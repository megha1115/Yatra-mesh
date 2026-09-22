# Yatra Mesh 🚏🚌

> **Corporate Shared Transit & Edge Safety Mesh Engine**  
> An intelligent, resilient mobility platform featuring edge acoustic anomaly detection, AI-powered route clustering, dynamic cryptographic passenger check-ins, and offline-first peer synchronization.

---

## 🌟 Key Features

### 1. 🎙️ Edge Acoustic Safety Telemetry
- Real-time client-side RMS decibel and acoustic disturbance analysis.
- Instant automated anomaly detection (>85 dB duration thresholds) triggering emergency state workflows without requiring persistent cloud connectivity.
- Dual testing mode: Live Microphone or High-Intensity Simulated Disturbance testing.

### 2. 🤖 Gemini-Powered Route Clustering
- Semantic & geographic clustering of employee commuter manifests.
- Intelligent multi-stop route grouping and route optimization tailored for corporate fleet efficiency.

### 3. 📲 Dynamic Cryptographic Check-Ins
- Commuter boarding manifests with time-rotating QR validation tokens.
- Instant driver manifest verification with offline caching.

### 4. 📶 Offline-First Mesh Resilience
- IndexedDB local storage engine for manifests, vehicle state, and emergency alerts.
- Auto-reconciliation and opportunistic synchronization when network connectivity restores.

### 5. 🏢 Multi-Portal Operations Suite
- **Commuter Portal**: Digital boarding pass, live route progression, and emergency SOS controls.
- **Driver Portal**: Passenger boarding scanner, acoustic telemetry HUD, and turnaround controls.
- **Enterprise Portal**: ESG emissions savings, fleet capacity utilization, and employee route clustering.
- **Dispatcher Portal**: Live telemetry matrix, vehicle status tracking, and active incident response.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/yatra-mesh.git

# Navigate into project directory
cd yatra-mesh

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access Yatra Mesh.  
On Windows, you can also launch directly using `Run-Yatra-Mesh.bat`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS & Lucide React
- **AI / LLM**: `@google/genai` (Gemini Flash Route Clustering)
- **Local Persistence**: IndexedDB API
- **Audio Processing**: Web Audio API (AnalyserNode & RMS telemetry)
- **TypeScript**: Strict type safety throughout

---

## 📄 License

This project is licensed under the MIT License.
