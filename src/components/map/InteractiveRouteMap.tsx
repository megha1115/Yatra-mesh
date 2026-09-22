"use client";

import React, { useState, useEffect } from "react";
import { Navigation, MapPin, Bus, ShieldAlert, CheckCircle, Info, Radio } from "lucide-react";
import { TripManifest, VirtualStop } from "@/lib/types";

interface InteractiveRouteMapProps {
  manifest: TripManifest;
  highlightedStopId?: string;
  onSelectStop?: (stop: VirtualStop) => void;
  showPedestrianWalkPaths?: boolean;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  manifest,
  highlightedStopId,
  onSelectStop,
  showPedestrianWalkPaths = true,
}) => {
  // Vehicle animation progress along polyline (0.0 to 1.0)
  const [routeProgress, setRouteProgress] = useState<number>(0.35);
  const [selectedStop, setSelectedStop] = useState<VirtualStop | null>(null);

  // Bounds normalization for SVG viewport with fallback
  const polyline = manifest.routePolyline && manifest.routePolyline.length > 0
    ? manifest.routePolyline
    : [[12.9362, 77.7015]];
  const lats = polyline.map((p) => p[0]);
  const lngs = polyline.map((p) => p[1]);
  const rawMinLat = Math.min(...lats);
  const rawMaxLat = Math.max(...lats);
  const rawMinLng = Math.min(...lngs);
  const rawMaxLng = Math.max(...lngs);
  const minLat = rawMinLat - 0.003;
  const maxLat = rawMaxLat === rawMinLat ? rawMaxLat + 0.006 : rawMaxLat + 0.003;
  const minLng = rawMinLng - 0.003;
  const maxLng = rawMaxLng === rawMinLng ? rawMaxLng + 0.006 : rawMaxLng + 0.003;

  const mapToSvg = (lat: number, lng: number) => {
    const latSpan = maxLat - minLat || 0.006;
    const lngSpan = maxLng - minLng || 0.006;
    const x = ((lng - minLng) / lngSpan) * 760 + 20;
    // Invert lat for SVG Y coordinate
    const y = ((maxLat - lat) / latSpan) * 360 + 20;
    return { x: Number.isFinite(x) ? x : 400, y: Number.isFinite(y) ? y : 200 };
  };

  // Interpolate current vehicle coordinates based on routeProgress safely
  const getVehiclePos = () => {
    if (polyline.length === 0) return { x: 400, y: 200 };
    if (polyline.length === 1) return mapToSvg(polyline[0][0], polyline[0][1]);

    const totalSegments = polyline.length - 1;
    const currentProgressScaled = routeProgress * totalSegments;
    const segmentIndex = Math.max(0, Math.min(Math.floor(currentProgressScaled), totalSegments - 1));
    const segmentT = Math.max(0, Math.min(1, currentProgressScaled - segmentIndex));

    const p1 = polyline[segmentIndex] || polyline[0];
    const p2 = polyline[segmentIndex + 1] || p1;

    const currentLat = p1[0] + (p2[0] - p1[0]) * segmentT;
    const currentLng = p1[1] + (p2[1] - p1[1]) * segmentT;

    return mapToSvg(currentLat, currentLng);
  };

  // Continuous smooth movement of vehicle along road corridor
  useEffect(() => {
    if (manifest.status === "EMERGENCY_HOLD") return; // Halt vehicle on emergency hold

    const interval = setInterval(() => {
      setRouteProgress((prev) => {
        const next = prev + 0.002;
        return next > 0.98 ? 0.05 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [manifest.status]);

  const vehicleSvgPos = getVehiclePos();

  // Construct SVG path string safely
  const svgPathData = polyline.length > 1
    ? polyline
        .map((point, idx) => {
          const { x, y } = mapToSvg(point[0], point[1]);
          return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ")
    : `M ${vehicleSvgPos.x} ${vehicleSvgPos.y} L ${vehicleSvgPos.x + 1} ${vehicleSvgPos.y + 1}`;

  const isEmergency = manifest.status === "EMERGENCY_HOLD";
  const isEvaluating = manifest.status === "EVALUATING";

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#090D16] to-[#0D1524] border border-slate-800/80 p-4 shadow-2xl overflow-hidden">
      {/* Top Map HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800/70 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Navigation className="w-3.5 h-3.5 rotate-45" />
          </div>
          <div>
            <span className="font-semibold text-slate-200">
              Live Transit Corridor • Outer Ring Road Tech Arc
            </span>
            <span className="text-[11px] text-slate-400 block">
              Contract Carriage Route: {manifest.manifestNumber}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono text-emerald-400 text-[11px]">
              {(manifest.speedKmph || 28)} km/h
            </span>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border flex items-center space-x-1.5 ${
              isEmergency
                ? "bg-red-950/80 text-red-400 border-red-500 animate-pulse"
                : isEvaluating
                ? "bg-amber-950/80 text-amber-400 border-amber-500"
                : "bg-emerald-950/60 text-emerald-400 border-emerald-500/50"
            }`}
          >
            {isEmergency ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>EMERGENCY HOLD</span>
              </>
            ) : isEvaluating ? (
              <>
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>ACOUSTIC EVAL</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>ACTIVE • MESH OK</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SVG Vector Map Canvas */}
      <div className="relative w-full h-[380px] bg-[#05080E] rounded-xl border border-slate-900/80 overflow-hidden flex items-center justify-center">
        {/* Subtle Map Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#06B6D4 1px, transparent 1px), radial-gradient(#10B981 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            backgroundPosition: "0 0, 16px 16px",
          }}
        />

        <svg
          viewBox="0 0 800 400"
          className="w-full h-full object-contain"
          style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
        >
          {/* Corridor Road Glow */}
          <path
            d={svgPathData}
            fill="none"
            stroke={isEmergency ? "#ef4444" : "#10b981"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />

          {/* Main Road Polyline */}
          <path
            d={svgPathData}
            fill="none"
            stroke={isEmergency ? "#f87171" : "#059669"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Road Center Dotted Line */}
          <path
            d={svgPathData}
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />

          {/* Virtual Stop Geofences and Nodes */}
          {manifest.virtualStops.map((stop, sIdx) => {
            const pos = mapToSvg(stop.lat, stop.lng);
            const isHighlighted =
              highlightedStopId === stop.id || selectedStop?.id === stop.id;

            return (
              <g
                key={stop.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => {
                  setSelectedStop(stop);
                  if (onSelectStop) onSelectStop(stop);
                }}
              >
                {/* 150m Geofence Radius Circle (Phase 2 & 3 constraint) */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="34"
                  fill={isHighlighted ? "rgba(6, 182, 212, 0.15)" : "rgba(16, 185, 129, 0.08)"}
                  stroke={isHighlighted ? "#06B6D4" : "#10B981"}
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  className={isHighlighted ? "animate-pulse" : ""}
                />

                {/* Stop Center Marker */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="9"
                  fill="#0F172A"
                  stroke={isHighlighted ? "#38BDF8" : "#10B981"}
                  strokeWidth="2.5"
                />

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill={isHighlighted ? "#38BDF8" : "#34D399"}
                />

                {/* Stop Sequence Number */}
                <text
                  x={pos.x}
                  y={pos.y - 14}
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize="10"
                  fontWeight="600"
                  className="select-none font-mono"
                >
                  Stop {sIdx + 1}
                </text>
              </g>
            );
          })}

          {/* Pedestrian 150m Walk Lines to Geofence Centers */}
          {showPedestrianWalkPaths &&
            manifest.passengers.map((pax) => {
              const stop = manifest.virtualStops.find((s) => s.id === pax.pickupStopId);
              if (!stop) return null;
              const stopPos = mapToSvg(stop.lat, stop.lng);
              // Simulated commuter origin offset within 120m
              const offsetLat = stop.lat + (pax.walkDistanceMeters / 111000) * 0.7;
              const offsetLng = stop.lng - (pax.walkDistanceMeters / 111000) * 0.7;
              const paxPos = mapToSvg(offsetLat, offsetLng);

              return (
                <g key={`walk-${pax.id}`} opacity="0.65">
                  <line
                    x1={paxPos.x}
                    y1={paxPos.y}
                    x2={stopPos.x}
                    y2={stopPos.y}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <circle cx={paxPos.x} cy={paxPos.y} r="2.5" fill="#38BDF8" />
                </g>
              );
            })}

          {/* Animated Moving Fleet Vehicle */}
          <g transform={`translate(${vehicleSvgPos.x}, ${vehicleSvgPos.y})`}>
            {/* Pulsing vehicle radar aura */}
            <circle
              r="22"
              fill={isEmergency ? "rgba(239, 68, 68, 0.25)" : "rgba(16, 185, 129, 0.2)"}
              className="animate-ping"
            />
            {/* Vehicle Card Marker */}
            <rect
              x="-16"
              y="-12"
              width="32"
              height="24"
              rx="6"
              fill={isEmergency ? "#DC2626" : "#064E3B"}
              stroke={isEmergency ? "#FCA5A5" : "#34D399"}
              strokeWidth="2"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="bold"
            >
              {manifest.vehicleType === "SHARED_AUTO" ? "🛺" : "🚐"}
            </text>
          </g>
        </svg>

        {/* Dynamic Selected Stop Info Callout */}
        {selectedStop && (
          <div className="absolute bottom-4 left-4 max-w-sm rounded-xl bg-slate-950/90 border border-slate-700/80 p-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedStop.name}</span>
              </span>
              <button
                onClick={() => setSelectedStop(null)}
                className="text-slate-400 hover:text-white ml-2 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500 block">Geofence Radius:</span>
                <span className="font-mono text-emerald-400">150m (Strict RTO)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Est. Arrival ETA:</span>
                <span className="font-mono text-cyan-400">{selectedStop.estimatedArrivalMin} mins</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-800">
                <span className="text-slate-500">Boarding Commuters: </span>
                <span className="text-slate-200 font-medium">
                  {selectedStop.assignedPassengerIds.length} pre-manifested
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[11px] text-slate-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-200 inline-block"></span>
            <span>Virtual Stop (150m geofence)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block"></span>
            <span>Walk distance path (&lt;150m)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-1 bg-emerald-500 rounded inline-block"></span>
            <span>RTO Road Polyline</span>
          </div>
        </div>
        <div className="font-mono text-slate-400">
          Occupancy: <strong className="text-emerald-400">{manifest.occupancyRatePct}%</strong> (Target: &ge;90%)
        </div>
      </div>
    </div>
  );
};
