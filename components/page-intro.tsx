import { Ornament } from './ornament';
export function PageIntro({eyebrow,title,accent,description}:{eyebrow:string;title:string;accent:string;description:string}){return <section className="page-intro shell"><div><p className="eyebrow"><span className="dot"/> {eyebrow}</p><h1>{title} <span className="serif accent">{accent}</span></h1><p>{description}</p></div><Ornament/></section>}
