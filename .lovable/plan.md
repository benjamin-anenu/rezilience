

# Display Documentation Content Inline (No Iframe)

## Overview

Replace the broken iframe approach with rich inline documentation content rendered as Markdown directly inside the slide-out panel. Each documentation section will have a `content` field containing the most critical information -- key concepts, code snippets, API endpoints, and usage examples -- so users can learn without leaving the site. A "View Full Documentation" link at the top lets them access the complete official page when needed.

## What Changes

| File | Action | Details |
|------|--------|---------|
| `src/data/solana-docs.ts` | **EDIT** | Add a `content` markdown string to the `DocSection` type and populate it for all ~140 sections across 33 services |
| `src/components/library/DocsSectionPanel.tsx` | **EDIT** | Remove iframe, loading spinner, and error fallback; replace with a ScrollArea rendering the markdown content using ReactMarkdown |

## Data Model Change

The `DocSection` interface gains a `content` field:

```text
Before:
  { title, description, url }

After:
  { title, description, url, content }
```

Each section's `content` will be a concise markdown document (200-400 words) covering:
- What the feature/API does (1-2 sentence summary)
- Key concepts or parameters
- A practical code snippet (TypeScript/Rust where relevant)
- Important notes or gotchas

## Panel Layout Change

The main content area (right column) changes from an iframe to:

```text
+----------------------------------------------------------+
| [ScrollArea with rendered Markdown]                      |
|                                                          |
|  ## RPC Nodes                                            |
|  Helius provides dedicated and shared Solana RPC...      |
|                                                          |
|  ### Quick Start                                         |
|  ```typescript                                           |
|  const connection = new Connection(                      |
|    'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'   |
|  );                                                      |
|  ```                                                     |
|                                                          |
|  ### Key Features                                        |
|  - Rate limiting and analytics dashboard                 |
|  - Dedicated nodes for enterprise use                    |
|  ...                                                     |
+----------------------------------------------------------+
```

## What Stays the Same

- TOC sidebar (left column) for switching between sections
- Header with service logo, section title, and "View Original Docs" link
- Footer "Ask GPT" button
- "Official Docs" button on each service card (untouched)

## Technical Details

- **ReactMarkdown + remarkGfm** are already installed and used in the AskGptModal, so no new dependencies needed
- The existing prose styling from the GPT modal will be reused for consistent markdown rendering
- The iframe-related state (`iframeLoading`, `iframeError`) and handlers will be removed entirely
- Content is static and loads instantly -- no network requests, no CSP issues, no loading spinners needed

## Content Scope

All 33 services will have their sections populated with concise, developer-focused markdown covering the most critical documentation points. Each section focuses on giving developers enough to get started, with the "View Original Docs" link available for deeper reading.

