import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Line} from './types';

type SceneProps = {visual: string; lines: Line[]; offset: number; accent: string; glow: string};

const CX = 540;
const CY = 700;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Seconds since this scene started, and helpers to time things against lines and words.
const useClock = (offset: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const lineAt = (lines: Line[], i: number) => (lines[i] ? lines[i].start - offset : Infinity);
  const wordAt = (lines: Line[], word: string) => {
    for (const l of lines) {
      const w = l.words.find((x) => x.word.toLowerCase().startsWith(word.toLowerCase()));
      if (w) return w.start - offset;
    }
    return Infinity;
  };
  return {t, frame, fps, lineAt, wordAt};
};

const Label: React.FC<{x: number; y: number; children: React.ReactNode; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; opacity?: number}> = ({
  x,
  y,
  children,
  color = 'white',
  size = 44,
  anchor = 'middle',
  opacity = 1,
}) => (
  <text x={x} y={y} fill={color} fontFamily="Inter" fontWeight={800} fontSize={size} letterSpacing={4} textAnchor={anchor} opacity={opacity}>
    {children}
  </text>
);

const DotField: React.FC<{color?: string; opacity?: number; drift?: number}> = ({color = 'white', opacity = 0.18, drift = 0}) => {
  const dots = [];
  for (let y = 260; y <= 1140; y += 44) {
    for (let x = 20; x <= 1060; x += 44) {
      dots.push(<circle key={`${x}-${y}`} cx={x + drift} cy={y} r={4} fill={color} />);
    }
  }
  return <g opacity={opacity}>{dots}</g>;
};

const Eye: React.FC<{accent: string; glow: string; open: number; look?: number}> = ({accent, glow, open, look = 0}) => {
  const lid = `M160 ${CY} Q${CX} ${CY - 300 * open} 920 ${CY} Q${CX} ${CY + 300 * open} 160 ${CY} Z`;
  return (
    <g>
      <defs>
        <clipPath id="eye-clip">
          <path d={lid} />
        </clipPath>
        <radialGradient id="iris" cx="50%" cy="50%" r="50%">
          <stop offset="35%" stopColor="#0B1418" />
          <stop offset="70%" stopColor={accent} />
          <stop offset="100%" stopColor="#0B1418" />
        </radialGradient>
      </defs>
      <path d={lid} fill="#E9EEF0" />
      <g clipPath="url(#eye-clip)">
        <circle cx={CX + look} cy={CY} r={165} fill="url(#iris)" />
        {Array.from({length: 36}).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={CX + look + Math.cos(a) * 70}
              y1={CY + Math.sin(a) * 70}
              x2={CX + look + Math.cos(a) * 158}
              y2={CY + Math.sin(a) * 158}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth={3}
            />
          );
        })}
        <circle cx={CX + look} cy={CY} r={66} fill="#000" />
        <circle cx={CX + look + 40} cy={CY - 44} r={20} fill="white" opacity={0.85} />
      </g>
      <path d={lid} fill="none" stroke={accent} strokeWidth={6} style={{filter: `drop-shadow(0 0 30px ${glow})`}} />
    </g>
  );
};

