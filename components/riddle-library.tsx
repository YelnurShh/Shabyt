'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Search, ArrowDown, Sparkles, Eye, EyeOff, ChevronDown } from 'lucide-react';
import data from '@/content/riddles.json';
import { Video } from './video';
import Link from 'next/link';
import { useAuth } from './auth-provider';

const categories = ['Барлығы', 'Пейзаж', 'Натюрморт', 'Анималистика', 'Маринистік', 'Тарихи жанр'];

function AnswerPanel({ id, answer, expanded }: { id: string; answer: string; expanded: boolean }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const updateHeight = () => {
      const marginTop = Number.parseFloat(getComputedStyle(content).marginTop) || 0;
      setHeight(content.scrollHeight + marginTop);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);
    return () => observer.disconnect();
  }, [answer]);

  return (
    <div
      id={`answer-${id}`}
      className={`answer-panel${expanded ? ' is-open' : ''}`}
      style={{ height: expanded ? height : 0 }}
      aria-hidden={!expanded}
    >
      <div ref={contentRef} className="answer-panel-inner">
        <span className="answer-label">ЖАУАБЫ</span>
        <strong>{answer}</strong>
        <p>Енді осы бейнені суретке салып көр!</p>
      </div>
    </div>
  );
}

export function RiddleLibrary() {
  const { user, profile, loading, setProgress } = useAuth();
  const [saveError, setSaveError] = useState('');
  const [category, setCategory] = useState('Барлығы');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(12);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const filtered = data.filter(r =>
    (category === 'Барлығы' || r.category === category) &&
    `${r.question} ${r.category}`.toLocaleLowerCase('kk').includes(query.toLocaleLowerCase('kk'))
  );

  function toggle(id: string) {
    setOpen(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function toggleSolved(id: string) {
    const isSolved = profile?.solvedRiddles.includes(id) ?? false;
    setSaveError('');
    try { await setProgress('solvedRiddles', id, !isSolved); }
    catch { setSaveError('Прогресті Firestore-ға сақтау мүмкін болмады. Қайталап көріңіз.'); }
  }

  return <>
    <div className="library-toolbar">
      <div className="filter-list" aria-label="Жанр бойынша сүзу">
        {categories.map(c => <button key={c} aria-pressed={category === c} className={category === c ? 'selected' : ''} onClick={() => { setCategory(c); setLimit(12); }}>{c}</button>)}
      </div>
      <label className="search"><Search size={18} /><input placeholder="Жұмбақ іздеу…" aria-label="Жұмбақ іздеу" value={query} onChange={e => { setQuery(e.target.value); setLimit(12); }} /></label>
    </div>
    <div className="results-heading"><p aria-live="polite">{filtered.length} {category === 'Тарихи жанр' ? 'нақыл сөз' : 'материал табылды'}</p><span>Ойлан → Жауабын тап → Суретін сал</span></div>
    {category !== 'Барлығы' && <div className="genre-description">{data.find(r => r.category === category)?.description}{category === 'Тарихи жанр' && <p>Берілген Word файлында жұмбақтар орнына тарих туралы нақыл сөздер бар.</p>}</div>}
    <div className="riddle-grid">
      {filtered.slice(0, limit).map(r => <article className="riddle-card" id={`riddle-${r.id}`} key={r.id}>
        <div className="riddle-top"><span>{r.category}</span><span>#{r.id.padStart(3, '0')}</span></div>
        <p className="riddle-question" tabIndex={r.question.length > 140 ? 0 : undefined}>{r.question}</p>
        {r.kind === 'proverb'
          ? <div className="proverb-label">ХАЛЫҚ ДАНАЛЫҒЫ</div>
          : <>
            <button className="answer-toggle" aria-expanded={open.has(r.id)} aria-controls={`answer-${r.id}`} onClick={() => toggle(r.id)}>
              <span className="answer-toggle-icon">{open.has(r.id) ? <EyeOff size={18} /> : <Eye size={18} />}</span>
              <span>{open.has(r.id) ? 'Жауабын жасыру' : 'Жауабын көру'}</span>
              <ChevronDown className="answer-chevron" size={17} aria-hidden="true" />
            </button>
            <AnswerPanel id={r.id} answer={r.answer ?? ''} expanded={open.has(r.id)} />
            {open.has(r.id) && !loading && profile?.role !== 'teacher' && (user ? <button className={`riddle-solved${profile?.solvedRiddles.includes(r.id) ? ' is-solved' : ''}`} type="button" aria-pressed={profile?.solvedRiddles.includes(r.id) ?? false} onClick={() => void toggleSolved(r.id)}>{profile?.solvedRiddles.includes(r.id) ? '✓ Шешілді' : '✓ Шештім'}</button> : <Link className="riddle-solved" href="/login">Сақтау үшін кір</Link>)}
          </>}
      </article>)}
    </div>
    {saveError && <p className="progress-error" role="alert">{saveError}</p>}
    {filtered.length === 0 && <div className="empty-state"><Search size={36} /><h3>Жұмбақ табылмады</h3><p>Басқа сөзбен іздеп көр немесе жанрды өзгерт.</p><button className="button primary" onClick={() => { setQuery(''); setCategory('Барлығы'); }}>Сүзгілерді тазалау</button></div>}
    {limit < filtered.length && <div className="load-more"><button className="button outline" onClick={() => setLimit(n => n + 12)}>Тағы 12 материал <ArrowDown size={17} /></button></div>}
    <section className="creative-task"><div><p className="eyebrow"><Sparkles size={16} /> ШЫҒАРМАШЫЛЫҚ МИНУТ</p><h2>Сөзді <span className="serif">суретке айналдыр</span></h2><p>Табиғат көрінісін тамашала. Қандай түстерді байқадың? Пейзаж жұмбағын таңдап, жауабын өз суретіңде бейнеле.</p><ol><li>Бір жұмбақты таңда және жауабын тап.</li><li>Кейіпкерді немесе көріністі елестет.</li><li>Сурет салып, сыныптастарыңа әңгімеле.</li></ol></div><Video src="/media/media3.mp4" poster="/media/image10.png" title="Презентациядағы күзгі табиғат көрінісі" /></section>
  </>;
}
