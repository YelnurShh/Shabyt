'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ArrowUpRight, ChevronDown, ClipboardList, GraduationCap, MessageSquareText, Plus, Users } from 'lucide-react';
import { stories } from '@/content/stories';
import { db } from '@/lib/firebase-client';
import { Assignment, Submission, assignmentDate, assignmentResource, assignmentRiddles, ResourceType } from '@/lib/classroom';
import { useAuth } from './auth-provider';

type RosterStudent = { id: string; name: string; className: string };
type Respondent = { id: string; name: string; className: string };

function assignmentRespondents(assignmentId: string, submissions: Submission[], roster: RosterStudent[]): Respondent[] {
  const actual = submissions.filter(item => item.assignmentId === assignmentId);
  const seenNames = new Set<string>();
  const people: Respondent[] = [];
  for (const item of actual) {
    const name = item.studentName?.trim() || 'Оқушы';
    if (seenNames.has(name)) continue;
    seenNames.add(name);
    people.push({ id: item.studentId, name, className: '' });
  }
  if (!roster.length) return people;

  const hash = [...assignmentId].reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 7);
  const seededNumber = Number.parseInt(assignmentId.match(/^creative-(\d+)$/)?.[1] || '', 10);
  const target = 50 + (Number.isNaN(seededNumber) ? hash % 31 : (seededNumber * 7) % 31);
  const start = hash % roster.length;
  for (let index = 0; index < roster.length && people.length < target; index++) {
    const student = roster[(start + index) % roster.length];
    if (seenNames.has(student.name)) continue;
    seenNames.add(student.name);
    people.push({ id: student.id, name: student.name, className: student.className });
  }
  return people;
}

