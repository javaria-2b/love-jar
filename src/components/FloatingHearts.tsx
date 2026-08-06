import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Heart {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
}

const HEART_EMOJIS = ['♥', '✿', '✦', '♡', '✧', '❀'];

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  let nextId = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart: Heart = {
        id: nextId++,
        x: Math.random() * 100,
        size: 12 + Math.random() * 20,
        duration: 4 + Math.random() * 6,
        delay: 0,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      };

      setHearts((prev) => {
        const filtered = prev.filter((h) => h.id > nextId - 30);
        return [...filtered, newHeart];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 0, y: '110vh', x: `${heart.x}vw`, rotate: 0 }}
            animate={{ opacity: [0, 0.4, 0.3, 0], y: '-10vh', rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: heart.duration,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              fontSize: `${heart.size}px`,
              filter: 'blur(0.5px)',
              color: 'var(--dusty-rose)',
            }}
          >
            {heart.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
