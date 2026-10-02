'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from './brand-mark';

export function ChatLauncher() {
  const pathname = usePathname();
  if (pathname === '/chat') return null;
  return <Link className="chat-launcher" href="/chat"><BrandMark size={24}/><span>ЖИ көмекші</span></Link>;
}
