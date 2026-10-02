import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, BookOpen, Palette, Sparkles } from 'lucide-react';

const paths = [
  { href: '/ertegiler', label: 'Ертегілер', icon: BookOpen },
  { href: '/zhumbaktar', label: 'Жұмбақтар', icon: Sparkles },
  { href: '/oyu-ornek', label: 'Ою-өрнек', icon: Palette },
];

export function HomeHero() {
  return <section className="home-hero shell" aria-labelledby="home-hero-title">
    <div className="home-hero-copy">
      <span className="home-hero-kicker"><span className="home-hero-kicker-mark"/> SHABYT · КӨРКЕМ ЕҢБЕК ӘЛЕМІ</span>
      <h1 id="home-hero-title">Ұлттық мұраға<br/><span>жаңа көзқарас.</span></h1>
      <p className="home-hero-description">Ертегімен қиялға қанат бітір. Жұмбақпен ойыңды оят. Ою-өрнекпен өнерге жақында.</p>
      <div className="home-hero-actions">
        <Link className="home-hero-primary" href="/ertegiler">Зерттеуді бастау <ArrowUpRight size={19} aria-hidden="true"/></Link>
        <a className="home-hero-secondary" href="#about">Жоба туралы <ArrowDownRight size={18} aria-hidden="true"/></a>
      </div>
      <div className="home-hero-paths" aria-label="Негізгі бөлімдер">
        {paths.map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={17} aria-hidden="true"/>{label}</Link>)}
      </div>
    </div>
    <aside className="home-author" aria-labelledby="home-author-title">
      <div className="home-author-top"><span>ЖОБА АВТОРЫ</span><span>01 / 01</span></div>
      <div className="home-author-portrait"><Image src="/media/author-sholpan-full.png" alt="Қойшықараева Шолпан" width={714} height={1272} priority sizes="(max-width: 760px) 220px, 240px"/></div>
      <div className="home-author-caption"><span>ШЫҒАРМАШЫЛЫҚ ЖОБА</span><h2 id="home-author-title">Қойшықараева<br/>Шолпан</h2><p>Ұлттық мұрадан — жаңа шабытқа.</p></div>
    </aside>
  </section>;
}
