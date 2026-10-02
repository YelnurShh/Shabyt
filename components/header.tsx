'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from './brand-mark';
import { AccountButton } from './account-button';
import { useAuth } from './auth-provider';
const links = [['/', 'Басты бет'], ['/ertegiler', 'Ертегілер әлемі'], ['/zhumbaktar', 'Жұмбақтар'], ['/oyu-ornek', 'Ою-өрнек сыры'], ['/chat', 'ЖИ көмекші'], ['/profile', 'Профиль']];
export function Header() { const path = usePathname(); const { profile } = useAuth(); return <header className="site-header"><div className="shell header-inner"><Link href="/" className="brand" aria-label="Shabyt — басты бет"><BrandMark/><span>Shabyt<span className="brand-caption">ҰЛТТЫҚ МҰРА · ЖАҢА КӨЗҚАРАС</span></span></Link><nav aria-label="Негізгі навигация">{links.map(([href,label])=><Link key={href} href={href} className={path === href ? 'active' : ''} aria-current={path === href ? 'page' : undefined}>{href === '/profile' && profile?.role === 'teacher' ? 'Мұғалім панелі' : label}</Link>)}</nav><AccountButton/></div></header> }
