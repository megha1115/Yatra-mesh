"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header, AppView } from "@/components/common/Header";
import { CommuterPortal } from "@/components/portals/CommuterPortal";
import { DriverPortal } from "@/components/portals/DriverPortal";
import { EnterprisePortal } from "@/components/portals/EnterprisePortal";
import { DispatcherPortal } from "@/components/portals/DispatcherPortal";
import { SafetyModal } from "@/components/safety/SafetyModal";
import {
  INITIAL_MANIFEST,
  INITIAL_ENTERPRISE,
  MOCK_VEHICLES,
} from "@/lib/db/mockData";
import {
  TripManifest,
  TripPassenger,
  EmergencyAlertPacket,
} from "@/lib/types";
import { AudioTelemetryEngine } from "@/lib/safety/audioTelemetry";
import { LocalIndexedDb } from "@/lib/offline/indexedDb";
import { OfflineSyncManager } from "@/lib/offline/syncManager";
import { ClusteredRoutePlan } from "@/lib/gemini/clustering";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>("COMMUTER");
  const [manifest, setManifest] = useState<TripManifest>(INITIAL_MANIFEST);
  const [enterprise, setEnterprise] = useState(INITIAL_ENTERPRISE);
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [isOffline, setIsOffline] = useState(false);

  // Audio Telemetry & Edge Safety
  const [currentDecibels, setCurrentDecibels] = useState<number>(44);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isSpikeActive, setIsSpikeActive] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlertPacket[]>([]);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const audioEngineRef = useRef<AudioTelemetryEngine | null>(null);

  // Initialize Audio Telemetry Engine on mount
  useEffect(() => {
    const engine = new AudioTelemetryEngine(
      85, // 85 dB threshold
      (event) => {
        setCurrentDecibels(event.decibelRMS);
      },
      (durationSec, peakDb) => {
        // Phase 4: Audio levels exceed 85 dB for > 3 seconds -> flag trip state as EVALUATING
        setManifest((prev) => ({
          ...prev,
          status: "EVALUATING",
        }));
        setIsSafetyModalOpen(true);
      }
    );

    audioEngineRef.current = engine;
    engine.startPassiveTelemetry();

    // Cache initial manifest in client-side IndexedDB for offline mesh capability
    LocalIndexedDb.saveManifest(INITIAL_MANIFEST).catch(console.error);

    return () => {
      engine.stop();
    };
  }, []);

  // Handle real microphone toggle
  const handleToggleMic = async () => {
    if (!audioEngineRef.current) return;

    if (isMicActive) {
      audioEngineRef.current.stop();
      setIsMicActive(false);
    } else {
      const started = await audioEngineRef.current.startRealMicrophone();
      setIsMicActive(started);
    }
  };

  // Handle simulated acoustic spike trigger (>88 dB)
  const handleTriggerSpike = () => {
    if (!audioEngineRef.current) return;

    if (isSpikeActive) {
      audioEngineRef.current.triggerSimulatedDisturbance(false);
      setIsSpikeActive(false);
    } else {
      audioEngineRef.current.triggerSimulatedDisturbance(true);
      setIsSpikeActive(true);

      // Auto turn off simulation after 4 seconds if not toggled
      setTimeout(() => {
        if (audioEngineRef.current) {
          audioEngineRef.current.triggerSimulatedDisturbance(false);
          setIsSpikeActive(false);
        }
      }, 4000);
    }
  };

  // Phase 4 Check-In Modal: Passenger confirms they are safe
  const handleConfirmSafe = () => {
    setIsSafetyModalOpen(false);
    setManifest((prev) => ({
      ...prev,
      status: "EN_ROUTE",
    }));
  };

  // Phase 4 Check-In Modal: Escalation to EMERGENCY_HOLD
  const handleEscalateEmergency = (packet: EmergencyAlertPacket) => {
    setIsSafetyModalOpen(false);
    setManifest((prev) => ({
      ...prev,
      status: "EMERGENCY_HOLD",
    }));
    setActiveAlerts((prev) => [packet, ...prev]);

    // If on commuter view, driver view or dispatcher will show alert
    console.warn("Incident dispatched:", packet);
  };

  // Dispatcher clears emergency
  const handleResolveEmergency = (alertId: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setManifest((prev) => ({
      ...prev,
      status: "EN_ROUTE",
    }));
  };

  // Driver toggles emergency hold manually
  const handleToggleEmergencyHold = () => {
    setManifest((prev) => {
      const nextStatus = prev.status === "EMERGENCY_HOLD" ? "EN_ROUTE" : "EMERGENCY_HOLD";
      if (nextStatus === "EMERGENCY_HOLD") {
        const manualAlert: EmergencyAlertPacket = {
          id: `alert-driver-${Date.now()}`,
          tripId: prev.id,
          vehicleNumber: prev.vehicleRegistration,
          vehicleType: prev.vehicleType,
          driverName: prev.driverName,
          driverPhone: prev.driverPhone,
          gpsCoordinates: {
            lat: 12.9362,
            lng: 77.7015,
            speedKmph: 0,
          },
          passengersOnboard: prev.passengers
            .filter((p) => p.boardingStatus === "ONBOARDED")
            .map((p) => ({
              name: p.name,
              seatNumber: p.seatNumber,
              phone: "+91 98451 00000",
            })),
          peakDecibels: currentDecibels,
          triggerReason: "Driver manually toggled cockpit Emergency Hold button",
          triggeredAt: new Date().toLocaleTimeString(),
          status: "OPEN",
        };
        setActiveAlerts((a) => [manualAlert, ...a]);
      }
      return { ...prev, status: nextStatus };
    });
  };

  // Handle passenger boarding status update
  const handleUpdatePassengerStatus = (
    passengerId: string,
    status: "ONBOARDED" | "NO_SHOW"
  ) => {
    setManifest((prev) => {
      const updatedPassengers = prev.passengers.map((p) => {
        if (p.id === passengerId) {
          return {
            ...p,
            boardingStatus: status,
            boardedAt: status === "ONBOARDED" ? new Date().toLocaleTimeString() : undefined,
          };
        }
        return p;
      });

      const updated = {
        ...prev,
        passengers: updatedPassengers,
      };

      // Also persist to IndexedDB
      LocalIndexedDb.saveManifest(updated).catch(console.error);
      return updated;
    });
  };

  // Handle toggle offline mesh mode
  const handleToggleOffline = async () => {
    if (!isOffline) {
      // Transition to offline mode
      setIsOffline(true);
      setSyncToast("Network disconnected. Switched to Offline Mesh P2P Fallback mode.");
      setTimeout(() => setSyncToast(null), 3500);
    } else {
      // Reconnected to internet: replay sync queue
      setIsOffline(false);
      const syncResult = await OfflineSyncManager.replayPendingSyncQueue();
      if (syncResult.syncedCount > 0) {
        setSyncToast(
          `Reconnected! Synchronized ${syncResult.syncedCount} queued check-ins to central PostGIS DB.`
        );
      } else {
        setSyncToast("Online mode restored. PostGIS database sync nominal.");
      }
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  // When enterprise runs clustering and updates route
  const handleClustersGenerated = (clusters: ClusteredRoutePlan[]) => {
    if (clusters.length > 0) {
      const primaryCluster = clusters[0];
      setManifest((prev) => ({
        ...prev,
        virtualStops: primaryCluster.virtualStops,
        routePolyline: primaryCluster.routePolyline,
        occupancyRatePct: primaryCluster.occupancyRatePct,
        avgWalkDistanceMeters: primaryCluster.avgWalkDistanceMeters,
        carbonSavedKg: primaryCluster.co2SavingsKg,
      }));
    }
  };

  const activePassenger = manifest.passengers[0]; // Aakash Sharma

  return (
    <div className="min-h-screen flex flex-col bg-[#070B13] text-slate-100">
      {/* Global Application Header */}
      <Header
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        currentDecibels={currentDecibels}
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        onTriggerSpike={handleTriggerSpike}
        isSpikeActive={isSpikeActive}
      />

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950/95 border border-emerald-500/60 shadow-2xl text-xs text-emerald-200 flex items-center space-x-3 backdrop-blur-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === "COMMUTER" && (
          <CommuterPortal
            manifest={manifest}
            activePassenger={activePassenger}
            onSimulateBoarding={(id) => handleUpdatePassengerStatus(id, "ONBOARDED")}
            isOffline={isOffline}
          />
        )}

        {currentView === "DRIVER" && (
          <DriverPortal
            manifest={manifest}
            onUpdatePassengerStatus={handleUpdatePassengerStatus}
            onToggleEmergencyHold={handleToggleEmergencyHold}
            isOffline={isOffline}
          />
        )}

        {currentView === "ENTERPRISE" && (
          <EnterprisePortal
            enterprise={enterprise}
            manifest={manifest}
            onClustersGenerated={handleClustersGenerated}
          />
        )}

        {currentView === "DISPATCHER" && (
          <DispatcherPortal
            manifest={manifest}
            vehicles={vehicles}
            activeAlerts={activeAlerts}
            onAcknowledgeAlert={(id) => console.log("Acknowledge", id)}
            onResolveEmergency={handleResolveEmergency}
          />
        )}
      </main>

      {/* Phase 4 Conversational Safety Check-In Modal */}
      <SafetyModal
        isOpen={isSafetyModalOpen}
        currentManifest={manifest}
        peakDb={currentDecibels}
        onConfirmSafe={handleConfirmSafe}
        onEscalateEmergency={handleEscalateEmergency}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">Yatra Mesh</span> • RTO Contract Carriage Section 74 & State Aggregator Compliance
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            CIN: {enterprise.cinNumber} • Permit: {enterprise.contractPermitRef}
          </div>
        </div>
      </footer>
    </div>
  );
}
