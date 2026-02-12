# Rezilience

**The Assurance Layer of Solana**

A developer tooling platform that provides transparent, verifiable project health scoring for the Solana ecosystem — bridging builders and the public through audited metrics across Code, Liveness, Originality, Governance, Dependencies, and Economics.

---

## Features

- **Explorer** — Browse and search indexed Solana programs with health scores and leaderboard
- **Program Profiles** — Detailed views with GitHub analytics, TVL, governance, dependency health, and vulnerability data
- **Claim & Verify** — Builders can claim their program profiles with on-chain authority verification and GitHub/X OAuth
- **Scoring Methodology** — Transparent hybrid formula with adaptive weighting and continuity decay
- **Dependency Tree** — Visual dependency graph explorer for Solana programs
- **Staking / Bonds** — Economic commitment layer (coming soon)
- **Rezilience GPT** — AI-powered chat for ecosystem intelligence
- **Pitch Deck** — Built-in investor presentation
- **Grants Directory** — Curated Solana ecosystem grants listing

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **Blockchain** | Solana Web3.js, Wallet Adapter |
| **Data Visualization** | Recharts, XY Flow (React Flow) |
| **Rich Text** | TipTap editor |

## Key Dependencies

| Category | Package(s) | Purpose |
|---|---|---|
| Blockchain | `@solana/web3.js`, `@solana/wallet-adapter-*` | On-chain interaction and wallet connectivity |
| UI Framework | `react`, `tailwindcss`, `shadcn/ui` | Component library and styling |
| Animation | `framer-motion` | Page transitions and cinematic reveals |
| Data Visualization | `recharts`, `@xyflow/react` | Charts, graphs, and dependency tree canvas |
| Rich Text | `@tiptap/react`, `@tiptap/starter-kit` | Build-in-public post editor |
| Backend Client | `@supabase/supabase-js` | Database, auth, and edge function client |
| Routing | `react-router-dom` | Client-side navigation |
| Forms | `react-hook-form`, `zod` | Form state management and validation |
| Markdown | `react-markdown`, `remark-gfm` | Rendering markdown content |
| State Management | `@tanstack/react-query` | Server state, caching, and data fetching |
| Theming | `next-themes` | Dark/light mode support |

## Prerequisites

- Node.js >= 18
- npm or bun
- A Supabase project (with the required tables and edge functions deployed)

## Getting Started

```sh
# Clone the repository
git clone <repo-url>
cd rezilience

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Fill in the required values (see Environment Variables below)

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests via Vitest |

## Project Structure

```
src/
├── assets/            # Images and static assets
├── components/
│   ├── claim/         # Profile claiming flow
│   ├── dashboard/     # User dashboard
│   ├── dependency-tree/ # Dependency graph visualizer
│   ├── explorer/      # Program explorer & leaderboard
│   ├── gpt/           # Rezilience GPT chat interface
│   ├── landing/       # Landing page sections
│   ├── layout/        # Navigation, footer, layout shell
│   ├── pitch/         # Investor pitch deck slides
│   ├── profile/       # Profile management tabs
│   ├── program/       # Program detail page components
│   ├── readme/        # Scoring methodology docs
│   ├── staking/       # Staking/bonds UI
│   └── ui/            # shadcn/ui primitives
├── context/           # React context providers (Auth)
├── data/              # Static data (grants, startups)
├── hooks/             # Custom React hooks
├── integrations/      # Supabase client & types
├── lib/               # Utilities (GitHub, PKCE, countries)
├── pages/             # Route-level page components
├── providers/         # Wallet provider
└── types/             # TypeScript type definitions

