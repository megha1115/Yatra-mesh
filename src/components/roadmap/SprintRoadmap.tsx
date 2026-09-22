"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Mic,
  WifiOff,
  Rocket,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Layers,
} from "lucide-react";

interface RoadmapPhase {
  phase: number;
  week: string;
  title: string;
  deliverable: string;
  coreFocus: string;
  status: "COMPLETED_MVP" | "LIVE_IN_PROTOTYPE";
  icon: any;
  techHighlights: string[];
  deliverablesList: string[];
}

const PHASES: RoadmapPhase[] = [
  {
    phase: 1,
    week: "Week 1",
    title: "Foundation & Data Layer",
    deliverable: "Base Monorepo & PostGIS DB",
    coreFocus: "Schema migrations, Next.js 15 scaffolding, Auth & RBAC roles.",
    status: "LIVE_IN_PROTOTYPE",
    icon: Database,
    techHighlights: [
      "Prisma ORM with PostGIS spatial extensions",
      "RTO Contract Carriage Section 74 legal schema modeling",
      "Enterprise CIN (U72200KA2023PTC178941) & Yellow-Board plate registries",
      "Multi-role RBAC: Commuter, Driver, Enterprise HR, Dispatcher",
    ],
    deliverablesList: [
      "Next.js 15 App Router + Tailwind CSS setup",
      "schema.prisma with Enterprise, User, FleetVehicle, TripManifest, TripPassenger",
      "High-fidelity seeded dataset for Bangalore Outer Ring Road tech corridor",
    ],
  },
  {
    phase: 2,
    week: "Week 2",
    title: "Demand Clustering Engine",
    deliverable: "Macro Gemini Routing API",
    coreFocus: "Structured output schema, employee batch clustering, route polylines.",
    status: "LIVE_IN_PROTOTYPE",
    icon: Sparkles,
    techHighlights: [
      "@google/genai SDK integration with Gemini 1.5 Flash structured output",
      "Strict average walk distance constraint < 150 meters",
      "Vehicle sizing: Shared Auto (3), Tempo Traveler (12), Minibus (24)",
      "Target seat occupancy threshold enforcement >= 90%",
      "Road polyline synthesis connecting virtual stop clusters",
    ],
    deliverablesList: [
      "Structured output schema pipeline enforcing responseSchema constraints",
      "Geometric centroid clustering algorithm with walk distance checks",
      "/api/routing/cluster endpoint for automated roster optimization",
    ],
  },
  {
    phase: 3,
    week: "Week 3",
    title: "Interactive Maps & Dashboards",
    deliverable: "Commuter & HR Web Portals",
    coreFocus: "Mapbox/Leaflet UI, virtual stops, live ETA simulations, seat passes.",
    status: "LIVE_IN_PROTOTYPE",
    icon: MapPin,
    techHighlights: [
      "Interactive vector canvas/SVG map with moving vehicle telemetry",
      "150m geofenced virtual stop pulse animations",
      "Holographic digital boarding pass with HMAC dynamic QR tokens",
      "Enterprise HR shift batch CSV/JSON uploader",
      "ESG carbon savings & corporate transit spend analytics",
      "Driver turn-by-turn navigation HUD & verified checklist",
    ],
    deliverablesList: [
      "Commuter Portal (/commuter) with boarding pass & live ETA",
      "Enterprise HR Portal (/enterprise) with ESG carbon avoidance metrics",
      "Driver HUD (/driver) with passenger onboarding checklist & emergency hold",
      "Dispatcher Console (/dispatcher) with live fleet oversight desk",
    ],
  },
  {
    phase: 4,
    week: "Week 4",
    title: "Proactive Edge Safety",
    deliverable: "Audio Telemetry & Anomaly Loop",
    coreFocus: "Browser Web Audio API, acoustic spike detection, conversational ping.",
    status: "LIVE_IN_PROTOTYPE",
    icon: Mic,
    techHighlights: [
      "Client-side HTML5 Web Audio API analyser with real-time RMS decibel computation",
      "Threshold trigger: RMS decibels > 85 dB sustained for > 3.0 seconds",
      "Automated 10-second radial countdown check-in modal: 'Are you safe?'",
      "Auto-escalation to EMERGENCY_HOLD on timeout or 'I Need Help' tap",
      "Contextual incident dispatch packet with GPS, vehicle plate, & passenger manifest",
    ],
    deliverablesList: [
      "AudioTelemetryEngine with live frequency visualizer & spike detector",
      "10-second conversational SafetyModal with countdown ring",
      "Simulated Acoustic Spike (>88 dB) toggle for zero-friction demo testing",
    ],
  },
  {
    phase: 5,
    week: "Week 5",
    title: "Offline PWA & Mesh Fallback",
    deliverable: "Offline-First PWA",
    coreFocus: "Service workers, IndexedDB cache, WebRTC P2P manifest verification.",
    status: "LIVE_IN_PROTOTYPE",
    icon: WifiOff,
    techHighlights: [
      "IndexedDB client storage for driver trip manifests and pass tokens",
      "P2P token verification between commuter screen and driver scanner without internet",
      "Offline sync queue persisting events with timestamps",
      "Automatic replay & synchronization when network reconnects",
      "One-click 'Simulate Cellular Dead Zone' offline test toggle",
    ],
    deliverablesList: [
      "LocalIndexedDb abstraction with manifests and sync_queue stores",
      "OfflineSyncManager validating passes peer-to-peer",
      "Replay sync progress notification on reconnection",
    ],
  },
  {
    phase: 6,
    week: "Week 6",
    title: "Hardening & Cloud Deploy",
    deliverable: "Production MVP on Vercel",
    coreFocus: "End-to-end stress testing, synthetic telemetry load, demo sandbox.",
    status: "LIVE_IN_PROTOTYPE",
    icon: Rocket,
    techHighlights: [
      "Unified multi-role sandbox switcher for instant persona evaluation",
      "Smooth micro-animations, glassmorphic dark cyber-logistics design system",
      "Full responsive desktop & mobile execution",
      "Type-safe compilation with Next.js 15 App Router",
    ],
    deliverablesList: [
      "Interactive 6-Week Sprint Roadmap Explorer",
      "Live acoustic decibel monitor widget with real mic stream or simulation",
      "Production-ready MVP deployment bundle",
    ],
  },
];

