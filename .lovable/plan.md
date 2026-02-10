

# Spell Out Abbreviated Orbital Node Labels

## What Changes
Update the three abbreviated labels in the hero orbital nodes to their full names, matching the style of the other four nodes (LIVENESS, ORIGINALITY, ASSURANCE, CODE).

| Current | New |
|---------|-----|
| DEPS | DEPENDENCIES |
| GOV | GOVERNANCE |
| ECON | ECONOMICS |

## Technical Details

**File: `src/components/landing/HeroSection.tsx`**

Three single-line text changes:
- Line 170: `DEPS` → `DEPENDENCIES`
- Line 192: `GOV` → `GOVERNANCE`
- Line 198: `ECON` → `ECONOMICS`

## Files Modified
1. `src/components/landing/HeroSection.tsx`

