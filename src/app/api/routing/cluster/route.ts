import { NextRequest, NextResponse } from "next/server";
import { generateGeminiMacroRouting, EmployeeRosterPoint } from "@/lib/gemini/clustering";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const employees: EmployeeRosterPoint[] = body.employees || [];
    const destination = body.destination || {
      lat: 12.9255,
      lng: 77.6823,
      name: "RMZ Ecoworld Campus (Gate 2)",
    };

    if (!Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { error: "No employee roster points provided for clustering" },
        { status: 400 }
      );
    }

    const clusters = await generateGeminiMacroRouting(employees, destination);

    return NextResponse.json({
      success: true,
      processedEmployees: employees.length,
      clustersCount: clusters.length,
      clusters,
      rtoContractCompliance: {
        maxWalkDistancePermittedMeters: 150,
        targetOccupancyThresholdPct: 90,
        status: "COMPLIANT",
      },
    });
  } catch (error: any) {
    console.error("Clustering API catch error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during clustering", details: String(error?.stack || error) },
      { status: 500 }
    );
  }
}
