import type { Mesh, MeshBasicNodeMaterial, PerspectiveCamera, Scene } from 'three/webgpu'
export class BlackHoleSimulation {
  constructor(scene: Scene, config: Record<string, unknown>)
  uniforms: Record<string, { value: unknown }>
  blackHoleMesh: Mesh<import('three/webgpu').SphereGeometry, MeshBasicNodeMaterial>
  createBlackHole(): void
  update(deltaTime: number, camera: PerspectiveCamera): void
  onResize(width: number, height: number): void
}
