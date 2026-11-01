import React from 'react';
import {BigPhone, Chips, Cereal, Letter, Sticky} from '../components/StayBrokeProps';
import {Remote, Notebook, Brush} from '../components/StayPoorProps';
import {Slice, Hammer, Dumbbell, Marker, Chalk} from '../components/KonkaProps';

/**
 * Props that live INSIDE Ebo's rig (the user's call: "certain props should be in the rig").
 * His master (cast/masters/Ebo.fla) has one graphic symbol, Ebo_HandProps, with one prop per
 * frame (frame 0 = empty hand), on a layer parented to each forearm: prop_R (right arm, behind
 * the head), prop_R_front (the right arm drawn in front) and prop_L (left arm). In Animate you
 * pick the prop by its frame, and it rides the forearm when you re-pose the arm.
 *
 * In code nothing changes for a scene: a held prop is still written as the character's child
 * (`<Remote rotate={-20} />`). RigCharacter looks it up here, draws it as that rig layer (its
 * x / y / rotate become the layer's offset in the hand) and the export keys the frame swap. A
 * held prop that isn't in the set below still draws as before (a separate prop symbol).
 *
 * Order matters: the frame number of each entry is its index + 1. Only append new props.
 */
type Entry = {name: string; el: React.ReactElement; match: (type: unknown, p: Record<string, unknown>) => boolean};

const is = (C: unknown) => (type: unknown) => type === C;
export const HAND_PROPS: Entry[] = [
  // ── everyday set ──
  {name: 'phone_back', el: <BigPhone screen="back" />, match: (t, p) => is(BigPhone)(t) && p.screen === 'back'},
  {name: 'phone_scroll', el: <BigPhone screen="scroll" />, match: (t, p) => is(BigPhone)(t) && (p.screen ?? 'scroll') === 'scroll'},
  {name: 'phone_gallery', el: <BigPhone screen="gallery" />, match: (t, p) => is(BigPhone)(t) && p.screen === 'gallery'},
  {name: 'remote', el: <Remote />, match: is(Remote)},
  {name: 'chips', el: <Chips />, match: is(Chips)},
  {name: 'cereal', el: <Cereal />, match: is(Cereal)},
  {name: 'slice', el: <Slice />, match: (t, p) => is(Slice)(t) && !p.bitten},
  {name: 'slice_bitten', el: <Slice bitten />, match: (t, p) => is(Slice)(t) && !!p.bitten},
  ...[0, 1, 2, 3, 4].map((n) => ({name: `notebook_${n}`, el: <Notebook lines={n} />, match: (t: unknown, p: Record<string, unknown>) => is(Notebook)(t) && (p.lines ?? 3) === n})),
  {name: 'letter_rejected', el: <Letter />, match: (t, p) => is(Letter)(t) && (p.label ?? 'REJECTED') === 'REJECTED'},
  {name: 'letter_cv', el: <Letter label="CV: BLANK" />, match: (t, p) => is(Letter)(t) && p.label === 'CV: BLANK'},
  {name: 'sticky_goal', el: <Sticky text="GOAL" />, match: (t, p) => is(Sticky)(t) && p.text === 'GOAL'},
  {name: 'sticky_appidea', el: <Sticky text="APP IDEA" />, match: (t, p) => is(Sticky)(t) && p.text === 'APP IDEA'},
  // ── tools set ──
  {name: 'hammer', el: <Hammer />, match: is(Hammer)},
  {name: 'dumbbell', el: <Dumbbell small />, match: (t, p) => is(Dumbbell)(t) && !!p.small},
  {name: 'brush', el: <Brush />, match: is(Brush)},
  {name: 'marker', el: <Marker />, match: is(Marker)},
  {name: 'chalk', el: <Chalk />, match: is(Chalk)},
];

export type HandProp = {frame: number; x: number; y: number; rotate: number};
/** The rig frame (1-based) for a held prop element, with its offset in the hand; null if it isn't a rig prop. */
export const handPropOf = (node: React.ReactNode): HandProp | null => {
  if (!React.isValidElement(node)) return null;
  const p = node.props as Record<string, unknown>;
  const i = HAND_PROPS.findIndex((e) => e.match(node.type, p));
  if (i < 0) return null;
  return {frame: i + 1, x: (p.x as number) ?? 0, y: (p.y as number) ?? 0, rotate: (p.rotate as number) ?? 0};
};

/** The rig's hand-prop layers and the forearm each rides. */
export const PROP_LAYERS = {prop_R: 'hand_down_2', prop_R_front: 'hand_down_2_front', prop_L: 'hand_down_1_'} as const;
export type PropLayer = keyof typeof PROP_LAYERS;
