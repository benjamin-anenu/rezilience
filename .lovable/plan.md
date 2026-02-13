
# In-App Documentation Panel (Slide-Out Sheet)

## Overview

Replace the external redirect behavior on the 4 section cards under each service with a wide slide-out panel from the right. Clicking a card opens the panel which embeds the external documentation inside an iframe, plus provides a Table of Contents sidebar, an "Ask GPT" tutor button, and a prominent link to the original documentation page. The "Official Docs" button on each service header stays untouched.

## User Experience

1. User clicks a section card (e.g. "Payment Links" under Sphere Pay)
2. A wide panel slides in from the right (approx 75% of viewport width)
3. Panel contains:
   - **Header bar** -- section title, parent service name/logo, and a prominent "View on [service].docs" external link button
   - **Body split into two columns**:
     - **Left narrow column (~200px)**: mini Table of Contents listing all sibling sections for that service (click to switch), with the active one highlighted in teal
     - **Right main column**: full-height iframe loading the external documentation URL
   - **Footer bar** -- "Ask GPT about this" button that opens the existing GPT tutor modal pre-filled with the section topic and service context
4. Clicking outside the panel or pressing the X closes it

## Technical Changes

| File | Action | Details |
|------|--------|---------|
| `src/components/library/DocsSectionPanel.tsx` | **CREATE** | New slide-out panel component using the existing Sheet (Radix) primitive |
| `src/components/library/DocsServiceSection.tsx` | **EDIT** | Change section cards from `<a>` tags to `<button>` elements that open the panel instead of navigating externally |
| `src/components/ui/sheet.tsx` | **EDIT** | Override the `sm:max-w-sm` constraint on the right variant to allow a wider panel via className |

## Component: DocsSectionPanel

**Props:**
- `open: boolean` -- controls visibility
- `onOpenChange: (open: boolean) => void`
- `service: SolanaService` -- the parent service (for logo, name, sibling sections)
- `activeSection: DocSection` -- the clicked section
- `onSectionChange: (section: DocSection) => void` -- switch between sibling sections
- `onAskGpt: (topic: string, context: string) => void` -- triggers the existing GPT tutor

**Layout:**
```
+---------------------------------------------------------------+
| [X]  Service Logo  Section Title     [View Original Docs ->]  |
+---------------------------------------------------------------+
|  TOC Sidebar   |          iframe (docs URL)                   |
|  (200px)       |          (flex-1)                            |
|                |                                              |
|  - Section 1   |                                              |
|  * Section 2   |                                              |  
|  - Section 3   |                                              |
|  - Section 4   |                                              |
|                |                                              |
+---------------------------------------------------------------+
| [Ask GPT icon] Ask GPT about "Section Title"                  |
+---------------------------------------------------------------+
```

## Changes to DocsServiceSection

- The section cards currently render as `<a href={sec.url} target="_blank">` elements
- They will become `<button onClick={() => openPanel(sec)}>` elements
- State management (`selectedSection`, `panelOpen`) will be lifted into this component
- The `onAskGpt` callback will be threaded from the parent `LibraryDocs` page

## Sheet Width Override

The existing Sheet component caps right-side panels at `sm:max-w-sm`. The new panel will pass a custom className to override this:
```
className="!max-w-none w-[75vw] lg:w-[70vw]"
```
No structural changes to the Sheet component itself -- just a className override on the instance.

## Iframe Considerations

- Some external documentation sites may block iframe embedding via `X-Frame-Options` or CSP headers
- A fallback message will be shown if the iframe fails to load: "This documentation cannot be embedded. Click below to view it directly." with a direct link button
- The iframe will have a loading spinner overlay while content loads
