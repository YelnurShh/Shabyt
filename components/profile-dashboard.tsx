'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { ArrowUpRight, BookOpen, Check, GraduationCap, LogOut, PencilLine, Puzzle, UserRound } from 'lucide-react';
import riddles from '@/content/riddles.json';
import { stories } from '@/content/stories';
import { auth } from '@/lib/firebase-client';
import { useAuth } from './auth-provider';
import { StudentAssignments } from './student-assignments';
import { TeacherDashboard } from './teacher-dashboard';

type FormData = { name: string; className: string; interests: string; about: string };
const emptyForm: FormData = { name: '', className: '', interests: '', about: '' };
const totalRiddles = riddles.filter(riddle => riddle.kind !== 'proverb').length;

export function ProfileDashboard() {
  const { user, profile, loading, error, saveProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [savedDetails, setSavedDetails] = useState<FormData>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    if (profile) {
      const details = { name: profile.name, className: profile.className, interests: profile.interests, about: profile.about };
      setSavedDetails(details);
      if (!editing) setForm(details);
    }
  }, [profile?.name, profile?.className, profile?.interests, profile?.about]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = {
      name: form.name.trim(), className: form.className.trim(),
      interests: form.interests.trim(), about: form.about.trim(),
    };
    setSaving(true);
    setStatus('');
    try {
      await saveProfile(cleaned);
      setSavedDetails(cleaned);
      setEditing(false);
    } catch {
      setStatus('Сақтау мүмкін болмады. Байланыс пен Firebase ережелерін тексеріңіз.');
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    try { await signOut(auth); router.push('/login'); }
    catch { setLogoutError('Аккаунттан шығу мүмкін болмады. Қайталап көріңіз.'); }
  }

  function startEditing() {
    setForm(savedDetails);
    setStatus('');
    setEditing(true);
  }

  function cancelEditing() {
    setForm(savedDetails);
    setStatus('');
    setEditing(false);
  }

  const solved = riddles.filter(riddle => riddle.kind !== 'proverb' && profile?.solvedRiddles.includes(riddle.id));
  const read = stories.filter(story => profile?.readStories.includes(story.slug));
  const initial = profile?.name.trim().charAt(0).toLocaleUpperCase('kk') || 'S';

  if (loading) return <div className="profile-page shell"><div className="profile-loading">Профиль жүктелуде…</div></div>;
  if (!user) return <div className="profile-page shell"><div className="profile-signin"><div className="profile-card-icon"><UserRound size={26}/></div><p className="eyebrow">ЖЕКЕ КЕҢІСТІК</p><h1>Профиліңе кір</h1><p>Ертегілер мен жұмбақтардағы жетістігіңді сақтау үшін аккаунт аш немесе кір.</p><div><Link className="button primary" href="/login">Кіру <ArrowUpRight size={18}/></Link><Link className="button outline" href="/register">Тіркелу</Link></div></div></div>;

  return <div className="profile-page shell">
    <div className="profile-heading-row">
      <div className="profile-heading">
        <p className="eyebrow"><span className="dot"/> SHABYT · ЖЕКЕ КЕҢІСТІК</p>
        <h1>Менің <span className="accent">профилім</span></h1>
        <p>{profile?.role === 'teacher' ? 'Оқушыларды бақылап, тапсырма беріп, жауаптарына пікір қалдырыңыз.' : 'Оқыған ертегілерің мен шешкен жұмбақтарыңды бір жерден көр.'}</p>
      </div>
      <button type="button" className="profile-logout" onClick={() => void logout()}><LogOut size={18}/> Аккаунттан шығу</button>
    </div>

    <div className="profile-top">
      <section className="profile-identity" aria-label="Профиль мәліметтері">
        <div className="profile-avatar" aria-hidden="true">{(user.photoURL || profile?.photoURL) && !photoFailed ? <img src={user.photoURL || profile?.photoURL || ''} alt="" referrerPolicy="no-referrer" onError={() => setPhotoFailed(true)}/> : initial}</div>
        <div className="profile-identity-copy"><span className="profile-kicker">{profile?.role === 'teacher' ? <><GraduationCap size={14}/> МҰҒАЛІМ</> : <><BookOpen size={14}/> ОҚУШЫ</>}</span><h2>{profile?.name || user.displayName || 'Қош келдің!'}</h2><p>{profile?.email || user.email}{profile?.interests ? ` · ${profile.interests}` : ''}</p></div>
      </section>
    </div>
    {(error || logoutError) && <p className="profile-service-error" role="alert">{error || logoutError}</p>}

    {profile?.role === 'teacher' ? <TeacherDashboard/> : <><section className="profile-progress" aria-labelledby="profile-progress-title">
      <div className="profile-section-heading"><div><p className="eyebrow">МЕНІҢ ЖЕТІСТІГІМ</p><h2 id="profile-progress-title">Шығармашылық прогресс</h2></div></div>
      <div className="profile-stats">
        <Link href="/zhumbaktar" className="profile-stat"><div className="profile-stat-icon"><Puzzle size={23}/></div><span>ШЕШІЛГЕН ЖҰМБАҚ</span><strong>{solved.length}<small> / {totalRiddles}</small></strong><div className="profile-meter" aria-hidden="true"><i style={{ width: `${Math.min(100, solved.length / totalRiddles * 100)}%` }}/></div><em>Жұмбақтарға өту <ArrowUpRight size={16}/></em></Link>
        <Link href="/ertegiler" className="profile-stat"><div className="profile-stat-icon"><BookOpen size={23}/></div><span>ОҚЫЛҒАН ЕРТЕГІ</span><strong>{read.length}<small> / {stories.length}</small></strong><div className="profile-meter" aria-hidden="true"><i style={{ width: `${read.length / stories.length * 100}%` }}/></div><em>Ертегілерге өту <ArrowUpRight size={16}/></em></Link>
      </div>
      <p className="profile-count-note">Прогресс «Шештім» және «Оқып шықтым» батырмаларымен белгіленеді.</p>
    </section><StudentAssignments/></>}

    <div className={`profile-lower${profile?.role === 'teacher' ? ' is-teacher' : ''}`}>
      <section className="profile-form-card" aria-labelledby="profile-about-title">
        <div className="profile-card-heading"><div className="profile-card-icon"><PencilLine size={21}/></div><div><p className="eyebrow">ЖЕКЕ МӘЛІМЕТ</p><h2 id="profile-about-title">Өзің туралы</h2></div>{!editing && <button type="button" className="profile-edit" onClick={startEditing}><PencilLine size={16}/> {savedDetails.className || savedDetails.interests || savedDetails.about ? 'Өзгерту' : 'Толтыру'}</button>}</div>
        {editing ? <form onSubmit={save} className="profile-form">
          <div className="profile-form-row"><label>Аты-жөніңіз<input type="text" value={form.name} onChange={event => { setForm({ ...form, name: event.target.value }); setStatus(''); }} placeholder="Аты-жөніңіз" maxLength={70} autoComplete="name"/></label><label>{profile?.role === 'teacher' ? 'Пәніңіз немесе сыныбыңыз' : 'Сыныбың немесе тобың'}<input type="text" value={form.className} onChange={event => { setForm({ ...form, className: event.target.value }); setStatus(''); }} placeholder={profile?.role === 'teacher' ? 'Мысалы, көркем еңбек' : 'Мысалы, 5-сынып'} maxLength={70}/></label></div>
          <label>Қызығушылығың<input type="text" value={form.interests} onChange={event => { setForm({ ...form, interests: event.target.value }); setStatus(''); }} placeholder="Сурет салу, ою жасау, ертегі оқу…" maxLength={100}/></label>
          <label>Өзің туралы қысқаша<textarea value={form.about} onChange={event => { setForm({ ...form, about: event.target.value }); setStatus(''); }} placeholder="Не жасағанды ұнатасың? Қандай өнер сені шабыттандырады?" maxLength={500} rows={4}/></label>
          <div className="profile-form-foot"><button type="submit" className="button primary" disabled={saving}><Check size={18}/> {saving ? 'Сақталуда…' : 'Сақтау'}</button><button type="button" className="profile-cancel" onClick={cancelEditing} disabled={saving}>Болдырмау</button><span role="alert" aria-live="polite">{status}</span></div>
        </form> : <dl className="profile-details">
          <div><dt>Аты-жөніңіз</dt><dd>{savedDetails.name || 'Әзірге көрсетілмеген'}</dd></div>
          <div><dt>{profile?.role === 'teacher' ? 'Пәніңіз немесе сыныбыңыз' : 'Сыныбың немесе тобың'}</dt><dd>{savedDetails.className || 'Әзірге көрсетілмеген'}</dd></div>
          <div><dt>Қызығушылығың</dt><dd>{savedDetails.interests || 'Әзірге көрсетілмеген'}</dd></div>
          <div className="profile-details-about"><dt>Өзің туралы қысқаша</dt><dd>{savedDetails.about || 'Әзірге көрсетілмеген'}</dd></div>
        </dl>}
      </section>

      {profile?.role !== 'teacher' && <section className="profile-activity" aria-labelledby="profile-activity-title">
        <div className="profile-card-heading"><div className="profile-card-icon"><UserRound size={21}/></div><div><p className="eyebrow">МЕНІҢ ТІЗІМІМ</p><h2 id="profile-activity-title">Белгілегендерім</h2></div></div>
        <div className="profile-activity-group"><h3>Жұмбақтар <span>{solved.length}</span></h3>{solved.length ? <ul>{solved.slice(0, 5).map(riddle => <li key={riddle.id}><Check size={15}/><span>{riddle.question}</span></li>)}</ul> : <p>Әзірге белгіленген жұмбақ жоқ.</p>}{solved.length > 5 && <small>Тағы {solved.length - 5} жұмбақ шешілген</small>}</div>
        <div className="profile-activity-group"><h3>Ертегілер <span>{read.length}</span></h3>{read.length ? <ul>{read.map(story => <li key={story.slug}><Check size={15}/><span>{story.title}</span></li>)}</ul> : <p>Әзірге оқылған ертегі белгіленбеген.</p>}</div>
      </section>}
    </div>
  </div>;
}
