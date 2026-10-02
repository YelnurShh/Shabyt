'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { extraPatterns } from '@/content/extra-patterns';
import { PatternSketch } from './pattern-sketch';

type WikiPage = {
  pageid: number;
  title: string;
  index?: number;
  extract?: string;
  thumbnail?: { source: string; width: number; height: number };
};

const suggestions = ['Ою-өрнек', 'Қошқармүйіз', 'Түйетабан', 'Құсқанаты'];
const knownPatterns = [
  ...extraPatterns,
  { name: 'Қошқармүйіз', variant: 4, text: 'Қой мүйізінің екі жаққа иірілген пішінінен туатын кең тараған қазақ оюы.' },
  { name: 'Түйетабан', variant: 7, text: 'Түйенің табан ізіне ұқсас пішіннен құралған өрнек.' },
  { name: 'Тұмар', variant: 7, text: 'Үшбұрышты тұмар пішініне негізделген сәндік өрнек.' },
];

function normalize(value: string) {
  return value.toLocaleLowerCase('kk').replace(/[^\p{L}\p{N}]/gu, '');
}

function matchingPattern(title: string) {
  const normalized = normalize(title);
  return knownPatterns.find(pattern => normalized.includes(normalize(pattern.name)));
}

function thumbnailUrl(page: WikiPage) {
  const source = page.thumbnail?.source;
  if (!source) return null;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' && ['thumb.wikimedia.org', 'upload.wikimedia.org'].includes(url.hostname) ? source : null;
  } catch {
    return null;
  }
}

export function WikipediaPatternSearch() {
  const [input, setInput] = useState('Ою-өрнек');
  const [term, setTerm] = useState('Ою-өрнек');
  const [results, setResults] = useState<WikiPage[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', generator: 'search',
      gsrsearch: term, gsrnamespace: '0', gsrlimit: '8',
      prop: 'pageimages|extracts', piprop: 'thumbnail', pithumbsize: '440', pilimit: '8',
      exintro: '1', explaintext: '1', exsentences: '2', origin: '*',
    });

    fetch(`https://kk.wikipedia.org/w/api.php?${params}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Wikipedia сұрауы орындалмады');
        return response.json();
      })
      .then(data => {
        const pages: WikiPage[] = data.query?.pages ?? [];
        const query = normalize(term);
        const relevant = pages
          .filter(page => normalize(page.title).includes(query) || /ою|өрнек|мүйіз|нақыш/i.test(`${page.title} ${page.extract ?? ''}`))
          .sort((a, b) => (a.index ?? 99) - (b.index ?? 99))
          .slice(0, 6);
        setResults(relevant);
        setStatus('ready');
      })
      .catch(error => { if (error.name !== 'AbortError') setStatus('error'); });

    return () => controller.abort();
  }, [term, requestId]);

  function search(value: string) {
    const next = value.trim();
    if (!next) return;
    setInput(next);
    setStatus('loading');
    setTerm(next);
    setRequestId(id => id + 1);
  }

  const wikipediaSearchUrl = `https://kk.wikipedia.org/w/index.php?search=${encodeURIComponent(term)}`;

  return <section id="wiki-search" className="shell section wiki-section">
    <div className="wiki-heading"><div><p className="eyebrow">БІЛІМДІ ТЕРЕҢДЕТ</p><h2>Оюларды Wikipedia-дан <span className="accent">ізде</span></h2><p>Ою атауын жазып, қазақша мақаланың суреті мен қысқаша анықтамасын қара.</p></div><span className="wiki-mark">W</span></div>
    <form className="wiki-search-form" onSubmit={event => { event.preventDefault(); search(input); }}>
      <label htmlFor="wiki-pattern-query">Ою атауы</label>
      <div className="wiki-search-controls"><Search size={21} aria-hidden="true"/><input id="wiki-pattern-query" value={input} onChange={event => setInput(event.target.value)} placeholder="Мысалы, қошқармүйіз" minLength={2}/><button type="submit">Іздеу <ArrowUpRight size={18}/></button></div>
    </form>
    <div className="wiki-suggestions"><span>ІЗДЕП КӨР:</span>{suggestions.map(item => <button type="button" key={item} onClick={() => search(item)}>{item}</button>)}</div>
    <div className="wiki-results-status" role="status" aria-live="polite">
      {status === 'loading' ? 'Wikipedia мақалалары ізделуде…' : status === 'error' ? 'Wikipedia-мен байланысу мүмкін болмады.' : `${results.length} мақала табылды`}
    </div>
    {status === 'ready' && results.length > 0 && <div className="wiki-results">{results.map(page => {
      const pattern = matchingPattern(page.title);
      const imageUrl = thumbnailUrl(page);
      const extract = page.extract?.replace(/\s+/g, ' ').trim();
      const articleUrl = `https://kk.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`;
      return <article className="wiki-result" key={page.pageid}>
        <div className="wiki-result-image">{imageUrl ? <img src={imageUrl} alt={`${page.title} мақаласының суреті`} loading="lazy" referrerPolicy="no-referrer"/> : <PatternSketch variant={pattern?.variant ?? 8} name={page.title} className="wiki-placeholder-mark"/>}<span>{imageUrl ? 'WIKIPEDIA СУРЕТІ' : 'СТИЛЬДЕНГЕН ҮЛГІ'}</span></div>
        <div className="wiki-result-body"><p className="eyebrow">ҚАЗАҚША WIKIPEDIA</p><h3>{page.title}</h3><p>{extract || pattern?.text || 'Бұл мақалада қысқаша анықтама жоқ. Толық мәтінді Wikipedia-дан оқуға болады.'}</p><a href={articleUrl} target="_blank" rel="noopener noreferrer">Мақаланы ашу <ArrowUpRight size={17}/></a></div>
      </article>;
    })}</div>}
    {status === 'ready' && results.length === 0 && <div className="wiki-empty"><p>Осы атаумен ою туралы мақала табылмады. Басқа атауды байқап көріңіз.</p><a href={wikipediaSearchUrl} target="_blank" rel="noopener noreferrer">Wikipedia-дағы барлық нәтижені қарау <ArrowUpRight size={17}/></a></div>}
    {status === 'error' && <div className="wiki-empty"><p>Интернет қосылымын тексеріп, іздеуді қайталап көріңіз.</p><button type="button" onClick={() => search(term)}>Қайта іздеу</button><a href={wikipediaSearchUrl} target="_blank" rel="noopener noreferrer">Wikipedia-да ашу <ArrowUpRight size={17}/></a></div>}
    <p className="wiki-source">Мақала мәтіні мен бар суреттер қазақша Wikipedia-дан алынады. Сурет жоқ жерде сайттың стильденген оқу үлгісі көрсетіледі.</p>
  </section>;
}
