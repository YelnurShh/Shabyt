import type { ReactNode } from 'react';

// Redrawn from labeled Kazakh ornament references linked on the patterns page.
const drawings: ReactNode[] = [
  <g key="broken" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"><path d="M100 128V84L76 61 53 80l20 20 17-17M100 84l24-23 23 19-20 20-17-17"/><path d="M53 80 39 67l25-29 36 31 36-31 25 29-14 13" strokeWidth="5"/></g>,
  <g key="meander" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 54c17-20 33-20 49 0s33 20 49 0 33-20 49 0 19 18 24 11M18 95c17-20 33-20 49 0s33 20 49 0 33-20 49 0 19 18 24 11"/></g>,
  <g key="flower" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><path d="M100 128V80M100 108Q62 105 49 84q35-4 51 24m0 0q38-3 51-24-35-4-51 24"/><path d="M100 76c-21-14-23-30-12-36 4-3 9-2 12 2 3-4 8-5 12-2 11 6 9 22-12 36Zm-14-9c-25 0-32-14-22-24 7-6 17-4 22 5m28 19c25 0 32-14 22-24-7-6-17-4-22 5"/></g>,
  <g key="single-horn" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"><path d="M45 120h80c28 0 43-17 43-42 0-19-12-31-27-31-16 0-27 11-27 25 0 11 7 18 17 18 8 0 14-5 14-13"/><path d="M55 120c-16-11-23-27-18-45 3-13 12-22 24-28" strokeWidth="7"/></g>,
  <g key="double-horn" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"><path d="M100 126V88C83 56 62 40 47 48 30 57 34 83 51 88c15 5 24-5 23-17-1-8-8-12-15-9M100 88c17-32 38-48 53-40 17 9 13 35-4 40-15 5-24-5-23-17 1-8 8-12 15-9"/><path d="M75 126h50" strokeWidth="7"/></g>,
  <g key="wings" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"><path d="M100 110 76 82C55 81 36 68 21 43c34 7 54 4 79 30 25-26 45-23 79-30-15 25-34 38-55 39l-24 28Z"/><path d="M100 73v52M46 58l43 36m65-36-43 36M86 112l14 18 14-18" strokeWidth="5"/><path d="M90 60c0-9 5-15 10-15s10 6 10 15" strokeWidth="5"/></g>,
  <g key="goose-neck" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"><path d="M37 103c13 18 35 20 51 8 17-13 11-29 0-31-9-2-18 5-16 15 3 9 15 7 19 0M163 103c-13 18-35 20-51 8-17-13-11-29 0-31 9-2 18 5 16 15-3 9-15 7-19 0"/><path d="M43 103c-15-10-21-24-12-37 7-10 19-11 29-5m97 42c15-10 21-24 12-37-7-10-19-11-29-5" strokeWidth="6"/></g>,
  <g key="botakoz" fill="none" stroke="currentColor" strokeWidth="7" strokeLinejoin="miter"><path d="M100 17 174 75 100 133 26 75 100 17Z"/><path d="M100 38 149 75 100 112 51 75 100 38Z" strokeWidth="5"/><path d="M100 56 125 75 100 94 75 75 100 56Z" strokeWidth="5"/></g>,
  <g key="tortqulaq" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><path d="M100 75C78 54 66 34 51 36c-15 2-16 23-2 27 10 3 16-7 10-14M100 75c22-21 34-41 49-39 15 2 16 23 2 27-10 3-16-7-10-14"/><path d="M100 75c-22 21-34 41-49 39-15-2-16-23-2-27 10-3 16 7 10 14m41-26c22 21 34 41 49 39 15-2 16-23 2-27-10-3-16 7-10 14"/><path d="M100 44v62M69 75h62" strokeWidth="5"/></g>,
];

export function PatternSketch({ variant, name, className = '' }: { variant: number; name: string; className?: string }) {
  return <svg className={className} viewBox="0 0 200 150" role="img" aria-label={`${name} оюының суреті`}>
    {drawings[variant] ?? drawings[8]}
  </svg>;
}
