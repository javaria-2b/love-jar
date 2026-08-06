import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  arrayUnion,
  type Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const JAR_ID_KEY = 'lovejar_jarId';

// Simple SHA-256 hash for passcodes (using Web Crypto API)
async function hashPasscode(passcode: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface Memory {
  id: string;
  type: 'note' | 'photo' | 'voice';
  content: string;
  mediaData: string | null;      // base64 data URI for photos/voice
  voiceDuration: number | null;
  createdAt: Timestamp | null;
  createdBy: string;
}

export interface JarData {
  id: string;
  name: string;
  members: string[];
  lastRevealDate: string | null;
  lastRevealMemoryId: string | null;
  createdAt: Timestamp | null;
}

export interface PresenceData {
  online: boolean;
  lastSeen: Timestamp | null;
}

export function useJar(uid: string | null) {
  const [jar, setJar] = useState<JarData | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [partnerPresence, setPartnerPresence] = useState<PresenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storedJarId = localStorage.getItem(JAR_ID_KEY);

  // Load jar data
  useEffect(() => {
    if (!storedJarId || !uid) {
      setLoading(false);
      return;
    }

    const jarRef = doc(db, 'jars', storedJarId);
    const unsub = onSnapshot(jarRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setJar({
          id: snap.id,
          name: data.name,
          members: data.members || [],
          lastRevealDate: data.lastRevealDate || null,
          lastRevealMemoryId: data.lastRevealMemoryId || null,
          createdAt: data.createdAt,
        });
      } else {
        localStorage.removeItem(JAR_ID_KEY);
        setJar(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Jar listener error:', err);
      setError('Failed to load jar');
      setLoading(false);
    });

    return () => unsub();
  }, [storedJarId, uid]);

  // Load memories
  useEffect(() => {
    if (!storedJarId) return;

    const memRef = collection(db, 'jars', storedJarId, 'memories');
    const q = query(memRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const mems: Memory[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: data.type,
          content: data.content || '',
          mediaData: data.mediaData || null,
          voiceDuration: data.voiceDuration || null,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
        };
      });
      setMemories(mems);
    });

    return () => unsub();
  }, [storedJarId]);

  // Partner presence
  useEffect(() => {
    if (!storedJarId || !jar || !uid) return;

    const partnerUid = jar.members.find((m) => m !== uid);
    if (!partnerUid) return;

    const presenceRef = doc(db, 'jars', storedJarId, 'presence', partnerUid);
    const unsub = onSnapshot(presenceRef, (snap) => {
      if (snap.exists()) {
        setPartnerPresence(snap.data() as PresenceData);
      } else {
        setPartnerPresence({ online: false, lastSeen: null });
      }
    });

    return () => unsub();
  }, [storedJarId, jar, uid]);

  // Set own presence
  useEffect(() => {
    if (!storedJarId || !uid) return;

    const myPresenceRef = doc(db, 'jars', storedJarId, 'presence', uid);

    setDoc(myPresenceRef, {
      online: true,
      lastSeen: serverTimestamp(),
    }, { merge: true });

    const handleUnload = () => {
      setDoc(myPresenceRef, {
        online: false,
        lastSeen: serverTimestamp(),
      }, { merge: true });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [storedJarId, uid]);

  // Create a new jar
  const createJar = useCallback(async (name: string, passcode: string, uid: string) => {
    const salt = crypto.randomUUID();
    const hash = await hashPasscode(passcode, salt);
    const jarRef = doc(collection(db, 'jars'));

    await setDoc(jarRef, {
      name,
      passcodeHash: `${salt}:${hash}`,
      createdAt: serverTimestamp(),
      members: [uid],
      lastRevealDate: null,
      lastRevealMemoryId: null,
    });

    localStorage.setItem(JAR_ID_KEY, jarRef.id);
    return jarRef.id;
  }, []);

  // Join an existing jar
  const joinJar = useCallback(async (name: string, passcode: string, uid: string) => {
    const jarsRef = collection(db, 'jars');
    const q = query(jarsRef);
    const snap = await getDocs(q);

    let foundJarData: DocumentData | null = null;
    let foundId: string | null = null;

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.name === name) {
        foundJarData = data;
        foundId = docSnap.id;
      }
    });

    if (!foundJarData || !foundId) {
      throw new Error('No jar found with that name. Double-check the spelling or ask your partner for the exact name.');
    }

    const jarData = foundJarData as Record<string, any>;
    if (Array.isArray(jarData['members']) && jarData['members'].length >= 2) {
      throw new Error('This jar already has two people. Each jar is for one couple only.');
    }

    const [salt, storedHash] = String(jarData['passcodeHash']).split(':');
    const computedHash = await hashPasscode(passcode, salt);

    if (computedHash !== storedHash) {
      throw new Error('Wrong passcode. Try again!');
    }

    await updateDoc(doc(db, 'jars', foundId), {
      members: arrayUnion(uid),
    });

    localStorage.setItem(JAR_ID_KEY, foundId);
    return foundId;
  }, []);

  // Leave jar
  const leaveJar = useCallback(() => {
    localStorage.removeItem(JAR_ID_KEY);
    setJar(null);
    setMemories([]);
  }, []);

  // Add a memory — mediaData is a base64 data URI (or null for notes)
  const addMemory = useCallback(async (
    type: Memory['type'],
    content: string,
    uid: string,
    mediaData?: string | null,
    voiceDuration?: number,
  ) => {
    if (!storedJarId) throw new Error('No jar selected');

    // Warn if document is getting large (Firestore limit is 1MB)
    if (mediaData && mediaData.length > 900_000) {
      throw new Error('Media is too large. Try a shorter recording or a smaller photo.');
    }

    const memRef = collection(db, 'jars', storedJarId, 'memories');
    await addDoc(memRef, {
      type,
      content,
      mediaData: mediaData || null,
      voiceDuration: voiceDuration || null,
      createdAt: serverTimestamp(),
      createdBy: uid,
    });
  }, [storedJarId]);

  // Set today's reveal
  const setTodayReveal = useCallback(async (memoryId: string) => {
    if (!storedJarId) return;
    const today = new Date().toISOString().split('T')[0];
    await updateDoc(doc(db, 'jars', storedJarId), {
      lastRevealDate: today,
      lastRevealMemoryId: memoryId,
    });
  }, [storedJarId]);

  // Get today's revealed memory
  const getTodayRevealedMemory = useCallback((): Memory | null => {
    if (!jar?.lastRevealMemoryId) return null;
    const today = new Date().toISOString().split('T')[0];
    if (jar.lastRevealDate !== today) return null;
    return memories.find((m) => m.id === jar!.lastRevealMemoryId) || null;
  }, [jar, memories]);

  // Pick a random memory (excluding a specific one)
  const pickRandomMemory = useCallback((excludeId?: string): Memory | null => {
    const pool = excludeId
      ? memories.filter((m) => m.id !== excludeId)
      : memories;
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [memories]);

  // Get a countdown to next reveal
  const getNextRevealCountdown = useCallback((): string => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, []);

  return {
    jar,
    memories,
    partnerPresence,
    loading,
    error,
    createJar,
    joinJar,
    leaveJar,
    addMemory,
    setTodayReveal,
    getTodayRevealedMemory,
    pickRandomMemory,
    getNextRevealCountdown,
    jarId: storedJarId,
  };
}

export function getStoredJarId(): string | null {
  return localStorage.getItem(JAR_ID_KEY);
}
