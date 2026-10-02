'use client';
import { useState } from 'react';
export function Video({src,poster,title}:{src:string;poster:string;title:string}){const [error,setError]=useState(false);return <div className="video-wrap"><video controls playsInline preload="none" poster={poster} aria-label={title} onError={()=>setError(true)}><source src={src} type="video/mp4"/>Браузеріңіз видеоны қолдамайды.</video>{error&&<p role="alert">Видео ашылмады. <a href={src}>Видеоны бөлек ашу</a></p>}</div>}