const Hook: React.FC<SceneProps> = ({lines, offset, accent, glow}) => {
  const {t, lineAt} = useClock(offset);
  const blink = t < 0.25 ? interpolate(t, [0, 0.12, 0.25], [1, 0.05, 1]) : 1;
  const zoom = interpolate(t, [0, 4], [1, 1.12], clamp);
  const hidingAt = lineAt(lines, 1);
  // The hole pulses, then "glitches" shut when the brain starts hiding it.
  const holeR = t < hidingAt ? 120 + Math.sin(t * 6) * 10 : interpolate(t - hidingAt, [0, 0.9], [120, 0], clamp);
  const glitch = t > hidingAt && t < hidingAt + 0.9 ? Math.sin(t * 90) * 24 : 0;
  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`}}>
      <svg width="1080" height="1920">
        <DotField />
        <g transform={`translate(${glitch} 0)`}>
          <circle cx={820} cy={420} r={holeR + 30} fill="black" opacity={0.6} />
          <circle cx={820} cy={420} r={holeR} fill="black" stroke={accent} strokeWidth={holeR > 4 ? 5 : 0} />
        </g>
        <Eye accent={accent} glow={glow} open={blink} look={interpolate(t, [0, 1.5], [0, 60], clamp)} />
      </svg>
    </AbsoluteFill>
  );
};

const Retina: React.FC<SceneProps> = ({lines, offset, accent}) => {
  const {t, lineAt} = useClock(offset);
  const R = 300;
  const spotA = (12 * Math.PI) / 180;
  const sx = CX + R * Math.cos(spotA);
  const sy = CY + R * Math.sin(spotA);
  const draw = interpolate(t, [0, 1.2], [0, 1], clamp);
  const sensorsAt = lineAt(lines, 1);
  const ticks = [];
  for (let deg = -70; deg <= 70; deg += 5) {
    if (Math.abs(deg - 12) < 9) continue; // no receptors where the nerve leaves
    const a = (deg * Math.PI) / 180;
    const k = (deg + 70) / 140;
    const on = interpolate(t - sensorsAt, [k * 0.8, k * 0.8 + 0.15], [0, 1], clamp);
    ticks.push(
      <line key={deg} x1={CX + (R - 6) * Math.cos(a)} y1={CY + (R - 6) * Math.sin(a)} x2={CX + (R - 34) * Math.cos(a)} y2={CY + (R - 34) * Math.sin(a)} stroke={accent} strokeWidth={6} strokeLinecap="round" opacity={on} />,
    );
  }
  const pulse = 1 + 0.15 * Math.sin(t * 7);
  const arcLen = 2 * Math.PI * R * (140 / 360);
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920">
        <circle cx={CX} cy={CY} r={R} fill="#0E1418" stroke="rgba(255,255,255,0.35)" strokeWidth={4} />
        <ellipse cx={CX - R + 30} cy={CY} rx={34} ry={120} fill="rgba(255,255,255,0.12)" stroke="white" strokeWidth={4} />
        {[-80, 0, 80].map((dy) => (
          <path key={dy} d={`M0 ${CY + dy * 1.6} L${CX - R + 30} ${CY + dy} L${CX + R - 20} ${CY - dy * 0.6}`} stroke="rgba(255,240,180,0.55)" strokeWidth={4} fill="none" strokeDasharray="1400" strokeDashoffset={1400 * (1 - draw)} />
        ))}
        <path d={`M${CX + R * Math.cos(-1.22)} ${CY + R * Math.sin(-1.22)} A${R} ${R} 0 0 1 ${CX + R * Math.cos(1.22)} ${CY + R * Math.sin(1.22)}`} stroke="white" strokeWidth={10} fill="none" strokeDasharray={arcLen} strokeDashoffset={arcLen * (1 - draw)} />
        <path d={`M${sx - 10} ${sy - 30} L1080 ${sy + 40} L1080 ${sy + 120} L${sx - 10} ${sy + 30} Z`} fill="#C9A27A" opacity={0.85} />
        {ticks}
        <circle cx={sx} cy={sy} r={46 * pulse} fill="none" stroke={accent} strokeWidth={6} opacity={draw} />
        <line x1={sx} y1={sy - 50} x2={sx - 60} y2={330} stroke={accent} strokeWidth={4} opacity={draw} />
        <Label x={sx - 60} y={310} color={accent} size={52} opacity={draw}>BLIND SPOT</Label>
        <Label x={980} y={sy + 190} size={30} anchor="end" opacity={0.7 * draw}>OPTIC NERVE</Label>
        <Label x={CX - R + 30} y={CY + 190} size={30} opacity={0.7 * draw}>LENS</Label>
      </svg>
    </AbsoluteFill>
  );
};

const Moon: React.FC<{x: number; y: number; r: number; s: number}> = ({x, y, r, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={r} fill="#D9D6CC" />
    <circle cx={-r * 0.3} cy={-r * 0.2} r={r * 0.22} fill="#B9B5A8" />
    <circle cx={r * 0.35} cy={r * 0.3} r={r * 0.15} fill="#B9B5A8" />
    <circle cx={r * 0.1} cy={-r * 0.5} r={r * 0.1} fill="#B9B5A8" />
  </g>
);

const Moons: React.FC<SceneProps> = ({lines, offset, accent, glow}) => {
  const {t, fps, wordAt} = useClock(offset);
  const startAt = Math.min(wordAt(lines, 'swallow'), wordAt(lines, 'eleven'));
  const r = 40;
  const count = Math.max(0, Math.min(11, Math.floor((t - startAt) / 0.17) + 1));
  const boxIn = interpolate(t, [0, 0.5], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920">
        <rect x={40} y={CY - 120} width={1000} height={240} rx={120} fill="rgba(0,0,0,0.6)" stroke={accent} strokeWidth={5} strokeDasharray="22 14" opacity={boxIn} />
        <Label x={CX} y={CY - 160} size={40} color={accent} opacity={boxIn}>YOUR BLIND SPOT</Label>
        {Array.from({length: 11}).map((_, i) => {
          const appear = startAt + i * 0.17;
          const s = t < appear ? 0 : spring({frame: Math.round((t - appear) * fps), fps, config: {damping: 10, stiffness: 200}});
          return <Moon key={i} x={CX + (i - 5) * 86} y={CY} r={r} s={s} />;
        })}
        <text x={CX} y={CY + 330} fill="white" fontFamily="Anton" fontSize={200} textAnchor="middle" opacity={count > 0 ? 1 : 0} style={{filter: `drop-shadow(0 0 30px ${glow})`}}>
          ×{count}
        </text>
        <Label x={CX} y={CY + 400} size={30} opacity={count === 11 ? 0.7 : 0}>FULL MOONS, SIDE BY SIDE</Label>
      </svg>
    </AbsoluteFill>
  );
};

const Stripes: React.FC<{accent: string}> = ({accent}) => (
  <g>
    {Array.from({length: 56}).map((_, i) => (
      <line key={i} x1={-900 + i * 60} y1={260} x2={-900 + i * 60 + 880} y2={1140} stroke={i % 3 === 0 ? accent : 'rgba(255,255,255,0.35)'} strokeWidth={14} />
    ))}
  </g>
);

const Fill: React.FC<SceneProps> = ({lines, offset, accent}) => {
  const {t, wordAt} = useClock(offset);
  const paintAt = wordAt(lines, 'paints');
  const fill = interpolate(t - paintAt, [0, 1.3], [0, 230], clamp);
  const pulse = 1 + 0.05 * Math.sin(t * 6);
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920">
        <defs>
          <clipPath id="field">
            <rect x={0} y={260} width={1080} height={880} />
          </clipPath>
          <clipPath id="patch">
            <circle cx={CX} cy={CY} r={fill} />
          </clipPath>
        </defs>
        <g clipPath="url(#field)">
          <Stripes accent={accent} />
        </g>
        <circle cx={CX} cy={CY} r={220 * pulse} fill="black" />
        <g clipPath="url(#patch)">
          <Stripes accent={accent} />
        </g>
        <circle cx={CX} cy={CY} r={220 * pulse} fill="none" stroke="white" strokeWidth={5} strokeDasharray="18 12" opacity={interpolate(fill, [0, 230], [1, 0.25])} />
      </svg>
    </AbsoluteFill>
  );
};

// The real blind-spot test. Cross and dot sit about 880 px apart, roughly 5.3 cm on a
// typical phone, which lines up with the right eye's blind spot at about 20 cm away.
const Test: React.FC<SceneProps> = ({lines, offset, accent}) => {
  const {t, lineAt} = useClock(offset);
  const closerAt = lineAt(lines, 1);
  const hint = t < closerAt ? 'CLOSE LEFT EYE · STARE AT +' : 'KEEP STARING AT +';
  const arrow = t > closerAt ? 0.6 + 0.4 * Math.sin(t * 5) : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width="1080" height="1920">
        <Label x={CX} y={540} size={38} color="rgba(255,255,255,0.8)">
          {hint}
        </Label>
        <g stroke="white" strokeWidth={14} strokeLinecap="round">
          <line x1={120} y1={CY - 46} x2={120} y2={CY + 46} />
          <line x1={74} y1={CY} x2={166} y2={CY} />
        </g>
        <circle cx={960} cy={CY} r={46} fill={accent} />
        <g opacity={arrow} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={6}>
          <path d={`M${CX - 70} ${CY + 170} L${CX} ${CY + 230} L${CX + 70} ${CY + 170}`} />
          <path d={`M${CX - 70} ${CY + 120} L${CX} ${CY + 180} L${CX + 70} ${CY + 120}`} opacity={0.5} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const RetinaPanel: React.FC<{x: number; label: string; front: boolean; accent: string; show: number}> = ({x, label, front, accent, show}) => {
  const cells = [];
  for (let y = CY - 260; y <= CY + 260; y += 40) {
    if (front && Math.abs(y - CY) < 30) continue;
    cells.push(<circle key={y} cx={x} cy={y} r={11} fill={accent} />);
  }
  // Nerve fibres: in front of the cells (toward the light, on the left) for us, behind for the octopus.
  const side = front ? -1 : 1;
  const fibres = [-220, -140, -60, 60, 140, 220].map((dy) => (
    <path key={dy} d={`M${x + side * 30} ${CY + dy} Q${x + side * 70} ${CY + dy * 0.3} ${front ? x : x + 110} ${CY}`} stroke="#C9A27A" strokeWidth={6} fill="none" />
  ));
  return (
    <g opacity={show} transform={`translate(0 ${interpolate(show, [0, 1], [40, 0])})`}>
      <Label x={x} y={CY - 330} size={46}>
        {label}
      </Label>
      <line x1={x} y1={CY - 280} x2={x} y2={CY + 280} stroke="rgba(255,255,255,0.3)" strokeWidth={36} strokeLinecap="round" />
      {cells}
      {fibres}
      <path d={front ? `M${x} ${CY} L${x + 140} ${CY}` : `M${x + 110} ${CY} L${x + 190} ${CY}`} stroke="#C9A27A" strokeWidth={22} strokeLinecap="round" />
      {front ? <circle cx={x} cy={CY} r={36} fill="none" stroke="#FF3B3B" strokeWidth={6} /> : null}
      <Label x={x} y={CY + 360} size={34} color={front ? '#FF3B3B' : accent}>
        {front ? 'BLIND SPOT' : 'NO GAP'}
      </Label>
    </g>
  );
};

const Octopus: React.FC<SceneProps> = ({lines, offset, accent}) => {
  const {t, wordAt} = useClock(offset);
  const left = interpolate(t, [0, 0.4], [0, 1], clamp);
  const right = interpolate(t - wordAt(lines, 'their'), [0, 0.4], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920">
        <RetinaPanel x={300} label="YOU" front accent={accent} show={left} />
        <RetinaPanel x={740} label="OCTOPUS" front={false} accent={accent} show={right} />
      </svg>
    </AbsoluteFill>
  );
};

const Outro: React.FC<SceneProps> = ({offset, accent, glow}) => {
  const {t} = useClock(offset);
  const open = interpolate(t, [0.5, 3.4], [1, 0.12], clamp);
  return (
    <AbsoluteFill style={{transform: `scale(${interpolate(t, [0, 3.5], [1.1, 1.25], clamp)})`}}>
      <svg width="1080" height="1920">
        <DotField drift={t * 10} />
        <Eye accent={accent} glow={glow} open={open} look={interpolate(t, [0, 3], [-40, 40], clamp)} />
      </svg>
    </AbsoluteFill>
  );
};

export const Scene: React.FC<SceneProps> = (props) => {
  switch (props.visual) {
    case 'hook':
      return <Hook {...props} />;
    case 'retina':
      return <Retina {...props} />;
    case 'moons':
      return <Moons {...props} />;
    case 'fill':
      return <Fill {...props} />;
    case 'test':
      return <Test {...props} />;
    case 'octopus':
      return <Octopus {...props} />;
    case 'outro':
      return <Outro {...props} />;
    default:
      return <Hook {...props} />;
  }
};
