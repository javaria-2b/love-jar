import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Mic, MicOff, Image, PenLine, Music } from 'lucide-react';
import type { ReactNode } from 'react';

interface AddMemoryDrawerProps {
  onClose: () => void;
  onAdd: (type: 'note' | 'photo' | 'voice', content: string, uid: string, mediaData?: string | null, duration?: number) => Promise<void>;
  uid: string;
}

type Tab = 'note' | 'photo' | 'voice';

const tabs: { key: Tab; label: string; icon: ReactNode }[] = [
  { key: 'note', label: 'note', icon: <PenLine size={18} /> },
  { key: 'photo', label: 'photo', icon: <Image size={18} /> },
  { key: 'voice', label: 'voice', icon: <Music size={18} /> },
];

// Compress an image file to a base64 data URI that fits in Firestore
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Max dimension 600px — keeps file small for Firestore
        const MAX = 600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height / width) * MAX);
            width = MAX;
          } else {
            width = Math.round((width / height) * MAX);
            height = MAX;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Quality 0.6 — good balance of size vs quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Convert a Blob to a base64 data URI
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read audio'));
    reader.readAsDataURL(blob);
  });
}

export default function AddMemoryDrawer({ onClose, onAdd, uid }: AddMemoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('note');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [compressing, setCompressing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (f.size > 20 * 1024 * 1024) {
      setError('Image should be under 20MB (it will be compressed)');
      return;
    }

    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      setError('Could not access microphone. Check your browser permissions.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    setError('');

    if (activeTab === 'note' && !content.trim()) {
      setError('Write a little something first ✦');
      return;
    }
    if (activeTab === 'photo' && !file) {
      setError('Pick a photo to add');
      return;
    }
    if (activeTab === 'voice' && !audioBlob && !file) {
      setError('Record something or upload an audio file');
      return;
    }

    setIsSubmitting(true);
    setCompressing(true);
    try {
      const finalContent = content.trim() || (activeTab === 'photo' ? 'a picture' : 'a voice message');
      let mediaData: string | null = null;

      // Compress and convert to base64
      if (activeTab === 'photo' && file) {
        mediaData = await compressImage(file);
      } else if (activeTab === 'voice') {
        const blob = audioBlob || file;
        if (blob) {
          mediaData = await blobToBase64(blob);
        }
      }

      setCompressing(false);
      const duration = activeTab === 'voice' && audioBlob ? recordingTime : undefined;
      await onAdd(activeTab, finalContent, uid, mediaData, duration);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save. Try again.');
    } finally {
      setIsSubmitting(false);
      setCompressing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(47, 27, 14, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          width: '100%',
          maxWidth: 'var(--max-width)',
          maxHeight: '85dvh',
          background: 'var(--bg-warm)',
          borderRadius: '24px 24px 0 0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflow: 'auto',
          boxShadow: '0 -8px 40px rgba(47, 27, 14, 0.15)',
        }}
      >
        {/* Handle + close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border-color)', margin: '0 auto' }} />
          <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', color: 'var(--ink-light)' }}>
            <X size={20} />
          </button>
        </div>

        <h3 style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '1.1rem' }}>
          drop something in the jar
        </h3>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(47,27,14,0.05)', borderRadius: '12px', padding: '4px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-display)',
                background: activeTab === tab.key ? 'var(--cream)' : 'transparent',
                color: activeTab === tab.key ? 'var(--ink)' : 'var(--ink-light)',
                boxShadow: activeTab === tab.key ? 'var(--shadow-soft)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ minHeight: '150px' }}>
          {activeTab === 'note' && (
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setError(''); }}
              placeholder="dear you, ..."
              autoFocus
              rows={5}
              maxLength={2000}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--cream)',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.7,
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--ink)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          )}

          {activeTab === 'photo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filePreview ? (
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={filePreview} alt="Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '12px' }} />
                  <button
                    onClick={() => { setFile(null); setFilePreview(null); }}
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: 'rgba(0,0,0,0.5)', color: 'white',
                      borderRadius: '50%', width: '28px', height: '28px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  padding: '32px', border: '2px dashed var(--border-color)', borderRadius: '12px',
                  cursor: 'pointer', transition: 'border-color 0.3s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--ink)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <Upload size={32} style={{ color: 'var(--ink-light)' }} />
                  <span style={{ color: 'var(--ink-light)', fontSize: '0.9rem' }}>tap to pick a photo</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--lavender)' }}>automatically compressed for storage</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                </label>
              )}
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="add a caption (optional)"
                maxLength={500}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'var(--cream)', border: '2px solid var(--border-color)',
                  borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {activeTab === 'voice' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {audioBlob ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    padding: '20px', background: 'var(--cream)', borderRadius: '16px',
                    display: 'flex', alignItems: 'center', gap: '16px', width: '100%',
                  }}>
                    <span style={{ fontSize: '32px' }}>🎙️</span>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>voice message</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)' }}>{formatTime(recordingTime)}</p>
                    </div>
                    <audio src={URL.createObjectURL(audioBlob)} controls style={{ marginLeft: 'auto', maxWidth: '160px' }} />
                  </div>
                  <button
                    onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                    style={{ fontSize: '0.85rem', color: 'var(--lavender)' }}
                  >
                    re-record
                  </button>
                </div>
              ) : (
                <>
                  <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isRecording ? { scale: [1, 1.08, 1] } : {}}
                    transition={isRecording ? { repeat: Infinity, duration: 1 } : {}}
                    style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      background: isRecording ? 'var(--wax-red)' : 'var(--ink)',
                      color: 'var(--cream)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      boxShadow: isRecording
                        ? '0 0 0 8px rgba(139,0,0,0.15), 0 4px 20px rgba(139,0,0,0.3)'
                        : 'var(--shadow-card)',
                    }}
                  >
                    {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                  </motion.button>
                  {isRecording && (
                    <p style={{ fontFamily: 'var(--font-display)', color: 'var(--wax-red)', fontSize: '1.2rem' }}>
                      {formatTime(recordingTime)}
                    </p>
                  )}
                  {!isRecording && (
                    <>
                      <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem' }}>tap to record ✦</p>
                      <div style={{ width: '100%', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--lavender)', marginBottom: '8px' }}>or upload a file</p>
                        <label style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', border: '1px solid var(--border-color)',
                          borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem',
                          color: 'var(--ink-light)',
                        }}>
                          <Upload size={14} />
                          upload audio
                          <input type="file" accept="audio/*" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setFile(f);
                          }} hidden />
                        </label>
                        {file && (
                          <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--ink)' }}>
                            {(file as File).name}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: 'var(--wax-red)', fontSize: '0.85rem', textAlign: 'center' }}
          >
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '14px',
            background: 'var(--ink)',
            color: 'var(--cream)',
            borderRadius: '14px',
            fontSize: '1.05rem',
            fontFamily: 'var(--font-display)',
            opacity: isSubmitting ? 0.6 : 1,
            transition: 'all 0.3s',
          }}
        >
          {compressing ? 'compressing...' : isSubmitting ? 'dropping in...' : '✦ drop it in the jar'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
