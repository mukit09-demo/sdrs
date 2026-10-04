#!/usr/bin/env python3
"""Generate the placeholder market films in `public/video/markets/`.

There is no real footage for the markets, in the same way there is no real
photography — so each market gets a silent ten-second loop built from the same
ingredients as its still placeholder: the gradient its seed hashes to (see
`gradientFor` in `src/lib/utils/placeholder.ts`, reimplemented here so film and
poster agree), with drafting linework about that market's subject panning over
it. Replace a film by dropping a real cut in `public/video/markets/` under the
same name; nothing in `src/data/markets.ts` has to change.

Requires Pillow and GStreamer (`vp9enc`, `webmmux`, `rawvideoparse`). Frames are
piped raw into the encoder, so no intermediate PNGs are written.

    python3 scripts/generate-market-films.py             # all markets
    python3 scripts/generate-market-films.py transport    # just one
"""

from __future__ import annotations

import math
import random
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

WIDTH, HEIGHT = 1260, 540  # 21:9, matching the `panorama` ratio the band uses
FPS = 25
FRAMES = 250  # ten seconds; every motion below is periodic over this span

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "video" / "markets"

INK_950 = (11, 14, 18)  # --color-ink-950
BASE_MIX = 0.46  # how far the gradient is pulled towards ink-950

# Copied from src/lib/utils/placeholder.ts — keep in step with it.
GRADIENTS = [
    ("0f2d3d", "1d5f70", "4aa39b"),
    ("2a1b3d", "44318d", "8265a7"),
    ("3a1214", "a10b0b", "e40303"),
    ("10212f", "2d4a6b", "7ea8c4"),
    ("1c2b16", "3f6212", "8bad4f"),
    ("2e1f0b", "855c1b", "d9a441"),
    ("14181f", "414a57", "8c96a4"),
    ("0b2b2b", "0f5f5c", "57b8a9"),
    ("2b0f24", "7a1f5c", "c46fa1"),
    ("171c23", "1f3a5f", "3f8fbf"),
]


def fnv1a(seed: str) -> int:
    """FNV-1a, matching `hash()` in placeholder.ts so the gradients line up."""
    value = 0x811C9DC5
    for char in seed:
        value ^= ord(char)
        value = (value * 0x01000193) & 0xFFFFFFFF
    return value


