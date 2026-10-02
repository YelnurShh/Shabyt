import Image from 'next/image';
import { PageIntro } from '@/components/page-intro';
import { Video } from '@/components/video';
import { Reveal } from '@/components/reveal';
import { Ornament } from '@/components/ornament';
import { PatternSketch } from '@/components/pattern-sketch';
import { WikipediaPatternSearch } from '@/components/wikipedia-pattern-search';
import { extraPatterns } from '@/content/extra-patterns';
import slides from '@/content/slides.json';

export const metadata = { title: 'Ою-өрнек сыры' };

const slide = slides[6].text.join('');
function legend(start: string, end?: string) {
  const text = slide.slice(slide.indexOf(start) + start.length, end ? slide.indexOf(end) : undefined);
  return text.slice(text.indexOf('Ертеде') >= 0 ? text.indexOf('Ертеде') : text.indexOf('Бір көші-қон'));
}

const patterns = [
  { name: 'Қошқар мүйіз', image: 'image13.png', video: 'media6.mp4', tag: 'БЕРЕКЕ МЕН МОЛДЫҚ', text: legend('Қошқар мүйіз', 'Түйетабан') },
  { name: 'Түйетабан', image: 'image12.png', video: 'media5.mp4', tag: 'ҚҰТТЫ ІЗ', text: legend('Түйетабан', 'Тұмар') },
  { name: 'Тұмар', image: 'image11.png', video: 'media4.mp4', tag: 'ҚОРҒАУ МЕН АМАНДЫҚ', text: legend('Тұмар') },
];

export default function Patterns() {
  return <>
    <PageIntro eyebrow="03 / ТАНЫ. ЗЕРТТЕ. ЖАСА." title="Ою-өрнек" accent="сыры" description="Әр иірім — бір әңгіме. Ұлттық өрнектермен танысып, олардың аңызын тыңда және өз өрнегіңді жаса." />
    <section className="shell section section-compact">
      <div className="section-heading"><div><p className="eyebrow">ПРЕЗЕНТАЦИЯДАҒЫ ӨРНЕКТЕР</p><h2>Пішінде сақталған <span className="serif">аңыз</span></h2></div><p>Презентациядағы халық аңыздарының нұсқалары.<br />Өрнекті қозғалыста тамашала.</p></div>
      <div className="pattern-list">{patterns.map((pattern, index) => <Reveal key={pattern.name} className="pattern-feature">
        <div className={`pattern-visual pattern-color-${index}`}><span className="pattern-index">0{index + 1}</span><Image src={`/media/${pattern.image}`} alt={`${pattern.name} — презентациядағы ою үлгісі`} width={550} height={420} className="pattern-original" /><span className="eyebrow">{pattern.tag}</span></div>
        <div className="pattern-copy"><p className="eyebrow">ОЮ АҢЫЗЫ</p><h2>{pattern.name}</h2><p>{pattern.text}</p><details className="pattern-video"><summary>Өрнек видеосын көру <span>＋</span></summary><Video src={`/media/${pattern.video}`} poster={`/media/${pattern.image}`} title={`${pattern.name} оюының анимациясы`} /></details></div>
      </Reveal>)}</div>
      <p className="source-note">Аңыздар мен бастапқы суреттер Қойшықараева Шолпанның презентациясынан алынды. Ондағы дерек сілтемелері: Х. Арғынбаев, Ө. Жәнібеков еңбектері, Орталық Қазақстан фольклор жинақтары және Н. Байғабылов жазбалары.</p>
    </section>
    <section className="tinted-section"><div className="shell section">
      <p className="eyebrow">ӨРНЕКТІ ЖАЛҒАСТЫР</p><h2>Өзге оюларды <span className="serif">зерттейік</span></h2>
      <p className="extra-intro">Тоғыз оюдың өзіне тән пішінін салыстыр. Суреттер атауы көрсетілген оқу деректеріне сүйеніп қайта сызылды.</p>
      <div className="extra-grid">{extraPatterns.map(pattern => <Reveal className="extra-pattern" key={pattern.name}>
        <div className="extra-pattern-art"><PatternSketch variant={pattern.variant} name={pattern.name} className="extra-svg" /></div>
        <span className="extra-group">{pattern.group}</span><h3>{pattern.name}</h3><p>{pattern.text}</p><span className="eyebrow">ОЮ ПІШІНІ</span>
      </Reveal>)}</div>
      <p className="source-note">Оюлардың атауы мен пішіні <a href="https://e-history.kz/kz/news/show/32292" target="_blank" rel="noopener noreferrer">e-history.kz анықтамалығымен</a>, <a href="https://ust.kz/powerpoint/gylymi_joba_qazaq_halqynyng_ulttyq_oyu_ornegin_turmysta_qoldany-243689.html" target="_blank" rel="noopener noreferrer">атаулы үлгілер кестесімен</a> және <a href="https://www.koshpendiler.kz/index.php/koloner/oyu-ornek/" target="_blank" rel="noopener noreferrer">Koshpendiler</a> сипаттамаларымен салыстырылды. Вектор суреттер осы бет үшін қайта сызылды.</p>
      <div className="pattern-task"><Ornament /><div><h3>Шеберхана: өз оюыңды жаса</h3><p>Қағазды екіге бүкте. Бір жартысына өрнек салып, қиып ал да, қағазды аш. Симметрияны бақылап, оюды өз түстеріңмен безендір.</p></div></div>
    </div></section>
    <WikipediaPatternSearch />
  </>;
}
