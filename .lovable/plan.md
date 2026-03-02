

# Navigation Reorganization + Bounty-to-Project Rename

## Two Changes

### 1. Rename "Bounty/Bounties" to "Project/Projects"

All user-facing text changes from "Bounty" to "Project":
- `BountyBoard.tsx`: Page title, hero badge, empty states, toasts
- `Accountability.tsx`: "BOUNTY BOARD" button becomes "PROJECT BOARD"
- `BountyCard.tsx`: Any visible "bounty" labels
- `BountyFilters.tsx`: Search placeholder "Search projects..."
- `CreateBountyWizard.tsx`: Dialog title "Create Project", step labels
- Routes stay as `/bounty-board` (no URL breakage)

### 2. Reorganize Navigation: README + REGISTRY + TOOLKIT

The 7 flat nav items collapse to 3 top-level items:

```text
README          REGISTRY [v]          TOOLKIT [v]
                  |                      |
                Explorer               GPT
                DAO Tracker            Grants
                Projects               Library
```

- **README** -- standalone link, as requested
- **REGISTRY** -- the core product: exploring, tracking, and funding projects
- **TOOLKIT** -- support resources: AI assistant, funding sources, documentation

**Desktop**: Radix Popover dropdowns triggered on hover/click. Each item shows a label and a short description (e.g. "Explorer -- Browse and score Solana projects"). Active child route highlights the parent trigger.

**Mobile drawer**: Keeps full list but organized under "REGISTRY" and "TOOLKIT" section headers.

## Files Modified

- `src/components/layout/Navigation.tsx` -- Replace flat navLinks with grouped structure, add dropdown components for desktop, update mobile drawer with section headers
- `src/pages/BountyBoard.tsx` -- Rename all "Bounty/Bounties" labels to "Project/Projects"
- `src/pages/Accountability.tsx` -- Rename "BOUNTY BOARD" button to "PROJECT BOARD"
- `src/components/bounty/BountyFilters.tsx` -- Update placeholder text
- `src/components/bounty/CreateBountyWizard.tsx` -- Update dialog title and labels
- `src/components/bounty/BountyCard.tsx` -- Update visible label text

## Technical Details

- Dropdowns use Radix Popover (already installed) with mouse enter/leave for hover behavior
- Each dropdown item is a React Router Link wrapped in PopoverClose
- The parent trigger gets `text-primary` styling when any child route is active (checked via `location.pathname.startsWith`)
- No new dependencies, no database changes, no route changes

