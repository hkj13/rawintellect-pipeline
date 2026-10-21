import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Line, Word} from './types';

const CHUNK = 3;

type Chunk = {words: Word[]; emphasis: string[]; start: number; end: number};

// Split each line into chunks of up to three words, breaking early after punctuation.
const toChunks = (lines: Line[]): Chunk[] => {
  const chunks: Chunk[] = [];
  for (const line of lines) {
    let cur: Word[] = [];
    line.words.forEach((w, i) => {
      cur.push(w);
      const last = i === line.words.length - 1;
      if (cur.length === CHUNK || /[,.!?]$/.test(w.word) || last) {
        chunks.push({words: cur, emphasis: line.emphasis, start: cur[0].start, end: cur.at(-1)!.end});
        cur = [];
      }
    });
  }
  return chunks;
};

export const Captions: React.FC<{lines: Line[]; accent: string}> = ({lines, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = toChunks(lines);
  const chunk = chunks.find((c, i) => t >= c.start && t < (chunks[i + 1]?.start ?? c.end + 0.6));
  if (!chunk) return null;

  const enter = spring({frame: frame - Math.round(chunk.start * fps), fps, config: {damping: 12, stiffness: 220}});

  return (
    <div
      style={{
        position: 'absolute',
        top: 1180,
        left: 60,
        right: 60,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 44px',
        transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px) scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
        opacity: enter,
      }}
    >
      {chunk.words.map((w, i) => {
        const active = t >= w.start && t < w.end + 0.05;
        const said = t >= w.start;
        const key = w.word.replace(/[^\w']/g, '').toLowerCase();
        const strong = chunk.emphasis.some((e) => e.replace(/[^\w']/g, '').toLowerCase() === key);
        return (
          <span
            key={i}
            style={{
              fontFamily: 'Anton',
              fontSize: 118,
              lineHeight: 1.08,
              textTransform: 'uppercase',
              color: strong && said ? accent : 'white',
              opacity: said ? 1 : 0.45,
              transform: `scale(${active ? 1.08 : 1})`,
              WebkitTextStroke: '10px black',
              paintOrder: 'stroke fill',
              textShadow: strong && said ? `0 0 40px ${accent}` : '0 8px 30px rgba(0,0,0,0.9)',
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};
