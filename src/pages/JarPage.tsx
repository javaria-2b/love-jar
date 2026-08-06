import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useJar } from '../hooks/useJar';
import PartnerPresence from '../components/PartnerPresence';
import DailyReveal from '../components/DailyReveal';
import AddMemoryDrawer from '../components/AddMemoryDrawer';
import MemoryGallery from '../components/MemoryGallery';
import MemorySlotMachine from '../components/MemorySlotMachine';
import FloatingHearts from '../components/FloatingHearts';

export default function JarPage() {
  const navigate = useNavigate();
  const { uid } = useAuth();
  const {
    jar,
    memories,
    partnerPresence,
    loading,
    addMemory,
    leaveJar,
    getTodayRevealedMemory,
    setTodayReveal,
    pickRandomMemory,
  } = useJar(uid);

  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showSlotMachine, setShowSlotMachine] = useState(false);
  const [todayMemory, setTodayMemory] = useState(getTodayRevealedMemory());
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    setTodayMemory(getTodayRevealedMemory());
  }, [jar?.lastRevealMemoryId, jar?.lastRevealDate, memories]);

  // Real-time countdown ticking every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      if (diff <= 0) {
        setTodayMemory(null);
        setCountdown('any moment now ✦');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReveal = async () => {
    const random = pickRandomMemory();
    if (!random) return;
    await setTodayReveal(random.id);
  };

  const handleLeave = () => {
    leaveJar();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', color: 'var(--ink-light)',
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
      }}>
        ...
      </div>
    );
  }

  if (!jar) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100dvh', gap: '16px', padding: '24px',
      }}>
        <p style={{ color: 'var(--ink-light)', textAlign: 'center' }}>
          Couldn't find that jar. It may have been sealed forever.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 24px', background: 'var(--ink)', color: 'var(--cream)',
            borderRadius: '10px', fontFamily: 'var(--font-display)',
          }}
        >
          go home
        </button>
      </div>
    );
  }

  const isPartnerHere = partnerPresence?.online ?? false;

  return (
    <div style={{
      minHeight: '100dvh',
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '16px 20px 100px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <FloatingHearts />

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PartnerPresence online={isPartnerHere} />
          <div>
            <h2 style={{
              fontSize: '1.3rem',
              fontStyle: 'italic',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {jar.name}
            </h2>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--ink-light)',
              fontStyle: 'italic',
            }}>
              {isPartnerHere ? 'your person is here ✦' : 'just you for now'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLeave}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.75rem', color: 'var(--lavender)',
            padding: '6px 10px', borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(155,142,168,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={14} />
          leave
        </button>
      </header>

      {/* Decorative divider */}
      <div style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '4px', marginTop: '-12px' }}>
        ✿ ✦ ✿ ✦ ✿
      </div>

      {/* Daily Reveal */}
      <section style={{ marginTop: '4px' }}>
        <DailyReveal
          revealedMemory={todayMemory}
          memoriesCount={memories.length}
          onReveal={handleReveal}
          nextRevealCountdown={countdown}
        />
      </section>

      {/* Quick actions */}
      {memories.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <button
            onClick={() => setShowSlotMachine(true)}
            style={{
              padding: '10px 24px',
              background: 'rgba(184, 150, 62, 0.1)',
              color: 'var(--gold)',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-display)',
              border: '1px solid rgba(184, 150, 62, 0.25)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(184, 150, 62, 0.18)';
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(184, 150, 62, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🎰 spin the memory slot machine
          </button>
        </motion.div>
      )}

      {/* Memories Gallery */}
      <section>
        <h3 style={{
          fontSize: '1rem',
          color: 'var(--ink-light)',
          fontStyle: 'italic',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ color: 'var(--gold)' }}>✦</span>
          your memories ({memories.length})
          <span style={{ color: 'var(--gold)' }}>✦</span>
        </h3>
        <MemoryGallery memories={memories} />
      </section>

      {/* Add button (FAB) */}
      <motion.button
        onClick={() => setShowAddDrawer(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--wax-red)',
          color: 'var(--cream)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(139, 0, 0, 0.3)',
          zIndex: 50,
        }}
      >
        <Plus size={28} />
      </motion.button>

      {/* Add Memory Drawer */}
      <AnimatePresence>
        {showAddDrawer && (
          <AddMemoryDrawer
            onClose={() => setShowAddDrawer(false)}
            onAdd={addMemory}
            uid={uid!}
          />
        )}
      </AnimatePresence>

      {/* Slot Machine Modal */}
      <AnimatePresence>
        {showSlotMachine && (
          <MemorySlotMachine
            memories={memories}
            onClose={() => setShowSlotMachine(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
