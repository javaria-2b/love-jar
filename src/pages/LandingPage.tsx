import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import JarIcon from '../components/JarIcon';
import { getStoredJarId } from '../hooks/useJar';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // If already in a jar, redirect there
    const jarId = getStoredJarId();
    if (jarId) navigate(`/jar/${jarId}`, { replace: true });
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      textAlign: 'center',
      gap: '12px',
    }}>
      {/* Decorative top ornament */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--gold)',
          fontSize: '1.5rem',
          letterSpacing: '8px',
          marginBottom: '8px',
        }}
      >
        ✿ ✦ ✿
      </motion.div>

      {/* Jar */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <JarIcon size={140} filled={0.5} />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          fontSize: '2.8rem',
          fontStyle: 'italic',
          marginTop: '8px',
          lineHeight: 1.2,
        }}
      >
        love jar
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{
          color: 'var(--ink-light)',
          maxWidth: '320px',
          fontSize: '1.05rem',
          lineHeight: 1.7,
          marginBottom: '8px',
        }}
      >
        a tiny keepsake jar for you and your person,<br />
        no matter how far apart
      </motion.p>

      {/* Decorative divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        style={{
          width: '120px',
          height: '1px',
          background: 'var(--border-color)',
          margin: '8px 0',
        }}
      />

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px', marginTop: '8px' }}
      >
        <button
          onClick={() => navigate('/create')}
          style={{
            padding: '16px 32px',
            background: 'var(--ink)',
            color: 'var(--cream)',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-card)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lift)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          }}
        >
          start a new jar ✦
        </button>

        <button
          onClick={() => navigate('/join')}
          style={{
            padding: '14px 32px',
            background: 'transparent',
            color: 'var(--ink)',
            borderRadius: '12px',
            fontSize: '1rem',
            fontFamily: 'var(--font-display)',
            border: '2px solid var(--border-color)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--ink)';
            e.currentTarget.style.background = 'rgba(47, 27, 14, 0.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          open an existing jar
        </button>
      </motion.div>

      {/* Footer whisper */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        style={{
          marginTop: '40px',
          fontSize: '0.8rem',
          color: 'var(--lavender)',
          fontStyle: 'italic',
        }}
      >
        made for hearts that miss each other
      </motion.p>
    </div>
  );
}
