import type { Transition } from "motion/react";

/**
 * House motion language. Springs are described by bounce + perceptual duration
 * (Apple's damping + response). Default is critically damped: overshoot is
 * reserved for motion that follows a gesture carrying momentum.
 */
export const spring = {
  /** Reposition / default UI movement. */
  move: { type: "spring", bounce: 0, duration: 0.4 },
  /** Larger surfaces and scroll reveals: slower settle, still no overshoot. */
  gentle: { type: "spring", bounce: 0, duration: 0.8 },
  /** After a flick, drag release or playful attention cue. */
  momentum: { type: "spring", bounce: 0.2, duration: 0.4 },
  /** Press feedback. */
  press: { type: "spring", bounce: 0, duration: 0.18 },
} satisfies Record<string, Transition>;

/** Expo-out curve for scroll reveals that are not gesture driven. */
export const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * Apple's scroll-deceleration projection: where a value comes to rest when
 * released at `velocity` (px/s).
 */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}
