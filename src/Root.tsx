import React from 'react';
import {CalculateMetadataFunction, Composition, getStaticFiles, staticFile} from 'remotion';
import {getAudioDurationInSeconds} from '@remotion/media-utils';
import {VendingVideo, VideoProps} from './Video';
import {CastTest} from './cast/CastTest';
import {FaceTest} from './cast/FaceTest';
import {CycleTest} from './cast/CycleTest';
import {PoseSheetOld, PoseSheetCal, PoseSheetGroup} from './cast/PoseSheetComps';
import {CastVideo} from './castep/CastVideo';
import {EboEp01, EP01_DURATION} from './series/ep01';
import {EboEp01Short, EP01_SHORT_DURATION} from './series/ep01short';
import {EboEp02, EP02_DURATION} from './series/ep02';
import {EboEp03, EP03_DURATION, EP03_W, EP03_H} from './series/ep03';
import {Ep03Storyboard, EP03_BOARD_PANELS} from './series/ep03board';
import {Ep04Storyboard, EP04_BOARD_PANELS} from './series/ep04board';
import {EboEp04, EP04_DURATION, EP04_W, EP04_H} from './series/ep04';
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
  <Composition id="EboTeachesMoney-Ep03" component={EboEp03} durationInFrames={EP03_DURATION} fps={VFPS} width={EP03_W} height={EP03_H} defaultProps={{layer: 'full' as const}} />
  <Composition id="EboTeachesMoney-Ep04" component={EboEp04} durationInFrames={EP04_DURATION} fps={VFPS} width={EP04_W} height={EP04_H} defaultProps={{layer: 'full' as const}} />
  <Composition id="Ep04-Storyboard" component={Ep04Storyboard} durationInFrames={EP04_BOARD_PANELS} fps={1} width={1920} height={1080} />
  <Composition id="Ep03-Storyboard" component={Ep03Storyboard} durationInFrames={EP03_BOARD_PANELS} fps={1} width={1920} height={1080} />
  <Composition id="EboTeachesMoney-Ep01-Short" component={EboEp01Short} durationInFrames={EP01_SHORT_DURATION} fps={VFPS} width={VW} height={VH} defaultProps={{layer: 'full' as const}} />
  {(['stand', 'talk', 'emotion', 'sit', 'lie', 'action'] as const).map((g) => (
    <Composition key={g} id={`PoseSheet-${g}`} component={PoseSheetGroup} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{group: g, who: 'ebo' as const}} />
  ))}
  <Composition id="PoseSheet-Cal" component={PoseSheetCal} durationInFrames={1} fps={30} width={1920} height={1080} />
  <Composition id="PoseSheet-Old" component={PoseSheetOld} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{}} />
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
