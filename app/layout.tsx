import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/header';
import { ChatLauncher } from '@/components/chat-launcher';
import { BrandMark } from '@/components/brand-mark';
import { AuthProvider } from '@/components/auth-provider';
import { AuthLoadingOverlay } from '@/components/auth-loading-overlay';
import './globals.css';
import './modern.css';
import './chat.css';
import './profile.css';
import './auth.css';
import './classroom.css';
import './loading.css';
import './home-hero.css';
export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')), title: {default:'Shabyt — ұлттық мұра, жаңа көзқарас', template:'%s | Shabyt'}, description:'Көркем еңбек пен халық ауыз әдебиетін біріктіретін қазақша оқу ресурсы. Ертегілер, жұмбақтар және ою-өрнектер. Жоба авторы: Қойшықараева Шолпан.', openGraph: { title: 'Shabyt — ұлттық мұра, жаңа көзқарас', description: 'Ертегілер, жұмбақтар, ою-өрнектер және шығармашылық ЖИ көмекші.', images: ['/site-preview.jpg'] }, twitter: { card: 'summary_large_image', images: ['/site-preview.jpg'] } };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="kk"><body><AuthProvider><AuthLoadingOverlay/><a className="skip-link" href="#main">Мазмұнға өту</a><Header/><main id="main">{children}</main><ChatLauncher/><footer><div className="shell footer-top"><div className="footer-brand"><BrandMark size={44}/><div><strong>Shabyt</strong><p>Өткеннен өнеге. Болашаққа шабыт.</p></div></div><div className="footer-links"><Link href="/ertegiler">Ертегілер</Link><Link href="/zhumbaktar">Жұмбақтар</Link><Link href="/oyu-ornek">Ою-өрнектер</Link><Link href="/chat">ЖИ көмекші</Link><Link href="/profile">Профиль</Link></div></div><div className="shell footer-bottom"><span>© 2026 Shabyt. Интерактивті оқу ресурсы.</span><span>Жоба авторы: Қойшықараева Шолпан</span></div></footer></AuthProvider></body></html>}
