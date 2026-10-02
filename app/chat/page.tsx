import type { Metadata } from 'next';
import { AiChat } from '@/components/ai-chat';

export const metadata: Metadata = { title: 'ЖИ көмекші', description: 'Shabyt ЖИ көмекшісімен ертегі, жұмбақ және ою-өрнек туралы қазақша сөйлесіңіз.' };

export default function ChatPage() {
  return <div className="chat-page shell"><div className="chat-page-heading"><p className="eyebrow"><span className="dot"/> SHABYT ЖИ КӨМЕКШІСІ</p><h1>Бір сұрақтан <span className="accent">жаңа идея</span> туады.</h1><p>Ою салу, ертегі кейіпкерін бейнелеу немесе жұмбақтың сырын ашу туралы сұраңыз.</p></div><AiChat /></div>;
}
