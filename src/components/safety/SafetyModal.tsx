"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, Siren, PhoneCall, Radio, Clock } from "lucide-react";
import { EmergencyAlertPacket, TripManifest } from "@/lib/types";

interface SafetyModalProps {
  isOpen: boolean;
  currentManifest: TripManifest;
  peakDb: number;
  onConfirmSafe: () => void;
  onEscalateEmergency: (packet: EmergencyAlertPacket) => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  isOpen,
  currentManifest,
  peakDb,
  onConfirmSafe,
  onEscalateEmergency,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(10);
      return;
    }

    setSecondsRemaining(10);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Timeout reached: automatically escalate to EMERGENCY_HOLD per Phase 4 protocol
          handleEmergencyTrigger("Automated 10s check-in protocol expired without passenger response");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleEmergencyTrigger = (reason: string) => {
    const alertPacket: EmergencyAlertPacket = {
      id: `alert-${Date.now()}`,
      tripId: currentManifest.id,
      vehicleNumber: currentManifest.vehicleRegistration,
      vehicleType: currentManifest.vehicleType,
      driverName: currentManifest.driverName,
      driverPhone: currentManifest.driverPhone,
      gpsCoordinates: {
        lat: currentManifest.routePolyline?.[2]?.[0] ?? currentManifest.routePolyline?.[0]?.[0] ?? 12.9362,
        lng: currentManifest.routePolyline?.[2]?.[1] ?? currentManifest.routePolyline?.[0]?.[1] ?? 77.7015,
        speedKmph: 32,
      },
      passengersOnboard: currentManifest.passengers
        .filter((p) => p.boardingStatus === "ONBOARDED")
        .map((p) => ({
          name: p.name,
          seatNumber: p.seatNumber,
          phone: "+91 98451 00000",
        })),
      peakDecibels: peakDb,
      triggerReason: reason,
      triggeredAt: new Date().toLocaleTimeString(),
      status: "OPEN",
    };

    onEscalateEmergency(alertPacket);
  };

  if (!isOpen) return null;

  const strokeDashoffset = 283 - (283 * (10 - secondsRemaining)) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-red-500/60 bg-mesh-dark/95 p-6 shadow-2xl shadow-red-950/70">
        {/* Pulsing Alert Header */}
        <div className="flex items-center space-x-3 mb-4 border-b border-red-900/40 pb-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/20 text-red-400">
            <AlertTriangle className="w-7 h-7 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-wide text-red-400">
              Yatra Safety Anomaly Detected
            </h3>
            <p className="text-xs text-red-200/70">
              Acoustic spike sustained {">"} 85 dB ({peakDb} dB recorded) on vehicle {currentManifest.vehicleRegistration}
            </p>
          </div>
        </div>

        {/* Central Radial Countdown Ring */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                className="text-red-500 transition-all duration-1000 ease-linear"
                fill="transparent"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {secondsRemaining}s
              </span>
              <span className="text-[10px] text-red-300 uppercase tracking-widest font-semibold">
                Auto-Escalate
              </span>
            </div>
          </div>

          <p className="mt-4 text-center text-sm font-medium text-slate-200">
            &ldquo;Yatra safety system detected an unusual disturbance. Are you safe?&rdquo;
          </p>
          <p className="mt-1 text-center text-xs text-slate-400 max-w-sm">
            If no action is taken before timer reaches zero, vehicle telemetry, live GPS, and manifest will automatically dispatch to Central Emergency Response.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={onConfirmSafe}
            className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400 transition-all shadow-lg active:scale-95"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>I Am Safe</span>
          </button>

          <button
            onClick={() =>
              handleEmergencyTrigger("Passenger explicitly triggered SOS Panic button during check-in")
            }
            className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border border-red-400 transition-all shadow-xl shadow-red-900/50 active:scale-95 animate-pulse"
          >
            <Siren className="w-5 h-5" />
            <span>I Need Help!</span>
          </button>
        </div>

        {/* Telemetry Snapshot Info */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>Telemetry: {currentManifest.vehicleRegistration} • Lat: {currentManifest.routePolyline?.[2]?.[0] ?? currentManifest.routePolyline?.[0]?.[0] ?? 12.9362}</span>
          </div>
          <span className="font-mono text-amber-400">STATUS: EVALUATING</span>
        </div>
      </div>
    </div>
  );
};
