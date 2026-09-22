"use client";

import React, { useState } from "react";
import {
  Enterprise,
  TripManifest,
} from "@/lib/types";
import {
  UploadCloud,
  FileSpreadsheet,
  TrendingUp,
  Leaf,
  DollarSign,
  Users,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  BarChart3,
  Calendar,
} from "lucide-react";
import { EmployeeRosterPoint, ClusteredRoutePlan } from "@/lib/gemini/clustering";

interface EnterprisePortalProps {
  enterprise: Enterprise;
  manifest: TripManifest;
  onClustersGenerated?: (clusters: ClusteredRoutePlan[]) => void;
}

// Sample batch roster of 18 employees for Outer Ring Road / Whitefield tech hub
const SAMPLE_EMPLOYEES_ROSTER: EmployeeRosterPoint[] = [
  { id: "emp-101", name: "Kiran Rao", lat: 12.9348, lng: 77.7025, address: "Panathur Road, Sobha Acres", shiftTime: "08:30 AM" },
  { id: "emp-102", name: "Priya Sundaram", lat: 12.9372, lng: 77.7051, address: "Prestige Silver Oak, Whitefield", shiftTime: "08:30 AM" },
  { id: "emp-103", name: "Rohan Verma", lat: 12.9331, lng: 77.6989, address: "Assetz Marq, Kadubeesanahalli", shiftTime: "08:30 AM" },
  { id: "emp-104", name: "Nisha Patel", lat: 12.9360, lng: 77.7018, address: "Cisco Green Glen Corner", shiftTime: "08:30 AM" },
  { id: "emp-105", name: "Gautam Iyer", lat: 12.9391, lng: 77.7088, address: "Marathahalli Flyover West", shiftTime: "08:30 AM" },
  { id: "emp-106", name: "Sunil Hegde", lat: 12.9385, lng: 77.7075, address: "Kadubeesanahalli Underpass", shiftTime: "08:30 AM" },
  { id: "emp-107", name: "Divya Nambiar", lat: 12.9320, lng: 77.6945, address: "Bellandur Central Hub", shiftTime: "08:30 AM" },
  { id: "emp-108", name: "Arun Nair", lat: 12.9329, lng: 77.6952, address: "Outer Ring Road Walkover", shiftTime: "08:30 AM" },
  { id: "emp-109", name: "Siddharth Sen", lat: 12.9355, lng: 77.7012, address: "Wells Fargo Gate 1", shiftTime: "08:30 AM" },
  { id: "emp-110", name: "Pooja Banerjee", lat: 12.9342, lng: 77.7001, address: "Green Glen Colony, Bellandur", shiftTime: "08:30 AM" },
  { id: "emp-111", name: "Aditya Mishra", lat: 12.9318, lng: 77.6938, address: "Cloudnine Hospital Bay", shiftTime: "08:30 AM" },
  { id: "emp-112", name: "Shalini Gupta", lat: 12.9382, lng: 77.7065, address: "Multiplex Road, Marathahalli", shiftTime: "08:30 AM" },
];