def rgb(hex_value: str) -> tuple[int, int, int]:
    return tuple(int(hex_value[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def mix(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))  # type: ignore[return-value]


# --------------------------------------------------------------------------- #
# Base plate: the poster's gradient, calmed down, with a vignette.
# --------------------------------------------------------------------------- #


def base_plate(seed: str) -> tuple[Image.Image, tuple[int, int, int]]:
    stops = [rgb(c) for c in GRADIENTS[fnv1a(seed) % len(GRADIENTS)]]
    stops = [mix(c, INK_950, BASE_MIX) for c in stops]

    # Built small and scaled up: a linear ramp survives bilinear resizing, and
    # 128x128 of Python pixel work is instant where 1260x540 is not.
    small = Image.new("RGB", (128, 128))
    pixels = small.load()
    for y in range(128):
        for x in range(128):
            # The 135deg diagonal of the CSS gradient: top-left to bottom-right.
            t = (x / 127 + y / 127) / 2
            if t <= 0.55:
                pixels[x, y] = mix(stops[0], stops[1], t / 0.55)
            else:
                pixels[x, y] = mix(stops[1], stops[2], (t - 0.55) / 0.45)

    plate = small.resize((WIDTH, HEIGHT), Image.BILINEAR)

    # Vignette, so the caption and the player controls always have something
    # darker under them than the gradient's light corner. Drawn small and blurred
    # hard, so no edge of the ellipse survives the scale up.
    mask = Image.new("L", (64, 32), 0)
    ImageDraw.Draw(mask).ellipse((-26, -18, 89, 49), fill=210)
    mask = mask.filter(ImageFilter.GaussianBlur(11)).resize((WIDTH, HEIGHT), Image.BICUBIC)
    plate = Image.composite(plate, Image.new("RGB", (WIDTH, HEIGHT), INK_950), mask)

    accent = mix(stops[2], (255, 255, 255), 0.35)
    return plate.convert("RGBA"), accent


# --------------------------------------------------------------------------- #
# Shared layers — every film carries these, so the set reads as one system.
# --------------------------------------------------------------------------- #


def make_massing(W, H, rnd, accent):
    """Soft blocks drifting at two speeds: the 'massing' of the studio loop.

    Drawn into the low-resolution layer, which is blurred and scaled up — so
    these are clouds of tone behind the linework, never rectangles with edges.
    """
    panels = [
        (
            rnd.uniform(-0.3, 1.0),
            rnd.uniform(-0.1, 0.55),
            rnd.uniform(0.28, 0.55),
            rnd.uniform(0.35, 0.95),
            rnd.choice((1, 2)),  # whole laps per loop, so it repeats exactly
            rnd.randint(10, 20),
        )
        for _ in range(4)
    ]

    def render(d, p):
        for x0, y0, w, h, laps, alpha in panels:
            x = ((x0 + p * laps * 0.4) % 1.7 - 0.35) * W
            d.rectangle(
                (x, y0 * H, x + w * W, (y0 + h) * H),
                fill=(255, 255, 255, alpha),
            )

    return render


def make_grid(W, H, rnd, accent):
    """The drafting grid, scrolling one cell per loop so the seam is invisible."""
    step = W / 28

    def render(d, p):
        offset = p * step
        x = -step + offset
        while x < W + step:
            d.line([(x, 0), (x, H)], fill=(255, 255, 255, 12), width=1)
            x += step
        y = -step + offset * 0.5
        while y < H + step:
            d.line([(0, y), (W, y)], fill=(255, 255, 255, 10), width=1)
            y += step

    return render


# --------------------------------------------------------------------------- #
# One motif per market. Each `make_*` fixes its geometry once, then draws a
# frame for a phase in [0, 1) — anything animated must be periodic in `p`.
# --------------------------------------------------------------------------- #


def make_transport(W, H, rnd, accent):
    """A corridor in plan: carriageways, a rail line and a platform.

    Plan rather than perspective, like the other motifs here — and it keeps the
    lanes parallel, so nothing converges into a shape the eye reads as a hill.
    """
    # (centre, direction, laps per loop, count, length) — opposing flows, and no
    # two lanes carrying the same traffic, or the road reads as a barcode.
    lanes = (
        (0.26, 1, 2, 4, 0.045),
        (0.36, 1, 3, 3, 0.070),
        (0.50, -1, 2, 5, 0.038),
        (0.60, -1, 1, 3, 0.055),
    )
    rail = 0.80

    def render(d, p):
        d.line([(0, H * 0.20), (W, H * 0.20)], fill=(255, 255, 255, 96), width=2)
        d.line([(0, H * 0.66), (W, H * 0.66)], fill=(255, 255, 255, 96), width=2)
        d.line([(0, H * 0.43), (W, H * 0.43)], fill=(255, 255, 255, 58), width=2)

        for y0 in (0.31, 0.55):
            for i in range(22):
                x = ((i / 22 - (p % 1.0)) % 1.0) * W
                d.line(
                    [(x, H * y0), (x + W * 0.022, H * y0)],
                    fill=(255, 255, 255, 60),
                    width=1,
                )

        for centre, direction, laps, count, length in lanes:
            for i in range(count):
                u = (i / count + direction * p * laps) % 1.0
                x = u * (W + length * W) - length * W
                d.rectangle(
                    (x, H * centre - H * 0.035, x + length * W, H * centre + H * 0.035),
                    fill=accent + (150,),
                )

        # The rail line below the road, with its sleepers and a train.
        for offset in (-0.022, 0.022):
            d.line(
                [(0, H * (rail + offset)), (W, H * (rail + offset))],
                fill=(255, 255, 255, 120),
                width=2,
            )
        for i in range(52):
            x = ((i / 52 - (p % 1.0) * 0.5) % 1.0) * W
            d.line(
                [(x, H * (rail - 0.032)), (x, H * (rail + 0.032))],
                fill=(255, 255, 255, 46),
                width=1,
            )
        train = ((p * 2) % 1.0) * (W + W * 0.4) - W * 0.4
        for car in range(4):
            x = train + car * W * 0.105
            d.rectangle(
                (x, H * (rail - 0.030), x + W * 0.092, H * (rail + 0.030)),
                fill=accent + (170,),
            )

        # Platform and its canopy ribs, holding the bottom of the frame.
        d.rectangle(
            (W * 0.12, H * 0.87, W * 0.62, H * 0.96),
            outline=(255, 255, 255, 90),
            fill=(255, 255, 255, 14),
            width=1,
        )
        for rib in range(11):
            x = W * (0.13 + rib * 0.048)
            d.line([(x, H * 0.87), (x, H * 0.96)], fill=(255, 255, 255, 40), width=1)

    return render


def make_energy(W, H, rnd, accent):
    """Three rotors turning at whole-number rates, over a transmission line."""
    rotors = [(W * 0.20, H * 0.34, H * 0.20, 2), (W * 0.52, H * 0.26, H * 0.15, 3),
              (W * 0.80, H * 0.38, H * 0.11, 4)]

    def render(d, p):
        # Catenary between drifting pylons.
        span = W / 3
        shift = (p % 1.0) * span
        for k in range(-1, 5):
            x = k * span - shift
            d.line([(x, H * 0.62), (x, H)], fill=(255, 255, 255, 72), width=2)
            for droop in (0.05, 0.075):
                points = [
                    (
                        x + span * s / 12,
                        H * 0.62 + math.sin(math.pi * s / 12) * H * droop,
                    )
                    for s in range(13)
                ]
                d.line(points, fill=accent + (95,), width=1)

        for cx, cy, r, laps in rotors:
            d.line([(cx, cy), (cx, H * 0.86)], fill=(255, 255, 255, 70), width=2)
            angle = p * laps * 2 * math.pi
            for blade in range(3):
                a = angle + blade * 2 * math.pi / 3
                d.line(
                    [(cx, cy), (cx + math.cos(a) * r, cy + math.sin(a) * r)],
                    fill=(255, 255, 255, 120),
                    width=2,
                )
            d.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=accent + (160,))

    return render


def make_water(W, H, rnd, accent):
    """Ripple rings expanding from two points, over moving contour lines."""
    sources = [(W * 0.30, H * 0.42), (W * 0.72, H * 0.58)]

    def render(d, p):
        for line in range(9):
            y0 = H * (0.10 + line * 0.095)
            points = [
                (
                    x,
                    y0
                    + math.sin(x / W * 4 * math.pi + p * 2 * math.pi + line * 0.6)
                    * H
                    * 0.022,
                )
                for x in range(0, W + 20, 20)
            ]
            d.line(points, fill=(255, 255, 255, 58), width=1)
        # Rings last, so they read over the flow lines rather than under them.
        for index, (cx, cy) in enumerate(sources):
            for ring in range(4):
                u = ((ring / 4) + p + index * 0.2) % 1.0
                r = u * H * 0.66
                alpha = int(165 * (1 - u) ** 1.4)
                if alpha <= 2 or r <= 1:
                    continue
                d.ellipse(
                    (cx - r * 2.2, cy - r, cx + r * 2.2, cy + r),
                    outline=accent + (alpha,),
                    width=2,
                )
            d.ellipse((cx - 4, cy - 3, cx + 4, cy + 3), fill=(255, 255, 255, 150))

    return render


def make_property(W, H, rnd, accent):
    """Floor plates stacking up and settling back, behind a façade grid."""
    towers = [
        (0.06 + i * 0.135, rnd.uniform(0.09, 0.115), rnd.randint(7, 13), rnd.random())
        for i in range(7)
    ]

    def render(d, p):
        for x0, w, floors, offset in towers:
            x = x0 * W
            # One full build-and-settle cycle per loop.
            grown = (math.sin((p + offset) * 2 * math.pi) + 1) / 2
            shown = max(1, round(floors * (0.35 + 0.65 * grown)))
            for floor in range(shown):
                y = H * 0.92 - floor * (H * 0.058)
                d.rectangle(
                    (x, y - H * 0.05, x + w * W, y),
                    outline=(255, 255, 255, 62),
                    fill=(255, 255, 255, 12),
                    width=1,
                )
            top = H * 0.92 - shown * (H * 0.058)
            d.line([(x, top), (x + w * W, top)], fill=accent + (130,), width=2)
        d.line([(0, H * 0.92), (W, H * 0.92)], fill=(255, 255, 255, 80), width=2)

    return render


def make_data_centres(W, H, rnd, accent):
    """Cold-aisle racks with their status rows, and packets crossing the bus."""
    racks = [(0.05 + i * 0.075, rnd.random()) for i in range(12)]

    def render(d, p):
        for x0, offset in racks:
            x = x0 * W
            w = W * 0.052
            d.rectangle(
                (x, H * 0.22, x + w, H * 0.86),
                outline=(255, 255, 255, 58),
                fill=(255, 255, 255, 10),
                width=1,
            )
            for unit in range(9):
                y = H * 0.26 + unit * H * 0.068
                # Each rack's lights sweep down it once per loop, out of step.
                lit = ((p + offset) * 9) % 9
                bright = 150 if abs(lit - unit) < 0.7 else 40
                d.line(
                    [(x + w * 0.18, y), (x + w * 0.82, y)],
                    fill=accent + (bright,),
                    width=2,
                )
        for lane, laps in ((0.12, 2), (0.94, 1)):
            d.line([(0, H * lane), (W, H * lane)], fill=(255, 255, 255, 40), width=1)
            for packet in range(4):
                u = ((p * laps) + packet / 4) % 1.0
                x = u * W
                d.line(
                    [(x, H * lane), (x + W * 0.05, H * lane)],
                    fill=accent + (150,),
                    width=3,
                )

    return render


def make_cities(W, H, rnd, accent):
    """Two skylines panning at different speeds, over a street grid."""
    layers = [
        (0.58, 1, 46, [rnd.uniform(0.10, 0.30) for _ in range(16)]),
        (0.74, 2, 96, [rnd.uniform(0.06, 0.20) for _ in range(22)]),
    ]

    def render(d, p):
        for ground, laps, alpha, heights in layers:
            step = W / (len(heights) - 2)
            shift = ((p * laps) % 1.0) * step
            for i, h in enumerate(heights):
                x = i * step - shift - step
                d.rectangle(
                    (x, H * ground - h * H, x + step * 0.78, H * ground),
                    outline=(255, 255, 255, alpha),
                    fill=(255, 255, 255, alpha // 5),
                    width=1,
                )
        vx = W * 0.5
        for spread in (-1.1, -0.55, 0.0, 0.55, 1.1):
            d.line(
                [(vx + spread * W * 0.3, H * 0.74), (vx + spread * W, H * 1.05)],
                fill=accent + (52,),
                width=1,
            )
        for i in range(6):
            u = ((i / 6) + p) % 1.0
            y = H * 0.74 + (H * 1.05 - H * 0.74) * u**2
            d.line([(0, y), (W, y)], fill=(255, 255, 255, int(20 + 60 * u)), width=1)

    return render


def make_science(W, H, rnd, accent):
    """Orbits with travelling nodes, over a bench plan."""
    orbits = [
        (W * 0.32, H * 0.44, W * 0.17, H * 0.20, 1, 0.0),
        (W * 0.32, H * 0.44, W * 0.09, H * 0.28, 2, 0.5),
        (W * 0.70, H * 0.50, W * 0.13, H * 0.15, 2, 0.25),
    ]

    def render(d, p):
        # Lab modules off a central spine: the plan every research building has.
        d.line([(W * 0.04, H * 0.50), (W * 0.96, H * 0.50)],
               fill=(255, 255, 255, 80), width=2)
        for module in range(8):
            x = W * (0.06 + module * 0.115)
            for top, bottom in ((H * 0.20, H * 0.50), (H * 0.50, H * 0.80)):
                d.rectangle(
                    (x, top, x + W * 0.085, bottom),
                    outline=(255, 255, 255, 46),
                    fill=(255, 255, 255, 9),
                    width=1,
                )
        for cx, cy, rx, ry, laps, offset in orbits:
            d.ellipse(
                (cx - rx, cy - ry, cx + rx, cy + ry),
                outline=accent + (120,),
                width=2,
            )
            a = (p * laps + offset) * 2 * math.pi
            x, y = cx + math.cos(a) * rx, cy + math.sin(a) * ry
            d.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(255, 255, 255, 190))
        for cx, cy in ((W * 0.32, H * 0.44), (W * 0.70, H * 0.50)):
            d.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), fill=accent + (200,))

    return render


