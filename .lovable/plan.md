

# Remove Cover Image + Dark Background End-to-End

## What Changes

1. **Remove AI-generated image** -- delete the cover image markup, the `useEffect` that fetches it, and the `coverImageUrl` state
2. **Cover page (page 1)** -- already dark (`#0F1216`), just remove the image element and its CSS class
3. **Content pages (page 2+)** -- change from white (`#ffffff`) to dark (`#0F1216`) with light text so there is zero white space anywhere in the PDF

## File Changes

### `src/pages/admin/AdminReporterPage.tsx`
- **Delete** the `coverImageUrl` state (`useState`) and the entire `useEffect` block that calls `generate-report-cover`
- **Delete** the `useEffect` import if no longer needed (but `useRef` still needs it -- keep the import)
- **Remove** the `{coverImageUrl && <img .../>}` block from the cover page markup
- Everything else stays: logo, accent line, title, subtitle, dates

### `src/index.css` (print styles)
- **`.print-report`**: Change background from `#ffffff` to `#0F1216`, text color from `#1a1a2e` to `#E0E0E0`
- **`.print-cover-image`**: Delete the entire CSS rule (no longer needed)
- **`.glass-card` / `.glass-chart`**: Change from `#f8f9fa` background to `#1A1E24` with `#2A2E34` border
- **`.print-report h3`**: Change to `#FFFFFF`
- **`.print-report p, span`**: Change to `#CCCCCC`
- **`.print-report .text-primary`**: Change to `#00C2B6`
- **`.kpi-strip`**: Dark background (`#1A1E24`) with dark border
- **`.print-header h1`**: White text
- **`.print-header p`**: Light grey text
- **Table styles**: Dark header background (`#1A1E24`), alternating dark rows (`#161A1F` / `#1A1E24`), light text (`#DDD` / `#CCC`)
- **`@page` margin area**: This stays as-is (browser controls the margin color)

This ensures the entire PDF is dark-themed end-to-end with no white showing on any page.

