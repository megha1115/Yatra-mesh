"use client";

import React, { useState } from "react";
import { TripManifest, TripPassenger } from "@/lib/types";
import {
  Navigation2,
  CheckCircle2,
  UserCheck,
  AlertOctagon,
  ScanLine,
  MapPin,
  Clock,
  ShieldAlert,
  Radio,
  WifiOff,
  UserX,
  Phone,
} from "lucide-react";
import { OfflineSyncManager } from "@/lib/offline/syncManager";

interface DriverPortalProps {
  manifest: TripManifest;
  onUpdatePassengerStatus: (passengerId: string, status: "ONBOARDED" | "NO_SHOW") => void;
  onToggleEmergencyHold: () => void;
  isOffline: boolean;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  manifest,
  onUpdatePassengerStatus,
  onToggleEmergencyHold,
  isOffline,
}) => {
  const [tokenInput, setTokenInput] = useState("");
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const isEmergency = manifest.status === "EMERGENCY_HOLD";
  const onboardedCount = manifest.passengers.filter((p) => p.boardingStatus === "ONBOARDED").length;

  const fallbackStop1 = {
    id: "vstop-fallback-1",
    name: "Transit Corridor Bay (Current)",
    lat: 12.9362,
    lng: 77.7015,
    radiusMeters: 150,
    assignedPassengerIds: [],
    estimatedArrivalMin: 4,
  };
  const fallbackStop2 = {
    id: "vstop-fallback-2",
    name: "Corporate Tech Park Gate (Next)",
    lat: 12.9255,
    lng: 77.6823,
    radiusMeters: 150,
    assignedPassengerIds: [],
    estimatedArrivalMin: 12,
  };

  const currentStop = manifest.virtualStops?.[1] || manifest.virtualStops?.[0] || fallbackStop1;
  const nextStop =
    manifest.virtualStops?.[2] ||
    (manifest.virtualStops && manifest.virtualStops.length > 0
      ? manifest.virtualStops[manifest.virtualStops.length - 1]
      : fallbackStop2);

  const handleManualTokenValidate = async () => {
    if (!tokenInput.trim()) return;

    if (isOffline) {
      // Offline Peer-to-Peer IndexedDB verification
      const result = await OfflineSyncManager.verifyPassengerOffline(
        manifest.id,
        "",
        tokenInput.trim()
      );
      setScanMessage(result.message);
      if (result.success) {
        const found = manifest.passengers.find((p) => p.boardingToken === tokenInput.trim());
        if (found) {
          onUpdatePassengerStatus(found.id, "ONBOARDED");
        }
      }
    } else {
      // Normal online validation
      const found = manifest.passengers.find((p) => p.boardingToken === tokenInput.trim());
      if (found) {
        onUpdatePassengerStatus(found.id, "ONBOARDED");
        setScanMessage(`Verified: ${found.name} (${found.seatNumber}) onboarded.`);
      } else {
        setScanMessage("Token not found in active manifest.");
      }
    }
    setTokenInput("");
  };

  return (
    <div className="space-y-6">
      {/* Driver Top HUD Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            HUD
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Driver: {manifest.driverName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
                YELLOW BOARD: {manifest.vehicleRegistration}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Trip {manifest.manifestNumber} • {manifest.vehicleType.replace("_", " ")} ({onboardedCount}/{manifest.passengers.length} Boarded)
            </p>
          </div>
        </div>

        {/* Emergency Hold Toggle Button */}
        <button
          onClick={onToggleEmergencyHold}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 border ${
            isEmergency
              ? "bg-red-600 text-white border-red-400 animate-pulse shadow-red-950/80"
              : "bg-red-950/60 hover:bg-red-900/60 text-red-400 border-red-700/60"
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>{isEmergency ? "RELEASE EMERGENCY HOLD" : "ACTIVATE EMERGENCY HOLD"}</span>
        </button>
      </div>

      {/* Emergency Active Alert Bar */}
      {isEmergency && (
        <div className="p-4 rounded-2xl bg-red-950/90 border-2 border-red-500 text-red-200 text-xs flex items-center space-x-3 animate-pulse">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <strong className="text-red-300 block text-sm">
              TRIP STATE LOCKED IN EMERGENCY_HOLD
            </strong>
            <span>
              Vehicle telemetry, GPS live coordinates, driver identification, and full passenger manifest transmitted to Central Dispatcher Desk. Vehicle speed throttled.
            </span>
          </div>
        </div>
      )}

      {/* Turn-by-Turn Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Virtual Stop Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-400 font-semibold uppercase flex items-center space-x-1.5">
              <Navigation2 className="w-4 h-4 rotate-45" />
              <span>Current Target Virtual Stop</span>
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              ETA: 4 mins
            </span>
          </div>
          <div className="text-lg font-bold text-slate-100">{currentStop.name}</div>
          <p className="text-xs text-slate-400">
            Geofence Node Lat: <span className="font-mono text-slate-300">{currentStop.lat}</span>, Lng: <span className="font-mono text-slate-300">{currentStop.lng}</span>
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-300">
            {currentStop.assignedPassengerIds.length} Commuters awaiting curbside pickup
          </div>
        </div>

        {/* Following Stop Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Subsequent Node</span>
            </span>
            <span className="font-mono text-xs text-slate-400">
              ETA: +11 mins
            </span>
          </div>
          <div className="text-base font-bold text-slate-300">{nextStop.name}</div>
          <p className="text-xs text-slate-500">
            Coordinates: {nextStop.lat}, {nextStop.lng}
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            {nextStop.assignedPassengerIds.length} Commuters scheduled
          </div>
        </div>
      </div>

      {/* Passenger Checklist and Boarding Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Pre-Manifested Passenger Checklist */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Pre-Manifested Passenger Checklist ({onboardedCount}/{manifest.passengers.length})</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              RTO Reg: Sec 74 Compliant
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 divide-y divide-slate-800/80 overflow-hidden">
            {manifest.passengers.map((pax) => {
              const isOnboarded = pax.boardingStatus === "ONBOARDED";
              const isNoShow = pax.boardingStatus === "NO_SHOW";

              return (
                <div
                  key={pax.id}
                  className={`p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                    isOnboarded ? "bg-emerald-950/20" : isNoShow ? "bg-red-950/20" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        isOnboarded
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {pax.seatNumber ? (pax.seatNumber.split(" ")[1] || pax.seatNumber) : "ST"}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-200">{pax.name}</span>
                        {pax.isOfflineVerified && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                            P2P OFFLINE VERIFIED
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Stop: {pax.pickupStopName} • Walk: {pax.walkDistanceMeters}m
                      </span>
                    </div>
                  </div>

                  {/* Actions for Driver */}
                  <div className="flex items-center space-x-2">
                    {!isOnboarded ? (
                      <>
                        <button
                          onClick={() => onUpdatePassengerStatus(pax.id, "ONBOARDED")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Board</span>
                        </button>
                        <button
                          onClick={() => onUpdatePassengerStatus(pax.id, "NO_SHOW")}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 transition-all active:scale-95"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Onboard ({pax.boardedAt || "08:35 AM"})</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Boarding Token Scanner (Online & Offline Peer-to-Peer) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <ScanLine className="w-4 h-4 text-cyan-400" />
                <span>Pass Token Validator</span>
              </h3>
              {isOffline && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                  OFFLINE P2P
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Scan commuter pass QR code or input digital token. Peer-to-peer verification executes directly against local IndexedDB cache when cell service drops.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Scan or paste YTR-XXXX-TOKEN..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                onClick={handleManualTokenValidate}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center space-x-2 shadow-md active:scale-95"
              >
                <ScanLine className="w-4 h-4" />
                <span>Validate & Board Commuter</span>
              </button>
            </div>

            {scanMessage && (
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs text-cyan-300">
                {scanMessage}
              </div>
            )}

            {/* Pre-cached Sample Tokens for quick testing */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="block text-slate-500">Quick Test Tokens:</span>
              <button
                onClick={() => setTokenInput("YTR-9884-AAKASH-SEC-TOKEN")}
                className="block text-left text-cyan-400 hover:underline font-mono"
              >
                Aakash Sharma: YTR-9884-AAKASH-SEC-TOKEN
              </button>
              <button
                onClick={() => setTokenInput("YTR-6631-ROHAN-SEC-TOKEN")}
                className="block text-left text-cyan-400 hover:underline font-mono"
              >
                Rohan Verma: YTR-6631-ROHAN-SEC-TOKEN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
