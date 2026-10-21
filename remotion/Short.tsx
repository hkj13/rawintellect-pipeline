import '@fontsource/anton';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Captions} from './Captions';
import {Scene} from './scenes';
import {Line, ShortProps, theme} from './types';

type Segment = {visual: string; from: number; to: number; lines: Line[]};

// Consecutive lines that share a base visual ("test", "test-vanish") are one scene.
const baseVisual = (v: string) => v.split('-')[0];

const toSegments = (lines: Line[], fps: number, total: number): Segment[] => {
  const segs: Segment[] = [];
  for (const line of lines) {
    const last = segs.at(-1);
    if (last && baseVisual(last.visual) === baseVisual(line.visual)) {
      last.lines.push(line);
    } else {
      segs.push({visual: baseVisual(line.visual), from: Math.round(line.start * fps), to: total, lines: [line]});
    }
  }
  segs.forEach((s, i) => {
    if (i === 0) s.from = 0;
    if (i + 1 < segs.length) s.to = segs[i + 1].from;
  });
  return segs;
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.09, mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <svg width="1080" height="1920">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} />
        </filter>
        <rect width="1080" height="1920" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)'}}
  />
);

const Progress: React.FC<{accent: string}> = ({accent}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.12)'}}>
      <div style={{width: `${(frame / durationInFrames) * 100}%`, height: '100%', background: accent}} />
    </div>
  );
};

const Brand: React.FC<{accent: string}> = ({accent}) => (
  <div
    style={{
      position: 'absolute',
      top: 150,
      width: '100%',
      textAlign: 'center',
      fontFamily: 'Inter',
      fontWeight: 800,
      fontSize: 30,
      letterSpacing: 10,
      color: 'rgba(255,255,255,0.55)',
    }}
  >
    RAW<span style={{color: accent}}>INTELLECT</span>
  </div>
);

// A quick flash and scale punch on every scene cut.
const Cut: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 14, stiffness: 180}});
  const flash = interpolate(frame, [0, 6], [0.5, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${interpolate(pop, [0, 1], [1.12, 1])})`, opacity: Math.min(1, pop * 1.4)}}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'white', opacity: flash}} />
    </AbsoluteFill>
  );
};

export const Short: React.FC<ShortProps> = ({id, timeline}) => {
  const {fps, durationInFrames} = useVideoConfig();
  if (!timeline) return null;
  const t = theme(timeline.theme);
  const segments = toSegments(timeline.lines, fps, durationInFrames);

  return (
    <AbsoluteFill style={{background: t.bg}}>
      {segments.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.to - s.from}>
          <Cut>
            <Scene visual={s.visual} lines={s.lines} offset={s.from / fps} accent={t.accent} glow={t.glow} />
          </Cut>
        </Sequence>
      ))}
      <Vignette />
      <Grain />
      <Brand accent={t.accent} />
      <Captions lines={timeline.lines} accent={t.accent} />
      <Progress accent={t.accent} />

      <Audio src={staticFile(`${id}/voice.wav`)} />
      <Audio src={staticFile(`${id}/music.wav`)} volume={0.16} />
      {segments.slice(1).map((s, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, s.from - 6)} durationInFrames={20}>
          <Audio src={staticFile(`${id}/whoosh.wav`)} volume={0.3} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