def make_healthcare(W, H, rnd, accent):
    """A trace crossing the plan of a ward wing."""
    def render(d, p):
        for wing in range(3):
            x = W * (0.08 + wing * 0.31)
            d.rectangle(
                (x, H * 0.16, x + W * 0.20, H * 0.84),
                outline=(255, 255, 255, 66),
                fill=(255, 255, 255, 10),
                width=1,
            )
            for bay in range(5):
                y = H * 0.16 + bay * H * 0.136
                d.line(
                    [(x, y), (x + W * 0.20, y)], fill=(255, 255, 255, 42), width=1
                )

        # One pulse period per two loops would break the seam, so use two.
        mid = H * 0.52
        points = []
        for x in range(0, W + 6, 6):
            u = (x / W + p) % 1.0
            beat = (u * 2) % 1.0
            if 0.10 < beat < 0.16:
                dy = -H * 0.16 * math.sin((beat - 0.10) / 0.06 * math.pi)
            elif 0.16 <= beat < 0.21:
                dy = H * 0.07 * math.sin((beat - 0.16) / 0.05 * math.pi)
            else:
                dy = math.sin(beat * 6 * math.pi) * H * 0.008
            points.append((x, mid + dy))
        d.line(points, fill=accent + (200,), width=3)

    return render


