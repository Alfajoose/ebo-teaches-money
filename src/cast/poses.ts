import {POSES, Pose} from '../components/Character';

/**
 * THE POSE LIBRARY — one named pose per readable attitude, tuned for the cast's rig
 * (big head, short limbs). Rotation / translation only (house rule): arms and legs are
 * [shoulder|hip, elbow|knee] degrees, `lift` sinks the body (+ = down), `tilt` leans it,
 * `headTilt` tips the head. Faces (eyes / mouth / brows) are swaps.
 *
 * Rig notes (from cast/sheets/poses-calibration.png):
 *  - arms: 0 = hanging, 90 = straight out, ~135 = up and out. Past ~140 the hand hides
 *    behind the head, so "arms up" poses stop at 130–140.
 *  - elbow: + bends the forearm up and in (hand to chest / face), − bends it down and out.
 *  - legs: hip + = forward, knee + = bends back. legs [88, 0] + lift 86 = sitting on a seat.
 *  - lying: tilt −90 rotates the whole body about the feet, so the body would sink half into
 *    the floor: place lying poses LIE_Y higher than the floor or mattress (y = surface − LIE_Y).
 *  - the head is drawn over the arms, so a hand can't touch the face — except on Ebo's new
 *    master: `armFront: true` draws his right arm over the head (the `hands` group). His arms
 *    are short, so a hand reaches the mouth / chin / cheek, not the eyes.
 *  - views (Ebo only, `view`): 0 = ¾ (default), 1 = front, 2 = front hands-in (shy), 3 = back.
 *    Other rigs ignore `view` and `armFront`; eyes / mouths they don't have fall back
 *    (angry → squint, tired → half, laugh → grin …), so every pose works on the whole cast.
 *
 * Use: `{...POSE.explain, eyes: 'happy'}` — every pose is a full Pose, so faces can be
 * overridden per shot. Sheets of every group: the PoseSheet-* compositions.
 */

/** How far above the floor / mattress to place a lying pose. */
export const LIE_Y = 128;

const B = POSES.standing;
const p = (x: Partial<Pose>): Pose => ({...B, ...x});

