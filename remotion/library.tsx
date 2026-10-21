import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Icon} from './icons';

// Reusable, parameterised scenes. A script line picks one with
// "visual": {"type": "number", "value": 23, "suffix": "%", "label": "..."}.
// Everything is drawn in the stage area (y 260 to 1140); captions sit below it.

export type Visual = {type: string; [key: string]: any};
type P = {v: Visual; accent: string; glow: string; dur: number};

const CX = 540;
const CY = 700;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {t: frame / fps, frame, fps};
};

const pop = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - Math.round(delay * fps), fps, config: {damping: 13, stiffness: 160}});

const Txt: React.FC<{x: number; y: number; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; font?: string; weight?: number; opacity?: number; spacing?: number; children: React.ReactNode}> = ({
  x,
  y,
  size = 44,
  color = 'white',
  anchor = 'middle',
  font = 'Inter',
  weight = 800,
  opacity = 1,
  spacing = 3,
  children,
}) => (
  <text x={x} y={y} fill={color} fontFamily={font} fontWeight={weight} fontSize={size} textAnchor={anchor} letterSpacing={spacing} opacity={opacity}>
    {children}
  </text>
);

// Split a label into lines of at most `max` characters.
const wrap = (s: string, max = 22) => {
  const out: string[] = [];
  let cur = '';
  for (const w of String(s).split(' ')) {
    if ((cur + ' ' + w).trim().length > max) {
      out.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

const Lines: React.FC<{text: string; x: number; y: number; size: number; max?: number; color?: string; opacity?: number; font?: string; gap?: number}> = ({text, x, y, size, max = 22, color, opacity, font, gap = 1.25}) => (
  <>
    {wrap(text, max).map((l, i) => (
      <Txt key={i} x={x} y={y + i * size * gap} size={size} color={color} opacity={opacity} font={font}>
        {l}
      </Txt>
    ))}
  </>
);

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <svg width="1080" height="1920">{children}</svg>
  </AbsoluteFill>
);

const NumberScene: React.FC<P> = ({v, accent, glow}) => {
  const {t} = useT();
  const k = interpolate(t, [0.1, 1.4], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const val = (v.from ?? 0) + (v.value - (v.from ?? 0)) * k;
  const shown = v.decimals ? val.toFixed(v.decimals) : v.plain ? String(Math.round(val)) : Math.round(val).toLocaleString('en-US');
  const ring = v.suffix === '%' ? Math.min(1, val / 100) : null;
  const r = 300;
  const circ = 2 * Math.PI * r;
  return (
    <Svg>
      {ring !== null ? (
        <g transform={`rotate(-90 ${CX} ${CY - 20})`}>
          <circle cx={CX} cy={CY - 20} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={26} />
          <circle cx={CX} cy={CY - 20} r={r} fill="none" stroke={accent} strokeWidth={26} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} style={{filter: `drop-shadow(0 0 24px ${glow})`}} />
        </g>
      ) : null}
      <Txt x={CX} y={CY + 60} size={String(shown).length > 5 ? 180 : 250} font="Anton" weight={400} spacing={0}>
        {v.prefix ?? ''}
        {shown}
        <tspan fill={accent}>{v.suffix ?? ''}</tspan>
      </Txt>
      <Lines text={String(v.label ?? '').toUpperCase()} x={CX} y={ring !== null ? CY + 400 : CY + 170} size={44} max={26} color={accent} opacity={interpolate(t, [0.8, 1.3], [0, 1], clamp)} />
    </Svg>
  );
};

const CompareScene: React.FC<P> = ({v, accent}) => {
  const {t, frame, fps} = useT();
  const max = Math.max(v.left.value, v.right.value);
  const bar = (side: any, x: number, color: string, delay: number) => {
    const g = pop(frame, fps, delay);
    const h = 560 * (side.value / max) * g;
    return (
      <g>
        <rect x={x - 120} y={1020 - h} width={240} height={h} rx={18} fill={color} opacity={0.9} />
        <Txt x={x} y={1000 - h - 24} size={92} font="Anton" weight={400} spacing={0} opacity={g}>
          {side.display ?? side.value}
          {v.unit ?? ''}
        </Txt>
        <Lines text={String(side.label).toUpperCase()} x={x} y={1080} size={34} max={14} opacity={g} />
      </g>
    );
  };
  return (
    <Svg>
      <line x1={120} x2={960} y1={1020} y2={1020} stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
      {bar(v.left, 330, 'rgba(255,255,255,0.35)', 0.1)}
      {bar(v.right, 750, accent, 0.6)}
      {v.title ? <Lines text={String(v.title).toUpperCase()} x={CX} y={330} size={42} max={28} color={accent} opacity={interpolate(t, [0, 0.4], [0, 1], clamp)} /> : null}
    </Svg>
  );
};

const PeopleScene: React.FC<P> = ({v, accent}) => {
  const {t} = useT();
  const total = v.total ?? 20;
  const big = total > 25;
  const cols = big ? 10 : 5;
  const rows = Math.ceil(total / cols);
  const cell = big ? 92 : 150;
  const x0 = CX - ((cols - 1) * cell) / 2;
  const y0 = CY - ((rows - 1) * cell) / 2 - 20;
  const lit = Math.round(interpolate(t, [0.5, 1.6], [0, v.highlight], clamp));
  return (
    <Svg>
      {Array.from({length: total}).map((_, i) => {
        const x = x0 + (i % cols) * cell;
        const y = y0 + Math.floor(i / cols) * cell;
        const on = i < lit;
        const appear = interpolate(t, [i * 0.02, i * 0.02 + 0.2], [0, 1], clamp);
        return (
          <g key={i} opacity={appear}>
            <Icon name="person" color={on ? accent : 'rgba(255,255,255,0.3)'} size={cell * 0.87} x={x} y={y} />
          </g>
        );
      })}
      <Lines text={String(v.label ?? '').toUpperCase()} x={CX} y={y0 + rows * cell + 20} size={42} max={26} color={accent} opacity={interpolate(t, [1.4, 1.8], [0, 1], clamp)} />
    </Svg>
  );
};

const QuoteScene: React.FC<P> = ({v, accent}) => {
  const {t} = useT();
  const words = String(v.text).split(' ');
  const per = 1.2 / Math.max(1, words.length);
  const lines = wrap(v.text, 20);
  let n = 0;
  return (
    <Svg>
      <Txt x={150} y={430} size={260} font="Anton" weight={400} color={accent} anchor="start" opacity={0.8}>
        “
      </Txt>
      {lines.map((l, li) => (
        <text key={li} x={CX} y={540 + li * 92} fill="white" fontFamily="Inter" fontWeight={800} fontSize={72} textAnchor="middle">
          {l.split(' ').map((w, wi) => {
            const k = n++;
            return (
              <tspan key={wi} opacity={interpolate(t, [k * per, k * per + 0.2], [0, 1], clamp)}>
                {w}{' '}
              </tspan>
            );
          })}
        </text>
      ))}
      {v.by ? (
        <Txt x={CX} y={560 + lines.length * 92 + 40} size={36} color={accent} opacity={interpolate(t, [1.3, 1.7], [0, 1], clamp)}>
          — {String(v.by).toUpperCase()}
        </Txt>
      ) : null}
    </Svg>
  );
};

const TimelineScene: React.FC<P> = ({v, accent, glow}) => {
  const {t, frame, fps} = useT();
  const pts: {year: string; label: string}[] = v.points;
  const x0 = 200;
  const x1 = 880;
  const draw = interpolate(t, [0, 1], [0, 1], clamp);
  return (
    <Svg>
      <line x1={x0} x2={x0 + (x1 - x0) * draw} y1={CY} y2={CY} stroke="rgba(255,255,255,0.5)" strokeWidth={6} />
      {pts.map((p, i) => {
        const x = pts.length === 1 ? CX : x0 + ((x1 - x0) * i) / (pts.length - 1);
        const g = pop(frame, fps, 0.3 + i * 0.45);
        const up = i % 2 === 0;
        const hl = v.highlight === i || (v.highlight === undefined && i === pts.length - 1);
        return (
          <g key={i} opacity={g}>
            <circle cx={x} cy={CY} r={hl ? 26 : 16} fill={hl ? accent : 'white'} style={hl ? {filter: `drop-shadow(0 0 20px ${glow})`} : undefined} />
            <Txt x={x} y={up ? CY - 70 : CY + 120} size={76} font="Anton" weight={400} spacing={0} color={hl ? accent : 'white'}>
              {p.year}
            </Txt>
            {/* Labels above the line grow upward so a long one never runs into its year. */}
            <Lines text={String(p.label).toUpperCase()} x={x} y={up ? CY - 160 - (wrap(String(p.label), 13).length - 1) * 30 * 1.25 : CY + 180} size={30} max={13} opacity={0.85} />
          </g>
        );
      })}
    </Svg>
  );
};

const PinScene: React.FC<P> = ({v, accent, glow}) => {
  const {t, frame, fps} = useT();
  const drop = pop(frame, fps, 0.3);
  const lat = [];
  for (let i = -3; i <= 3; i++) lat.push(<ellipse key={`a${i}`} cx={CX} cy={CY + i * 70} rx={Math.sqrt(1 - (i / 4) ** 2) * 340} ry={18} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={3} />);
  const spin = (t * 30) % 60;
  const lon = [];
  for (let i = 0; i < 6; i++) {
    const rx = Math.abs(Math.cos(((i * 30 + spin) * Math.PI) / 180)) * 340;
    lon.push(<ellipse key={`o${i}`} cx={CX} cy={CY} rx={rx} ry={300} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={3} />);
  }
  const pulse = (t * 1.2) % 1;
  return (
    <Svg>
      <circle cx={CX} cy={CY} r={340} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.3)" strokeWidth={4} />
      {lat}
      {lon}
      <circle cx={CX + (v.dx ?? 60)} cy={CY - 80} r={30 + pulse * 120} fill="none" stroke={accent} strokeWidth={4} opacity={1 - pulse} />
      <g transform={`translate(${CX + (v.dx ?? 60)} ${CY - 80 - (1 - drop) * 300})`} opacity={drop}>
        <path d="M0 0c-30-40-46-62-46-86a46 46 0 0 1 92 0c0 24-16 46-46 86z" fill={accent} style={{filter: `drop-shadow(0 0 20px ${glow})`}} />
        <circle cx={0} cy={-86} r={16} fill="#000" />
      </g>
      <Lines text={String(v.place).toUpperCase()} x={CX} y={330} size={64} max={20} font="Anton" />
      {v.detail ? <Txt x={CX} y={1100} size={36} color={accent} opacity={interpolate(t, [0.8, 1.2], [0, 1], clamp)}>{String(v.detail).toUpperCase()}</Txt> : null}
    </Svg>
  );
};

const IconScene: React.FC<P> = ({v, accent, glow}) => {
  const {t, frame, fps} = useT();
  const g = pop(frame, fps, 0);
  const float = Math.sin(t * 2) * 12;
  const icons: string[] = Array.isArray(v.names) ? v.names : [v.name];
  return (
    <Svg>
      <circle cx={CX} cy={CY - 30} r={330 + Math.sin(t * 3) * 8} fill="none" stroke={accent} strokeWidth={3} opacity={0.35} strokeDasharray="10 16" />
      {icons.map((name, i) => {
        const x = icons.length === 1 ? CX : CX + (i - (icons.length - 1) / 2) * 320;
        const gi = pop(frame, fps, i * 0.35);
        return (
          <g key={i} style={{filter: `drop-shadow(0 0 30px ${glow})`}} opacity={gi}>
            <Icon name={name} color={accent} size={icons.length === 1 ? 460 * g : 280} x={x} y={CY - 30 + float} />
          </g>
        );
      })}
      {v.label ? <Lines text={String(v.label).toUpperCase()} x={CX} y={1100} size={44} max={26} opacity={interpolate(t, [0.6, 1], [0, 1], clamp)} /> : null}
    </Svg>
  );
};

const WordsScene: React.FC<P> = ({v, accent}) => {
  const {frame, fps} = useT();
  const words: string[] = v.words;
  return (
    <Svg>
      {words.map((w, i) => {
        const g = pop(frame, fps, i * 0.3);
        const y = CY - ((words.length - 1) * 170) / 2 + i * 170 + 60;
        return (
          <Txt key={i} x={CX} y={y} size={w.length > 9 ? 120 : 170} font="Anton" weight={400} spacing={2} color={i === (v.highlight ?? words.length - 1) ? accent : 'white'} opacity={g}>
            {w.toUpperCase()}
          </Txt>
        );
      })}
    </Svg>
  );
};

// Interactive: name the ink colour, not the word.
const StroopScene: React.FC<P> = ({v}) => {
  const {frame, fps} = useT();
  const colors: Record<string, string> = {red: '#FF3B3B', blue: '#3D7BFF', green: '#2BD96B', yellow: '#FFD23D', purple: '#B35CFF', orange: '#FF8A2B'};
  const items: [string, string][] = v.items;
  return (
    <Svg>
      {items.map(([word, ink], i) => {
        const g = pop(frame, fps, i * 0.12);
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <Txt key={i} x={col === 0 ? 300 : 780} y={380 + row * 160} size={120} font="Anton" weight={400} spacing={2} color={colors[ink] ?? ink} opacity={g}>
            {word.toUpperCase()}
          </Txt>
        );
      })}
    </Svg>
  );
};

