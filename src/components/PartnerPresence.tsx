import { motion } from 'framer-motion';

interface PartnerPresenceProps {
  online: boolean;
}

export default function PartnerPresence({ online }: PartnerPresenceProps) {
  return (
    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
      {/* Glow ring */}
      <motion.div
        animate={online ? {
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.15, 0.4],
        } : {}}
        transition={online ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
        style={{
          position: 'absolute',
          inset: '-4px',
          borderRadius: '50%',
          background: online ? 'radial-gradient(circle, rgba(184, 150, 62, 0.4), transparent 70%)' : 'none',
        }}
      />
      {/* The light */}
      <motion.div
        animate={online ? {
          boxShadow: [
            '0 0 6px rgba(184, 150, 62, 0.4)',
            '0 0 16px rgba(184, 150, 62, 0.7)',
            '0 0 6px rgba(184, 150, 62, 0.4)',
          ],
        } : {}}
        transition={online ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: online
            ? 'radial-gradient(circle at 40% 40%, #E8C84A, #B8963E)'
            : 'radial-gradient(circle at 40% 40%, #C4BDB0, #A0988A)',
          border: online ? '2px solid rgba(184, 150, 62, 0.5)' : '2px solid rgba(160, 152, 138, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.5s ease',
        }}
      >
        <motion.span
          animate={online ? { scale: [1, 1.15, 1] } : {}}
          transition={online ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
          style={{ fontSize: '12px', lineHeight: 1 }}
        >
          {online ? '✨' : '💤'}
        </motion.span>
      </motion.div>
    </div>
  );
}
