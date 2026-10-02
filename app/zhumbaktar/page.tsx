import { PageIntro } from '@/components/page-intro';
import { RiddleLibrary } from '@/components/riddle-library';
export const metadata={title:'Жұмбақтар — сөзден суретке'};
export default function Riddles(){return <><PageIntro eyebrow="02 / ОЙЛАН. ТАП. БЕЙНЕЛЕ." title="Сөзден -" accent="суретке" description="Жұмбақтың шешуін тап. Сөзбен жасырылған бейнені ойыңда елестетіп, қағазға түсір."/><section className="shell section section-compact"><RiddleLibrary/><p className="source-note">Материалдар берілген бес Word файлынан алынды. Жанр атаулары мен жауаптары түпнұсқаға сай сақталды.</p></section></>}