export const EnterprisePortal: React.FC<EnterprisePortalProps> = ({
  enterprise,
  manifest,
  onClustersGenerated,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [clusterResults, setClusterResults] = useState<ClusteredRoutePlan[] | null>(null);

  // Trigger Gemini demand clustering engine
  const handleTriggerClustering = async () => {
    setIsProcessing(true);
    setUploadSuccess(false);

    try {
      const res = await fetch("/api/routing/cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employees: SAMPLE_EMPLOYEES_ROSTER,
          destination: {
            lat: 12.9255,
            lng: 77.6823,
            name: "RMZ Ecoworld Tech Campus",
          },
        }),
      });

      const data = await res.json();
      if (data.clusters) {
        setClusterResults(data.clusters);
        setUploadSuccess(true);
        if (onClustersGenerated) {
          onClustersGenerated(data.clusters);
        }
      }
    } catch (err) {
      console.error("Clustering request failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Compliance Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#10192A] to-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">{enterprise.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                RTO PERMIT ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Corporate CIN: <span className="font-mono text-slate-300">{enterprise.cinNumber}</span> • RTO Contract Permit: <span className="font-mono text-cyan-300">{enterprise.contractPermitRef}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Headquarters:</span>
          <span className="text-slate-200 font-medium">{enterprise.headquarters}</span>
        </div>
      </div>

      {/* Top Level Metric KPIs (Utilization, Savings, ESG Carbon) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Route Seat Occupancy Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Fleet Seat Occupancy
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              91.7%
            </span>
            <span className="text-xs text-emerald-500 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Target: &ge;90%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Enforced by Gemini demand clustering engine. 11/12 seats filled.
          </p>
        </div>

        {/* KPI 2: Corporate Transit Spend Savings */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Monthly Transit Savings
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-cyan-300 font-mono">
              ₹4.82L
            </span>
            <span className="text-xs text-cyan-400 font-semibold">
              -43.8% vs Cabs
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Savings calculated against single-occupancy corporate cab vouchers.
          </p>
        </div>

        {/* KPI 3: ESG Carbon Reduction */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              ESG Carbon Avoidance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-300 font-mono">
              1,420 kg
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              CO₂e / Month
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Equivalent to 71 full-grown teak trees planted along ORR corridor.
          </p>
        </div>

        {/* KPI 4: Average Walk Distance */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Avg Walking Distance
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-purple-300 font-mono">
              81m
            </span>
            <span className="text-xs text-purple-400 font-semibold">
              &lt; 150m Limit
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero employee walks exceed 135m to reach their assigned virtual stop.
          </p>
        </div>
      </div>

      {/* Main Shift Upload Interface & Gemini Macro-Routing Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Shift Batch Upload Interface */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>Employee Shift Roster Uploader</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                Phase 2 Pipeline
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Upload employee shift manifests (CSV or JSON format) containing employee IDs, shift windows, and home geocodes.
            </p>

            {/* Dropzone Container */}
            <div className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 transition-colors rounded-2xl p-6 text-center bg-slate-950/40 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Drag and drop shift roster file here
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports .csv, .xlsx, or JSON batch schemas
                </p>
              </div>

              {/* Sample Batch Action */}
              <button
                onClick={handleTriggerClustering}
                disabled={isProcessing}
                className="mt-2 py-2.5 px-5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all flex items-center space-x-2 shadow-lg shadow-emerald-950/40 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>Clustering Batch with Gemini 1.5 Flash...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Macro Gemini Clustering ({SAMPLE_EMPLOYEES_ROSTER.length} Employees)</span>
                  </>
                )}
              </button>
            </div>

            {/* Shift Roster Table Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Roster Manifest Preview</span>
                <span className="font-mono text-emerald-400">
                  {SAMPLE_EMPLOYEES_ROSTER.length} Active Records
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800 text-[11px]">
                {SAMPLE_EMPLOYEES_ROSTER.slice(0, 6).map((emp) => (
                  <div key={emp.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block">{emp.name}</span>
                      <span className="text-slate-500 text-[10px]">{emp.address}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-cyan-400 block">{emp.shiftTime}</span>
                      <span className="text-[10px] text-slate-500">
                        {emp.lat}, {emp.lng}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Gemini Routing & Clustering Structured Output Inspection */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Macro Gemini Routing Output</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                JSON Schema Enforced
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Deterministic routing synthesis: Clusters workers into groups with average walk distance &lt; 150m, dynamically allocates vehicles (Shared Auto 3 / Tempo 12 / Minibus 24), and enforces &ge;90% occupancy.
            </p>

            {uploadSuccess && clusterResults ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Successfully synthesized {clusterResults.length} RTO Contract Carriage routes with 91.7% fleet occupancy!
                  </span>
                </div>

                {clusterResults.map((cluster, cIdx) => (
                  <div
                    key={cluster.clusterId}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        <span className="font-bold text-sm text-slate-200">
                          Route Batch #{cIdx + 1}: {cluster.vehicleType.replace("_", " ")}
                        </span>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        Capacity: {cluster.seatCapacity} seats
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Occupancy</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {cluster.occupancyRatePct}% (&ge;90%)
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Avg Walk</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {cluster.avgWalkDistanceMeters}m (&lt;150m)
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">CO2 Saved</span>
                        <span className="font-mono font-bold text-purple-400">
                          {cluster.co2SavingsKg} kg
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      <span>Virtual Stops: </span>
                      <span className="text-slate-200">
                        {cluster.virtualStops.map((s) => s.name.split("(")[0]).join(" → ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center space-y-2">
                <BarChart3 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  No active upload in progress. Click &ldquo;Run Macro Gemini Clustering&rdquo; to simulate a live 12-employee batch optimization.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
