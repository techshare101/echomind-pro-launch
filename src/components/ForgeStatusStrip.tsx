/**
 * ============================================================
 * 🌊 ForgeStatusStrip.tsx — Animated energy baseline
 * Living pulse strip that mirrors background worker health
 * ============================================================
 */

import { motion } from "framer-motion";
import type { HealthStatus } from '../hooks/useBackgroundHealth';

interface ForgeStatusStripProps {
  status: HealthStatus;
}

export default function ForgeStatusStrip({ status }: ForgeStatusStripProps) {
  const colorConfig = {
    active: {
      bg: "bg-gradient-to-r from-emerald-500/20 via-emerald-400/40 to-emerald-500/20",
      glow: "shadow-[0_-2px_10px_rgba(16,185,129,0.3)]",
      duration: 3,
    },
    recovering: {
      bg: "bg-gradient-to-r from-amber-500/20 via-amber-400/40 to-amber-500/20",
      glow: "shadow-[0_-2px_10px_rgba(245,158,11,0.3)]",
      duration: 1.5,
    },
    offline: {
      bg: "bg-gradient-to-r from-rose-500/20 via-rose-400/40 to-rose-500/20",
      glow: "shadow-[0_-2px_10px_rgba(244,63,94,0.3)]",
      duration: 2,
    },
  };

  const config = colorConfig[status];

  return (
    <div className="relative h-1 w-full overflow-hidden">
      {/* Base strip */}
      <div className={`absolute inset-0 ${config.bg} ${config.glow}`} />
      
      {/* Animated pulse wave */}
      <motion.div
        className="absolute h-full w-1/3"
        style={{
          background: status === "active" 
            ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)"
            : status === "recovering"
            ? "linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)"
            : "linear-gradient(90deg, transparent, rgba(244,63,94,0.6), transparent)",
        }}
        animate={{
          x: ["-100%", "400%"],
        }}
        transition={{
          repeat: Infinity,
          duration: config.duration,
          ease: "linear",
        }}
      />
    </div>
  );
}
