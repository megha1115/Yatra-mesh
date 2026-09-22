"use client";

import React, { useState } from "react";
import { TripManifest, TripPassenger } from "@/lib/types";
import { InteractiveRouteMap } from "../map/InteractiveRouteMap";
import {
  QrCode,
  MapPin,
  Clock,
  ShieldCheck,
  UserCheck,
  Navigation,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Footprints,
  Phone,
  Bus,
} from "lucide-react";
import confetti from "canvas-confetti";

interface CommuterPortalProps {
  manifest: TripManifest;
  activePassenger: TripPassenger;
  onSimulateBoarding: (passengerId: string) => void;
  isOffline: boolean;
}

export const CommuterPortal: React.FC<CommuterPortalProps> = ({
  manifest,
  activePassenger,
  onSimulateBoarding,
  isOffline,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const fallbackStop = {
    id: "vstop-default",
    name: "Assigned Virtual Bay (Main Gate)",
    lat: 12.9362,
    lng: 77.7015,
    radiusMeters: 150,
    assignedPassengerIds: [activePassenger.id],
    estimatedArrivalMin: 8,
  };

  const virtualStop =
    manifest.virtualStops?.find((s) => s.id === activePassenger.pickupStopId) ||
    manifest.virtualStops?.[0] ||
    fallbackStop;

  const isOnboarded = activePassenger.boardingStatus === "ONBOARDED";

  const handleSelfBoarding = () => {
    onSimulateBoarding(activePassenger.id);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#10B981", "#06B6D4", "#F59E0B"],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Good morning, {activePassenger.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                VERIFIED COMMUTER
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Assigned to {manifest.vehicleType === "TEMPO_TRAVELER" ? "Tempo Traveler" : "Transit"} ({manifest.vehicleRegistration}) • Shift {manifest.shiftWindow}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Pickup Window</span>
            <span className="font-mono font-semibold text-emerald-400">
              ETA: ~{virtualStop.estimatedArrivalMin} mins
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Walking Distance</span>
            <span className="font-mono font-semibold text-cyan-400 flex items-center justify-end space-x-1">
              <Footprints className="w-3.5 h-3.5" />
              <span>{activePassenger.walkDistanceMeters}m (&lt;150m)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Holographic Digital Boarding Pass */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Live Interactive Route Map */}
        <div className="lg:col-span-7 space-y-4">
          <InteractiveRouteMap
            manifest={manifest}
            highlightedStopId={virtualStop.id}
          />

          {/* Virtual Stop Walk Guidance Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Assigned Virtual Stop: {virtualStop.name}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                150m Geofenced Node
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Yatra Mesh algorithmic clustering placed your virtual boarding spot just{" "}
              <strong className="text-white">{activePassenger.walkDistanceMeters} meters</strong> from your doorstep. The vehicle will pull into this curbside bay at{" "}
              <strong className="text-emerald-300">08:42 AM</strong>.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400">
                Driver: <strong className="text-slate-200">{manifest.driverName}</strong>
              </span>
              <a
                href={`tel:${manifest.driverPhone}`}
                className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{manifest.driverPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Digital Boarding Pass & NFC/QR Validation */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0F172A] via-[#111C35] to-[#0A0F1D] border-2 border-emerald-500/40 p-6 shadow-2xl shadow-emerald-950/40 overflow-hidden">
            {/* Holographic Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-dashed border-slate-700/80">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                  YM
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wider text-slate-100 uppercase">
                    Yatra Mesh Pass
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    RTO CONTRACT CARRIAGE
                  </span>
                </div>
              </div>
              <div
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isOnboarded
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500"
                    : "bg-amber-950/80 text-amber-300 border-amber-500/70 animate-pulse"
                }`}
              >
                {isOnboarded ? "ONBOARDED" : "READY TO BOARD"}
              </div>
            </div>

            {/* Passenger & Seat Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Passenger Name
                  </span>
                  <span className="text-base font-bold text-slate-100">
                    {activePassenger.name}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    ID: {activePassenger.userId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Reserved Seat
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                    {activePassenger.seatNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Pre-Manifested
                  </span>
                </div>
              </div>

              {/* Transit Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Vehicle Yellow Plate</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {manifest.vehicleRegistration}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Commercial Carriage
                  </span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Corporate Permit</span>
                  <span className="font-mono font-semibold text-slate-200 text-xs">
                    KA-RTO-CC-2024
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    Section 74 Compliant
                  </span>
                </div>
              </div>

              {/* Dynamic QR Validation Pass */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white text-slate-900 shadow-inner my-2">
                <div className="relative p-2 bg-slate-100 rounded-xl border-2 border-slate-300">
                  {/* Styled Dynamic QR Code Canvas Representation */}
                  <svg className="w-36 h-36" viewBox="0 0 100 100">
                    {/* QR Frame corner marks */}
                    <rect x="5" y="5" width="28" height="28" rx="4" fill="#0F172A" />
                    <rect x="10" y="10" width="18" height="18" rx="2" fill="#FFFFFF" />
                    <rect x="14" y="14" width="10" height="10" rx="1" fill="#0F172A" />

                    <rect x="67" y="5" width="28" height="28" rx="4" fill="#0F172A" />
                    <rect x="72" y="10" width="18" height="18" rx="2" fill="#FFFFFF" />
                    <rect x="76" y="14" width="10" height="10" rx="1" fill="#0F172A" />

                    <rect x="5" y="67" width="28" height="28" rx="4" fill="#0F172A" />
                    <rect x="10" y="72" width="18" height="18" rx="2" fill="#FFFFFF" />
                    <rect x="14" y="76" width="10" height="10" rx="1" fill="#0F172A" />

                    {/* QR Data Matrix dots */}
                    <rect x="38" y="12" width="6" height="6" fill="#0F172A" />
                    <rect x="48" y="8" width="6" height="6" fill="#0F172A" />
                    <rect x="42" y="24" width="6" height="6" fill="#0F172A" />
                    <rect x="54" y="20" width="6" height="6" fill="#0F172A" />

                    <rect x="12" y="42" width="6" height="6" fill="#0F172A" />
                    <rect x="22" y="48" width="6" height="6" fill="#0F172A" />
                    <rect x="8" y="54" width="6" height="6" fill="#0F172A" />

                    <rect x="38" y="38" width="8" height="8" rx="2" fill="#10B981" />
                    <rect x="50" y="44" width="6" height="6" fill="#0F172A" />
                    <rect x="60" y="38" width="8" height="8" fill="#0F172A" />

                    <rect x="74" y="48" width="6" height="6" fill="#0F172A" />
                    <rect x="84" y="54" width="6" height="6" fill="#0F172A" />
                    <rect x="42" y="68" width="6" height="6" fill="#0F172A" />
                    <rect x="52" y="74" width="8" height="8" fill="#0F172A" />
                    <rect x="66" y="70" width="6" height="6" fill="#0F172A" />
                    <rect x="78" y="80" width="8" height="8" fill="#0F172A" />
                  </svg>
                </div>
                <span className="font-mono text-[10px] text-slate-700 mt-2 font-bold tracking-wider">
                  TOKEN: {activePassenger.boardingToken}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Valid for Mesh Offline Verification</span>
                </span>
              </div>

              {/* Boarding Action / Simulation Button */}
              {!isOnboarded ? (
                <button
                  onClick={handleSelfBoarding}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/50 flex items-center justify-center space-x-2 active:scale-98 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Tap to Validate Boarding</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center text-xs text-emerald-300 flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Successfully Boarded at {activePassenger.boardedAt || "08:34 AM"}</span>
                </div>
              )}

              {/* Offline Resilience indicator */}
              {isOffline && (
                <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Operating in Offline Mesh Mode. Your pass cryptographic token is cached in IndexedDB and validated peer-to-peer.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
