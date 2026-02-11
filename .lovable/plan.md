

# Pitch Deck Updates: 4-Step Pipeline, Adaptive Formula, and Grant Budget Restructure

## Change 1: Four-Step Assurance Pipeline (HowItWorksSlide)

Add **DETECT** as step 04, selling the AEGIS Supply Chain vision as the end-game capability.

**Updated steps:**

| Step | Title | Icon | Description |
|------|-------|------|-------------|
| 01 | INDEX | Database | Automated multi-dimensional scoring of every registered Solana project. GitHub, dependencies, governance, and TVL analyzed continuously. |
| 02 | VERIFY | ShieldCheck | On-chain authority wallet SIWS for "Verified Titan" status. Off-chain GitHub ownership proof. Bytecode originality + dependency health checks. |
| 03 | COMMIT | Lock | Economic commitment through staked assurance bonds. Public milestone tracking with Commitment Locks and timeline variance alerts. |
| 04 | DETECT | AlertTriangle | AEGIS Supply Chain Intelligence -- real-time dependency graph mapping, automated CVE detection, and cross-program risk propagation alerts across the ecosystem's nervous system. |

The slide title changes from "Three-Step" to "Four-Step Assurance Pipeline" and the grid switches from `grid-cols-3` to `grid-cols-4` with slightly tighter padding to fit.

---

## Change 2: Adaptive Formula on the Solution Slide

Replace the fixed formula display with the new adaptive weighting system. Instead of showing one static formula, present the base formula plus a visual showing how weights shift by project category.

**Current (static):**
```
R = 0.40xGitHub + 0.25xDeps + 0.20xGov + 0.15xTVL
```

**New (adaptive):**
```
R = (wG x GitHub + wD x Deps + wGov x Gov + wTVL x TVL) x Continuity
```

Below the formula, add a compact table showing 3 weight profiles:
- **Full Stack (DeFi + DAO):** 40 / 25 / 20 / 15
- **DeFi (no governance):** 50 / 30 / -- / 20
- **Infrastructure / Tools:** 60 / 40 / -- / --

Add a subtitle: *"Weights adapt to project category -- no project is penalized for dimensions that don't apply."*

The four dimension cards below remain the same but each card's weight label changes to show the full-stack weight with a note like "up to 60%" for GitHub.

---

## Change 3: Revised Grant Budget Split

### Strategic Rationale

The current budget allocates only $10k (13%) to AEGIS despite it being the most technically complex deliverable. Meanwhile Phase 1 is allocated $30k for work that is partially already built (the prototype exists). Here is the recommended restructure:

**Revised Budget:**

| Phase | Title | Budget | Timeline | Rationale |
|-------|-------|--------|----------|-----------|
| 1 | Production Hardening and On-Chain Migration | $25,000 | Months 1-2 | Prototype exists. Funds go to expert code review, security audit, Solana standards compliance, Anchor smart contract development, and migrating score history on-chain. Reduced from $30k because the foundation is already built. |
| 2 | Economic Commitment Layer | $15,000 | Months 3-5 | Staking bonds, yield mechanics, Commitment Locks. Moderate complexity -- builds on Phase 1's on-chain program. Increased slightly because the staking contract needs rigorous security review. |
| 3 | Ecosystem Integration | $12,000 | Months 6-8 | Score Oracle on-chain program, protocol-gated APIs, partner integrations. Lighter engineering lift -- mostly API wrappers and documentation. |
| 4 | AEGIS Supply Chain | $23,000 | Months 9-12 | The end-game. Real-time cross-program dependency graph, automated CVE propagation, risk cascade modeling. Most technically complex phase requiring specialized security engineering expertise. Gets the second-largest allocation to match its complexity. |

**Why this split works for grant reviewers:**
1. **Phase 1 is credible at $25k** because you can point to the working prototype and say "we already built 70% of this -- we need experts to harden it, not build from scratch"
2. **AEGIS at $23k (31%)** signals that you understand the technical depth required and are not hand-waving the hardest part
3. **Descending then ascending budget curve** ($25k -> $15k -> $12k -> $23k) tells a story: heavy upfront investment for foundation, lean middle phases, then heavy investment for the most ambitious deliverable
4. **12-month timeline is unchanged** -- reviewers see methodical pacing, not rushed delivery

**Phase 1 revised line items ($25,000):**
- Senior Anchor Engineer (1 mo) -- Code review, on-chain program, security hardening
- Frontend Engineer (1 mo) -- Standards compliance, performance optimization, documentation
- Infrastructure/DevOps (0.5 mo) -- Production deployment, monitoring, RPC configuration
- Security Audit and QA -- End-to-end testing, vulnerability assessment
- Contingency buffer (~10%)

---

## Files to Modify

**`src/components/pitch/slides.tsx`** -- all three changes in this single file:
1. `HowItWorksSlide`: Add step 04 DETECT, change title and grid to 4 columns
2. `SolutionSlide`: Replace static formula with adaptive formula + weight profile table
3. `RoadmapSlide`: Update budget numbers ($25k/$15k/$12k/$23k), revise Phase 1 line items, update timeline text
4. `AskSlide`: Update the summary table to match new budget numbers

**`src/components/landing/HowItWorksSection.tsx`** -- Add DETECT step to the landing page pipeline for consistency (currently 3 steps: INGEST, ANALYZE, ASSURE -- add DETECT as step 4)

