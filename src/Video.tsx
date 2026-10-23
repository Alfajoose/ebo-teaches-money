import React, {useMemo} from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {BEATS, BeatId} from './timing';
import {buildTimeMap, SceneProvider, SyncInput, SyncProvider} from './sync';
import {Captions} from './components/Captions';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Business} from './scenes/Scene2Business';
import {Scene3Reality} from './scenes/Scene3Reality';
import {Scene4Discovery} from './scenes/Scene4Discovery';
import {Scene5Payoff} from './scenes/Scene5Payoff';
import {C} from './theme';

export type VideoProps = {
  showCaptions: boolean;
  sync: SyncInput;
};

const SCENES: Record<BeatId, React.FC> = {
  hook: Scene1Hook,
  business: Scene2Business,
  reality: Scene3Reality,
  discovery: Scene4Discovery,
  payoff: Scene5Payoff,
};

export const VendingVideo: React.FC<VideoProps> = ({showCaptions, sync}) => {
  const map = useMemo(() => buildTimeMap(sync), [sync]);

  return (
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
            <Captions />
          </Sequence>
        )}
        {sync.hasAudio && <Html5Audio src={staticFile('narration.mp3')} />}
      </AbsoluteFill>
    </SyncProvider>
  );
};
