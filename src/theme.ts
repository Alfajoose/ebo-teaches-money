import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './timing';

export const C = {
  ink: '#1D1A1A',
  paper: '#F6F0E4',
  paperDark: '#ECE3D2',
  floor: '#E3D6BF',
  floorLine: '#CDBD9F',
  skin: '#F7C9A1',
  skinShade: '#E8AF84',
  shirt: '#45B69C',
  pants: '#3A4767',
  shoe: '#2A2626',
  white: '#FFFDF8',
  machine: '#E5534B',
  machineDark: '#B83A35',
  glass: '#BFE3EA',
  money: '#86C383',
  moneyDark: '#4E9550',
  gold: '#F5C443',
  goldDark: '#C9962A',
  red: '#E5484D',
  blue: '#4D8FD6',
  yellow: '#F3C53F',
  purple: '#8F6BD1',
  pink: '#F4A3B4',
  night: '#2E3558',
  gray: '#9E968A',
};

export const FONT = "Inter, 'Arial Rounded MT Bold', 'Helvetica Neue', Arial, sans-serif";

/** Clamped interpolate with a default smooth ease. */
export const kf = (
  t: number,
  input: number[],
  output: number[],
  easing: (n: number) => number = Easing.inOut(Easing.cubic),
) =>
  interpolate(t, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Linear clamped interpolate. */
export const lin = (t: number, input: number[], output: number[]) =>
  interpolate(t, input, output, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Springy 0→1 starting at `start`. */
export const pop = (t: number, start: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  spring({
    frame: t - start,
    fps: FPS,
    config: {damping: cfg.damping ?? 11, stiffness: cfg.stiffness ?? 160, mass: cfg.mass ?? 0.8},
  });

/** Ease-in "drop" with a bounce, 0→1. */
export const bounceIn = (t: number, start: number, dur = 20) =>
  kf(t, [start, start + dur], [0, 1], Easing.bounce);

export const shake = (t: number, amount: number, speed = 2.1) =>
  amount === 0 ? 0 : Math.sin(t * speed) * amount * Math.cos(t * speed * 0.7);
