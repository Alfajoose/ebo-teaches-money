import React from 'react';
import {CalculateMetadataFunction, Composition, getStaticFiles, staticFile} from 'remotion';
import {getAudioDurationInSeconds} from '@remotion/media-utils';
import {VendingVideo, VideoProps} from './Video';
import {CastTest} from './cast/CastTest';
import {FaceTest} from './cast/FaceTest';
import {CycleTest} from './cast/CycleTest';
import {CastVideo} from './castep/CastVideo';
import {EboEp01, EP01_DURATION} from './series/ep01';
import {EboEp01Short, EP01_SHORT_DURATION} from './series/ep01short';
import {EboEp02, EP02_DURATION} from './series/ep02';
import {VW, VH, VFPS} from './series/kit';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './timing';
import type {NarrationTiming} from './sync';

const hasPublicFile = async (name: string) => {
  try {
    if (getStaticFiles().some((f) => f.name === name)) return true;
  } catch {
    // getStaticFiles is unavailable in some environments; fall through
  }
  try {
    const res = await fetch(staticFile(name), {method: 'HEAD'});
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * Looks for public/narration.mp3 (+ optional public/narration-timing.json).
 * The video always stays exactly 58 seconds.
 */
const metadataFor = (audio: string, timingFile: string): CalculateMetadataFunction<VideoProps> => async ({props}) => {
  const hasAudio = await hasPublicFile(audio);
  let audioDurationInSeconds: number | null = null;
  let timing: NarrationTiming | null = null;
  if (hasAudio) {
    try {
      audioDurationInSeconds = await getAudioDurationInSeconds(staticFile(audio));
    } catch {
      audioDurationInSeconds = null;
    }
    if (await hasPublicFile(timingFile)) {
      try {
        timing = (await (await fetch(staticFile(timingFile))).json()) as NarrationTiming;
      } catch {
        timing = null;
      }
    }
  }
  return {
    durationInFrames: TOTAL_FRAMES,
    props: {...props, sync: {hasAudio, audioDurationInSeconds, timing}},
  };
};

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="CastTest"
    component={CastTest}
    durationInFrames={60}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{rows: [0, 1, 2, 3, 4]}}
  />
  <Composition id="EboTeachesMoney-Ep01" component={EboEp01} durationInFrames={EP01_DURATION} fps={VFPS} width={VW} height={VH} defaultProps={{layer: 'full' as const}} />
  <Composition id="EboTeachesMoney-Ep02" component={EboEp02} durationInFrames={EP02_DURATION} fps={VFPS} width={VW} height={VH} defaultProps={{layer: 'full' as const}} />
  <Composition id="EboTeachesMoney-Ep01-Short" component={EboEp01Short} durationInFrames={EP01_SHORT_DURATION} fps={VFPS} width={VW} height={VH} defaultProps={{layer: 'full' as const}} />
  <Composition id="CycleTest" component={CycleTest} durationInFrames={60} fps={VFPS} width={WIDTH} height={HEIGHT} defaultProps={{}} />
  <Composition id="FaceTest" component={FaceTest} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition
    id="VendingMachineMoney"
    component={VendingVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{showCaptions: true, sync: {hasAudio: false, audioDurationInSeconds: null, timing: null}}}
    calculateMetadata={metadataFor('narration.mp3', 'narration-timing.json')}
  />
  <Composition
    id="VendingMachineMoneyCast"
    component={CastVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{showCaptions: true, sync: {hasAudio: false, audioDurationInSeconds: null, timing: null}}}
    calculateMetadata={metadataFor('narration-ebo.mp3', 'narration-ebo-timing.json')}
  />
  </>
);
