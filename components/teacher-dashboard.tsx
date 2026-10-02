'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { ArrowUpRight, BookOpen, Check, ClipboardList, GraduationCap, MessageSquareText, Plus, Users } from 'lucide-react';
import { stories } from '@/content/stories';
import { db } from '@/lib/firebase-client';
import { Assignment, Submission, assignmentDate, assignmentResource, assignmentRiddles, ResourceType } from '@/lib/classroom';
import { UserProfile, useAuth } from './auth-provider';

function TeacherResponse({ submission }: { submission: Submission }) {
  const [feedback, setFeedback] = useState(submission.teacherFeedback || '');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => setFeedback(submission.teacherFeedback || ''), [submission.teacherFeedback]);

  async function saveFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      await updateDoc(doc(db, 'submissions', submission.id), {
        teacherFeedback: feedback.trim(), reviewedAt: serverTimestamp(),
      });
      setStatus('Пікір сақталды.');
    } catch {
      setStatus('Пікірді сақтау мүмкін болмады. Қайта көріңіз.');
    } finally {
      setBusy(false);
    }
  }

  return <article className="classroom-response">
    <div className="classroom-response-head"><strong>{submission.studentName || 'Оқушы'}</strong><span>{submission.updatedAt?.toDate().toLocaleDateString('kk-KZ') || 'Жіберілді'}</span></div>
    <p>{submission.response}</p>
    <form onSubmit={saveFeedback}>
      <label>Мұғалім пікірі<textarea value={feedback} onChange={event => { setFeedback(event.target.value); setStatus(''); }} placeholder="Оқушыға қысқаша пікір жазыңыз…" maxLength={1000} rows={2}/></label>
      <div><button type="submit" disabled={busy}><Check size={15}/>{busy ? 'Сақталуда…' : 'Пікірді сақтау'}</button><small role="status">{status}</small></div>
    </form>
  </article>;
}