def make_industry_and_manufacturing(W, H, rnd, accent):
    """A line running left to right, with the gears that drive it."""
    def render(d, p):
        belt = H * 0.66
        d.line([(0, belt), (W, belt)], fill=(255, 255, 255, 70), width=2)
        d.line([(0, belt + H * 0.09), (W, belt + H * 0.09)],
               fill=(255, 255, 255, 34), width=1)
        for i in range(9):
            u = ((i / 9) + p) % 1.0
            x = u * (W + W * 0.09) - W * 0.09
            d.rectangle(
                (x, belt - H * 0.11, x + W * 0.062, belt),
                outline=(255, 255, 255, 96),
                fill=(255, 255, 255, 16),
                width=1,
            )
        for cx, r, laps, teeth in ((W * 0.22, H * 0.13, 1, 9), (W * 0.74, H * 0.09, 2, 7)):
            cy = H * 0.26
            # Rim, hub and spokes together — a rim alone reads as a circle, and
            # spokes alone read as a sunburst.
            d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=accent + (150,), width=2)
            d.ellipse(
                (cx - r * 0.5, cy - r * 0.5, cx + r * 0.5, cy + r * 0.5),
                outline=(255, 255, 255, 90),
                width=1,
            )
            d.ellipse(
                (cx - r * 0.14, cy - r * 0.14, cx + r * 0.14, cy + r * 0.14),
                fill=(255, 255, 255, 120),
            )
            for tooth in range(teeth):
                a = p * laps * 2 * math.pi + tooth * 2 * math.pi / teeth
                d.line(
                    [
                        (cx + math.cos(a) * r * 0.5, cy + math.sin(a) * r * 0.5),
                        (cx + math.cos(a) * r, cy + math.sin(a) * r),
                    ],
                    fill=(255, 255, 255, 105),
                    width=2,
                )
                d.line(
                    [
                        (cx + math.cos(a) * r, cy + math.sin(a) * r),
                        (cx + math.cos(a) * r * 1.13, cy + math.sin(a) * r * 1.13),
                    ],
                    fill=accent + (150,),
                    width=3,
                )

    return render


