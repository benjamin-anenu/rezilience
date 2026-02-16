
# Safely Update Dependencies to Improve Health Score

## Current State
- Dependency health score: **31/100**
- 32 outdated packages, 2 marked critical
- Most outdated packages are minor/patch version bumps (low risk)

## Strategy: Safe Batch Update

Update dependencies in two tiers based on risk level.

### Tier 1 — Safe Updates (low/no breaking risk)
These are minor or patch version bumps that should be fully backward-compatible:

**Radix UI packages (20+ packages, all 1 minor version behind):**
- `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-context-menu`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-label`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip`, `@radix-ui/react-accordion`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-scroll-area`

**Other safe updates:**
- `@supabase/supabase-js` (patch bump)
- `@tanstack/react-query` (patch bump within v5)
- `@hookform/resolvers` (if compatible with current react-hook-form)
- `react-hook-form` (patch bump)
- `sonner`, `date-fns`, `zod`, `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge`

### Tier 2 — Risky Updates (skip for now)
- **React 18 to 19**: Major version. Many ecosystem libraries still catching up. Upgrading would require auditing compatibility of every dependency. Not recommended at this time.
- **TypeScript 5.8 to 5.9**: Moderate risk, may introduce stricter type checks that surface new errors.

### Expected Outcome
Updating Tier 1 packages should bring the health score from **31 to approximately 75-85**, clearing most of the "outdated" flags while keeping the app stable.

### Steps
1. Update all Radix UI packages to latest
2. Update other safe packages (TanStack Query, Supabase JS, hook-form resolvers, etc.)
3. Verify the app builds and renders correctly
4. Re-trigger dependency analysis to update the score

## Technical Details
- All updates will be done via the dependency installer
- No code changes expected since these are minor/patch bumps
- The dependency analysis edge function will need to be re-triggered after updates to refresh the score in the database
