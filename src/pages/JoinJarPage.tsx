import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useJar } from '../hooks/useJar';

export default function JoinJarPage() {
  const navigate = useNavigate();
  const { uid } = useAuth();
  const { joinJar } = useJar(uid);
  const [jarName, setJarName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!jarName.trim()) {
      setError('Enter the jar name your partner created');
      return;
    }
    if (!passcode) {
      setError('You need the secret passcode to open this jar');
      return;
    }
    if (!uid) {
      setError('Not connected. Try refreshing?');
      return;
    }

    setJoining(true);
    setError('');

    try {
      const jarId = await joinJar(jarName.trim(), passcode, uid);
      navigate(`/jar/${jarId}`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Could not open that jar. Check your spelling?');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      maxWidth: '420px',
      margin: '0 auto',
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--ink-light)',
          fontSize: '0.9rem',
          padding: '8px 0',
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={16} />
        back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '32px' }}
      >
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--gold)',
            fontSize: '1.2rem',
            letterSpacing: '6px',
            marginBottom: '12px',
          }}>
            ✦ ✿ ✦
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            welcome back
          </h1>
          <p style={{ color: 'var(--ink-light)', fontSize: '0.95rem' }}>
            Your partner left a jar waiting for you.<br />
            Enter the name and secret passcode to open it.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              fontSize: '0.85rem',
              color: 'var(--ink-light)',
              marginBottom: '6px',
              display: 'block',
              fontFamily: 'var(--font-display)',
            }}>
              jar name
            </label>
            <input
              type="text"
              value={jarName}
              onChange={(e) => { setJarName(e.target.value); setError(''); }}
              placeholder='e.g. "our little anchovy"'
              autoFocus
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'var(--cream)',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1.05rem',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--ink)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '0.85rem',
              color: 'var(--ink-light)',
              marginBottom: '6px',
              display: 'block',
              fontFamily: 'var(--font-display)',
            }}>
              secret passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="the secret word"
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'var(--cream)',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1.05rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--ink)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              background: 'rgba(139, 0, 0, 0.06)',
              borderRadius: '10px',
              color: 'var(--wax-red)',
              fontSize: '0.9rem',
              textAlign: 'center',
              border: '1px solid rgba(139, 0, 0, 0.15)',
            }}
          >
            {error}
          </motion.div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            padding: '16px',
            background: joining ? 'var(--dusty-rose)' : 'var(--ink)',
            color: 'var(--cream)',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontFamily: 'var(--font-display)',
            marginTop: 'auto',
            transition: 'all 0.3s',
            opacity: joining ? 0.7 : 1,
          }}
        >
          {joining ? 'opening...' : '✦ open the jar'}
        </button>
      </motion.div>
    </div>
  );
}