supabase/
└── functions/         # Edge Functions (see below)
```

## Edge Functions

| Function | Description |
|---|---|
| `analyze-dependencies` | Analyzes Cargo/npm dependency health for a program |
| `analyze-github-repo` | Fetches and analyzes GitHub repository metrics |
| `analyze-governance` | Checks governance activity (DAO/multisig transactions) |
| `analyze-security-posture` | Queries OpenSSF Scorecard for repo security posture |
| `analyze-tvl` | Fetches TVL data from DeFiLlama for DeFi protocols |
| `analyze-vulnerabilities` | Scans for known vulnerabilities via OSV.dev |
| `chat-gpt` | Powers the Rezilience GPT chat interface |
| `check-claim-blacklist` | Validates claim eligibility against blacklist |
| `delete-profile` | Deletes a claimed profile (owner-verified) |
| `fetch-github` | Proxied GitHub API requests with authentication |
| `github-oauth-callback` | Handles GitHub OAuth callback flow |
| `record-claim-attempt` | Records claim attempts for rate limiting |
| `refresh-all-profiles` | Batch refresh of all profile metrics |
| `refresh-governance-hourly` | Scheduled governance data refresh |
| `refresh-tvl-realtime` | High-frequency TVL refresh for DeFi profiles |
| `seed-registry-profiles` | Seeds the registry with known Solana programs |
| `update-profile` | Updates claimed profile data |
| `verify-bytecode` | Verifies on-chain bytecode integrity |
| `verify-program-authority` | Verifies program upgrade authority ownership |
| `x-oauth-callback` | Handles X (Twitter) OAuth callback flow |

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth app client ID |

Edge functions require additional secrets configured in your Supabase project:

| Secret | Description |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GITHUB_TOKEN` | GitHub personal access token for API calls |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret |
| `X_CLIENT_ID` | X (Twitter) OAuth client ID |
| `X_CLIENT_SECRET` | X (Twitter) OAuth client secret |
| `RPC_URL` | Solana RPC endpoint (e.g., Helius) |

## Deployment

### Frontend

1. Build the production bundle:
   ```sh
   npm run build
   ```

2. Deploy the `dist/` folder to any static hosting provider:
   - **Vercel**: `vercel deploy --prod`
   - **Netlify**: Drag & drop `dist/` or connect your repo
   - **Cloudflare Pages**: Connect repo, set build command to `npm run build` and output to `dist`
   - **Any static host**: Upload the contents of `dist/`

3. Configure the environment variables listed above on your hosting platform.

### Backend (Edge Functions)

Deploy Supabase edge functions using the Supabase CLI:

```sh
# Install Supabase CLI
npm install -g supabase

# Login and link your project
supabase login
supabase link --project-ref <your-project-id>

# Deploy all functions
supabase functions deploy

# Or deploy a specific function
supabase functions deploy analyze-github-repo
```

Set secrets on your Supabase project:

```sh
supabase secrets set GITHUB_TOKEN=<value> RPC_URL=<value> ...
```

## Roadmap

High-level planned milestones:

- **Score Oracle** — On-chain Anchor program to publish `(program_id, score, timestamp)` for protocol-level composability
- **Economic Commitment Layer** — Staking and assurance bonds with yield tied to Resilience Score thresholds
- **AEGIS Supply Chain Intelligence** — Real-time CVE propagation and risk mapping across the ecosystem dependency graph
- **Multi-chain Expansion** — Extend scoring and indexing beyond Solana

## Contributing

Contributions are welcome! To get started:

1. **Fork** the repository and create a feature branch:
   ```sh
   git checkout -b feat/your-feature-name
   ```
2. **Install dependencies** and run locally:
   ```sh
   npm install
   npm run dev
   ```
3. **Follow existing patterns** — component structure in `src/components/`, hooks in `src/hooks/`, Tailwind utility classes, and shadcn/ui primitives.
4. **Write meaningful commit messages** (e.g., `feat: add dependency health badge` or `fix: scoring decay calculation`).
5. **Open a Pull Request** against `main` with a clear description of what changed and why.

> **Note:** For large features or architectural changes, please [open an issue](../../issues) first to discuss the approach before investing significant effort.

## Security Policy

Rezilience is a security and assurance platform — we take vulnerability reports seriously.

### Reporting a Vulnerability

If you discover a security vulnerability, **please do not open a public issue.** Instead:

1. Use [GitHub Security Advisories](../../security/advisories/new) to report privately, **or**
2. Email **security@rezilience.io** with a detailed description

### What Qualifies as a Security Issue

- Authentication or authorization bypasses
- Data exposure or leakage through API endpoints
- RLS policy misconfigurations
- Cross-site scripting (XSS) or injection vulnerabilities
- Edge function vulnerabilities

General bugs (UI glitches, broken links, incorrect scores) should be reported as regular [issues](../../issues).

## Acknowledgments

Rezilience is built on the shoulders of incredible open-source and ecosystem infrastructure:

- [Solana Foundation](https://solana.org) — Ecosystem support and grants
- [Helius](https://helius.dev) — RPC infrastructure for on-chain data
- [OpenSSF Scorecard](https://securityscorecards.dev) — Repository security posture data
- [OSV.dev](https://osv.dev) — Open-source vulnerability database
- [DeFiLlama](https://defillama.com) — TVL and DeFi protocol data
- [Supabase](https://supabase.com) — Backend infrastructure

## License

MIT

## Contact

For questions or collaboration, reach out via the project's [GitHub Issues](../../issues) or [X (Twitter)](https://x.com/rezaborhani).
