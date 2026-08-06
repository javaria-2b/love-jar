import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase/config';

const UID_KEY = 'lovejar_uid';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        localStorage.setItem(UID_KEY, firebaseUser.uid);
        setUser(firebaseUser);
      } else {
        localStorage.removeItem(UID_KEY);
        setUser(null);
      }
      setLoading(false);
    });

    // Auto sign-in anonymously if not already signed in
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((err) => {
        console.error('Anonymous sign-in failed:', err);
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, []);

  return { user, loading, uid: user?.uid ?? null };
}

export function getStoredUid(): string | null {
  return localStorage.getItem(UID_KEY);
}
