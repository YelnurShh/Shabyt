'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ArrowRight, BookOpen, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { auth, db } from '@/lib/firebase-client';
import { TEACHER_CODE } from '@/lib/teacher-code';
import { setTeacherRole } from '@/lib/teacher-role';
import { ensureProfile } from './auth-provider';
import { BrandMark } from './brand-mark';

function readableError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Бұл email бұрын тіркелген. Кіру бетін қолданыңыз.',
    'auth/invalid-email': 'Email мекенжайын тексеріңіз.',
    'auth/weak-password': 'Құпиясөз кемінде 6 таңбадан тұруы керек.',
    'auth/invalid-credential': 'Email немесе құпиясөз дұрыс емес.',
    'auth/popup-closed-by-user': 'Google кіру терезесі жабылды. Қайталап көріңіз.',
    'auth/popup-blocked': 'Браузер Google терезесін бұғаттады. Қалқымалы терезеге рұқсат беріңіз.',
    'auth/unauthorized-domain': 'Бұл домен Firebase Authentication ішінде рұқсат етілмеген.',
    'auth/operation-not-allowed': 'Бұл кіру тәсілі Firebase Console ішінде қосылмаған.',
    'permission-denied': 'Firestore рұқсаты берілмеді. Қауіпсіздік ережелерін тексеріңіз.',
  };
  if (error instanceof Error && !code && error.message) return error.message;
  return messages[code] || 'Тіркелу немесе кіру мүмкін болмады. Қайталап көріңіз.';
}

