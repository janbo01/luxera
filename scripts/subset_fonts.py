#!/usr/bin/env python3
"""
Subset and compress all fonts in src/assets/fonts/ to only the unicode ranges
each font actually needs, then re-export as optimised woff2.
"""

import subprocess
import sys
from pathlib import Path

FONTS_DIR = Path(__file__).parent.parent / "src" / "assets" / "fonts"

# Unicode ranges per font family
# Latin-only fonts: JetBrains Mono & Cormorant Garamond
LATIN_RANGE = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,"
    "U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
)

# Persian/Arabic fonts: Morabba & Yekan Bakh
# Arabic block + Arabic Presentation Forms A & B + basic Latin + punctuation
PERSIAN_RANGE = (
    "U+0000-00FF,"          # Basic Latin + Latin-1
    "U+0600-06FF,"          # Arabic
    "U+0750-077F,"          # Arabic Supplement
    "U+08A0-08FF,"          # Arabic Extended-A
    "U+200C-200F,"          # Zero-width joiners / dir marks
    "U+2010-2027,"          # Punctuation
    "U+FB50-FDFF,"          # Arabic Presentation Forms-A
    "U+FE70-FEFF,"          # Arabic Presentation Forms-B
    "U+1EE00-1EEFF"         # Arabic Mathematical
)

FONT_UNICODE_MAP: dict[str, str] = {
    "JetBrainsMono-Regular.woff2":                        LATIN_RANGE,
    "CormorantGaramond-VariableFont_wght.woff2":           LATIN_RANGE,
    "CormorantGaramond-Italic-VariableFont_wght.woff2":    LATIN_RANGE,
    "Morabba-Bold.woff2":                                  PERSIAN_RANGE,
    "Morabba-Regular.woff2":                               PERSIAN_RANGE,
    "yekanbakh-Light.woff2":                               PERSIAN_RANGE,
    "yekanbakh-Regular.woff2":                             PERSIAN_RANGE,
    "yekanbakh-Medium.woff2":                              PERSIAN_RANGE,
    "yekanbakh-Bold.woff2":                                PERSIAN_RANGE,
}


def human(n: int) -> str:
    return f"{n / 1024:.1f} KB"


def subset(font_path: Path, unicodes: str) -> None:
    tmp = font_path.with_suffix(".subset.woff2")
    cmd = [
        "pyftsubset",
        str(font_path),
        f"--unicodes={unicodes}",
        "--flavor=woff2",
        "--layout-features=*",   # keep all OT features (ligatures, mark, etc.)
        "--glyph-names",
        "--no-hinting",           # drop TT hinting — saves space, irrelevant on screen
        f"--output-file={tmp}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr.strip()}")
        if tmp.exists():
            tmp.unlink()
        return

    before = font_path.stat().st_size
    after  = tmp.stat().st_size
    saved  = before - after
    pct    = saved / before * 100

    if after < before:
        tmp.replace(font_path)
        print(f"  {font_path.name}: {human(before)} → {human(after)}  (-{human(saved)}, -{pct:.0f}%)")
    else:
        tmp.unlink()
        print(f"  {font_path.name}: already optimal ({human(before)}), skipped")


def main() -> None:
    if not FONTS_DIR.exists():
        sys.exit(f"Fonts directory not found: {FONTS_DIR}")

    print(f"Subsetting fonts in: {FONTS_DIR}\n")
    total_before = total_after = 0

    for name, unicodes in FONT_UNICODE_MAP.items():
        path = FONTS_DIR / name
        if not path.exists():
            print(f"  SKIP {name} (not found)")
            continue
        before = path.stat().st_size
        total_before += before
        subset(path, unicodes)
        total_after += path.stat().st_size

    saved = total_before - total_after
    print(f"\nTotal: {human(total_before)} → {human(total_after)}  (-{human(saved)}, -{saved/total_before*100:.0f}%)")


if __name__ == "__main__":
    main()
