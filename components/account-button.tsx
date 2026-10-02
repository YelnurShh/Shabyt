'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn, UserRound } from 'lucide-react';
import { useAuth } from './auth-provider';

export function AccountButton() {
  const { user, profile, loading } = useAuth();
  const [photoFailed, setPhotoFailed] = useState(false);
  const photo = user?.photoURL || profile?.photoURL || '';

  useEffect(() => setPhotoFailed(false), [photo]);

  if (loading) return <span className="account-button account-loading" aria-label="Профиль жүктелуде"><UserRound size={20}/><span>Жүктелуде…</span></span>;
  if (!user) return <Link href="/login" className="account-button account-guest"><LogIn size={19}/><span>Кіру</span></Link>;

  const name = profile?.name || user.displayName || user.email?.split('@')[0] || 'Профиль';
  const role = profile?.role === 'teacher' ? 'Мұғалім' : 'Оқушы';
  return <Link href="/profile" className="account-button" aria-label={`${name}, ${role} — профильге өту`}>
    <span className="account-avatar">{photo && !photoFailed ? <img src={photo} alt="" referrerPolicy="no-referrer" onError={() => setPhotoFailed(true)}/> : <UserRound size={20}/>}</span>
    <span className="account-copy"><strong>{name}</strong><small>{role}</small></span>
  </Link>;
}