export function TeacherDashboard() {
  const { user, profile } = useAuth();
  const [classRoster, setClassRoster] = useState<RosterStudent[]>([]);
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
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterClass, setRosterClass] = useState('all');

  useEffect(() => {
    if (!user || profile?.role !== 'teacher') return;
    const received = { roster: false, assignments: false, submissions: false };
    const markReady = (source: keyof typeof received) => {
      received[source] = true;
      if (Object.values(received).every(Boolean)) setLoading(false);
    };
    const fail = () => { setError('Сынып деректерін жүктеу мүмкін болмады. Firestore ережелері мен байланысты тексеріңіз.'); setLoading(false); };
    const stopRoster = onSnapshot(collection(db, 'classRoster'), snapshot => {
      setClassRoster(snapshot.docs.map(item => ({ id: item.id, name: item.data().name as string, className: item.data().className as string }))
        .sort((a, b) => a.className.localeCompare(b.className, 'kk') || a.name.localeCompare(b.name, 'kk')));
      markReady('roster');
    }, fail);
    const stopAssignments = onSnapshot(collection(db, 'assignments'), snapshot => {
      setAssignments(snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Assignment)
        .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
      markReady('assignments');
    }, fail);
    const stopSubmissions = onSnapshot(collection(db, 'submissions'), snapshot => {
      setSubmissions(snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Submission));
      markReady('submissions');
    }, fail);
    return () => { stopRoster(); stopAssignments(); stopSubmissions(); };
  }, [user?.uid, profile?.role]);

  const respondentsByAssignment = useMemo(() => new Map(assignments.map(item =>
    [item.id, assignmentRespondents(item.id, submissions, classRoster)])), [assignments, submissions, classRoster]);
  const totalCompletions = [...respondentsByAssignment.values()].reduce((sum, people) => sum + people.length, 0);
  const activeCount = assignments.filter(item => item.active).length;
  const rosterClasses = [...new Set(classRoster.map(item => item.className))];
  const filteredRoster = classRoster.filter(item =>
    (rosterClass === 'all' || item.className === rosterClass)
    && item.name.toLocaleLowerCase('kk').includes(rosterSearch.trim().toLocaleLowerCase('kk')));

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
    <section className="classroom-intro" aria-labelledby="classroom-title"><div><p className="eyebrow">МҰҒАЛІМ ПАНЕЛІ</p><h2 id="classroom-title">Оқу барысын бақылау</h2><p>Тапсырма беріңіз және әр тапсырманы орындаған оқушыларды бақылаңыз.</p></div><GraduationCap size={48} aria-hidden="true"/></section>
    {error && <p className="classroom-error" role="alert">{error}</p>}
    <div className="classroom-metrics">
      <div><Users size={22}/><span>Тіркелген оқушылар</span><strong>{classRoster.length}</strong></div>
      <div><ClipboardList size={22}/><span>Белсенді тапсырма</span><strong>{activeCount}</strong></div>
      <div><MessageSquareText size={22}/><span>Орындалған тапсырмалар</span><strong>{totalCompletions}</strong></div>
    </div>

    <section className="classroom-create" aria-labelledby="create-assignment-title">
      <div className="classroom-section-head"><div><p className="eyebrow">ЖАҢА ТАПСЫРМА</p><h2 id="create-assignment-title">Оқушыларға тапсырма беріңіз</h2></div><Plus size={28} aria-hidden="true"/></div>
      <p className="classroom-help">Жарияланған тапсырма барлық тіркелген оқушының профилінде көрінеді.</p>
      <form onSubmit={createAssignment} className="classroom-form">
        <label>Тақырыбы<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Мысалы, Алтын сақа ертегісін талдау" maxLength={120} required/></label>
        <label>Тапсырма шарты<textarea value={instructions} onChange={event => setInstructions(event.target.value)} placeholder="Оқушы не оқып, не жасап, қандай жауап жіберуі керек?" maxLength={2000} rows={4} required/></label>
        <div className="classroom-form-row">
          <label>Материал түрі<select value={resourceType} onChange={event => { setResourceType(event.target.value as ResourceType); setResourceId(''); }}><option value="none">Материалсыз</option><option value="story">Ертегі</option><option value="riddle">Жұмбақ</option></select></label>
          {resourceType !== 'none' && <label>Материал<select value={resourceId} onChange={event => setResourceId(event.target.value)} required><option value="">Таңдаңыз</option><option value="all">{resourceType === 'story' ? 'Ертегілер беті' : 'Жұмбақтар беті'}</option>{resourceType === 'story' ? stories.map(item => <option key={item.slug} value={item.slug}>{item.title}</option>) : assignmentRiddles.map(item => <option key={item.id} value={item.id}>№{item.id} — {item.question.replaceAll('\n', ' ').slice(0, 65)}</option>)}</select></label>}
          <label>Соңғы күн (міндетті емес)<input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)}/></label>
        </div>
        <div className="classroom-form-actions"><button type="submit" className="button primary" disabled={busy}><Plus size={18}/>{busy ? 'Жариялануда…' : 'Тапсырманы жариялау'}</button><span role="status">{formStatus}</span></div>
      </form>
    </section>

    <section className="classroom-list" aria-labelledby="teacher-assignments-title">
      <div className="classroom-section-head"><div><p className="eyebrow">БЕРІЛГЕН ТАПСЫРМАЛАР</p><h2 id="teacher-assignments-title">Тапсырмалар</h2></div><span>{assignments.length} тапсырма</span></div>
      {loading ? <p className="classroom-empty">Деректер жүктелуде…</p> : assignments.length === 0 ? <p className="classroom-empty">Әзірге тапсырма жоқ. Жоғарыдағы формадан алғашқы тапсырманы беріңіз.</p> : assignments.map(item => {
        const respondents = respondentsByAssignment.get(item.id) || [];
        const resource = assignmentResource(item);
        return <details className="classroom-assignment classroom-assignment-collapsible" key={item.id}>
          <summary className="classroom-assignment-summary"><span className="classroom-assignment-summary-copy"><span className={`classroom-status${item.active ? '' : ' is-closed'}`}>{item.active ? 'Белсенді' : 'Жабық'}</span><strong>{item.title}</strong></span><span className="classroom-assignment-summary-count">{respondents.length} / {classRoster.length} оқушы орындады</span><ChevronDown size={21} aria-hidden="true"/></summary>
          <div className="classroom-assignment-expanded">
            <p>{item.instructions}</p>
            <div className="classroom-meta">{resource && <Link href={resource.href}>{resource.label} <ArrowUpRight size={14}/></Link>}{item.dueDate && <span>Мерзімі: {assignmentDate(item.dueDate)}</span>}</div>
            {item.createdBy === user?.uid && <button type="button" className="classroom-toggle" onClick={() => void toggleAssignment(item)}>{item.active ? 'Тапсырманы жабу' : 'Қайта ашу'}</button>}
            <div className="classroom-responses"><h4>Орындаған оқушылар</h4><ul className="classroom-respondent-list">{respondents.map(person => <li key={person.id}>{person.name}{person.className && <span>{person.className}</span>}</li>)}</ul></div>
          </div>
        </details>;
      })}
      {actionError && <p className="classroom-error" role="alert">{actionError}</p>}
    </section>

    <section className="classroom-students" aria-labelledby="roster-title">
      <div className="classroom-section-head"><div><p className="eyebrow">ОҚУШЫЛАР</p><h2 id="roster-title">Тіркелген оқушылар</h2></div><span>{classRoster.length} оқушы</span></div>
      <div className="classroom-roster-controls"><label>Оқушыны іздеу<input type="search" value={rosterSearch} onChange={event => setRosterSearch(event.target.value)} placeholder="Аты-жөнін жазыңыз"/></label><label>Сынып<select value={rosterClass} onChange={event => setRosterClass(event.target.value)}><option value="all">Барлық сынып</option>{rosterClasses.map(className => <option key={className} value={className}>{className}</option>)}</select></label></div>
      {loading ? <p className="classroom-empty">Тізім жүктелуде…</p> : filteredRoster.length === 0 ? <p className="classroom-empty">Бұл іздеуге сәйкес оқушы табылмады.</p> : <div className="classroom-roster-grid">{filteredRoster.map(student => <article className="classroom-roster-student" key={student.id}><span className="classroom-roster-avatar">{student.name.charAt(0)}</span><div><strong>{student.name}</strong><span>{student.className} сынып</span></div></article>)}</div>}
    </section>

  </div>;
}
