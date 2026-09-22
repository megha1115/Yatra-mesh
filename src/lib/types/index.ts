export type UserRole = "COMMUTER" | "DRIVER" | "HR_ADMIN" | "DISPATCHER";

export type VehicleType = "SHARED_AUTO" | "TEMPO_TRAVELER" | "MINIBUS";

export type TripStatus = "SCHEDULED" | "EN_ROUTE" | "EVALUATING" | "EMERGENCY_HOLD" | "COMPLETED";

export type BoardingStatus = "PENDING" | "ONBOARDED" | "NO_SHOW";

export interface Enterprise {
  id: string;
  name: string;
  cinNumber: string; // Corporate Identification Number e.g. U72200KA2023PTC178941
  contractPermitRef: string; // RTO Contract Carriage permit reference e.g. KA-RTO-CC-2024-918
  headquarters: string;
  contactEmail: string;
  targetOccupancyPct: number; // default 90%
  esgMonthlyTargetKgCo2: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  enterpriseId: string;
  avatarUrl?: string;
  homeAddress?: string;
  homeLat?: number;
  homeLng?: number;
  shiftTime?: string;
}

export interface FleetVehicle {
  id: string;
  registrationNumber: string; // Yellow-board commercial plate e.g. KA 03 AG 9042
  vehicleType: VehicleType;
  seatCapacity: number; // 3, 12, or 24
  makeModel: string;
  rtoPermitExpiry: string;
  isYellowBoardCompliant: boolean;
  driverId: string;
  currentLat: number;
  currentLng: number;
  speedKmph: number;
  fuelType: "EV" | "CNG" | "DIESEL";
}

export interface VirtualStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number; // 150m geofence radius
  assignedPassengerIds: string[];
  estimatedArrivalMin: number;
}

export interface TripPassenger {
  id: string;
  tripId: string;
  userId: string;
  name: string;
  seatNumber: string;
  pickupStopId: string;
  pickupStopName: string;
  pickupLat: number;
  pickupLng: number;
  walkDistanceMeters: number; // Must be < 150m
  boardingStatus: BoardingStatus;
  boardingToken: string; // Cryptographic QR validation token
  boardedAt?: string;
  isOfflineVerified?: boolean;
}

export interface TripManifest {
  id: string;
  manifestNumber: string; // e.g. MNF-BLR-2026-0881
  enterpriseId: string;
  vehicleId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleRegistration: string;
  vehicleType: VehicleType;
  seatCapacity: number;
  shiftWindow: string; // e.g. "08:30 - 09:30 AM"
  status: TripStatus;
  virtualStops: VirtualStop[];
  passengers: TripPassenger[];
  occupancyRatePct: number; // >= 90%
  totalWalkDistanceMeters: number;
  avgWalkDistanceMeters: number;
  carbonSavedKg: number;
  routePolyline: [number, number][]; // Array of [lat, lng] waypoints
  speedKmph?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface AudioTelemetryEvent {
  timestamp: number;
  decibelRMS: number;
  peakFrequencyHz: number;
  isSpike: boolean;
  exceedsThreshold: boolean;
}

export interface EmergencyAlertPacket {
  id: string;
  tripId: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  driverName: string;
  driverPhone: string;
  gpsCoordinates: {
    lat: number;
    lng: number;
    speedKmph: number;
  };
  passengersOnboard: {
    name: string;
    seatNumber: string;
    phone: string;
  }[];
  peakDecibels: number;
  triggerReason: string;
  triggeredAt: string;
  status: "OPEN" | "ACKNOWLEDGED" | "PATROL_DISPATCHED" | "RESOLVED";
}

export interface OfflineSyncItem {
  id: string;
  type: "BOARDING_VERIFIED" | "TELEMETRY_PING" | "EMERGENCY_FLAG";
  tripId: string;
  passengerId?: string;
  token?: string;
  timestamp: string;
  synced: boolean;
}
