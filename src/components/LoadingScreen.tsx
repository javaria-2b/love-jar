import { motion } from 'framer-motion';
import JarIcon from './JarIcon';

export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      gap: '24px',
      background: 'var(--bg-warm)',
    }}>
      <motion.div
        animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.05, 1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <JarIcon size={80} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          color: 'var(--ink-light)',
          fontSize: '1.1rem',
        }}
      >
        warming up the love jar...
      </motion.p>
    </div>
  );
}
