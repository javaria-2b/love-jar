import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Memory } from "../hooks/useJar";
import MemoryCard from "./MemoryCard";

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "this morning";
  if (hour >= 12 && hour < 17) return "this afternoon";
  if (hour >= 17 && hour < 21) return "this evening";
  return "tonight";
}

interface DailyRevealProps {
  revealedMemory: Memory | null;
  memoriesCount: number;
  onReveal: () => Promise<void>;
  nextRevealCountdown: string;
}

export default function DailyReveal({
  revealedMemory,
  memoriesCount,
  onReveal,
  nextRevealCountdown,
}: DailyRevealProps) {
  return (
    <div
      className="vignette"
      style={{
        background: "var(--cream)",
        borderRadius: "16px",
        border: "2px solid var(--border-color)",
        padding: "24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        minHeight: "200px",
      }}
    >
      {/* Decorative wax seal in corner */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "var(--wax-red)",
          opacity: 0.15,
        }}
      />

      <AnimatePresence mode="wait">
        {revealedMemory ? (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.8rem",
                color: "var(--gold)",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "16px",
              }}
            >
              ✦ today's memory ✦
            </p>
            <MemoryCard memory={revealedMemory} variant="reveal" />
            <p
              style={{
                marginTop: "16px",
                fontSize: "0.8rem",
                color: "var(--ink-light)",
                fontStyle: "italic",
              }}
            >
              come back in {nextRevealCountdown} for a new one
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="sealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              padding: "16px 0",
            }}
          >
            {/* Wax seal */}
            <motion.div
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--wax-red), var(--wax-red-light))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 4px 16px rgba(139, 0, 0, 0.2), inset 0 2px 4px rgba(255,255,255,0.2)",
                position: "relative",
              }}
            >
              {/* Wax seal inner ring */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "24px",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                  }}
                >
                  ♥
                </span>
              </div>
              {/* Seal ribbon */}
              <motion.div
                animate={{ width: ["40px", "44px", "40px"] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  height: "6px",
                  background: "rgba(255,255,255,0.25)",
                  borderRadius: "3px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </motion.div>

            <div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  color: "var(--ink)",
                  marginBottom: "4px",
                }}
              >
                a memory awaits
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--ink-light)",
                }}
              >
                sealed with lovee since {getTimeOfDay()}
              </p>
            </div>

            <motion.button
              onClick={onReveal}
              disabled={memoriesCount === 0}
              whileHover={memoriesCount > 0 ? { scale: 1.03 } : {}}
              whileTap={memoriesCount > 0 ? { scale: 0.97 } : {}}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                background:
                  memoriesCount > 0 ? "var(--ink)" : "var(--border-color)",
                color: "var(--cream)",
                borderRadius: "25px",
                fontSize: "1rem",
                fontFamily: "var(--font-display)",
                transition: "all 0.3s",
                opacity: memoriesCount > 0 ? 1 : 0.5,
              }}
            >
              <Sparkles size={18} />
              {memoriesCount > 0
                ? "reveal today's memory"
                : "add some memories first"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
