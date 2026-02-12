

# Update README.md — Professional, Platform-Agnostic Documentation

## Overview
Replace the current boilerplate README with a professional README that accurately describes Rezilience as a product, its tech stack, features, and standard deployment instructions (not tied to any specific hosting platform).

## What the new README will include

### 1. Project Identity
- **Name**: Rezilience
- **Tagline**: "The Assurance Layer of Solana"
- **One-paragraph description**: A developer tooling platform that provides transparent, verifiable project health scoring for the Solana ecosystem — bridging builders and the public through audited metrics across Code, Liveness, Originality, Governance, Dependencies, and Economics.

### 2. Features Section
Highlight the core product capabilities derived from the actual codebase:
- **Explorer** — Browse and search indexed Solana programs with health scores and leaderboard
- **Program Profiles** — Detailed views with GitHub analytics, TVL, governance, dependency health, and vulnerability data
- **Claim and Verify** — Builders can claim their program profiles with on-chain authority verification and GitHub/X OAuth
- **Scoring Methodology** — Transparent hybrid formula with adaptive weighting and continuity decay
- **Dependency Tree** — Visual dependency graph explorer for Solana programs
- **Staking / Bonds** — Economic commitment layer (coming soon)
- **Rezilience GPT** — AI-powered chat for ecosystem intelligence
- **Pitch Deck** — Built-in investor presentation
- **Grants Directory** — Curated Solana ecosystem grants listing

### 3. Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Data Visualization**: Recharts, XY Flow (React Flow)
- **Rich Text**: TipTap editor

### 4. Prerequisites
- Node.js >= 18
- npm or bun
- A Supabase project (with the required tables and edge functions)
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

### 5. Getting Started (standard, platform-agnostic)
```
git clone <repo-url>
cd rezilience
npm install
npm run dev
```
Plus instructions for setting up the `.env` file.

### 6. Available Scripts
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint
- `npm test` — Run tests

### 7. Project Structure
A brief overview of the directory layout (`src/pages`, `src/components`, `src/hooks`, `supabase/functions`, etc.)

### 8. Edge Functions
List the 20 backend functions with a one-line description each (e.g., `analyze-github-repo` — Fetches and analyzes GitHub repository metrics).

### 9. Deployment
Standard instructions for deploying to any static hosting provider:
- Build with `npm run build`
- Deploy the `dist/` folder to Vercel, Netlify, Cloudflare Pages, or any static host
- Configure environment variables on the hosting platform
- Set up Supabase edge functions deployment via `supabase functions deploy`

### 10. Environment Variables
A table listing required env vars without exposing actual values.

### 11. License and Contact
Placeholder for license type and contact info.

## Technical Details

### File changed
- **`README.md`** — Complete rewrite (the current file contains only the Lovable boilerplate template with placeholder URLs and Lovable-specific deployment instructions)

### No other files are modified
This is a documentation-only change.

