'use client';

import { useEffect, useRef } from 'react';
import animationData from '@/content/loading-animation.json';

export function LoadingAnimation({ label = 'Жүктелуде…' }: { label?: string }) {
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let animation: import('lottie-web').AnimationItem | undefined;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    void import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !animationRef.current) return;
      animation = lottie.loadAnimation({
        container: animationRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: !motionQuery.matches,
        animationData,
      });
      if (motionQuery.matches) animation.goToAndStop(0, true);
    });

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, []);

  return <div className="site-loading-content" role="status" aria-label={label}>
    <div className="site-loading-animation" ref={animationRef} aria-hidden="true" />
    <span className="site-loading-label">{label}</span>
  </div>;
}
