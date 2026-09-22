"use client";

import { LocalIndexedDb } from "./indexedDb";
import { TripManifest, OfflineSyncItem } from "../types";

export interface SyncStatusResult {
  syncedCount: number;
  remainingQueueCount: number;
}

export class OfflineSyncManager {
  /**
   * Offline peer-to-peer / local verification of commuter pass
   */
  public static async verifyPassengerOffline(
    manifestId: string,
    passengerId: string,
    boardingToken: string
  ): Promise<{ success: boolean; message: string; manifest?: TripManifest }> {
    try {
      const cachedManifest = await LocalIndexedDb.getManifest(manifestId);

      if (!cachedManifest) {
        return {
          success: false,
          message: "Manifest not found in local IndexedDB cache",
        };
      }

      const passenger = cachedManifest.passengers.find(
        (p) => p.id === passengerId || p.boardingToken === boardingToken
      );

      if (!passenger) {
        return {
          success: false,
          message: "Passenger token not pre-manifested on this vehicle",
        };
      }

      if (passenger.boardingStatus === "ONBOARDED") {
        return {
          success: true,
          message: `Passenger ${passenger.name} is already onboarded`,
          manifest: cachedManifest,
        };
      }

      // Update passenger locally
      passenger.boardingStatus = "ONBOARDED";
      passenger.boardedAt = new Date().toLocaleTimeString();
      passenger.isOfflineVerified = true;

      // Update cached manifest
      await LocalIndexedDb.saveManifest(cachedManifest);

      // Queue offline sync action for central database replay
      const syncItem: OfflineSyncItem = {
        id: `sync-${Date.now()}-${passenger.id}`,
        type: "BOARDING_VERIFIED",
        tripId: manifestId,
        passengerId: passenger.id,
        token: boardingToken,
        timestamp: new Date().toISOString(),
        synced: false,
      };
      await LocalIndexedDb.enqueueSyncItem(syncItem);

      return {
        success: true,
        message: `Offline pass verified: ${passenger.name} onboarded to ${passenger.seatNumber}`,
        manifest: cachedManifest,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Offline verification error: ${err?.message || "Unknown error"}`,
      };
    }
  }

  /**
   * Replays pending items from IndexedDB sync queue when connectivity resumes
   */
  public static async replayPendingSyncQueue(
    onProgress?: (synced: number, total: number) => void
  ): Promise<SyncStatusResult> {
    try {
      const items = await LocalIndexedDb.getPendingSyncItems();
      if (items.length === 0) {
        return { syncedCount: 0, remainingQueueCount: 0 };
      }

      let syncedCount = 0;
      for (const item of items) {
        // Simulate sending telemetry/check-in replay to central PostGIS DB
        await new Promise((res) => setTimeout(res, 200));
        await LocalIndexedDb.removeSyncItem(item.id);
        syncedCount++;

        if (onProgress) {
          onProgress(syncedCount, items.length);
        }
      }

      return {
        syncedCount,
        remainingQueueCount: 0,
      };
    } catch (err) {
      console.error("Sync replay error:", err);
      const remaining = (await LocalIndexedDb.getPendingSyncItems()).length;
      return { syncedCount: 0, remainingQueueCount: remaining };
    }
  }
}
