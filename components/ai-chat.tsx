'use client';

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Copy, RotateCcw, Sparkles } from 'lucide-react';
import { BrandMark } from './brand-mark';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const welcome: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Сәлем! Мен Shabyt ЖИ көмекшісімін. Ертегі кейіпкерін салу, жұмбаққа ой жүгірту немесе ою-өрнек құрастыру туралы сұрай аласыз.',
};

const suggestions = [
  'Қошқармүйіз оюын қалай саламын?',
  'Ер Төстік кейіпкерін қалай бейнелеймін?',
  'Жұмбақты суретке айналдыруға көмектес',
  'Ұлттық оюға қандай түстер үйлеседі?',
];

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const container = messagesRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    if (content.length > 1200) { setError('Сұрақ 1200 таңбадан аспауы керек.'); return; }

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content };
    const conversation = [...messages.filter(message => message.id !== 'welcome'), userMessage]
      .slice(-12)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }));

    setMessages(previous => [...previous, userMessage]);
    setDraft('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation }),
      });
      const data: { message?: string; error?: string } = await response.json();
      if (!response.ok || !data.message) throw new Error(data.error || 'Жауап алу мүмкін болмады.');
      setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'assistant', content: data.message! }]);
    } catch (cause) {
      setMessages(previous => previous.filter(message => message.id !== userMessage.id));
      setDraft(content);
      setError(cause instanceof Error ? cause.message : 'Байланыс қатесі. Қайталап көріңіз.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(draft);
    }
  }

  async function copyMessage(message: Message) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(message.id);
      window.setTimeout(() => setCopied(null), 1800);
    } catch { setError('Мәтінді көшіру мүмкін болмады.'); }
  }

  function clearChat() {
    setMessages([welcome]);
    setDraft('');
    setError('');
    inputRef.current?.focus();
  }

  return <div className="ai-chat-layout">
    <aside className="ai-chat-aside">
      <div className="ai-aside-icon"><BrandMark size={42} /></div>
      <p className="eyebrow">СЕНІҢ ШЫҒАРМАШЫЛЫҚ СЕРІГІҢ</p>
      <h2>Ойыңдағыны<br />өнерге айналдыр.</h2>
      <p className="ai-aside-description">Идея керек пе? ЖИ көмекші сурет, ертегі және ою-өрнек бойынша келесі қадамды табуға көмектеседі.</p>
      <div className="ai-aside-topics"><span>01 <strong>Ертегі кейіпкерлері</strong></span><span>02 <strong>Жұмбақ пен қиял</strong></span><span>03 <strong>Ұлттық оюлар</strong></span></div>
      <div className="ai-aside-foot">Сұрақ қой · Ойлан · Жаса <Sparkles size={17} /></div>
    </aside>

    <section className="ai-chat-panel" aria-label="Shabyt ЖИ чаты">
      <div className="ai-chat-topbar"><div className="ai-chat-avatar"><BrandMark size={39} /></div><div><strong>Shabyt ЖИ</strong><span>Шығармашылық көмекші</span></div><button type="button" className="ai-chat-reset" onClick={clearChat} disabled={loading} aria-label="Әңгімені тазалау" title="Әңгімені тазалау"><RotateCcw size={18} /></button></div>
      <div ref={messagesRef} className="ai-chat-messages" aria-live="polite" aria-relevant="additions text">
        {messages.map(message => <div className={`ai-message ${message.role}`} key={message.id}>
          {message.role === 'assistant' && <div className="ai-message-avatar"><Sparkles size={16} /></div>}
          <div className="ai-message-content"><div className="ai-message-bubble">{message.content}</div>{message.role === 'assistant' && message.id !== 'welcome' && <button type="button" className="ai-copy" onClick={() => void copyMessage(message)}>{copied === message.id ? <Check size={14} /> : <Copy size={14} />}{copied === message.id ? 'Көшірілді' : 'Көшіру'}</button>}</div>
        </div>)}
        {messages.length === 1 && <div className="ai-suggestions"><span>МЫНА СҰРАҚТАРДАН БАСТАП КӨР</span><div>{suggestions.map(suggestion => <button type="button" key={suggestion} onClick={() => void send(suggestion)}>{suggestion}<ArrowUp size={15} /></button>)}</div></div>}
        {loading && <div className="ai-message assistant"><div className="ai-message-avatar"><Sparkles size={16} /></div><div className="ai-typing" role="status" aria-label="Жауап жазылып жатыр"><i/><i/><i/></div></div>}
      </div>
      <div className="ai-chat-composer-wrap">
        {error && <p className="ai-chat-error" role="alert">{error}</p>}
        <form className="ai-chat-composer" onSubmit={submit}><label htmlFor="ai-chat-input" className="sr-only">Сұрағыңыз</label><textarea ref={inputRef} id="ai-chat-input" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={onKeyDown} placeholder="Сұрағыңызды осы жерге жазыңыз…" maxLength={1200} rows={2} disabled={loading}/><button type="submit" disabled={loading || !draft.trim()} aria-label="Сұрақты жіберу"><ArrowUp size={21}/></button></form>
        <p className="ai-chat-hint">Жіберу үшін Enter · Жаңа жол үшін Shift + Enter</p>
      </div>
    </section>
  </div>;
}
