import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useDesignFrame} from '../sync';
import {LINES, Line} from '../timing';
import {C, FONT, lin} from '../theme';

/** Bottom captions, word-by-word reveal, following the (synced) narration timing. */
export const Captions: React.FC<{lines?: Line[]}> = ({lines = LINES}) => {
  const f = useDesignFrame();
  const line = lines.find((l) => f >= l.start - 2 && f <= l.end + 4);
  if (!line) return null;
  const words = line.text.split(' ');
  const span = Math.max(1, line.end - line.start - 10);
  const o = lin(f, [line.start - 2, line.start + 3, line.end, line.end + 4], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 54, opacity: o}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 46,
          lineHeight: 1.2,
          color: C.ink,
          background: 'rgba(255,253,248,0.94)',
          border: `5px solid ${C.ink}`,
          borderRadius: 26,
          padding: '14px 34px',
          maxWidth: 1720,
          textAlign: 'center',
          boxShadow: `0 8px 0 ${C.ink}`,
        }}
      >
        {words.map((w, i) => {
          const at = line.start + (i / words.length) * span;
          const p = lin(f, [at - 1, at + 4], [0, 1]);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: 14,
                opacity: 0.25 + 0.75 * p,
                transform: `translateY(${(1 - p) * 8}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
