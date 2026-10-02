'use client';
import { useEffect, useRef } from 'react';
export function Reveal({ children, className = '', id }: {children: React.ReactNode; className?: string; id?: string}) { const ref=useRef<HTMLDivElement>(null); useEffect(()=>{ const el=ref.current;if(!el)return; const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){el.classList.add('visible');observer.unobserve(el)}},{threshold:.08});el.classList.add('reveal-ready');observer.observe(el);return()=>observer.disconnect();},[]);return <div ref={ref} id={id} className={`reveal ${className}`}>{children}</div> }
