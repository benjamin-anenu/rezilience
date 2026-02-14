

# Grant Reporter PDF Export — Premium Cover Page, Watermark, Page Numbers & Project Table

## Overview

Transform the Grant Reporter PDF export into a polished, multi-page milestone report with:
1. A branded **cover page** featuring the Rezilience logo, an AI-generated hero image depicting "reporting to the Solana Foundation," and brand typography
2. A repeating **logo watermark** on every page (subtle, diagonal, low opacity)
3. Automatic **page numbers** in the footer via CSS counters
4. A **registered projects table** with scores as milestone evidence

---

## Changes

### 1. AI-Generated Cover Image (Edge Function)

Create a new edge function `generate-report-cover` that:
- Uses the Lovable AI gateway (`google/gemini-2.5-flash-image`) to generate a 3D pixel-realism image depicting a futuristic data dashboard being presented to a council (Solana Foundation vibe), with teal accents and dark terminal aesthetics
- Uploads result to a `report-assets` storage bucket
- Caches the image -- only generates once, subsequent calls return the existing URL
- The component calls this on mount and displays the returned URL on the cover page

### 2. AdminReporterPage.tsx — Full Rewrite

**Cover Page (print-only, page 1)**:
- Full-page branded cover with:
  - Rezilience logo (`src/assets/logo.png`) centered at top
  - AI-generated hero image below (depicting Solana Foundation reporting)
  - Title: "Milestone Report" in Space Grotesk 32px
  - Subtitle: "Solana Foundation Grant Program"
  - Period: date range in JetBrains Mono
  - Generated date
  - Teal accent line separator
  - `page-break-after: always` to force page 2

**Existing Content (pages 2+)**:
- All existing KPI strip, charts, radar, narrative remain unchanged
- New: **Registered Projects Table** section after the narrative:
  - Uses the shadcn Table component
  - Columns: #, Project Name, Status (Claimed/Unclaimed), Rezilience Score, Registered Date
  - Sorted by score descending
  - Score values color-coded: 70+ teal, 40-69 amber, below 40 steel
  - `break-inside: avoid` on table rows for clean page breaks

**Logo Watermark**:
- A fixed-position div with the logo at 5% opacity, rotated -30deg, centered on the page
- Only visible in `@media print` via the `.print-report` scope

**Page Numbers**:
- CSS `@page` counter-based page numbering in the footer
- Format: "Page X" right-aligned in the footer area

### 3. index.css — Print Stylesheet Enhancements

Add to the existing `@media print` block:
- `.print-cover-page`: Full-page layout with flexbox centering, page-break-after
- `.print-watermark`: Fixed position, centered, rotated logo at low opacity, pointer-events none
- `@page` counter increments for page numbering
- `.print-page-number`: Bottom-right positioned counter display
- Table print styles: alternating row backgrounds (#f8f9fa / #fff), visible borders, proper text contrast
- Cover page specific styles: large title sizing, teal accent borders, centered layout

### 4. Storage Bucket

Create a `report-assets` storage bucket (public) to cache the AI-generated cover image so it only needs to be generated once.

---

## File Summary

| File | Action |
|------|--------|
| `supabase/functions/generate-report-cover/index.ts` | **CREATE** — AI image generation + storage caching |
| `src/pages/admin/AdminReporterPage.tsx` | **REWRITE** — Cover page, project table, watermark, page numbers |
| `src/index.css` | **EDIT** — Enhanced print styles for cover, watermark, counters, table |
| Database migration | **CREATE** — `report-assets` storage bucket |

---

## Technical Notes

- The watermark uses the existing `src/assets/logo.png` imported directly -- it renders as an `<img>` in a fixed-position container that only shows during print
- CSS `counter-reset` on `.print-report` and `counter-increment` on each section enables automatic page numbering without JavaScript
- The project table pulls from the already-fetched `data.profiles` array (no additional queries needed)
- The cover image edge function uses `LOVABLE_API_KEY` (already configured) for AI generation