export const POSE_GROUPS = {
  // ── standing / neutral ──
  stand: {
    stand: p({armL: [10, 6], armR: [10, 6]}),
    relaxed: p({armL: [6, 4], armR: [8, 4], headTilt: 3, lift: 2}),
    handsBehind: p({armL: [-30, 0], armR: [-30, 0], headTilt: -2, brows: 'up'}),
    handsOnHips: p({armL: [48, -128], armR: [48, -128], brows: 'up', mouth: 'smirk'}),
    armsCrossed: p({armL: [26, 128], armR: [26, 128], headTilt: -4, eyes: 'half', mouth: 'flat'}),
    lean: p({armL: [8, 4], armR: [48, -128], tilt: 6, headTilt: 6, mouth: 'smirk'}),
  },
  // ── talking to camera / gestures ──
  talk: {
    explain: p({armR: [72, -40], armL: [14, 8], brows: 'up'}),
    explainBoth: p({armL: [62, -38], armR: [62, -38], brows: 'up'}),
    point: p({armR: [95, -6], armL: [12, 6], brows: 'up'}),
    pointUp: p({armR: [135, -10], armL: [12, 6], lookX: 8, lookY: -10, brows: 'up'}),
    pointAtYou: p({armR: [70, 30], armL: [12, 6], tilt: 4, headTilt: -6, eyes: 'squint', mouth: 'smirk'}),
    ideaFinger: p({armR: [134, -6], armL: [12, 6], eyes: 'wide', mouth: 'o', brows: 'up'}),
    stopHand: p({armR: [96, 0], armL: [14, 8], tilt: -6, brows: 'angry', mouth: 'flat'}),
    shrug: p({armL: [70, 82], armR: [70, 82], headTilt: 9, lift: 6, brows: 'up', mouth: 'flat'}),
    presentTaDa: p({armL: [122, -22], armR: [122, -22], lift: -10, eyes: 'happy', mouth: 'grin', brows: 'up'}),
    wave: p({armR: [132, 40], armL: [12, 6], eyes: 'happy', mouth: 'grin'}),
  },
  // ── emotions ──
  emotion: {
    happy: p({armL: [36, 28], armR: [36, 28], headTilt: 4, eyes: 'happy', mouth: 'grin', blush: 1}),
    cheer: p({armL: [138, -12], armR: [138, -12], lift: -24, eyes: 'happy', mouth: 'laugh', brows: 'up'}),
    jumpForJoy: p({armL: [140, -14], armR: [140, -14], legL: [24, 46], legR: [-22, 46], lift: -60, eyes: 'happy', mouth: 'grin', brows: 'up'}),
    shocked: p({armL: [118, -35], armR: [118, -35], lift: -16, eyes: 'wide', mouth: 'scream', brows: 'up'}),
    scared: p({armL: [78, 128], armR: [78, 128], tilt: -6, headTilt: -8, lift: 22, legL: [18, 30], legR: [-14, 30], eyes: 'wide', mouth: 'grimace', brows: 'sad'}),
    sad: p({armL: [4, 2], armR: [4, 2], headTilt: -9, lift: 8, eyes: 'sad', mouth: 'frown', brows: 'sad', lookY: 8}),
    devastated: p({armL: [2, 0], armR: [2, 0], headTilt: 14, tilt: 4, lift: 22, eyes: 'sad', mouth: 'wobbly', brows: 'sad', lookY: 10}),
    angry: p({armL: [22, -70], armR: [22, -70], legL: [8, 0], legR: [-10, 0], tilt: 5, eyes: 'angry', mouth: 'grimace', brows: 'angry'}),
    smug: p({armL: [48, -128], armR: [48, -128], headTilt: 7, eyes: 'half', mouth: 'smirk', brows: 'up'}),
    bored: p({armL: [3, 2], armR: [3, 2], tilt: 4, headTilt: -10, lift: 10, eyes: 'tired', mouth: 'flat', brows: 'flat'}),
    confused: p({armR: [40, 112], armL: [10, 6], headTilt: 14, lookX: 12, eyes: 'open', mouth: 'o', brows: 'up'}),
    ugh: p({armL: [32, -92], armR: [32, -92], headTilt: -12, lift: 6, eyes: 'squeeze', mouth: 'frown', brows: 'sad'}),
    suspicious: p({armL: [26, 128], armR: [26, 128], headTilt: -6, lookX: 10, eyes: 'suspicious', mouth: 'flat', brows: 'angry'}),
    laughing: p({armL: [40, 90], armR: [40, 90], tilt: -6, headTilt: -10, lift: 8, eyes: 'squeeze', mouth: 'laugh'}),
    thinking: p({armFront: true, armR: [58, 140], armL: [26, 128], headTilt: 6, eyes: 'squint', mouth: 'flat', lookX: 10, lookY: -8}),
    sleepy: p({armL: [3, 2], armR: [3, 2], headTilt: 14, lift: 8, eyes: 'closed', mouth: 'snore', brows: 'flat'}),
  },
  // ── sitting (place on a seat: y = seat top) ──
  sit: {
    sit: p({legL: [88, 0], legR: [82, 0], lift: 86, armL: [24, 34], armR: [30, 40], mouth: 'flat'}),
    sitSlouch: p({legL: [92, 0], legR: [86, 0], lift: 98, tilt: -7, headTilt: -6, armL: [8, 4], armR: [10, 4], eyes: 'half', mouth: 'flat'}),
    sitForward: p({legL: [86, 0], legR: [80, 0], lift: 86, tilt: 8, armL: [36, 60], armR: [36, 60], eyes: 'wide', brows: 'up'}),
    sitPhone: p({legL: [88, 0], legR: [82, 0], lift: 90, headTilt: -6, armR: [44, 118], armL: [26, 40], eyes: 'half', mouth: 'flat', lookY: 8}),
    sitEat: p({armFront: true, legL: [88, 0], legR: [82, 0], lift: 88, armR: [70, 148], armL: [26, 40], eyes: 'happy', mouth: 'o'}),
    sitRemote: p({legL: [88, 0], legR: [82, 0], lift: 92, tilt: -4, armR: [92, -10], armL: [8, 4], eyes: 'half', mouth: 'flat'}),
  },
  // ── lying (tilt −90; place with y on the bed / floor) ──
  lie: {
    lieBack: p({tilt: -90, armL: [8, 4], armR: [8, 4], eyes: 'open', mouth: 'flat'}),
    lieAsleep: p({tilt: -90, armL: [6, 4], armR: [6, 4], eyes: 'closed', mouth: 'snore', brows: 'flat'}),
    lieStarfish: p({tilt: -90, armL: [100, 0], armR: [100, 0], legL: [-18, 0], legR: [18, 0], eyes: 'open', mouth: 'flat'}),
    lieDreaming: p({tilt: -90, armL: [8, 4], armR: [60, 120], eyes: 'closed', mouth: 'smile'}),
  },
  // ── actions ──
  action: {
    holdOut: p({armR: [70, -20], armL: [14, 8], brows: 'up'}),
    showToCamera: p({armR: [110, -60], armL: [14, 8], eyes: 'happy', mouth: 'grin', brows: 'up'}),
    carry: p({armL: [34, 92], armR: [34, 92], lift: 6, mouth: 'flat'}),
    typing: p({armL: [62, -104], armR: [62, -104], headTilt: -4, eyes: 'squint', mouth: 'flat', lookY: 6}),
    checkPhone: p({armR: [44, 118], armL: [10, 6], headTilt: -6, eyes: 'half', mouth: 'flat', lookY: 8}),
    sneak: p({armL: [44, 70], armR: [44, 70], legL: [26, 38], legR: [-20, 34], tilt: 8, lift: 22, eyes: 'squint', mouth: 'flat', lookX: 10}),
    kneel: p({legL: [90, 90], legR: [10, 100], lift: 70, armL: [14, 8], armR: [14, 8], mouth: 'flat'}),
    kickback: p({legL: [70, 0], legR: [-4, 0], tilt: -10, armL: [60, 0], armR: [60, 0], eyes: 'squint', mouth: 'scream', brows: 'angry'}),
  },
  // ── Ebo's new master: hand-to-face (right arm drawn over the head) ──
  hands: {
    handOverMouth: p({armFront: true, armR: [180, 0], armL: [14, 8], lift: 4, eyes: 'wide', mouth: 'o', brows: 'up'}),
    thinkChin: p({armFront: true, armR: [175, 40], armL: [26, 128], headTilt: 5, eyes: 'squint', mouth: 'flat', lookX: 10, lookY: -10}),
    hmm: p({armFront: true, armR: [170, 80], armL: [10, 6], headTilt: -5, eyes: 'suspicious', mouth: 'flat', lookX: 10}),
    facepalm: p({armFront: true, armR: [180, 0], armL: [6, 4], headTilt: -12, lift: 10, eyes: 'squeeze', mouth: 'frown', brows: 'sad'}),
    oops: p({view: 1, armL: [170, 60], armR: [10, 6], lift: 6, eyes: 'wide', mouth: 'grimace', brows: 'up'}),
    cheekWorry: p({view: 1, armR: [170, 60], armL: [10, 6], headTilt: 8, eyes: 'sad', mouth: 'wobbly', brows: 'sad'}),
    panic: p({view: 1, armL: [170, 60], armR: [170, 60], lift: 6, eyes: 'wide', mouth: 'scream', brows: 'up'}),
  },
  // ── Ebo's new master: straight to camera (view 1) and shy (view 2) ──
  front: {
    hostFront: p({view: 1, armL: [10, 6], armR: [10, 6], mouth: 'grin'}),
    hostExplain: p({view: 1, armR: [70, -40], armL: [12, 6], brows: 'up', mouth: 'grin'}),
    hostOpen: p({view: 1, armL: [80, -20], armR: [80, -20], brows: 'up', mouth: 'grin'}),
    hostPoint: p({view: 1, armR: [95, -6], armL: [12, 6], brows: 'up', mouth: 'grin'}),
    hostShrug: p({view: 1, armL: [70, 82], armR: [70, 82], headTilt: 9, lift: 6, brows: 'up', eyes: 'half', mouth: 'flat'}),
    hostCheer: p({view: 1, armL: [138, -12], armR: [138, -12], lift: -24, eyes: 'happy', mouth: 'laugh'}),
    shy: p({view: 2, headTilt: 7, lift: 4, eyes: 'happy', mouth: 'smile', blush: 1}),
    nervous: p({view: 2, headTilt: -5, lift: 8, eyes: 'sad', mouth: 'grimace', lookX: -8}),
  },
  // ── Ebo's new master: from behind (view 3) — walking off, sulking, facing the problem ──
  back: {
    backStand: p({view: 3}),
    backSulk: p({view: 3, headTilt: -10, lift: 10, armL: [3, 2], armR: [3, 2], tilt: 3}),
    backHips: p({view: 3, armL: [48, -128], armR: [48, -128]}),
    backDespair: p({view: 3, armL: [138, -12], armR: [138, -12], headTilt: -6}), // hands on head, from behind
    backShrug: p({view: 3, armL: [70, 82], armR: [70, 82], headTilt: 9, lift: 6}),
  },
} satisfies Record<string, Record<string, Pose>>;

type Groups = typeof POSE_GROUPS;
export type PoseKey = {[G in keyof Groups]: keyof Groups[G]}[keyof Groups];

/** Every pose by name, e.g. POSE.explain, POSE.sitPhone, POSE.lieAsleep. */
export const POSE = Object.assign({}, ...Object.values(POSE_GROUPS)) as Record<PoseKey, Pose>;