def make_resources(W, H, rnd, accent):
    """A section through a pit: stepped benches down to the floor, and haulage."""
    benches = 5
    ground, floor = 0.30, 0.86
    # The stepped profile, left rim down to the floor and back up to the right.
    profile: list[tuple[float, float]] = [(0.0, ground)]
    for step in range(benches):
        t = (step + 1) / benches
        x = 0.06 + t * 0.30
        y = ground + t * (floor - ground)
        profile += [(x - 0.035, y), (x, y)]  # tread, then the face down to it
    profile.append((0.64, floor))
    for step in range(benches):
        t = 1 - (step + 1) / benches
        x = 0.64 + (1 - t) * 0.30
        y = ground + t * (floor - ground)
        profile += [(x, y), (x + 0.035, y)]
    profile.append((1.0, ground))
    points = [(x * W, y * H) for x, y in profile]

    def render(d, p):
        # Strata under the pit, so the section has ground rather than void.
        for stratum in range(4):
            y = H * (ground + 0.06 + stratum * 0.055)
            d.line([(0, y), (W, y)], fill=(255, 255, 255, 20), width=1)

        d.line([(0, H * ground), (W, H * ground)], fill=(255, 255, 255, 70), width=1)
        d.line(points, fill=(255, 255, 255, 150), width=2)

        # Trucks working the profile, one down and one up, out of step.
        total = len(points) - 1
        for truck, direction in ((0.0, 1), (0.5, -1)):
            u = ((p * direction + truck) % 1.0) * total
            i = min(int(u), total - 1)
            f = u - i
            x = points[i][0] + (points[i + 1][0] - points[i][0]) * f
            y = points[i][1] + (points[i + 1][1] - points[i][1]) * f
            d.rectangle(
                (x - W * 0.011, y - H * 0.030, x + W * 0.011, y),
                fill=accent + (175,),
            )

        # Material leaving the pit on a conveyor.
        d.line(
            [(W * 0.64, H * floor), (W * 0.98, H * (ground - 0.06))],
            fill=accent + (90,),
            width=2,
        )
        for load in range(7):
            u = ((load / 7) + p) % 1.0
            x = W * (0.64 + u * 0.34)
            y = H * (floor + u * ((ground - 0.06) - floor))
            d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=(255, 255, 255, 140))

    return render


