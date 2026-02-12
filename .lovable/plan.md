

# Navigation Updates and New Library Page

## Summary
1. Remove "MY BONDS" from the top nav (it's already accessible from Staking)
2. Reorder nav links to: README, EXPLORER, STAKING, GPT, GRANTS, LIBRARY
3. Create a new Library page at `/library`
4. Change the footer "Documentation" link to "README" pointing to `/readme`

## Changes

### 1. Navigation (`src/components/layout/Navigation.tsx`)
Update the `navLinks` array to:
- README -> /readme
- EXPLORER -> /explorer
- STAKING -> /staking
- GPT -> /gpt
- GRANTS -> /grants
- LIBRARY -> /library

Only "MY BONDS" is removed.

### 2. Footer (`src/components/layout/Footer.tsx`)
Change the external "Documentation" link (pointing to `https://docs.rezilience.dev`) to an internal `<Link>` pointing to `/readme` with label "README".

### 3. New Library Page (`src/pages/Library.tsx`)
A new resource hub page with:
- Header with title and description
- Placeholder category sections (Guides, Research, Tools, Community Resources)
- Uses the same Layout wrapper as other pages

### 4. Route Registration (`src/App.tsx`)
Add `/library` route for the new page.

## Technical Details

### Files modified
- `src/components/layout/Navigation.tsx` — Remove MY BONDS, add LIBRARY, reorder
- `src/components/layout/Footer.tsx` — Change Documentation to internal README link
- `src/App.tsx` — Add `/library` route

### Files created
- `src/pages/Library.tsx` — New Library resource hub page

