import { frameAt, type Track } from './heroTimeline'

const MAX_IN_FLIGHT = 6

// Index of the loaded frame closest to `index` (the earlier one on a tie); -1 when none is loaded.
export function nearestReady(index: number, ready: readonly boolean[]): number {
  for (let d = 0; d < ready.length; d++) {
    if (index - d >= 0 && ready[index - d]) return index - d
    if (index + d < ready.length && ready[index + d]) return index + d
  }
  return -1
}

export type FrameCanvas = { draw(p: number): void; resize(): void; dispose(): void }

// Draws the two frames around a progress on a 2D canvas, the second blended over the first.
export function createFrameCanvas(
  canvas: HTMLCanvasElement,
  urls: readonly string[],
  track: Track,
  events: { onFirstDraw: () => void; onReady: () => void; onNoFrames: () => void },
): FrameCanvas {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')

  const images: (HTMLImageElement | null)[] = urls.map(() => null)
  const ready = urls.map(() => false)
  let next = 0
  let inFlight = 0
  let settled = 0
  let anyReady = false
  let firstDrawn = false
  let disposed = false
  let lastKey = ''

  const load = (i: number) => {
    const img = new Image()
    images[i] = img
    inFlight++
    img.src = urls[i]
    const done = (ok: boolean) => {
      if (disposed) return
      inFlight--
      settled++
      if (ok) {
        ready[i] = true
        anyReady = true
        lastKey = ''
        events.onReady()
      }
      if (settled === urls.length && !anyReady) events.onNoFrames()
      pump()
    }
    const decoded = img.decode
      ? img.decode()
      : new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
        })
    decoded.then(
      () => done(true),
      () => done(false),
    )
  }

  const pump = () => {
    while (!disposed && inFlight < MAX_IN_FLIGHT && next < urls.length) load(next++)
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(rect.width * ratio)
    canvas.height = Math.round(rect.height * ratio)
    lastKey = ''
  }

  const draw = (p: number) => {
    const { a, b, mix } = frameAt(p, urls.length, track)
    const ia = nearestReady(a, ready)
    if (ia < 0) return
    const ib = nearestReady(b, ready)
    const m = Math.round(mix * 32) / 32
    const key = `${ia}:${ib}:${m}`
    if (key === lastKey) return
    lastKey = key
    const { width, height } = canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.globalAlpha = 1
    ctx.drawImage(images[ia]!, 0, 0, width, height)
    if (ib !== ia && m > 0) {
      ctx.globalAlpha = m
      ctx.drawImage(images[ib]!, 0, 0, width, height)
      ctx.globalAlpha = 1
    }
    if (!firstDrawn) {
      firstDrawn = true
      events.onFirstDraw()
    }
  }

  const dispose = () => {
    disposed = true
    images.forEach((img) => {
      if (img) img.src = ''
    })
    images.fill(null)
  }

  resize()
  pump()
  return { draw, resize, dispose }
}
