"use client";

import React, { useState } from "react";
import {
  TripManifest,
  EmergencyAlertPacket,
  FleetVehicle,
} from "@/lib/types";
import {
  Siren,
  ShieldAlert,
  ShieldCheck,
  Radio,
  MapPin,
  Users,
  Clock,
  Phone,
  CheckCircle,
  Truck,
  Car,
  AlertTriangle,
  ExternalLink,
  Flame,
} from "lucide-react";
import { InteractiveRouteMap } from "../map/InteractiveRouteMap";

interface DispatcherPortalProps {
  manifest: TripManifest;
  vehicles: FleetVehicle[];
  activeAlerts: EmergencyAlertPacket[];
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveEmergency: (alertId: string) => void;
}

export const DispatcherPortal: React.FC<DispatcherPortalProps> = ({
  manifest,
  vehicles,
  activeAlerts,
  onAcknowledgeAlert,
  onResolveEmergency,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlertPacket | null>(
    activeAlerts[0] || null
  );

  const isEmergencyActive = manifest.status === "EMERGENCY_HOLD";
  const isEvaluating = manifest.status === "EVALUATING";

  return (
    <div className="space-y-6">
      {/* Dispatch Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Central Dispatch & Fleet Operations Control</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                LIVE SOC DESK
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Monitoring {vehicles.length} Active Yellow-Board Fleet Units • Outer Ring Road Corridor
            </p>
          </div>
        </div>

        {/* Live System Status */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono">Edge Telemetry Stream Active</span>
          </div>

          <div
            className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] border flex items-center space-x-1.5 ${
              activeAlerts.length > 0 || isEmergencyActive
                ? "bg-red-950/80 text-red-400 border-red-500 animate-pulse"
                : "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
            }`}
          >
            {activeAlerts.length > 0 || isEmergencyActive ? (
              <>
                <Siren className="w-4 h-4" />
                <span>{activeAlerts.length} EMERGENCY INCIDENTS</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>ALL CORRIDORS NOMINAL</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Incident Triage Drawer if Alert Exists */}
      {(activeAlerts.length > 0 || isEmergencyActive) && (
        <div className="rounded-2xl border-2 border-red-500/80 bg-gradient-to-r from-red-950/70 via-slate-900 to-red-950/70 p-5 shadow-2xl shadow-red-950/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-red-400">
              <Siren className="w-6 h-6 animate-bounce" />
              <div>
                <h3 className="font-extrabold text-base tracking-wide text-red-300">
                  CRITICAL INCIDENT: EMERGENCY_HOLD DISPATCH PACKET
                </h3>
                <p className="text-xs text-red-200/80">
                  Triggered by Phase 4 Acoustic Telemetry Loop on Vehicle {manifest.vehicleRegistration}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onResolveEmergency(activeAlerts[0]?.id || "alert-active")}
                className="py-1.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Resolve & Clear Emergency</span>
              </button>
            </div>
          </div>

          {/* Incident Telemetry Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-red-900/40">
              <span className="text-slate-500 block text-[10px] uppercase">Vehicle Yellow Plate</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {manifest.vehicleRegistration}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Model: Force Traveler EV
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-red-900/40">
              <span className="text-slate-500 block text-[10px] uppercase">Driver Contact & KYC</span>
              <span className="font-semibold text-slate-200 block">
                {manifest.driverName}
              </span>
              <span className="font-mono text-cyan-400 text-[11px] block mt-0.5">
                {manifest.driverPhone}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-red-900/40">
              <span className="text-slate-500 block text-[10px] uppercase">Incident Location GPS</span>
              <span className="font-mono text-red-400 font-bold block">
                12.9362 N, 77.7015 E
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Near Cisco Green Glen Gateway
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-red-900/40">
              <span className="text-slate-500 block text-[10px] uppercase">Acoustic Telemetry Peak</span>
              <span className="font-mono font-bold text-red-400 text-sm">
                89.4 dB SPL
              </span>
              <span className="text-[10px] text-red-300 block mt-0.5">
                Disturbance &gt;85dB &gt;3s
              </span>
            </div>
          </div>

          {/* Passenger Manifest Snapshot */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <span className="text-slate-400 font-semibold block text-[11px]">
              Active Onboard Passengers ({manifest.passengers.filter(p => p.boardingStatus === "ONBOARDED").length} Confirmed Seats):
            </span>
            <div className="flex flex-wrap gap-2">
              {manifest.passengers
                .filter((p) => p.boardingStatus === "ONBOARDED")
                .map((p) => (
                  <span
                    key={p.id}
                    className="px-2.5 py-1 rounded-lg font-mono text-[10px] bg-slate-900 text-slate-200 border border-slate-700"
                  >
                    {p.seatNumber}: {p.name}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Fleet Live Operations Map and Active Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <InteractiveRouteMap manifest={manifest} />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Active Commercial Fleet ({vehicles.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                Section 74
              </span>
            </div>

            <div className="space-y-3">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-300">
                      {v.registrationNumber}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                      {v.fuelType} • {v.seatCapacity} Seats
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center justify-between">
                    <span>{v.makeModel}</span>
                    <span className="font-mono text-cyan-400">{v.speedKmph} km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
