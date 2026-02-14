

# Cover Page Color Fix — Dark Background + White Text

## What Changes

Update the print stylesheet so the PDF cover page uses your brand's dark background (`#0F1216` / Abyss) with white text, matching the app's theme.

## Technical Details

**File: `src/index.css`** (print styles only)

| Element | Current | New |
|---------|---------|-----|
| `.print-cover-page` background | White/light gradient | Solid `#0F1216` (Abyss) |
| `.print-cover-title` color | `#0F1216` (dark) | `#FFFFFF` (white) |
| `.print-cover-subtitle` color | `#00897B` (teal) | `#00C2B6` (brand teal, brighter for contrast on dark) |
| `.print-cover-period` color | `#666` (grey) | `#CCCCCC` (light grey) |
| `.print-cover-date` color | `#999` | `#AAAAAA` |
| `.print-cover-confidential` color | `#bbb` | `#888888` |
| `.print-cover-accent` | Stays `#00C2B6` teal | No change |

The `-webkit-print-color-adjust: exact` and `print-color-adjust: exact` rules (already present) will ensure the dark background renders in the PDF output.

No other files need changes. The cover image reference stays in the markup but will simply not show if unavailable — the dark branded cover stands on its own.

