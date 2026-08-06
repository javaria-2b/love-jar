import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Memory } from '../hooks/useJar';
import MemoryCard from './MemoryCard';

interface MemorySlotMachineProps {
  memories: Memory[];
  onClose: () => void;
}

export default function MemorySlotMachine({ memories, onClose }: MemorySlotMachineProps) {
  const [spinning, setSpinning] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const spin = () => {
    if (spinning || memories.length === 0) return;

    setSpinning(true);
    setHasSpun(true);
    setSelectedMemory(null);

    // Pick a random memory
    const targetIndex = Math.floor(Math.random() * memories.length);
    const totalFlashes = 20 + Math.floor(Math.random() * 15);
    let currentFlash = 0;

    // Speed up then slow down
    intervalRef.current = setInterval(() => {
      currentFlash++;
      setDisplayIndex(Math.floor(Math.random() * memories.length));

      if (currentFlash >= totalFlashes) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        // Land on target
        setDisplayIndex(targetIndex);
        setTimeout(() => {
          setSelectedMemory(memories[targetIndex]);
          setSpinning(false);
        }, 300);
      }
    }, currentFlash < totalFlashes * 0.7 ? 60 : 120);
  };

  const currentFace = memories[displayIndex] || memories[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(47, 27, 14, 0.5)',
        backdropFilter: 'blur(6px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'var(--bg-warm)',
          borderRadius: '24px',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 16px 64px rgba(47, 27, 14, 0.2)',
          border: '2px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--ink-light)', zIndex: 1 }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            fontStyle: 'italic',
            color: 'var(--ink)',
            marginBottom: '2px',
          }}>
            🎰 memory slot machine
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)' }}>
            pull the lever for a surprise memory
          </p>
        </div>

        {/* Slot display */}
        <div style={{
          width: '100%',
          background: 'var(--cream)',
          borderRadius: '16px',
          border: '3px solid var(--border-color)',
          padding: '12px',
          minHeight: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Slot machine shine lines */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.05) 100%)',
            pointerEvents: 'none', zIndex: 2,
          }} />

          <AnimatePresence mode="wait">
            {selectedMemory ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%' }}
              >
                <MemoryCard memory={selectedMemory} variant="reveal" />
              </motion.div>
            ) : (
              <motion.div
                key={displayIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={spinning ? { opacity: [0, 1, 1, 0] } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                style={{ width: '100%' }}
              >
                <MemoryCard memory={currentFace} variant={spinning ? 'slot' : 'gallery'} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lever / Spin button */}
        <motion.button
          onClick={spin}
          disabled={spinning}
          whileHover={!spinning ? { scale: 1.05 } : {}}
          whileTap={!spinning ? { y: 4 } : {}}
          style={{
            padding: '14px 40px',
            background: spinning ? 'var(--dusty-rose)' : 'var(--wax-red)',
            color: 'var(--cream)',
            borderRadius: '25px',
            fontSize: '1.1rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.5px',
            boxShadow: spinning ? 'none' : '0 4px 16px rgba(139, 0, 0, 0.25)',
            transition: 'all 0.3s',
            opacity: spinning ? 0.7 : 1,
          }}
        >
          {spinning ? 'spinning...' : hasSpun ? '🎰 pull again!' : '🎰 pull the lever!'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