def make_sport(W, H, rnd, accent):
    """A bowl in plan, its roof cables, and a floodlight sweeping the pitch."""
    cx, cy = W * 0.5, H * 0.54

    def render(d, p):
        for ring, scale in enumerate((1.0, 0.82, 0.64, 0.46)):
            rx, ry = W * 0.32 * scale, H * 0.40 * scale
            d.ellipse(
                (cx - rx, cy - ry, cx + rx, cy + ry),
                outline=(255, 255, 255, 46 + ring * 16),
                width=1 if ring else 2,
            )
        for spoke in range(24):
            a = spoke * 2 * math.pi / 24
            d.line(
                [
                    (cx + math.cos(a) * W * 0.148, cy + math.sin(a) * H * 0.184),
                    (cx + math.cos(a) * W * 0.32, cy + math.sin(a) * H * 0.40),
                ],
                fill=accent + (44,),
                width=1,
            )
        # The sweep: one lap per loop.
        a = p * 2 * math.pi
        for trail in range(6):
            at = a - trail * 0.08
            d.line(
                [
                    (cx, cy),
                    (cx + math.cos(at) * W * 0.30, cy + math.sin(at) * H * 0.37),
                ],
                fill=(255, 255, 255, max(0, 90 - trail * 15)),
                width=2,
            )

    return render


