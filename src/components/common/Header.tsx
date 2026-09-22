"use client";

import React, { useState } from "react";
import { UserRole } from "@/lib/types";
import {
  Bus,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  Shield,
  Activity,
  Zap,
  Volume2,
  Sparkles,
  Users,
  Building2,
  Radio,
  FileCode2,
} from "lucide-react";

export type AppView = "COMMUTER" | "DRIVER" | "ENTERPRISE" | "DISPATCHER";

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  currentDecibels: number;
  isMicActive: boolean;
  onToggleMic: () => void;
  onTriggerSpike: () => void;
  isSpikeActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  isOffline,
  onToggleOffline,
  currentDecibels,
  isMicActive,
  onToggleMic,
  onTriggerSpike,
  isSpikeActive,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070B13]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Operational Status Bar */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 text-xs">
          {/* Brand Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/20">
              YM
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-100 tracking-wider text-sm">
                  YATRA MESH
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MVP v1.0
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                RTO Contract Carriage Mesh Mobility
              </span>
            </div>
          </div>

          {/* Edge Safety Audio Telemetry & Offline Toggle Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Decibel Audio Telemetry Pill */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80">
              <button
                onClick={onToggleMic}
                title={isMicActive ? "Disable microphone" : "Enable Web Audio API microphone"}
                className={`p-1 rounded-md transition-colors ${
                  isMicActive
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>

              <div className="flex items-center space-x-1.5 font-mono">
                <Volume2 className={`w-3.5 h-3.5 ${currentDecibels > 85 ? "text-red-400 animate-bounce" : "text-cyan-400"}`} />
                <span
                  className={`font-bold text-xs ${
                    currentDecibels > 85
                      ? "text-red-400 font-extrabold"
                      : currentDecibels > 70
                      ? "text-amber-300"
                      : "text-slate-300"
                  }`}
                >
                  {currentDecibels} dB
                </span>
              </div>

              {/* Animated Decibel Wave Bar */}
              <div className="flex items-end space-x-0.5 h-4 w-12">
                {[40, 65, 80, 55, 70].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      currentDecibels > 85
                        ? "bg-red-500 animate-wave-bar"
                        : "bg-emerald-400 opacity-80"
                    }`}
                    style={{
                      height: `${Math.min(100, Math.max(15, (currentDecibels / 100) * 100 * (0.6 + i * 0.15)))}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Simulate Acoustic Spike Button (>88 dB for 3s per Phase 4 requirement) */}
            <button
              onClick={onTriggerSpike}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all border shadow-sm active:scale-95 ${
                isSpikeActive
                  ? "bg-red-600 text-white border-red-400 animate-pulse"
                  : "bg-red-950/60 hover:bg-red-900/60 text-red-300 border-red-800/60"
              }`}
              title="Test Phase 4: Simulates >85 dB acoustic spike to trigger 10-second check-in modal"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSpikeActive ? "Simulating >88 dB..." : "Test 85dB+ Anomaly"}</span>
            </button>

            {/* Offline Mesh Simulator Switch */}
            <button
              onClick={onToggleOffline}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-all border active:scale-95 ${
                isOffline
                  ? "bg-amber-950/80 text-amber-300 border-amber-500 animate-pulse"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
              }`}
              title="Phase 5: Simulates network disconnect / subway cellular dead zone"
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline Mesh Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Online (PostGIS DB)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Role Switcher Navigation Bar */}
        <div className="py-2.5 flex items-center justify-between overflow-x-auto scrollbar-none">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => onViewChange("COMMUTER")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                currentView === "COMMUTER"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Commuter Portal</span>
            </button>

            <button
              onClick={() => onViewChange("DRIVER")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                currentView === "DRIVER"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Driver HUD</span>
            </button>

            <button
              onClick={() => onViewChange("ENTERPRISE")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                currentView === "ENTERPRISE"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Enterprise HR & Shift Ops</span>
            </button>

            <button
              onClick={() => onViewChange("DISPATCHER")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                currentView === "DISPATCHER"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Dispatcher Console</span>
            </button>
          </nav>


        </div>
      </div>
    </header>
  );
};
