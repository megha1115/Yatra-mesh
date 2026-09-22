import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mesh: {
          dark: "#070B12",
          surface: "#0F172A",
          card: "#1E293B",
          border: "#334155",
          accent: "#10B981", // Neon emerald
          cyan: "#06B6D4",   // Cyber cyan
          amber: "#F59E0B",  // Alert amber
          crimson: "#EF4444",// Emergency crimson
          purple: "#8B5CF6", // Dynamic route
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "wave-bar": "waveBar 1.2s ease-in-out infinite alternate",
        "radar": "radarSweep 4s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        waveBar: {
          "0%": { height: "15%" },
          "100%": { height: "100%" },
        },
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
