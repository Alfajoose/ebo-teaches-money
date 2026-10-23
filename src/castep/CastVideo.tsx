import React, {useMemo} from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {BEATS, BeatId, LINES_EBO} from '../timing';
import {buildTimeMap, SceneProvider, SyncProvider} from '../sync';
import {Captions} from '../components/Captions';
import {NoScaleContext} from '../noScale';
import {Scene1Hook} from './Scene1Hook';
import {Scene2Business} from './Scene2Business';
import {Scene3Reality} from './Scene3Reality';
import {Scene4Discovery} from './Scene4Discovery';
import {Scene5Payoff} from './Scene5Payoff';
import type {VideoProps} from '../Video';
import {C} from '../theme';

/**
 * "How Vending Machines Actually Make Money" — cast edition.
 * Ebo stars; Mica, Obuor, Ama and Christy are the office customers.
 * House rules: characters and props only translate/rotate (no scale animation).
 * Voiceover: public/narration-ebo.mp3 (+ optional narration-ebo-timing.json).
 */
const SCENES: Record<BeatId, React.FC> = {
  hook: Scene1Hook,
  business: Scene2Business,
  reality: Scene3Reality,
  discovery: Scene4Discovery,
  payoff: Scene5Payoff,
};

export const CastVideo: React.FC<VideoProps> = ({showCaptions, sync}) => {
  const map = useMemo(() => buildTimeMap(sync), [sync]);
  return (
    <NoScaleContext.Provider value>
      <SyncProvider map={map}>
        <AbsoluteFill style={{backgroundColor: C.paper}}>
          {BEATS.map((beat) => {
            const from = Math.round(map.toReal(beat.start));
            const to = Math.round(map.toReal(beat.end));
            const Scene = SCENES[beat.id];
            return (
              <Sequence key={beat.id} from={from} durationInFrames={to - from} name={beat.id}>
                <SceneProvider designStart={beat.start} realStart={from}>
                  <Scene />
                </SceneProvider>
              </Sequence>
            );
          })}
          {showCaptions && (
            <Sequence name="captions">
              <Captions lines={LINES_EBO} />
            </Sequence>
          )}
          {sync.hasAudio && <Html5Audio src={staticFile('narration-ebo.mp3')} />}
        </AbsoluteFill>
      </SyncProvider>
    </NoScaleContext.Provider>
  );
};
