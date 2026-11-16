export type Pixels = { data: Uint8ClampedArray; width: number; height: number } // RGBA
export type Points = { positions: Float32Array; colors: Float32Array } // x,y in 0..1; r,g,b in 0..1

// Picks `count` points (with replacement) among the kept pixels, each jittered inside its pixel.
export function samplePoints(
  pixels: Pixels,
  count: number,
  keep: (r: number, g: number, b: number, a: number) => boolean,
  random: () => number = Math.random,
): Points {
  const { data, width, height } = pixels
  const kept: number[] = []
  for (let i = 0; i < width * height; i++) {
    const o = i * 4
    if (keep(data[o], data[o + 1], data[o + 2], data[o + 3])) kept.push(i)
  }
  if (kept.length === 0) return { positions: new Float32Array(0), colors: new Float32Array(0) }

  const positions = new Float32Array(count * 2)
  const colors = new Float32Array(count * 3)
  for (let n = 0; n < count; n++) {
    const i = kept[Math.floor(random() * kept.length)]
    positions[n * 2] = ((i % width) + random()) / width
    positions[n * 2 + 1] = (Math.floor(i / width) + random()) / height
    for (let c = 0; c < 3; c++) colors[n * 3 + c] = data[i * 4 + c] / 255
  }
  return { positions, colors }
}

// Not the near-white (253–254) background of the frames.
export const isDust = (r: number, g: number, b: number, a: number): boolean => a > 0 && Math.min(r, g, b) < 235

// Drawn pixels of text rendered on a transparent canvas.
export const isInk = (_r: number, _g: number, _b: number, a: number): boolean => a > 128
