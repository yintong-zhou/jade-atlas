# WebGPU black hole project

Source: https://github.com/dgreenheck/webgpu-black-hole/blob/cf2fca75a9e774449057cbebe2197129249d96b8/blackhole-shader.js

Copyright (c) 2025 dgreenheck. MIT license in `LICENSE`, also distributed at `/licenses/webgpu-black-hole.txt`.

`webgpu-black-hole/` contains the complete upstream project at this commit, excluding Git metadata. The portfolio imports its original `BlackHoleSimulation`, sphere mesh and default configuration; the host restores the perspective camera, OrbitControls, ACES tone mapping and bloom from `main.js`. Three r187 calls the original `PostProcessing` API `RenderPipeline`.

Three changes in the copied shader adapt it to the portfolio: shift the retained blackbody intensity to jade, add a view-scale uniform for scroll collapse, and return linear HDR radiation with coverage alpha for composition over white. The host strengthens coverage on white. Procedural background stars/nebulae are disabled in favor of the separate scroll-driven stars. `defaults.js` extracts the original `main.js` configuration; TypeScript declarations are host additions. All other upstream files remain unmodified.

The live disk runs only while visible and before collapse. Dragging orbits the real camera; wheel zoom/pan are disabled and vertical touch scroll is retained. The settings GUI and cinematic flythrough source are included but are not mounted in the portfolio.
