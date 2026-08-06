import { motion } from 'framer-motion';
import type { Memory } from '../hooks/useJar';

interface MemoryCardProps {
  memory: Memory;
  variant?: 'gallery' | 'reveal' | 'slot';
}

export default function MemoryCard({ memory, variant = 'gallery' }: MemoryCardProps) {
  const isReveal = variant === 'reveal';

  const cardStyle: React.CSSProperties = {
    background: 'var(--cream)',
    borderRadius: '12px',
    border: '2px solid var(--border-color)',
    padding: isReveal ? '20px' : '14px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: isReveal ? 'var(--shadow-card)' : 'var(--shadow-soft)',
    transition: 'all 0.3s ease',
    ...(isReveal ? { maxWidth: '100%' } : {}),
  };

  // Random vintage rotation for gallery cards
  const rotation = variant === 'gallery'
    ? [0, 0.5, -0.5, 1, -1][memory.content.length % 5]
    : 0;

  const dateStr = memory.createdAt?.toDate
    ? memory.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const content = (
    <>
      {/* Vintage tape/stamp decoration */}
      {variant === 'gallery' && (
        <div style={{
          position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)',
          width: '40px', height: '12px', background: 'rgba(196, 149, 106, 0.4)',
          borderRadius: '2px', zIndex: 1,
        }} />
      )}

      {/* Type icon */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: isReveal ? '12px' : '6px',
      }}>
        <span style={{ fontSize: isReveal ? '20px' : '14px' }}>
          {memory.type === 'note' ? '✉️' : memory.type === 'photo' ? '📷' : '🎙️'}
        </span>
        {isReveal && (
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--ink-light)',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            {memory.type}
          </span>
        )}
      </div>

      {/* Photo */}
      {memory.type === 'photo' && memory.mediaData && (
        <div style={{
          borderRadius: isReveal ? '8px' : '6px',
          overflow: 'hidden',
          marginBottom: isReveal ? '12px' : '6px',
          position: 'relative',
        }}>
          <img
            src={memory.mediaData}
            alt={memory.content}
            style={{
              width: '100%',
              maxHeight: isReveal ? '300px' : '140px',
              objectFit: 'cover',
              display: 'block',
            }}
            loading="lazy"
          />
          {/* Polaroid-style border in reveal mode */}
          {isReveal && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '12px 16px', background: 'rgba(47,27,14,0.03)',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                {memory.content}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Voice */}
      {memory.type === 'voice' && (
        <div style={{
          padding: isReveal ? '12px' : '8px',
          background: 'rgba(47,27,14,0.03)',
          borderRadius: '8px',
          marginBottom: isReveal ? '12px' : '6px',
        }}>
          {memory.mediaData && (
            <audio src={memory.mediaData} controls style={{ width: '100%', maxWidth: '280px' }} />
          )}
          {memory.voiceDuration && (
            <p style={{
              fontSize: isReveal ? '0.8rem' : '0.7rem',
              color: 'var(--ink-light)',
              marginTop: '4px',
              textAlign: 'center',
            }}>
              {Math.floor(memory.voiceDuration / 60)}:{(memory.voiceDuration % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>
      )}

      {/* Note text / Caption */}
      {memory.type === 'note' && (
        <motion.p
          initial={isReveal ? { opacity: 0 } : false}
          animate={isReveal ? { opacity: 1 } : false}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontSize: isReveal ? '1.15rem' : '0.9rem',
            lineHeight: isReveal ? 1.8 : 1.5,
            fontFamily: isReveal ? 'var(--font-display)' : 'var(--font-body)',
            fontStyle: isReveal ? 'italic' : 'normal',
            color: 'var(--ink)',
            whiteSpace: isReveal ? 'pre-wrap' : 'normal',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: isReveal ? undefined : 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {isReveal ? `"${memory.content}"` : memory.content}
        </motion.p>
      )}

      {(memory.type === 'photo' && !isReveal) && (
        <p style={{
          fontSize: '0.85rem', color: 'var(--ink)',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {memory.content}
        </p>
      )}

      {(memory.type === 'voice' && memory.content !== 'a voice message') && (
        <p style={{
          fontSize: '0.85rem', color: 'var(--ink)', fontStyle: 'italic',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          "{memory.content}"
        </p>
      )}

      {/* Date stamp */}
      {dateStr && (
        <p style={{
          fontSize: '0.7rem', color: 'var(--lavender)',
          marginTop: isReveal ? '12px' : '8px',
          fontStyle: 'italic',
          textAlign: isReveal ? 'center' : 'right',
        }}>
          {dateStr}
        </p>
      )}
    </>
  );

  if (variant === 'gallery') {
    return (
      <motion.div
        style={{ ...cardStyle, transform: `rotate(${rotation}deg)` }}
        whileHover={{ scale: 1.03, rotate: 0, boxShadow: 'var(--shadow-card)', zIndex: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {content}
      </motion.div>
    );
  }

  return <div style={cardStyle}>{content}</div>;
}
