'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';
import { LEGACY_PROFILE_KEY, readLegacyProfile } from '@/lib/legacy-profile';

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  role: 'student' | 'teacher';
  className: string;
  interests: string;
  about: string;
  solvedRiddles: string[];
  readStories: string[];
};

type EditableProfile = Pick<UserProfile, 'name' | 'className' | 'interests' | 'about'>;
type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string;
  saveProfile: (fields: EditableProfile) => Promise<void>;
  setProgress: (kind: 'solvedRiddles' | 'readStories', id: string, done: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const profileJobs = new Map<string, Promise<void>>();

export function ensureProfile(user: User): Promise<void> {
  const pending = profileJobs.get(user.uid);
  if (pending) return pending;
  const job = ensureProfileOnce(user).finally(() => profileJobs.delete(user.uid));
  profileJobs.set(user.uid, job);
  return job;
}

async function ensureProfileOnce(user: User) {
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);
  const legacy = readLegacyProfile();

  if (!existing.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || '',
      name: user.displayName || legacy?.name || '',
      photoURL: user.photoURL || '',
      role: 'student',
      className: legacy?.className || '',
      interests: legacy?.interests || '',
      about: legacy?.about || '',
      solvedRiddles: legacy?.solvedRiddles || [],
      readStories: legacy?.readStories || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else if (legacy) {
    const migration: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (legacy.solvedRiddles.length) migration.solvedRiddles = arrayUnion(...legacy.solvedRiddles);
    if (legacy.readStories.length) migration.readStories = arrayUnion(...legacy.readStories);
    if (legacy.name && !existing.data().name) migration.name = legacy.name;
    if (legacy.className && !existing.data().className) migration.className = legacy.className;
    if (legacy.interests && !existing.data().interests) migration.interests = legacy.interests;
    if (legacy.about && !existing.data().about) migration.about = legacy.about;
    await updateDoc(ref, migration);
  }
  if (legacy) try { window.localStorage.removeItem(LEGACY_PROFILE_KEY); } catch { /* Keep data if storage fails. */ }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let active = true;
    let authVersion = 0;
    const unsubscribeAuth = onAuthStateChanged(auth, async currentUser => {
      const version = ++authVersion;
      unsubscribeProfile?.();
      setUser(currentUser);
      setProfile(null);
      setError('');
      if (!currentUser) { setLoading(false); return; }
      setLoading(true);
      try {
        await ensureProfile(currentUser);
        if (!active || version !== authVersion) return;
        unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), snapshot => {
          setProfile(snapshot.exists() ? snapshot.data() as UserProfile : null);
          setLoading(false);
        }, () => {
          setError('Профильді Firestore-дан оқу мүмкін болмады. Қауіпсіздік ережелері мен желіні тексеріңіз.');
          setLoading(false);
        });
      } catch {
        if (active && version === authVersion) {
          setError('Профильді Firestore-да сақтау мүмкін болмады. Firebase баптауларын тексеріңіз.');
          setLoading(false);
        }
      }
    });
    return () => { active = false; unsubscribeAuth(); unsubscribeProfile?.(); };
  }, []);

  async function saveUserProfile(fields: EditableProfile) {
    if (!user) throw new Error('Алдымен аккаунтқа кіріңіз.');
    await updateDoc(doc(db, 'users', user.uid), { ...fields, updatedAt: serverTimestamp() });
  }

  async function setProgress(kind: 'solvedRiddles' | 'readStories', id: string, done: boolean) {
    if (!user) throw new Error('Алдымен аккаунтқа кіріңіз.');
    if (profile?.role === 'teacher') throw new Error('Оқу прогресі тек оқушыларға арналған.');
    await updateDoc(doc(db, 'users', user.uid), { [kind]: done ? arrayUnion(id) : arrayRemove(id), updatedAt: serverTimestamp() });
  }

  return <AuthContext.Provider value={{ user, profile, loading, error, saveProfile: saveUserProfile, setProgress }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
