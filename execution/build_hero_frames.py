"""Derive the Home hero web frames from the delivered frame sequence.

Usage (from the repository root): py -3 -I execution/build_hero_frames.py [SOURCE_DIR] [OUT_DIR]
"""
import sys
from pathlib import Path

from PIL import Image

SOURCE = Path(".tmp/hero-sequence/rock-sequence-v2/frames")
OUT = Path("frontend/src/assets/home-hero/seq")
# name: (frame count, side in px, WebP quality)
SETS = {"large": (120, 720, 72), "small": (60, 480, 70)}


def pick(n_source: int, n_out: int) -> list[int]:
    """Evenly spaced source indexes; first and last frame always included."""
    return [round(i * (n_source - 1) / (n_out - 1)) for i in range(n_out)]


def main() -> int:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else OUT
    frames = sorted(source.glob("*.webp"))
    if len(frames) < 2:
        print(f"need at least 2 frames in {source}, found {len(frames)}", file=sys.stderr)
        return 1
    for name, (count, side, quality) in SETS.items():
        folder = out / name
        folder.mkdir(parents=True, exist_ok=True)
        for old in folder.glob("f_*.webp"):
            old.unlink()
        total = 0
        for i, src in enumerate(pick(len(frames), count)):
            with Image.open(frames[src]) as im:
                im = im.convert("RGB").resize((side, side), Image.Resampling.LANCZOS)
                target = folder / f"f_{i:03d}.webp"
                im.save(target, "WEBP", quality=quality, method=6)
            total += target.stat().st_size
        print(f"{name}: {count} frames, {side}px, {total / 1024 / 1024:.2f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
