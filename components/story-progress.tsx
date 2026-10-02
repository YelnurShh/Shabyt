'use client';

import { ArrowUpRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './auth-provider';

export function StoryProgress({ slug }: { slug: string }) {
  const { user, profile, loading, setProgress } = useAuth();
  const [error, setError] = useState('');
  const isRead = profile?.readStories.includes(slug) ?? false;

  async function toggleRead() {
    setError('');
    try { await setProgress('readStories', slug, !isRead); }
    catch { setError('Сақтау мүмкін болмады.'); }
  }

  return <div className="story-actions">
    <a className="card-link" href={`https://ertegiler.kz/story/${slug}`} target="_blank" rel="noopener noreferrer">Толық көру <ArrowUpRight size={20}/><span className="sr-only"> — Ertegiler.kz сайтында, жаңа қойындыда</span></a>
    {!loading && profile?.role !== 'teacher' && (user ? <button type="button" className={`story-read${isRead ? ' is-read' : ''}`} aria-pressed={isRead} onClick={() => void toggleRead()}><Check size={17}/>{isRead ? 'Оқылды' : 'Оқып шықтым'}</button> : <Link href="/login" className="story-read">Оқығанымды сақтау үшін кіру</Link>)}
    {error && <span className="progress-error" role="alert">{error}</span>}
  </div>;
}
