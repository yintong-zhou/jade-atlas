// Progress (0..1) over native hero scroll; the scene and HTML copy share one timeline.
export const HERO = {
  hintEnd: 0.05,
  suction: [0.03, 0.4], // every star falls into the hole
  heat: [0.32, 0.5], // the disk spins up while it swallows the last stars and we fall in
  dive: [0.4, 0.52], // the camera falls into the hole: its shadow grows past the screen
  dark: [0.46, 0.52], // the inside of the hole: the page turns dark
  tunnel: [0.48, 0.55], // the star tunnel fades in
  warp: [0.5, 0.88], // cruise to light speed
  light: [0.76, 0.87], // light at the end of the tunnel
  exit: [0.84, 0.92], // the white opening grows until the page is white again
  copy: { title: [0.89, 0.95], subtitle: [0.91, 0.97], actions: [0.93, 0.99] },
  spring: { stiffness: 220, damping: 40, restDelta: 0.0005 },
  stars: { large: 1100, small: 440 },
  minViewportHeight: 560,
  interactive: 0.97, // pointer events on the hero text from here (buttons almost fully visible)
  nav: [0.03, 0.9], // the navigation island hides while the sequence plays, back as the title lands
} as const

export function range(p: number, from: number, to: number): number {
  return Math.min(1, Math.max(0, (p - from) / (to - from)))
}

export function smooth(p: number, from: number, to: number): number {
  const t = range(p, from, to)
  return t * t * (3 - 2 * t)
}

export function modelState(p: number) {
  const dive = range(p, ...HERO.dive)
  const dark = smooth(p, ...HERO.dark)
  const warp = range(p, ...HERO.warp)
  const exit = range(p, ...HERO.exit)
  return {
    suction: range(p, ...HERO.suction),
    heat: smooth(p, ...HERO.heat),
    // 1 at rest, grows as we fall in (the shadow covers the screen), 0 once the page is dark.
    holeScale: dark >= 1 ? 0 : 1 + 13 * dive ** 3,
    dark: exit >= 1 ? 0 : dark,
    tunnel: exit >= 1 ? 0 : smooth(p, ...HERO.tunnel),
    // From cruise to light speed: slow at first, then it runs away.
    speed: 0.06 + 0.94 * warp ** 2.2,
    light: smooth(p, ...HERO.light),
    exit: exit * exit * (3 - 2 * exit),
  }
}

// Pointer events on the hero text: only once the buttons can be seen, or while keyboard focus is inside.
export function copyState(p: number, revealed: boolean): { interactive: boolean } {
  return { interactive: revealed || p >= HERO.interactive }
}

// The navigation island steps aside for the sequence; keyboard focus in the hero text brings it back.
export function navHidden(p: number, revealed: boolean): boolean {
  return !revealed && p > HERO.nav[0] && p < HERO.nav[1]
}