def make_education(W, H, rnd, accent):
    """Quads in plan, with people moving along the desire lines between them."""
    quads = [(0.08, 0.20), (0.40, 0.16), (0.68, 0.24)]
    path = [(0.03, 0.88), (0.24, 0.62), (0.52, 0.72), (0.74, 0.46), (0.98, 0.34)]

    def render(d, p):
        for x0, y0 in quads:
            d.rectangle(
                (x0 * W, y0 * H, (x0 + 0.20) * W, (y0 + 0.36) * H),
                outline=(255, 255, 255, 105),
                fill=(255, 255, 255, 14),
                width=2,
            )
            # The cloister: a range of rooms around an open court.
            d.rectangle(
                ((x0 + 0.05) * W, (y0 + 0.09) * H, (x0 + 0.15) * W, (y0 + 0.27) * H),
                outline=(255, 255, 255, 60),
                width=1,
            )
            for court in range(4):
                x = (x0 + 0.04 + court * 0.04) * W
                d.line([(x, y0 * H), (x, (y0 + 0.09) * H)],
                       fill=(255, 255, 255, 44), width=1)
        pts = [(x * W, y * H) for x, y in path]
        d.line(pts, fill=accent + (110,), width=2)
        for walker in range(5):
            u = ((walker / 5) + p) % 1.0
            seg = u * (len(pts) - 1)
            i = min(int(seg), len(pts) - 2)
            f = seg - i
            x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f
            y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f
            d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=(255, 255, 255, 165))

    return render


def make_arts_and_culture(W, H, rnd, accent):
    """Seating arcs, and the wavefronts leaving the stage."""
    cx, cy = W * 0.5, H * 0.14

    def render(d, p):
        for row in range(9):
            r = H * (0.26 + row * 0.085)
            d.arc(
                (cx - r * 1.9, cy - r, cx + r * 1.9, cy + r),
                start=18,
                end=162,
                fill=(255, 255, 255, 40),
                width=1,
            )
        for front in range(4):
            u = ((front / 4) + p) % 1.0
            r = H * (0.10 + u * 0.92)
            alpha = int(120 * (1 - u))
            if alpha <= 0:
                continue
            d.arc(
                (cx - r * 1.9, cy - r, cx + r * 1.9, cy + r),
                start=12,
                end=168,
                fill=accent + (alpha,),
                width=2,
            )
        d.line(
            [(W * 0.34, H * 0.12), (W * 0.66, H * 0.12)],
            fill=(255, 255, 255, 110),
            width=3,
        )

    return render


def make_international_development(W, H, rnd, accent):
    """A truss span over a river that keeps running."""
    def render(d, p):
        # The river the span crosses, running under it.
        for line in range(7):
            y0 = H * (0.74 + line * 0.040)
            points = [
                (
                    x,
                    y0
                    + math.sin(x / W * 3 * math.pi + p * 2 * math.pi + line)
                    * H
                    * 0.016,
                )
                for x in range(0, W + 20, 20)
            ]
            d.line(points, fill=accent + (78,), width=1)
        d.line([(0, H * 0.72), (W, H * 0.72)], fill=(255, 255, 255, 60), width=1)

        deck = H * 0.46
        left, right = W * 0.08, W * 0.92
        # The span breathes under load, once per loop.
        sag = H * 0.014 * (1 + math.sin(p * 2 * math.pi))
        d.line([(left, deck + sag), (right, deck + sag)],
               fill=(255, 255, 255, 165), width=3)
        panels = 10
        for i in range(panels + 1):
            x = left + (right - left) * i / panels
            top = deck + sag - H * 0.20 * math.sin(math.pi * i / panels)
            d.line([(x, deck + sag), (x, top)], fill=(255, 255, 255, 100), width=1)
            if i < panels:
                nx = left + (right - left) * (i + 1) / panels
                ntop = deck + sag - H * 0.20 * math.sin(math.pi * (i + 1) / panels)
                d.line([(x, top), (nx, ntop)], fill=accent + (140,), width=2)
                d.line([(x, deck + sag), (nx, ntop)], fill=(255, 255, 255, 60), width=1)
        for pier in (left, right):
            d.line([(pier, deck + sag), (pier, H * 0.80)],
                   fill=(255, 255, 255, 120), width=4)
        # Someone crossing it, once per loop.
        walker = left + (right - left) * (p % 1.0)
        d.ellipse(
            (walker - 5, deck + sag - 11, walker + 5, deck + sag - 1),
            fill=(255, 255, 255, 190),
        )

    return render


