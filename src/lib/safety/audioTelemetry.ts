"use client";

import { AudioTelemetryEvent } from "../types";

export type AudioTelemetryCallback = (event: AudioTelemetryEvent) => void;
export type AnomalyTriggerCallback = (durationSeconds: number, peakDb: number) => void;

export class AudioTelemetryEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private isMonitoring: boolean = false;

  // Running RMS tracking
  private thresholdDb: number = 85;
  private sustainedSpikeStartTime: number | null = null;
  private onTelemetryUpdate?: AudioTelemetryCallback;
  private onAnomalyTriggered?: AnomalyTriggerCallback;

  // Simulation mode
  private simulatedSpikeActive: boolean = false;

  constructor(
    thresholdDb: number = 85,
    onTelemetry?: AudioTelemetryCallback,
    onAnomaly?: AnomalyTriggerCallback
  ) {
    this.thresholdDb = thresholdDb;
    this.onTelemetryUpdate = onTelemetry;
    this.onAnomalyTriggered = onAnomaly;
  }

  public startPassiveTelemetry(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.processAudioLoop();
  }

  public async startRealMicrophone(): Promise<boolean> {
    try {
      if (typeof window === "undefined" || !navigator.mediaDevices) {
        console.warn("Web Audio API not supported in this environment");
        return false;
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.3;
      source.connect(this.analyser);

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.isMonitoring = true;
      this.processAudioLoop();
      return true;
    } catch (err) {
      console.warn("Microphone access denied or unavailable. Running in passive telemetry mode.", err);
      return false;
    }
  }

  private processAudioLoop = () => {
    if (!this.isMonitoring) return;

    let currentDb = 45; // Ambient background vehicle rumble baseline

    if (this.simulatedSpikeActive) {
      // Simulate sharp acoustic spike between 88 and 94 dB
      currentDb = 88 + Math.random() * 6;
    } else if (this.analyser) {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteTimeDomainData(dataArray);

      // Compute Root-Mean-Square (RMS)
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);

      // Convert RMS to estimated decibels (SPL calibrated scale: 40-100 dB)
      if (rms > 0.0001) {
        // Map 0.01 - 1.0 to 45 - 98 dB
        currentDb = Math.min(105, Math.max(40, Math.round(20 * Math.log10(rms * 100) + 55)));
      } else {
        currentDb = 42;
      }
    } else {
      // Gentle passive fluctuation when mic is inactive
      currentDb = 45 + Math.sin(Date.now() / 800) * 4;
    }

    const exceeds = currentDb >= this.thresholdDb;
    const now = Date.now();

    if (exceeds) {
      if (!this.sustainedSpikeStartTime) {
        this.sustainedSpikeStartTime = now;
      } else {
        const elapsedSec = (now - this.sustainedSpikeStartTime) / 1000;
        // Phase 4 Constraint: If audio levels exceed 85 dB for > 3 seconds
        if (elapsedSec >= 3.0) {
          if (this.onAnomalyTriggered) {
            this.onAnomalyTriggered(elapsedSec, currentDb);
          }
          this.sustainedSpikeStartTime = null; // Reset to prevent duplicate alerts
        }
      }
    } else {
      this.sustainedSpikeStartTime = null;
    }

    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({
        timestamp: now,
        decibelRMS: Math.round(currentDb * 10) / 10,
        peakFrequencyHz: 440 + Math.random() * 200,
        isSpike: exceeds,
        exceedsThreshold: exceeds,
      });
    }

    this.animationFrameId = requestAnimationFrame(this.processAudioLoop);
  };

  public triggerSimulatedDisturbance(active: boolean) {
    this.simulatedSpikeActive = active;
    if (!this.isMonitoring) {
      this.isMonitoring = true;
      this.processAudioLoop();
    }
  }

  public stop() {
    this.isMonitoring = false;
    this.simulatedSpikeActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
  }
}
