'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { ArrowUpRight, Check, ClipboardList, MessageSquareText } from 'lucide-react';
import { db } from '@/lib/firebase-client';
import { Assignment, Submission, assignmentDate, assignmentResource } from '@/lib/classroom';
import { useAuth } from './auth-provider';

function StudentAssignmentCard({ assignment, submission }: { assignment: Assignment; submission?: Submission }) {
  const { user, profile } = useAuth();
  const [response, setResponse] = useState(submission?.response || '');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const resource = assignmentResource(assignment);

  useEffect(() => setResponse(submission?.response || ''), [submission?.response]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !profile) return;
    setBusy(true);
    setStatus('');
    try {
      const ref = doc(db, 'submissions', `${assignment.id}_${user.uid}`);
      if (submission) {
        await updateDoc(ref, { response: response.trim(), updatedAt: serverTimestamp() });
      } else {
        await setDoc(ref, {
          assignmentId: assignment.id, studentId: user.uid,
          studentName: profile.name || user.displayName || 'Оқушы',
          response: response.trim(), teacherFeedback: '',
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
      }
      setStatus('Жауабыңыз мұғалімге жіберілді.');
    } catch {
      setStatus('Жауапты жіберу мүмкін болмады. Қайта көріңіз.');
    } finally {
      setBusy(false);
    }
  }

  return <article className="classroom-assignment student-assignment">
    <div className="classroom-assignment-head"><div><span className={`classroom-status${assignment.active ? submission ? ' is-submitted' : '' : ' is-closed'}`}>{assignment.active ? submission ? 'Жауап жіберілді' : 'Орындау керек' : 'Тапсырма жабық'}</span><h3>{assignment.title}</h3></div></div>
    <p>{assignment.instructions}</p>
    <div className="classroom-meta">{resource && <Link href={resource.href}>{resource.label} <ArrowUpRight size={14}/></Link>}{assignment.dueDate && <span>Мерзімі: {assignmentDate(assignment.dueDate)}</span>}<span>Мұғалім: {assignment.teacherName}</span></div>
    {assignment.active ? <form onSubmit={submit} className="classroom-submit-form"><label>Жауабың және кері байланысың<textarea value={response} onChange={event => { setResponse(event.target.value); setStatus(''); }} placeholder="Тапсырма бойынша ойыңды, орындаған жұмысыңды және сұрағыңды жаз…" minLength={1} maxLength={3000} rows={4} required/></label><div><button type="submit" className="button primary" disabled={busy}><Check size={17}/>{busy ? 'Жіберілуде…' : submission ? 'Жауапты жаңарту' : 'Мұғалімге жіберу'}</button><span role="status">{status}</span></div></form> : submission && <div className="classroom-closed-response"><strong>Жіберген жауабың</strong><p>{submission.response}</p></div>}
    {submission?.teacherFeedback && <div className="classroom-feedback"><MessageSquareText size={19}/><div><strong>Мұғалімнің пікірі</strong><p>{submission.teacherFeedback}</p></div></div>}
  </article>;
}

export function StudentAssignments() {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shownAssignments, setShownAssignments] = useState(8);

  useEffect(() => {
    if (!user || profile?.role !== 'student') return;
    let receivedAssignments = false;
    let receivedSubmissions = false;
    const ready = () => { if (receivedAssignments && receivedSubmissions) setLoading(false); };
    const fail = () => { setError('Тапсырмаларды жүктеу мүмкін болмады. Firestore ережелері мен байланысты тексеріңіз.'); setLoading(false); };
    const stopAssignments = onSnapshot(collection(db, 'assignments'), snapshot => {
      setAssignments(snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Assignment)
        .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
      receivedAssignments = true; ready();
    }, fail);
    const stopSubmissions = onSnapshot(query(collection(db, 'submissions'), where('studentId', '==', user.uid)), snapshot => {
      setSubmissions(snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Submission));
      receivedSubmissions = true; ready();
    }, fail);
    return () => { stopAssignments(); stopSubmissions(); };
  }, [user?.uid, profile?.role]);

  const visibleAssignments = assignments.filter(item => item.active || submissions.some(submission => submission.assignmentId === item.id));

  return <section className="classroom-student-assignments" id="assignments" aria-labelledby="student-assignments-title">
    <div className="classroom-section-head"><div><p className="eyebrow">МАҒАН БЕРІЛГЕН ТАПСЫРМАЛАР</p><h2 id="student-assignments-title">Тапсырмаларым</h2></div><ClipboardList size={27} aria-hidden="true"/></div>
    {error && <p className="classroom-error" role="alert">{error}</p>}
    {loading ? <p className="classroom-empty">Тапсырмалар жүктелуде…</p> : visibleAssignments.length === 0 ? <p className="classroom-empty">Қазір берілген тапсырма жоқ. Мұғалім жариялаған кезде осы жерде көрінеді.</p> : <><p className="classroom-help">{visibleAssignments.length} тапсырма жарияланған. Орындаған жұмысың туралы жауапты мұғалімге жібер.</p><div className="classroom-assignment-list">{visibleAssignments.slice(0, shownAssignments).map(item => <StudentAssignmentCard key={item.id} assignment={item} submission={submissions.find(submission => submission.assignmentId === item.id)}/>)}</div>{visibleAssignments.length > shownAssignments && <button type="button" className="classroom-more" onClick={() => setShownAssignments(count => count + 8)}>Тағы тапсырмалар көрсету ({visibleAssignments.length - shownAssignments})</button>}</>}
  </section>;
}
