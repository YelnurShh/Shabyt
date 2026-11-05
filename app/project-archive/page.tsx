import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, Download, FileText, Film } from 'lucide-react';
import files from '@/content/project-files.json';
import './archive.css';

export const metadata: Metadata = {
  title: 'Жоба материалдары',
  robots: { index: false, follow: false },
};

export default function ProjectArchive() {
  return <section className="shell archive-page">
    <div className="archive-heading"><p className="eyebrow">SHABYT · ЖОБА МАТЕРИАЛДАРЫ</p><h1>Құжаттар мен бейне</h1><p>Материалды ашыңыз немесе QR-кодын жүктеп алыңыз.</p><a className="button primary" href="/shabyt-qr-codes.zip" download><Download size={18}/> Барлық QR-кодты жүктеу</a></div>
    <div className="archive-grid">{files.map(file => <article className="archive-card" key={file.name}>
      <div className="archive-card-head">{file.kind === 'video' ? <Film size={24}/> : <FileText size={24}/>}<span>{file.kind === 'video' ? 'MP4' : 'PDF'} · {file.size} МБ</span></div>
      <h2>{file.title}</h2>
      {file.kind === 'video' && <video controls preload="none" playsInline src={file.href} aria-label={file.title}/>}
      <a className="archive-open" href={file.href} target="_blank" rel="noopener noreferrer">Файлды ашу <ArrowUpRight size={18}/></a>
      <div className="archive-qr"><Image src={file.qr} width={148} height={148} alt={`${file.title} — QR-код`}/><a href={file.qr} download><Download size={16}/> QR-кодты жүктеу</a></div>
    </article>)}</div>
    <div className="archive-website"><Image src="/qr-codes/shabyt-website.png" width={160} height={160} alt="Shabyt сайтының QR-коды"/><div><h2>Shabyt сайты</h2><a href="https://shabyt.vercel.app/">shabyt.vercel.app</a><p><a className="archive-open" href="/qr-codes/shabyt-website.png" download><Download size={17}/> Сайттың QR-кодын жүктеу</a></p></div></div>
  </section>;
}