export function AuthScreen({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [registrationPending, setRegistrationPending] = useState(false);
  const [teacherPending, setTeacherPending] = useState(false);

  function checkTeacherCode() {
    if (mode === 'register' && role === 'teacher' && teacherCode.trim().toLocaleUpperCase() !== TEACHER_CODE) {
      throw new Error('Мұғалім коды дұрыс емес.');
    }
  }

  async function promoteTeacher(user: import('firebase/auth').User) {
    await setTeacherRole(user, teacherCode);
  }

  async function finish(user: import('firebase/auth').User) {
    if (mode === 'register' && role === 'teacher') {
      setTeacherPending(true);
      await promoteTeacher(user);
      setTeacherPending(false);
    }
    router.replace('/profile');
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      checkTeacherCode();
      if (registrationPending && auth.currentUser) {
        await ensureProfile(auth.currentUser);
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { name: name.trim() });
        await finish(auth.currentUser);
      } else if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        await finish(result.user);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        setRegistrationPending(true);
        await updateProfile(result.user, { displayName: name.trim() });
        await ensureProfile(result.user);
        await updateDoc(doc(db, 'users', result.user.uid), { name: name.trim() });
        await finish(result.user);
      }
    } catch (cause) { setError(readableError(cause)); }
    finally { setBusy(false); }
  }

  async function googleSignIn() {
    setError('');
    setBusy(true);
    try {
      checkTeacherCode();
      const result = teacherPending && auth.currentUser
        ? { user: auth.currentUser }
        : await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureProfile(result.user);
      await finish(result.user);
    } catch (cause) { setError(readableError(cause)); }
    finally { setBusy(false); }
  }

  async function resetPassword() {
    setError('');
    setNotice('');
    if (!email.trim()) { setError('Алдымен email мекенжайыңызды жазыңыз.'); return; }
    setBusy(true);
    try { await sendPasswordResetEmail(auth, email.trim()); setNotice('Құпиясөзді қалпына келтіру сілтемесі email-ге жіберілді.'); }
    catch (cause) { setError(readableError(cause)); }
    finally { setBusy(false); }
  }

  return <div className="auth-page shell">
    <aside className="auth-aside"><BrandMark size={52}/><p className="eyebrow">SHABYT · ШЫҒАРМАШЫЛЫҚ КЕҢІСТІК</p><h1>{mode === 'register' ? 'Өнерге алғашқы қадамыңды жаса.' : 'Шабыт әлеміне қайта орал.'}</h1><p>Ертегілерді оқы, жұмбақтарды шеш және жетістігіңді өз профиліңде сақта.</p><div className="auth-aside-points"><span><BookOpen size={17}/> Оқыған ертегілерің</span><span><Sparkles size={17}/> Шешкен жұмбақтарың</span><span><GraduationCap size={17}/> Өзіңе арналған профиль</span></div></aside>
    <section className="auth-card" aria-label={mode === 'register' ? 'Тіркелу' : 'Кіру'}>
      <p className="eyebrow">{mode === 'register' ? 'ЖАҢА АККАУНТ' : 'ҚОШ КЕЛДІҢІЗ'}</p>
      <h2>{mode === 'register' ? 'Тіркелу' : 'Аккаунтқа кіру'}</h2>
      <p className="auth-subtitle">{mode === 'register' ? 'Өзіңе ыңғайлы тіркелу тәсілін таңда.' : 'Прогресіңді жалғастыру үшін кір.'}</p>

      {mode === 'register' && <div className="auth-roles" role="group" aria-label="Рөлді таңдаңыз"><button type="button" className={role === 'student' ? 'selected' : ''} aria-pressed={role === 'student'} onClick={() => setRole('student')} disabled={teacherPending}><BookOpen size={18}/> Оқушы</button><button type="button" className={role === 'teacher' ? 'selected' : ''} aria-pressed={role === 'teacher'} onClick={() => setRole('teacher')} disabled={teacherPending}><GraduationCap size={19}/> Мұғалім</button></div>}
      {registrationPending && <p className="auth-pending">Аккаунт ашылды. Профильді сақтауды аяқтау үшін қайта көріңіз. Егер қате қайталанса, Firestore ережелерін тексеріңіз.</p>}
      {teacherPending && !registrationPending && <p className="auth-pending">Google аккаунты қосылды, бірақ мұғалім рөлін сақтау аяқталмады. Төмендегі Google батырмасын қайта басыңыз.</p>}

      <form onSubmit={submit} className="auth-form">
        {mode === 'register' && <label>Аты-жөніңіз<input value={name} onChange={event => setName(event.target.value)} placeholder="Аты-жөніңіз" maxLength={70} autoComplete="name" required/></label>}
        <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" required/></label>
        <label>Құпиясөз<div className="auth-password"><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Кемінде 6 таңба" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={6} required/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Құпиясөзді жасыру' : 'Құпиясөзді көрсету'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
        {mode === 'login' && <button type="button" className="auth-reset" onClick={() => void resetPassword()} disabled={busy}>Құпиясөзді ұмыттыңыз ба?</button>}
        {mode === 'register' && role === 'teacher' && <label>Мұғалімнің арнайы коды<input type="password" value={teacherCode} onChange={event => setTeacherCode(event.target.value)} placeholder="Арнайы код" maxLength={120} autoComplete="off" required/><small>Код тіркелген кезде тексеріледі және профильде сақталмайды.</small></label>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Күте тұрыңыз…' : registrationPending ? 'Профильді сақтауды жалғастыру' : mode === 'register' ? 'Аккаунт ашу' : 'Кіру'}<ArrowRight size={19}/></button>
      </form>

      <div className="auth-divider"><span>немесе</span></div>
      <button type="button" className="auth-google" onClick={() => void googleSignIn()} disabled={busy || registrationPending}><Image className="auth-google-icon" src="/google-g.svg" alt="" width={20} height={20}/> Google арқылы {mode === 'register' ? 'тіркелу' : 'кіру'}</button>
      {mode === 'register' && role === 'teacher' && <p className="auth-teacher-note"><LockKeyhole size={16}/> Google арқылы тіркелгенде де арнайы код қажет.</p>}
      <p className="auth-switch">{mode === 'register' ? 'Аккаунтыңыз бар ма?' : 'Әлі аккаунтыңыз жоқ па?'} <Link href={mode === 'register' ? '/login' : '/register'}>{mode === 'register' ? 'Кіру' : 'Тіркелу'} <ArrowRight size={15}/></Link></p>
      <p className="auth-privacy"><Mail size={14}/> Профиль деректері Firebase-де сақталады.</p>
    </section>
  </div>;
}
