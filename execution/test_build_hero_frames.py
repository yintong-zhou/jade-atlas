"""Self-check for build_hero_frames.pick. Run: py -3 -I execution/test_build_hero_frames.py"""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("build_hero_frames", Path(__file__).with_name("build_hero_frames.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

for n_out in (120, 60):
    picked = mod.pick(240, n_out)
    assert len(picked) == n_out, (n_out, len(picked))
    assert picked[0] == 0 and picked[-1] == 239, picked[:2] + picked[-2:]
    assert all(a < b for a, b in zip(picked, picked[1:])), "not strictly increasing"

print("ok")
