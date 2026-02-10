

# Pre-Production Audit: Seed Consolidation + Bytecode Auto-Refresh

---

## 1. Coverage and Intent Validation

**Original Intent:**
- Consolidate `seed-colosseum-profiles` into a single generic `seed-registry-profiles` function supporting both embedded Colosseum data and arbitrary JSON payloads.
- Integrate bytecode verification into the automated refresh pipeline so it runs without manual intervention.

**Fully Addressed:**
- Generic seeder created with dual-mode support (embedded + payload).
- `transformProgram()` correctly maps fields to `claimed_profiles` schema.
- Upsert on `project_name` conflict key preserved.
- Fire-and-forget `refresh-all-profiles` trigger after seeding works.
- Bytecode verification added to both `useAutoRefreshProfile` (frontend) and `refresh-all-profiles` (backend batch).
- Old `seed-colosseum-profiles` deleted, config updated.

**Partially Implemented / Gaps:**
- The `seed-registry-profiles` fire-and-forget refresh (line 306) does NOT include `bytecode` in its dimensions array -- it sends `["github", "dependencies", "governance", "tvl"]`, missing the newly added `bytecode` dimension. This means freshly seeded profiles won't get bytecode verified during the post-seed pipeline. **MEDIUM severity.**
- The `useAutoRefreshProfile` hook requires `githubUrl` to be truthy (line 32) before triggering ANY refresh, including bytecode. Profiles with a valid `program_id` but no GitHub URL (private repos) will never get bytecode auto-verified on page visit. **HIGH severity** -- many Colosseum entries have `github_url: "private"` but could still have valid on-chain program IDs.

---

## 2. Reverse-Engineering Check (User Outcome to System Logic)

**User expectation:** "I visit a program page and bytecode originality shows the real status automatically."

**Actual flow:**
1. User navigates to `/program/:id`
2. `ProgramDetail` renders, `useAutoRefreshProfile` fires
3. Hook checks: `profileId` exists? `githubUrl` exists? `lastAnalyzedAt` stale?
4. If ALL true, triggers GitHub + Bytecode in parallel

**Mismatch:** The staleness gate uses `github_analyzed_at` (line 51 of ProgramDetail). If GitHub analysis succeeded recently but bytecode was never run, the hook will NOT trigger bytecode verification because the data isn't considered "stale." These are two independent dimensions sharing one staleness check. **MEDIUM severity.**

**Backend batch flow:**
1. `refresh-all-profiles` fetches profiles with `github_org_url IS NOT NULL`
2. Runs bytecode for profiles where `program_id` is present

**Mismatch:** The batch query filters to only profiles with non-null `github_org_url` (line 74-75). Profiles with a valid `program_id` but no GitHub URL are excluded from the batch entirely, so bytecode verification never runs for them in batch mode either. **MEDIUM severity** -- though limited impact since most of these have `program_id: "TBD"` anyway.

---

## 3. Edge Cases and Failure Scenarios

| Edge Case | Current Behavior | Risk |
|-----------|-----------------|------|
| Profile with `program_id` but `github_url = null` | Skipped by both auto-refresh and batch pipeline | **HIGH** -- bytecode never verified |
| Profile with `program_id = "TBD"` (most Colosseum entries) | Seed transforms to `null` correctly; bytecode skipped | OK -- correct behavior |
| Fake/invalid program_id (e.g., `Arcium111...111`) | RPC returns `not-deployed`, stored correctly | OK |
| OtterSec API timeout (10s) | Graceful fallback to "unknown" | OK |
| Solana RPC rate limiting | Caught in try/catch, continues to next profile | OK |
| Duplicate seed call | Upsert with `ignoreDuplicates: false` overwrites; resets `discovered_at` timestamp each time | **LOW** -- minor data integrity concern |
| `useAutoRefreshProfile` firing during SSR/initial hydration | `useRef` prevents duplicates per profile; `useEffect` is client-only | OK |
| Race condition: two tabs open same profile | Both fire auto-refresh; backend handles idempotently (24h cache on bytecode) | OK |
| Batch auto-chain: offset drift if profiles added mid-chain | Could skip or re-process profiles | **LOW** -- acceptable for background job |

---

## 4. Touchpoints and User Journeys

