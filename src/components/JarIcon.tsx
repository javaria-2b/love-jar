import { motion } from 'framer-motion';

interface JarIconProps {
  size?: number;
  animated?: boolean;
  filled?: number; // 0-1 how full
}

export default function JarIcon({ size = 60, animated = true, filled = 0.3 }: JarIconProps) {
  return (
    <motion.svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={animated ? { rotate: [0, -2, 2, -2, 0] } : undefined}
      transition={animated ? { repeat: Infinity, duration: 4, ease: 'easeInOut' } : undefined}
    >
      {/* Jar body */}
      <motion.path
        d="M25 40 L25 95 Q25 105 35 105 L65 105 Q75 105 75 95 L75 40 Z"
        fill="rgba(245, 230, 204, 0.6)"
        stroke="var(--ink-light)"
        strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(47,27,14,0.1))' }}
      />
      {/* Fill level */}
      <rect
        x="26"
        y={95 - (55 * filled)}
        width="48"
        height={55 * filled}
        rx="2"
        fill="rgba(184, 150, 62, 0.25)"
        clipPath="polygon(0 0, 100% 0, 95% 100%, 5% 100%)"
      />
      {/* Floating hearts inside */}
      {filled > 0 && (
        <>
          <motion.g
            animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          >
            <text x="38" y={80 - (filled * 30)} fontSize="10">❤️</text>
          </motion.g>
          {filled > 0.3 && (
            <motion.g
              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1 }}
            >
              <text x="52" y={70 - (filled * 20)} fontSize="8">✨</text>
            </motion.g>
          )}
        </>
      )}
      {/* Jar neck */}
      <path
        d="M30 40 L30 28 Q30 22 36 22 L64 22 Q70 22 70 28 L70 40"
        fill="rgba(245, 230, 204, 0.4)"
        stroke="var(--ink-light)"
        strokeWidth="2.5"
      />
      {/* Lid */}
      <rect
        x="28"
        y="18"
        width="44"
        height="8"
        rx="3"
        fill="var(--dusty-rose)"
        stroke="var(--ink-light)"
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(47,27,14,0.15))' }}
      />
      {/* Lid knob */}
      <ellipse cx="50" cy="15" rx="8" ry="4" fill="var(--dusty-rose)" stroke="var(--ink-light)" strokeWidth="1.5" />
      {/* Label string / twine */}
      <path
        d="M30 50 Q45 55 50 50 Q55 45 70 50"
        stroke="var(--gold)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 2"
      />
      {/* Small tag */}
      <motion.rect
        x="42" y="52" width="16" height="12" rx="2"
        fill="var(--cream)"
        stroke="var(--ink-light)"
        strokeWidth="1"
        animate={animated ? { rotate: [0, -3, 3, 0] } : undefined}
        transition={animated ? { repeat: Infinity, duration: 5, ease: 'easeInOut' } : undefined}
      />
      <motion.text
        x="46" y="61"
        fontSize="7"
        fill="var(--wax-red)"
        fontFamily="var(--font-display)"
        animate={animated ? { rotate: [0, -3, 3, 0] } : undefined}
        transition={animated ? { repeat: Infinity, duration: 5, ease: 'easeInOut' } : undefined}
      >
        ♥
      </motion.text>
    </motion.svg>
  );
}
