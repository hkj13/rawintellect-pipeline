"""Write the film-grain texture once (public/_shared/grain.png).

Drawing SVG turbulence on every frame is the slowest part of a render, so the
template moves this pre-made texture around instead.
"""

from pathlib import Path

import numpy as np
import zlib, struct

out = Path("public/_shared/grain.png")
if not out.exists():
    out.parent.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(1)
    h, w = 1200, 680
    img = rng.integers(0, 256, size=(h, w), dtype=np.uint8)
    raw = b"".join(b"\x00" + img[y].tobytes() for y in range(h))

    def chunk(kind, data):
        c = struct.pack(">I", len(data)) + kind + data
        return c + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 0, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    out.write_bytes(png)
    print(f"wrote {out}")
