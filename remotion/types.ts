export type Word = {word: string; start: number; end: number};

export type Line = {
  index: number;
  text: string;
  visual: string | {type: string; [key: string]: any};
  emphasis: string[];
  start: number;
  end: number;
  words: Word[];
};

export type Timeline = {
  id: string;
  title: string;
  theme: string;
  duration: number;
  lines: Line[];
};

export type ShortProps = {id: string; timeline: Timeline | null};

export const THEMES: Record<string, {accent: string; glow: string; bg: string}> = {
  psychology: {accent: '#3DDCFF', glow: 'rgba(61,220,255,0.35)', bg: '#06080B'},
  mystery: {accent: '#FF3B3B', glow: 'rgba(255,59,59,0.35)', bg: '#0A0606'},
  body: {accent: '#7CFF8A', glow: 'rgba(124,255,138,0.32)', bg: '#050A07'},
};

export const theme = (name: string) => THEMES[name] ?? THEMES.psychology;