# slug -> (poster seed, motif factory)
MARKETS = {
    "transport": ("market-transport", make_transport),
    "energy": ("market-energy", make_energy),
    "water": ("market-water", make_water),
    "property": ("market-property", make_property),
    "data-centres": ("market-data-centres", make_data_centres),
    "cities": ("market-cities", make_cities),
    "science": ("market-science", make_science),
    "healthcare": ("market-healthcare", make_healthcare),
    "industry-and-manufacturing": ("market-industry", make_industry_and_manufacturing),
    "resources": ("market-resources", make_resources),
    "sport": ("market-sport", make_sport),
    "education": ("market-education", make_education),
    "arts-and-culture": ("market-arts", make_arts_and_culture),
    "international-development": ("market-development", make_international_development),
}


def encoder(path: Path) -> subprocess.Popen:
    return subprocess.Popen(
        [
            "gst-launch-1.0", "-q",
            "fdsrc",
            "!", "rawvideoparse",
            f"width={WIDTH}", f"height={HEIGHT}", "format=rgb",
            f"framerate={FPS}/1",
            "!", "videoconvert",
            "!", "video/x-raw,format=I420",
            "!", "vp9enc",
            "deadline=0", "threads=4", "end-usage=cq", "cq-level=30",
            "target-bitrate=420000", "keyframe-max-dist=50",
            "!", "webmmux",
            "!", "filesink", f"location={path}",
        ],
        stdin=subprocess.PIPE,
    )


SOFT_W, SOFT_H = WIDTH // 8, HEIGHT // 8


def compose(plate, soft, sharp, p) -> Image.Image:
    """One frame: soft tone under the linework, both over the gradient plate.

    The massing is drawn at an eighth scale and blurred there rather than at full
    resolution — the result is the same wash of tone for a fraction of the work.
    """
    tone = Image.new("RGBA", (SOFT_W, SOFT_H), (0, 0, 0, 0))
    soft(ImageDraw.Draw(tone), p)
    tone = tone.filter(ImageFilter.GaussianBlur(4)).resize(
        (WIDTH, HEIGHT), Image.BICUBIC
    )

    line = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    sharp(ImageDraw.Draw(line), p)

    return Image.alpha_composite(Image.alpha_composite(plate, tone), line)


def render_market(slug: str) -> None:
    seed, motif_factory = MARKETS[slug]
    plate, accent = base_plate(seed)
    rnd = random.Random(fnv1a(seed))  # deterministic geometry per market

    soft = make_massing(SOFT_W, SOFT_H, rnd, accent)
    grid = make_grid(WIDTH, HEIGHT, rnd, accent)
    motif = motif_factory(WIDTH, HEIGHT, rnd, accent)

    def sharp(draw, p):
        grid(draw, p)
        motif(draw, p)

    out = OUT_DIR / f"{slug}.webm"
    process = encoder(out)
    assert process.stdin is not None
    for frame in range(FRAMES):
        p = frame / FRAMES  # never reaches 1.0, so the loop closes cleanly
        process.stdin.write(compose(plate, soft, sharp, p).convert("RGB").tobytes())
    process.stdin.close()
    if process.wait() != 0:
        raise SystemExit(f"encoding {slug} failed")
    print(f"{out.relative_to(OUT_DIR.parents[2])}  {out.stat().st_size // 1024} KB")


def main(argv: list[str]) -> None:
    slugs = argv or list(MARKETS)
    unknown = [slug for slug in slugs if slug not in MARKETS]
    if unknown:
        raise SystemExit(f"unknown market(s): {', '.join(unknown)}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for slug in slugs:
        render_market(slug)


if __name__ == "__main__":
    main(sys.argv[1:])
