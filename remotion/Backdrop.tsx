import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// A faint moving pattern behind every scene. The pattern is picked from the video id,
// so consecutive uploads don't share the same look.
const PATTERNS = ['dots', 'grid', 'rings', 'diagonal'] as const;

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export const Backdrop: React.FC<{id: string; accent: string}> = ({id, accent}) => {
  const frame = useCurrentFrame();
  const kind = PATTERNS[hash(id) % PATTERNS.length];
  const drift = (frame * 0.6) % 60;
  const els: React.ReactNode[] = [];
  if (kind === 'dots') {
    for (let y = -60; y < 1980; y += 60) for (let x = 0; x < 1140; x += 60) els.push(<circle key={`${x}-${y}`} cx={x} cy={y + drift} r={3} fill="white" />);
  } else if (kind === 'grid') {
    for (let i = -1; i < 34; i++) els.push(<line key={`h${i}`} x1={0} x2={1080} y1={i * 60 + drift} y2={i * 60 + drift} stroke="white" strokeWidth={1.5} />);
    for (let i = 0; i < 19; i++) els.push(<line key={`v${i}`} x1={i * 60} x2={i * 60} y1={0} y2={1920} stroke="white" strokeWidth={1.5} />);
  } else if (kind === 'rings') {
    for (let r = 60; r < 1400; r += 90) els.push(<circle key={r} cx={540} cy={700} r={r + drift * 1.5} fill="none" stroke={accent} strokeWidth={2} />);
  } else {
    for (let i = -40; i < 40; i++) els.push(<line key={i} x1={i * 70 + drift} y1={0} x2={i * 70 + drift + 1920} y2={1920} stroke="white" strokeWidth={2} />);
  }
  return (
    <AbsoluteFill style={{opacity: 0.07}}>
      <svg width="1080" height="1920">{els}</svg>
    </AbsoluteFill>
  );
};
