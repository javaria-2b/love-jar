import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useJar } from '../hooks/useJar';

export default function CreateJarPage() {
  const navigate = useNavigate();
  const { uid } = useAuth();
  const { createJar } = useJar(uid);
  const [jarName, setJarName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [step, setStep] = useState<'name' | 'passcode'>('name');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleNext = () => {
    if (!jarName.trim()) {
      setError('Give your jar a sweet name ✦');
      return;
    }
    if (jarName.trim().length < 2) {
      setError('A little longer, maybe?');
      return;
    }
    setError('');
    setStep('passcode');
  };

  const handleCreate = async () => {
    if (!passcode) {
      setError('You need a passcode to seal the jar!');
      return;
    }
    if (passcode.length < 4) {
      setError('Passcode should be at least 4 characters');
      return;
    }
    if (passcode !== confirmPasscode) {
      setError('Passcodes don\'t match, darling');
      return;
    }
    if (!uid) {
      setError('Not connected. Try refreshing?');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const jarId = await createJar(jarName.trim(), passcode, uid);
      navigate(`/jar/${jarId}`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setCreating(false);
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
        onClick={() => step === 'name' ? navigate('/') : setStep('name')}
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
        {step === 'name' ? 'back' : 'change name'}
      </button>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '20px 0' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: step === 'name' ? 'var(--ink)' : 'var(--dusty-rose)',
          transition: 'background 0.3s',
        }} />
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: step === 'passcode' ? 'var(--ink)' : 'var(--border-color)',
          transition: 'background 0.3s',
        }} />
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '12px' }}
      >
        {step === 'name' ? (
          <>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                what shall we<br />call this jar?
              </h1>
              <p style={{ color: 'var(--ink-light)', fontSize: '0.95rem' }}>
                Something only the two of you would know —<br />
                a nickname, an inside joke, a special place.
              </p>
            </div>

            <input
              type="text"
              value={jarName}
              onChange={(e) => { setJarName(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              placeholder='e.g. "our little anchovy"'
              autoFocus
              maxLength={40}
              style={{
                padding: '16px 20px',
                background: 'var(--cream)',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--ink)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--lavender)', marginTop: '-16px' }}>
              {jarName.length}/40 — your partner will need this exact name to find the jar
            </p>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: 'var(--wax-red)', fontSize: '0.9rem', textAlign: 'center' }}
              >
                {error}
              </motion.p>
            )}

            <button onClick={handleNext} style={{
              padding: '16px',
              background: 'var(--ink)',
              color: 'var(--cream)',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontFamily: 'var(--font-display)',
              marginTop: 'auto',
              transition: 'all 0.3s',
            }}>
              next ✦ make it secret
            </button>
          </>
        ) : (
          <>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                seal it with<br />a secret word
              </h1>
              <p style={{ color: 'var(--ink-light)', fontSize: '0.95rem' }}>
                Pick a passcode to share with your person.<br />
                Like sealing a love letter with wax.
              </p>
            </div>

            <input
              type="password"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(''); }}
              placeholder="secret passcode"
              autoFocus
              style={{
                padding: '16px 20px',
                background: 'var(--cream)',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--ink)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />

            <input
              type="password"
              value={confirmPasscode}
              onChange={(e) => { setConfirmPasscode(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="confirm passcode"
              style={{
                padding: '16px 20px',
                background: 'var(--cream)',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color 0.3s',
                marginTop: '-12px',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--ink)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: 'var(--wax-red)', fontSize: '0.9rem', textAlign: 'center' }}
              >
                {error}
              </motion.p>
            )}

            <button
              onClick={handleCreate}
              disabled={creating}
              style={{
                padding: '16px',
                background: creating ? 'var(--dusty-rose)' : 'var(--wax-red)',
                color: 'var(--cream)',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontFamily: 'var(--font-display)',
                marginTop: 'auto',
                transition: 'all 0.3s',
                opacity: creating ? 0.7 : 1,
              }}
            >
              {creating ? 'sealing your jar...' : '✦ seal the jar'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
