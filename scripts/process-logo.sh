#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGO_PNG="$SCRIPT_DIR/logo.png"
DEMO_ASSETS="$PROJECT_ROOT/apps/demo/src/assets"
README="$PROJECT_ROOT/README.md"
OUTPUT_SVG="$DEMO_ASSETS/logo.svg"

# ── Helpers ─────────────────────────────────────────────────────────────────────
die() { echo "Error: $1" >&2; exit 1; }

has() { command -v "$1" &>/dev/null; }

# ── Prerequisites ──────────────────────────────────────────────────────────────
if ! has magick; then
  die "'ImageMagick' is required. Install with: brew install imagemagick"
fi

if ! has potrace; then
  die "'potrace' is required. Install with: brew install potrace"
fi

# ── Validate Input ─────────────────────────────────────────────────────────────
[[ -f "$LOGO_PNG" ]] || die "logo.png not found at $LOGO_PNG"

# ── Process ─────────────────────────────────────────────────────────────────────
echo "🎨 Processing logo.png → logo.svg"

# Create temp directory
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# 1. Strip background (remove white/near-white pixels, make transparent)
echo "   → Stripping background…"
magick "$LOGO_PNG" \
  -fuzz 10% \
  -transparent white \
  "$TMP_DIR/nobg.png"

# 2. Convert to PBM for potrace (threshold to black/white bitmap)
echo "   → Vectorizing with potrace…"
magick "$TMP_DIR/nobg.png" \
  -colorspace gray \
  -threshold 50% \
  "$TMP_DIR/input.pbm"

# 3. Trace to SVG
potrace "$TMP_DIR/input.pbm" \
  --svg \
  --opttolerance 0.3 \
  --turnpolicy minority \
  -o "$OUTPUT_SVG"

echo "   → Saved: $OUTPUT_SVG"

# ── Update README ──────────────────────────────────────────────────────────────
echo "📝 Updating README.md…"

REL_PATH="./apps/demo/src/assets/logo.svg"

if grep -q 'logo\.svg' "$README"; then
  # Already has a logo reference — update the path
  sed -i '' "s|logo\.svg.*|logo.svg)|g; s|src=\"[^\"]*logo\.svg[^\"]*\"|src=\"$REL_PATH\"|g" "$README"
else
  # Prepend logo image at the top of the file (after the first heading line)
  sed -i '' '1,/^# /{
    /^# /a\
<p align="center">\
  <img src="'"$REL_PATH"'" alt="Chalo Logo" width="120" />\
</p>
  }' "$README"
fi

echo "✅ Done! Logo processed and README updated."