export function TeacherDashboard() {
  const { user, profile } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('none');
  const [resourceId, setResourceId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [formStatus, setFormStatus] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!user || profile?.role !== 'teacher') return;
    const received = { students: false, assignments: false, submissions: false };
    const markReady = (source: keyof typeof received) => {
      received[source] = true;
      if (received.students && received.assignments && received.submissions) setLoading(false);
    };
    const fail = () => { setError('Сынып деректерін жүктеу мүмкін болмады. Firestore ережелері мен байланысты тексеріңіз.'); setLoading(false); };
    const stopStudents = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), snapshot => {
      setStudents(snapshot.docs.map(item => item.data() as UserProfile).sort((a, b) => a.name.localeCompare(b.name, 'kk')));
      markReady('students');
    }, fail);
    const stopAssignments = onSnapshot(query(collection(db, 'assignments'), where('createdBy', '==', user.uid)), snapshot => {
      setAssignments(snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Assignment)
        .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
      markReady('assignments');
    }, fail);
    const stopSubmissions = onSnapshot(collection(db, 'submissions'), snapshot => {
      setSubmissions(snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Submission));
      markReady('submissions');
    }, fail);
    return () => { stopStudents(); stopAssignments(); stopSubmissions(); };
  }, [user?.uid, profile?.role]);

  const ownAssignmentIds = useMemo(() => new Set(assignments.map(item => item.id)), [assignments]);
  const ownSubmissions = submissions.filter(item => ownAssignmentIds.has(item.assignmentId));
  const activeCount = assignments.filter(item => item.active).length;

  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !profile) return;
    setBusy(true);
    setFormStatus('');
    try {
      await addDoc(collection(db, 'assignments'), {
        title: title.trim(), instructions: instructions.trim(), resourceType,
        resourceId: resourceType === 'none' ? '' : resourceId,
        createdBy: user.uid, teacherName: profile.name || user.displayName || 'Мұғалім',
        dueDate, active: true, createdAt: serverTimestamp(),
      });
      setTitle(''); setInstructions(''); setResourceType('none'); setResourceId(''); setDueDate('');
      setFormStatus('Тапсырма оқушыларға жарияланды.');
    } catch {
      setFormStatus('Тапсырманы жариялау мүмкін болмады. Қайта көріңіз.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleAssignment(item: Assignment) {
    setActionError('');
    try { await updateDoc(doc(db, 'assignments', item.id), { active: !item.active }); }
    catch { setActionError('Тапсырма күйін өзгерту мүмкін болмады.'); }
  }

  return <div className="classroom-dashboard">
    <section className="classroom-intro" aria-labelledby="classroom-title"><div><p className="eyebrow">МҰҒАЛІМ ПАНЕЛІ</p><h2 id="classroom-title">Оқу барысын бақылау</h2><p>Тапсырма беріңіз, оқушылардың жауаптарын қарап, пікір қалдырыңыз.</p></div><GraduationCap size={48} aria-hidden="true"/></section>
    {error && <p className="classroom-error" role="alert">{error}</p>}
    <div className="classroom-metrics">
      <div><Users size={22}/><span>Тіркелген оқушы</span><strong>{students.length}</strong></div>
      <div><ClipboardList size={22}/><span>Белсенді тапсырма</span><strong>{activeCount}</strong></div>
      <div><MessageSquareText size={22}/><span>Келген жауап</span><strong>{ownSubmissions.length}</strong></div>
    </div>

    <section className="classroom-create" aria-labelledby="create-assignment-title">
      <div className="classroom-section-head"><div><p className="eyebrow">ЖАҢА ТАПСЫРМА</p><h2 id="create-assignment-title">Оқушыларға тапсырма беріңіз</h2></div><Plus size={28} aria-hidden="true"/></div>
      <p className="classroom-help">Жарияланған тапсырма барлық тіркелген оқушының профилінде көрінеді.</p>
      <form onSubmit={createAssignment} className="classroom-form">
        <label>Тақырыбы<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Мысалы, Алтын сақа ертегісін талдау" maxLength={120} required/></label>
        <label>Тапсырма шарты<textarea value={instructions} onChange={event => setInstructions(event.target.value)} placeholder="Оқушы не оқып, не жасап, қандай жауап жіберуі керек?" maxLength={2000} rows={4} required/></label>
        <div className="classroom-form-row">
          <label>Материал түрі<select value={resourceType} onChange={event => { setResourceType(event.target.value as ResourceType); setResourceId(''); }}><option value="none">Материалсыз</option><option value="story">Ертегі</option><option value="riddle">Жұмбақ</option></select></label>
          {resourceType !== 'none' && <label>Материал<select value={resourceId} onChange={event => setResourceId(event.target.value)} required><option value="">Таңдаңыз</option>{resourceType === 'story' ? stories.map(item => <option key={item.slug} value={item.slug}>{item.title}</option>) : assignmentRiddles.map(item => <option key={item.id} value={item.id}>№{item.id} — {item.question.replaceAll('\n', ' ').slice(0, 65)}</option>)}</select></label>}
          <label>Соңғы күн (міндетті емес)<input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)}/></label>
        </div>
        <div className="classroom-form-actions"><button type="submit" className="button primary" disabled={busy}><Plus size={18}/>{busy ? 'Жариялануда…' : 'Тапсырманы жариялау'}</button><span role="status">{formStatus}</span></div>
      </form>
    </section>

    <section className="classroom-list" aria-labelledby="teacher-assignments-title">
      <div className="classroom-section-head"><div><p className="eyebrow">БЕРІЛГЕН ТАПСЫРМАЛАР</p><h2 id="teacher-assignments-title">Тапсырмалар мен жауаптар</h2></div><span>{assignments.length} тапсырма</span></div>
      {loading ? <p className="classroom-empty">Деректер жүктелуде…</p> : assignments.length === 0 ? <p className="classroom-empty">Әзірге тапсырма жоқ. Жоғарыдағы формадан алғашқы тапсырманы беріңіз.</p> : assignments.map(item => {
        const responses = ownSubmissions.filter(response => response.assignmentId === item.id);
        const resource = assignmentResource(item);
        return <article className="classroom-assignment" key={item.id}>
          <div className="classroom-assignment-head"><div><span className={`classroom-status${item.active ? '' : ' is-closed'}`}>{item.active ? 'Белсенді' : 'Жабық'}</span><h3>{item.title}</h3></div><button type="button" onClick={() => void toggleAssignment(item)}>{item.active ? 'Тапсырманы жабу' : 'Қайта ашу'}</button></div>
          <p>{item.instructions}</p>
          <div className="classroom-meta">{resource && <Link href={resource.href}>{resource.label} <ArrowUpRight size={14}/></Link>}{item.dueDate && <span>Мерзімі: {assignmentDate(item.dueDate)}</span>}<span>{responses.length} / {students.length} оқушы жауап берді</span></div>
          <div className="classroom-responses"><h4>Оқушылардың жауаптары</h4>{responses.length ? responses.map(response => <TeacherResponse key={response.id} submission={response}/>) : <p>Әзірге жауап келген жоқ.</p>}</div>
        </article>;
      })}
      {actionError && <p className="classroom-error" role="alert">{actionError}</p>}
    </section>

    <section className="classroom-students" aria-labelledby="students-title">
      <div className="classroom-section-head"><div><p className="eyebrow">ОҚУШЫЛАР</p><h2 id="students-title">Тіркелген оқушылар</h2></div><span>{students.length} оқушы</span></div>
      {loading ? <p className="classroom-empty">Оқушылар жүктелуде…</p> : students.length === 0 ? <p className="classroom-empty">Әзірге тіркелген оқушы жоқ.</p> : <div className="classroom-student-list">{students.map(student => {
        const submitted = ownSubmissions.filter(item => item.studentId === student.uid).length;
        return <article className="classroom-student" key={student.uid}><div className="classroom-student-avatar">{student.name.trim().charAt(0).toLocaleUpperCase('kk') || 'О'}</div><div><strong>{student.name || student.email || 'Оқушы'}</strong><span>{student.className || 'Сыныбы көрсетілмеген'}</span></div><div className="classroom-student-counts"><span><BookOpen size={15}/> {student.readStories?.length || 0} ертегі</span><span>✓ {student.solvedRiddles?.length || 0} жұмбақ</span><span><MessageSquareText size={15}/> {submitted} жауап</span></div></article>;
      })}</div>}
    </section>
  </div>;
}