export const SprintRoadmap: React.FC = () => {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  const togglePhase = (phaseNum: number) => {
    setExpandedPhase((prev) => (prev === phaseNum ? null : phaseNum));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0E1729] to-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-500/40">
              6-WEEK ENGINEERING SPRINT PLAN
            </span>
            <h2 className="text-xl font-extrabold text-slate-100 mt-2">
              Yatra Mesh: Sprint Delivery Roadmap
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Agile execution schedule taking Yatra Mesh from initial scaffolding and PostGIS RTO legal schemas to an enterprise-grade live working MVP with edge acoustic safety and offline mesh resilience.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">TOTAL DURATION</span>
              <span className="font-mono font-bold text-slate-200">6 Weeks</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">SPRINT CADENCE</span>
              <span className="font-mono font-bold text-emerald-400">1-Wk Iterations</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">PROTOTYPE STATUS</span>
              <span className="font-mono font-bold text-cyan-400">100% Implemented</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Phase Timeline Cards */}
      <div className="space-y-4">
        {PHASES.map((p) => {
          const Icon = p.icon;
          const isExpanded = expandedPhase === p.phase;

          return (
            <div
              key={p.phase}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? "bg-slate-900/95 border-emerald-500/50 shadow-xl shadow-emerald-950/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Header Row */}
              <div
                onClick={() => togglePhase(p.phase)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-base shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {p.week} • Phase {p.phase}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>MVP Active</span>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">
                      {p.title}: {p.deliverable}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{p.coreFocus}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-mono hidden md:inline-block">
                    Click to {isExpanded ? "collapse" : "view technical breakdown"}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details Drawer */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tech Highlights */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-cyan-400 block">
                        Architecture & Technical Specifications
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        {p.techHighlights.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-emerald-400 block">
                        Verified Sprint Deliverables
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        {p.deliverablesList.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
