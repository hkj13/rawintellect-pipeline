import React from 'react';

// Line icons drawn on a 200x200 grid, stroked in the theme accent. Keep them simple:
// they sit behind big captions and must read at a glance on a phone.
type IconProps = {color: string};

const S: React.FC<{color: string; children: React.ReactNode; width?: number}> = ({color, children, width = 7}) => (
  <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </g>
);

export const ICONS: Record<string, React.FC<IconProps>> = {
  brain: ({color}) => (
    <S color={color}>
      <path d="M100 40c-14-14-44-8-46 14-20 2-28 26-14 40-12 14-2 38 18 38 4 18 30 24 42 8" />
      <path d="M100 40c14-14 44-8 46 14 20 2 28 26 14 40 12 14 2 38-18 38-4 18-30 24-42 8" />
      <path d="M100 40v100M70 74c10 0 16 8 16 16M130 74c-10 0-16 8-16 16M64 112c12-4 22 2 24 10M136 112c-12-4-22 2-24 10" />
    </S>
  ),
  gut: ({color}) => (
    <S color={color}>
      <path d="M70 30v30c0 14 60 6 60 24s-60 6-60 24 60 6 60 24-60 6-60 24v14" />
      <circle cx="70" cy="30" r="6" />
    </S>
  ),
  ship: ({color}) => (
    <S color={color}>
      <path d="M30 130h140l-20 30H50z" />
      <path d="M100 30v100M100 40l50 70h-50M100 50l-40 60h40" />
      <path d="M20 175c20 8 40-8 60 0s40-8 60 0 40-8 60 0" />
    </S>
  ),
  signal: ({color}) => (
    <S color={color}>
      <path d="M100 170V110M70 170h60M100 110l-30-40h60z" />
      <path d="M60 60a56 56 0 0 1 80 0M44 42a80 80 0 0 1 112 0M76 78a28 28 0 0 1 48 0" />
    </S>
  ),
  skull: ({color}) => (
    <S color={color}>
      <path d="M100 30c-40 0-64 26-64 60 0 22 12 34 22 40v24h84v-24c10-6 22-18 22-40 0-34-24-60-64-60z" />
      <circle cx="76" cy="96" r="14" />
      <circle cx="124" cy="96" r="14" />
      <path d="M92 132l8-14 8 14M80 154v-12M100 154v-12M120 154v-12" />
    </S>
  ),
  tree: ({color}) => (
    <S color={color}>
      <path d="M100 170V90M100 30l-44 60h88z" />
      <path d="M100 60l-54 74h108z" />
    </S>
  ),
  clock: ({color}) => (
    <S color={color}>
      <circle cx="100" cy="100" r="70" />
      <path d="M100 52v48l30 18" />
    </S>
  ),
  phone: ({color}) => (
    <S color={color}>
      <rect x="64" y="30" width="72" height="140" rx="14" />
      <path d="M90 150h20M40 70c-8 10-8 50 0 60M160 70c8 10 8 50 0 60M24 56c-14 18-14 70 0 88M176 56c14 18 14 70 0 88" />
    </S>
  ),
  lighthouse: ({color}) => (
    <S color={color}>
      <path d="M80 170l8-100h24l8 100zM84 70h32M92 70V54h16v16M100 54V44" />
      <path d="M116 60l60-22v44zM84 60l-60-22v44z" opacity={0.6} />
      <path d="M40 170h120" />
    </S>
  ),
  book: ({color}) => (
    <S color={color}>
      <path d="M100 50c-20-14-50-14-70-6v116c20-8 50-8 70 6 20-14 50-14 70-6V44c-20-8-50-8-70 6zM100 50v116" />
      <path d="M46 74c12-4 28-4 38 0M46 98c12-4 28-4 38 0M116 74c12-4 28-4 38 0M116 98c12-4 28-4 38 0" opacity={0.6} />
    </S>
  ),
  ear: ({color}) => (
    <S color={color}>
      <path d="M70 80c0-32 22-50 46-50s44 20 44 48c0 30-30 36-30 60 0 18-14 30-30 30s-28-12-28-28" />
      <path d="M96 84c0-12 8-20 20-20s20 8 20 18c0 14-16 16-16 30" />
    </S>
  ),
  nose: ({color}) => (
    <S color={color}>
      <path d="M100 30c0 40-10 70-34 96 0 18 18 24 34 14 16 10 34 4 34-14" />
      <path d="M40 60c10 6 10 18 0 24M160 60c-10 6-10 18 0 24M30 40c16 10 16 30 0 40M170 40c-16 10-16 30 0 40" opacity={0.6} />
    </S>
  ),
  bed: ({color}) => (
    <S color={color}>
      <path d="M24 150V60M24 120h152v30M24 120V100h40c10 0 14 6 14 20M78 104h80c10 0 18 6 18 16" />
      <path d="M120 70h24l-24 22h24M150 40h16l-16 16h16" />
    </S>
  ),
  person: ({color}) => (
    <S color={color}>
      <circle cx="100" cy="52" r="22" />
      <path d="M60 170v-50c0-20 18-34 40-34s40 14 40 34v50" />
    </S>
  ),
  door: ({color}) => (
    <S color={color}>
      <path d="M56 170V30h88v140M40 170h120" />
      <path d="M56 30l54 16v134l-54-10" />
      <circle cx="98" cy="108" r="5" />
    </S>
  ),
  water: ({color}) => (
    <S color={color}>
      <path d="M20 80c20 10 40-10 60 0s40-10 60 0 40-10 60 0M20 120c20 10 40-10 60 0s40-10 60 0 40-10 60 0M20 160c20 10 40-10 60 0s40-10 60 0 40-10 60 0" />
    </S>
  ),
  gear: ({color}) => (
    <S color={color}>
      <circle cx="100" cy="100" r="30" />
      <path d="M100 30v20M100 150v20M30 100h20M150 100h20M50 50l14 14M136 136l14 14M50 150l14-14M136 64l14-14" />
      <circle cx="100" cy="100" r="52" />
    </S>
  ),
  star: ({color}) => (
    <S color={color}>
      <path d="M100 26l20 50 54 4-42 34 14 52-46-30-46 30 14-52-42-34 54-4z" />
    </S>
  ),
  bug: ({color}) => (
    <S color={color}>
      <ellipse cx="100" cy="110" rx="36" ry="50" />
      <circle cx="100" cy="52" r="16" />
      <path d="M64 90H34M64 120H30M66 146l-26 16M136 90h30M136 120h34M134 146l26 16M92 38l-10-14M108 38l10-14" />
    </S>
  ),
  mask: ({color}) => (
    <S color={color}>
      <path d="M40 60c40-20 80-20 120 0 0 50-20 90-60 100-40-10-60-50-60-100z" />
      <path d="M66 92c8-8 20-8 28 0M106 92c8-8 20-8 28 0M80 128c12 8 28 8 40 0" />
    </S>
  ),
  eye: ({color}) => (
    <S color={color}>
      <path d="M20 100c40-50 120-50 160 0-40 50-120 50-160 0z" />
      <circle cx="100" cy="100" r="26" />
    </S>
  ),
  dna: ({color}) => (
    <S color={color}>
      <path d="M70 20c0 40 60 40 60 80s-60 40-60 80M130 20c0 40-60 40-60 80s60 40 60 80" />
      <path d="M78 46h44M78 154h44M90 74h20M90 126h20" opacity={0.7} />
    </S>
  ),
  music: ({color}) => (
    <S color={color}>
      <path d="M76 150V50l90-20v100" />
      <circle cx="56" cy="150" r="20" />
      <circle cx="146" cy="130" r="20" />
      <path d="M76 80l90-20" />
    </S>
  ),
  coffee: ({color}) => (
    <S color={color}>
      <path d="M40 80h100v50c0 24-20 40-50 40s-50-16-50-40zM140 96h14c14 0 14 30 0 30h-14" />
      <path d="M70 40c-8 10 8 16 0 26M100 36c-8 10 8 16 0 26" opacity={0.7} />
      <path d="M150 170c10-4 20 0 26 8" />
    </S>
  ),
};

export const Icon: React.FC<{name: string; color: string; size: number; x: number; y: number}> = ({name, color, size, x, y}) => {
  const C = ICONS[name] ?? ICONS.brain;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 200})`}>
      <C color={color} />
    </g>
  );
};
