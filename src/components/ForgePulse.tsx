/**
 * ============================================================
 * 💠 ForgePulse.tsx — Visual heartbeat + tooltip
 * Living status indicator for background worker health
 * ============================================================
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Health = "active" | "recovering" | "offline";

interface ForgePulseProps {
  status: Health;
  size?: number;
}

export default function ForgePulse({ status, size = 16 }: ForgePulseProps) {
  const [color, setColor] = useState("emerald");
  const [label, setLabel] = useState("Active");

  useEffect(() => {
    switch (status) {
      case "active":
        setColor("emerald");
        setLabel("Active");
        break;
      case "recovering":
        setColor("amber");
        setLabel("Recovering...");
        break;
      case "offline":
        setColor("rose");
        setLabel("Offline");
        break;
    }
  }, [status]);

  const glow = {
    emerald: "shadow-[0_0_10px_3px_rgba(16,185,129,0.7)]",
    amber: "shadow-[0_0_10px_3px_rgba(245,158,11,0.7)]",
    rose: "shadow-[0_0_10px_3px_rgba(244,63,94,0.7)]",
  }[color];

  const borderColor = {
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
  }[color];

  return (
    <div className="relative group">
      <AnimatePresence mode="wait">
        <motion.div
          key={color}
          initial={{ opacity: 0.6, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: [1, 1.1, 1],
            transition: {
              repeat: Infinity,
              duration: status === "active" ? 2 : 1,
              ease: "easeInOut",
            },
          }}
          exit={{ opacity: 0 }}
          className={`rounded-full ${glow} cursor-pointer`}
          style={{
            width: size,
            height: size,
            background: `linear-gradient(145deg, rgba(255,255,255,0.3), rgba(0,0,0,0.1))`,
            border: `2px solid ${borderColor}`,
          }}
        />
      </AnimatePresence>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 mt-2 hidden group-hover:block bg-gray-900/90 text-white text-[10px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-50"
      >
        {label}
      </motion.div>
    </div>
  );
}