const WaveScene: React.FC<P> = ({v, accent, glow}) => {
  const {t} = useT();
  const pts = [];
  const spike = v.spike ?? true;
  for (let x = 40; x <= 1040; x += 8) {
    const u = (x - 40) / 1000;
    const base = Math.sin(u * 40 + t * 8) * 18 + Math.sin(u * 97 + t * 13) * 10;
    const s = spike ? Math.exp(-((u - 0.55) ** 2) / 0.004) * 260 * interpolate(t, [0.4, 1.2], [0, 1], clamp) : 0;
    pts.push(`${x},${CY - base - s * Math.abs(Math.sin(u * 60))}`);
  }
  return (
    <Svg>
      {[...Array(9)].map((_, i) => (
        <line key={i} x1={40} x2={1040} y1={CY - 320 + i * 80} y2={CY - 320 + i * 80} stroke="rgba(255,255,255,0.07)" strokeWidth={2} />
      ))}
      <polyline points={pts.join(' ')} fill="none" stroke={accent} strokeWidth={6} style={{filter: `drop-shadow(0 0 16px ${glow})`}} />
      {v.code ? (
        <Txt x={CX} y={CY + 300} size={130} font="Anton" weight={400} spacing={14} opacity={interpolate(t, [1, 1.5], [0, 1], clamp)}>
          {v.code}
        </Txt>
      ) : null}
      {v.label ? <Txt x={CX} y={360} size={40} color={accent}>{String(v.label).toUpperCase()}</Txt> : null}
    </Svg>
  );
};

