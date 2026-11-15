// Home hero timeline. All numbers are progress (0..1) over the scroll distance of the hero; tune by eye.
export const HERO = {
  hintEnd: 0.05,
  // progress → position in the sequence (0 = first frame, 1 = last), piecewise linear.
  // Rock holds until 0.08; shell gone and jade intact at 0.44 (frame 119/239);
  // jade holds to 0.52 (frame 125/239); dust cloud complete at 0.8.
  track: [
    [0.08, 0],
    [0.44, 0.498],
    [0.52, 0.523],
    [0.8, 1],
  ],
  framesOut: [0.78, 0.82],
  travel: [0.8, 0.94],
  settle: [0.94, 1],
  copy: { rest: [0.94, 0.98], subtitle: [0.95, 0.99], actions: [0.96, 1] },
  spring: { stiffness: 220, damping: 40, restDelta: 0.0005 },
  particles: { large: 18000, small: 8000 },
  minViewportHeight: 560,
  interactive: 0.98, // pointer events on the hero text from here (buttons half visible)
} as const

export type Track = readonly (readonly [number, number])[]

export function range(p: number, from: number, to: number): number {
  return Math.min(1, Math.max(0, (p - from) / (to - from)))
}

function along(p: number, track: Track): number {
  if (p <= track[0][0]) return track[0][1]
  for (let i = 1; i < track.length; i++) {
    const [p0, s0] = track[i - 1]
    const [p1, s1] = track[i]
    if (p <= p1) return s0 + (s1 - s0) * range(p, p0, p1)
  }
  return track[track.length - 1][1]
}

export function frameAt(p: number, count: number, track: Track): { a: number; b: number; mix: number } {
  const pos = Math.min(1, Math.max(0, along(p, track))) * (count - 1)
  const a = Math.floor(pos)
  return { a, b: Math.min(a + 1, count - 1), mix: pos - a }
}

export function layers(p: number, hasDust: boolean): { frames: number; dust: number; travel: number; name: number } {
  const name = range(p, ...HERO.settle)
  const out = range(p, ...HERO.framesOut)
  return {
    frames: hasDust ? 1 - out : 1 - name,
    dust: hasDust ? out * (1 - name) : 0,
    travel: range(p, ...HERO.travel),
    name,
  }
}
