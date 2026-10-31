import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {StageSizeContext} from './exportCtx';
import {HandDrawnContext} from '../handDrawn';
import {Panel} from './ep03board';
import {EP04_PLAN, ep04Set} from './ep04plan';

/** Storyboard for Episode 4: frame n is the panel for shot n of the plan (ep04plan.tsx). */
export const EP04_BOARD_PANELS = EP04_PLAN.length;

export const Ep04Storyboard: React.FC = () => {
  const n = useCurrentFrame();
  const s = EP04_PLAN[Math.min(n, EP04_PLAN.length - 1)];
  return (
    <StageSizeContext.Provider value={{w: 1920, h: 1080}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <Panel s={s as never} n={n + 1} setNode={ep04Set(s.set)} />
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