const CipherScene: React.FC<P> = ({v, accent}) => {
  const {t} = useT();
  const glyphs = String(v.glyphs ?? '∆⊕ϡ♁ℵ⌘ϟ∂ʘ⊗ʬ⧖⊚∮ϫ⊞ⵔ⵿ⴰ⊿⌖').split('');
  const rows = 7;
  const perRow = 9;
  const shown = Math.floor(interpolate(t, [0, 2.4], [0, rows * perRow], clamp));
  let k = 0;
  return (
    <Svg>
      <rect x={110} y={320} width={860} height={760} rx={16} fill="#D8C9A3" opacity={0.92} transform={`rotate(-2 ${CX} ${CY})`} />
      <g transform={`rotate(-2 ${CX} ${CY})`}>
        {[...Array(rows)].map((_, r) =>
          [...Array(perRow)].map((__, c) => {
            const i = k++;
            const g = glyphs[(i * 7 + r) % glyphs.length];
            return (
              <text key={`${r}-${c}`} x={180 + c * 90} y={430 + r * 95} fontSize={64} fill="#3A2A14" opacity={i < shown ? 0.85 : 0} fontFamily="serif">
                {g}
              </text>
            );
          }),
        )}
      </g>
      {v.label ? <Txt x={CX} y={1160} size={40} color={accent} opacity={interpolate(t, [0.6, 1], [0, 1], clamp)}>{String(v.label).toUpperCase()}</Txt> : null}
    </Svg>
  );
};