- **Explorer -> Program Detail:** User clicks a row, lands on detail page. Auto-refresh fires if stale. Bytecode status updates after ~10s. Transition is smooth.
- **Seed -> Explorer:** After seeding, profiles appear immediately in Explorer but with score=0 and locked metrics. Refresh pipeline auto-chains in background. Coherent but slow (minutes).
- **Seed -> Refresh -> Bytecode:** The seed function's refresh trigger omits `bytecode` dimension. Bytecode only gets verified when a user visits the page or the next scheduled full refresh includes it. Gap in automation.
- **Realtime subscription error** in console (`CHANNEL_ERROR`) is unrelated to this implementation but indicates a general Explorer stability issue.

---

## 5. Frontend Review

| State | Handling |
|-------|---------|
| Loading | Skeleton UI renders correctly |
| Success | Scores, bytecode status, metrics all display |
| Error | Console logging only; no user-facing error for failed auto-refresh | **LOW** -- silent failure is acceptable for background refresh |
| Empty (no data) | "PROJECT NOT FOUND" page with back/register CTAs | OK |
| Refreshing indicator | `isRefreshing` returned but not visually surfaced anywhere in ProgramDetail | **LOW** -- nice-to-have |

No broken flows or confusing affordances identified.

---

## 6. Backend Review

**Data Validation:**
- `transformProgram()` correctly sanitizes `TBD`, `N/A`, empty strings, `private` values to `null`
- x_handle `@` prefix stripped correctly

**Error Handling:**
- Both edge functions have try/catch with proper HTTP error responses
- Bytecode verification in batch has inner try/catch (line 228) preventing one failure from killing the batch

**Idempotency:**
- Bytecode: 24-hour cache check prevents redundant verification -- good
- Seed: Upsert on `project_name` is idempotent but overwrites `discovered_at` on re-seed -- minor

**Security:**
- `verify_jwt = false` on `seed-registry-profiles` -- this means ANYONE can seed profiles into the registry without authentication. **HIGH severity security risk.** An attacker could insert arbitrary data or overwrite existing profile descriptions/categories.
- All other edge functions already have `verify_jwt = false` which is consistent with the existing architecture (service role key used for writes), but the seed function is particularly dangerous since it does direct upserts.

**Race Conditions:**
- Auto-chain pagination could have minor offset drift -- acceptable for background job
- No database-level locking on profile updates during concurrent refresh -- Supabase handles row-level locking implicitly

---

## 7. Churn and Risk Assessment

| Issue | Churn Risk | Details |
|-------|-----------|---------|
| Bytecode status never shows for profiles without GitHub URL | **HIGH** | Users see perpetual "unknown" for on-chain programs where github is private but program_id is valid |
| Post-seed refresh missing bytecode dimension | **MEDIUM** | Newly seeded profiles with valid program_ids won't get bytecode verified until next full cycle or page visit |
| Shared staleness gate for GitHub + Bytecode | **MEDIUM** | Fresh GitHub data blocks bytecode refresh even if bytecode was never checked |
| No visual "refreshing" indicator | **LOW** | Users don't know data is being updated in background |
| Unauthenticated seed endpoint | **HIGH** (security) | Potential data poisoning attack vector |

---

## 8. Final Verdict

**Conditionally Ready** -- with required fixes.

### Mandatory Fixes (before production)

1. **Add `bytecode` to seed function's refresh trigger dimensions** (line 306 of `seed-registry-profiles/index.ts`): Change `["github", "dependencies", "governance", "tvl"]` to `["github", "dependencies", "governance", "tvl", "bytecode"]`. One-line fix.

2. **Decouple bytecode staleness from GitHub staleness** in `useAutoRefreshProfile`: Bytecode should have its own independent staleness check so that a recently-analyzed GitHub profile still triggers bytecode verification if `bytecodeVerifiedAt` is null or stale.

3. **Allow bytecode auto-refresh without requiring `githubUrl`**: Remove the `githubUrl` guard for the bytecode-only path. Profiles with a valid `program_id` but no GitHub URL should still get bytecode verified on page visit.

### Recommended Improvements (nice-to-have)

4. **Secure the `seed-registry-profiles` endpoint**: Add JWT verification or at minimum an API key check to prevent unauthorized seeding. This is the most impactful security improvement.

5. **Add a subtle "refreshing" indicator** to the ProgramDetail page (e.g., a pulsing dot or shimmer on the score ring) so users know data is updating.

6. **Prevent `discovered_at` overwrite on re-seed**: Only set `discovered_at` on INSERT, not on conflict UPDATE. Use a raw SQL upsert or conditional logic.

