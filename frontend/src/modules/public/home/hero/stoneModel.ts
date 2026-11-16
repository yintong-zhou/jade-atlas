import { BufferGeometry, Float32BufferAttribute, IcosahedronGeometry, Vector3 } from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

// Shared, deterministic surface: no model download and no random changes on resize or reverse scroll.
export function stonePoint(x: number, y: number, z: number): Vector3 {
  const n = new Vector3(x, y, z).normalize()
  const relief =
    1 +
    0.065 * Math.sin(n.x * 5 + n.y * 3) * Math.cos(n.z * 4 - n.y * 2) +
    0.008 * Math.sin(n.x * 13 + n.z * 9) * Math.sin(n.y * 11)
  return n.multiplyScalar(relief).multiply(new Vector3(0.91, 1.04, 0.79))
}

export function createJadeGeometry(detail = 4) {
  const raw = new IcosahedronGeometry(1, detail)
  const positions = raw.getAttribute('position')
  for (let i = 0; i < positions.count; i++) {
    const p = stonePoint(positions.getX(i), positions.getY(i), positions.getZ(i)).multiplyScalar(0.86)
    positions.setXYZ(i, p.x, p.y, p.z)
  }
  // IcosahedronGeometry has duplicated UV seams; remove them before averaging normals.
  raw.deleteAttribute('normal')
  raw.deleteAttribute('uv')
  const core = mergeVertices(raw)
  core.computeVertexNormals()
  raw.dispose()
  return core
}

export function createStoneGeometry() {
  const core = createJadeGeometry(12)
  const base = new IcosahedronGeometry(1, 0)
  const vertices = base.getAttribute('position')
  const fragments: { geometry: BufferGeometry; direction: Vector3 }[] = []
  const steps = 6
  for (let face = 0; face < vertices.count; face += 3) {
    const a = new Vector3().fromBufferAttribute(vertices, face)
    const b = new Vector3().fromBufferAttribute(vertices, face + 1)
    const c = new Vector3().fromBufferAttribute(vertices, face + 2)
    const direction = a.clone().add(b).add(c).normalize()
    const data: number[] = []
    const triangle = (p: Vector3, q: Vector3, r: Vector3) => data.push(...p.toArray(), ...q.toArray(), ...r.toArray())
    const surface = (i: number, j: number, outer: boolean) => {
      const v = a
        .clone()
        .multiplyScalar(1 - (i + j) / steps)
        .addScaledVector(b, i / steps)
        .addScaledVector(c, j / steps)
        .normalize()
      const p = stonePoint(v.x, v.y, v.z)
      const grit = outer ? 1.12 + 0.018 * Math.sin(v.x * 53 + v.z * 31) * Math.cos(v.y * 47) : 0.98
      return p.multiplyScalar(grit)
    }
    const skin = (i: number, j: number, k: number, l: number, m: number, n: number) => {
      triangle(surface(i, j, true), surface(k, l, true), surface(m, n, true))
      triangle(surface(m, n, false), surface(k, l, false), surface(i, j, false))
    }
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < steps - i; j++) {
        skin(i, j, i + 1, j, i, j + 1)
        if (i + j < steps - 1) skin(i + 1, j, i + 1, j + 1, i, j + 1)
      }
    }
    const wall = (i: number, j: number, k: number, l: number) => {
      const p = surface(i, j, true),
        q = surface(k, l, true)
      const r = surface(i, j, false),
        s = surface(k, l, false)
      triangle(q, p, r)
      triangle(q, r, s)
    }
    for (let i = 0; i < steps; i++) {
      wall(i, 0, i + 1, 0)
      wall(steps - i, i, steps - i - 1, i + 1)
      wall(0, steps - i, 0, steps - i - 1)
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(data, 3))
    geometry.computeVertexNormals()
    fragments.push({ geometry, direction })
  }
  base.dispose()
  return { core, fragments }
}