const SplitScene: React.FC<P> = ({v, accent}) => {
  const {frame, fps} = useT();
  const a = pop(frame, fps, 0);
  const b = pop(frame, fps, 0.5);
  return (
    <Svg>
      <line x1={CX} x2={CX} y1={300} y2={1100} stroke="rgba(255,255,255,0.3)" strokeWidth={4} />
      <g opacity={a}>
        {v.leftIcon ? <Icon name={v.leftIcon} color="rgba(255,255,255,0.8)" size={260} x={290} y={620} /> : null}
        <Lines text={String(v.left).toUpperCase()} x={290} y={v.leftIcon ? 860 : 700} size={60} max={9} font="Anton" />
      </g>
      <g opacity={b}>
        {v.rightIcon ? <Icon name={v.rightIcon} color={accent} size={260} x={790} y={620} /> : null}
        <Lines text={String(v.right).toUpperCase()} x={790} y={v.rightIcon ? 860 : 700} size={60} max={9} font="Anton" color={accent} />
      </g>
    </Svg>
  );
};

// Interactive: stare at the cross and the soft blobs fade away (Troxler fading).
const TroxlerScene: React.FC<P> = () => {
  const blobs = [
    [300, 480, '#FF5FA2'],
    [800, 520, '#5FD4FF'],
    [260, 920, '#FFD25F'],
    [820, 900, '#7CFF5F'],
    [540, 380, '#B88CFF'],
    [540, 1030, '#FF9B5F'],
  ] as const;
  return (
    <AbsoluteFill style={{background: '#8A8A8A'}}>
      <svg width="1080" height="1920">
        <defs>
          <filter id="soft">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        {blobs.map(([x, y, c], i) => (
          <circle key={i} cx={x} cy={y} r={110} fill={c} filter="url(#soft)" />
        ))}
        <g stroke="black" strokeWidth={10}>
          <line x1={CX - 30} x2={CX + 30} y1={CY} y2={CY} />
          <line x1={CX} x2={CX} y1={CY - 30} y2={CY + 30} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const ClockScene: React.FC<P> = ({v, accent}) => {
  const {t} = useT();
  // The first tick hangs longer, like the stopped-clock illusion.
  const hold = v.hold ?? 1.2;
  const sec = t < hold ? 0 : Math.floor(t - hold) + 1;
  const a = (sec * 6 * Math.PI) / 180;
  return (
    <Svg>
      <circle cx={CX} cy={CY} r={330} fill="rgba(255,255,255,0.04)" stroke="white" strokeWidth={10} />
      {[...Array(60)].map((_, i) => {
        const b = (i * 6 * Math.PI) / 180;
        const l = i % 5 === 0 ? 40 : 16;
        return <line key={i} x1={CX + Math.sin(b) * 310} y1={CY - Math.cos(b) * 310} x2={CX + Math.sin(b) * (310 - l)} y2={CY - Math.cos(b) * (310 - l)} stroke="white" strokeWidth={i % 5 === 0 ? 8 : 3} />;
      })}
      <line x1={CX} y1={CY} x2={CX + Math.sin(a) * 280} y2={CY - Math.cos(a) * 280} stroke={accent} strokeWidth={10} strokeLinecap="round" />
      <circle cx={CX} cy={CY} r={18} fill={accent} />
    </Svg>
  );
};

const QuestionScene: React.FC<P> = ({v, accent, glow}) => {
  const {t, frame, fps} = useT();
  const g = pop(frame, fps, 0);
  const jitter = Math.sin(t * 40) * (t % 1.7 < 0.12 ? 18 : 0);
  return (
    <Svg>
      <g transform={`translate(${jitter} 0)`}>
        <Txt x={CX} y={CY + 280} size={620 * g} font="Anton" weight={400} color={accent} spacing={0}>
          ?
        </Txt>
      </g>
      <Txt x={CX + 8} y={CY + 280} size={620 * g} font="Anton" weight={400} color="white" spacing={0} opacity={0.12}>
        ?
      </Txt>
      {v.label ? <Lines text={String(v.label).toUpperCase()} x={CX} y={360} size={48} max={22} opacity={interpolate(t, [0.4, 0.8], [0, 1], clamp)} /> : null}
      <circle cx={CX} cy={CY} r={420} fill="none" stroke={accent} strokeWidth={2} opacity={0.3} style={{filter: `drop-shadow(0 0 30px ${glow})`}} />
    </Svg>
  );
};


// Vertebrae with soft discs between them; "squeeze" flattens the discs, "grow" refills them.
const SpineScene: React.FC<P> = ({v, accent, glow}) => {
  const {t} = useT();
  const k = interpolate(t, [0.3, 2.2], [0, 1], clamp);
  const disc = v.mode === 'grow' ? 14 + 30 * k : 44 - 30 * k;
  const n = 7;
  const bone = 70;
  const total = n * bone + (n - 1) * disc;
  const y0 = CY - total / 2;
  const els = [];
  for (let i = 0; i < n; i++) {
    const y = y0 + i * (bone + disc);
    els.push(<rect key={`b${i}`} x={CX - 130} y={y} width={260} height={bone} rx={20} fill="#E8E2D4" />);
    if (i < n - 1) els.push(<rect key={`d${i}`} x={CX - 110} y={y + bone + 3} width={220} height={Math.max(4, disc - 6)} rx={12} fill={accent} opacity={0.85} style={{filter: `drop-shadow(0 0 14px ${glow})`}} />);
  }
  const arrow = v.mode === 'grow' ? -1 : 1;
  return (
    <Svg>
      {els}
      <g stroke="rgba(255,255,255,0.6)" strokeWidth={8} fill="none" strokeLinecap="round">
        <path d={`M${CX + 230} ${CY - 150 * arrow} V${CY + 150 * arrow} M${CX + 200} ${CY + 120 * arrow} L${CX + 230} ${CY + 150 * arrow} L${CX + 260} ${CY + 120 * arrow}`} />
      </g>
      {v.label ? <Txt x={CX} y={300} size={44} color={accent}>{String(v.label).toUpperCase()}</Txt> : null}
    </Svg>
  );
};

const LIBRARY: Record<string, React.FC<P>> = {
  spine: SpineScene,
  number: NumberScene,
  compare: CompareScene,
  people: PeopleScene,
  quote: QuoteScene,
  timeline: TimelineScene,
  pin: PinScene,
  icon: IconScene,
  words: WordsScene,
  stroop: StroopScene,
  wave: WaveScene,
  cipher: CipherScene,
  split: SplitScene,
  troxler: TroxlerScene,
  clock: ClockScene,
  question: QuestionScene,
};

export const hasLibraryScene = (type: string) => type in LIBRARY;

export const LibraryScene: React.FC<P> = (props) => {
  const C = LIBRARY[props.v.type] ?? QuestionScene;
  return <C {...props} />;
};
