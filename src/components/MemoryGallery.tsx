import { motion, AnimatePresence } from 'framer-motion';
import type { Memory } from '../hooks/useJar';
import MemoryCard from './MemoryCard';

interface MemoryGalleryProps {
  memories: Memory[];
}

export default function MemoryGallery({ memories }: MemoryGalleryProps) {
  if (memories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--ink-light)',
        }}
      >
        <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🫙</p>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', marginBottom: '4px' }}>
          the jar is empty
        </p>
        <p style={{ fontSize: '0.85rem' }}>
          tap the + button to drop in your first memory
        </p>
      </motion.div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '14px',
      }}
    >
      <AnimatePresence>
        {memories.map((memory, i) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <MemoryCard memory={memory} variant="gallery" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
