'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { BrandMark } from './brand-mark';
import { AccountButton } from './account-button';
import { useAuth } from './auth-provider';

const links = [
  ['/', 'Басты бет'],
  ['/ertegiler', 'Ертегілер әлемі'],
  ['/zhumbaktar', 'Жұмбақтар'],
  ['/oyu-ornek', 'Ою-өрнек сыры'],
  ['/chat', 'ЖИ көмекші'],
  ['/profile', 'Профиль'],
];

export function Header() {
  const path = usePathname();
  const { profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMenuOpen(false), [path]);
  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return <header className="site-header">
    <div className="shell header-inner">
      <Link href="/" className="brand" aria-label="Shabyt — басты бет" onClick={() => setMenuOpen(false)}><BrandMark/><span>Shabyt<span className="brand-caption">ҰЛТТЫҚ МҰРА · ЖАҢА КӨЗҚАРАС</span></span></Link>
      <nav id="site-navigation" className={`site-nav${menuOpen ? ' is-open' : ''}`} aria-label="Негізгі навигация">
        {links.map(([href, label]) => <Link key={href} href={href} className={path === href ? 'active' : ''} aria-current={path === href ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{href === '/profile' && profile?.role === 'teacher' ? 'Мұғалім панелі' : label}</Link>)}
      </nav>
      <AccountButton/>
      <button ref={menuButtonRef} type="button" className="mobile-menu-toggle" aria-controls="site-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? 'Мәзірді жабу' : 'Мәзірді ашу'} onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={22} aria-hidden="true"/> : <Menu size={22} aria-hidden="true"/>}<span>Мәзір</span></button>
    </div>
  </header>;
}
