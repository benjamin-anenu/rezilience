

# Fix: Trigger Analysis at Profile Creation Time

## Problem

The `claim-profile` edge function saves the profile and returns, but never kicks off the analysis pipeline. Users land on their dashboard seeing "Awaiting Analysis" for everything except GitHub (which was analyzed during the claim flow). They have to wait up to 30 minutes for the cron to run.

## What's Already Available at Claim Time

| Dimension | Data Available? | Can Run Immediately? |
|---|---|---|
| GitHub Activity (40%) | Yes -- analyzed in Step 3 and saved with the profile | Already done |
| Dependency Health (25%) | `github_org_url` is saved | Yes |
| Governance (20%) | Only if user configured a multisig address | Yes (conditional) |
| TVL (15%) | Only for DeFi category | Yes (conditional) |
| Bytecode (0% weight but displayed) | Only if `program_id` is set (on-chain) | Yes (conditional) |

## Solution

After the profile is successfully inserted/updated in the `claim-profile` edge function, fire the relevant analysis functions as **fire-and-forget** background calls. This means:

- The response to the user is still instant (profile created)
- Analysis runs in parallel in the background
- By the time the user lands on their dashboard (1-3 seconds later), most or all analyses will have completed
- No timeout risk because each analysis is its own independent edge function call

## Technical Changes

### 1. Update `supabase/functions/claim-profile/index.ts`

After the successful profile insert/update (after line 121), add fire-and-forget calls to the analysis functions using `fetch()` against the Supabase edge function URLs. This avoids awaiting them and delaying the response.

```
// After: const finalProfileId = ...

// Fire-and-forget: trigger analysis pipeline
const functionsUrl = `${supabaseUrl}/functions/v1`;
const headers = {
  'Authorization': `Bearer ${supabaseServiceKey}`,
  'Content-Type': 'application/json',
};

const githubUrl = rest.github_org_url || profileData.github_org_url;

// 1. Dependency Health (needs GitHub URL)
if (githubUrl) {
  fetch(`${functionsUrl}/analyze-dependencies`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      github_url: githubUrl,
      profile_id: finalProfileId,
    }),
  }).catch(() => {});
}

// 2. Governance (needs multisig address)
const govAddress = rest.multisig_address;
if (govAddress) {
  fetch(`${functionsUrl}/analyze-governance`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      governance_address: govAddress,
      profile_id: finalProfileId,
    }),
  }).catch(() => {});
}

// 3. TVL (only for DeFi)
const profileCategory = rest.category;
if (profileCategory === 'defi') {
  fetch(`${functionsUrl}/analyze-tvl`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      protocol_name: project_name,
      profile_id: finalProfileId,
      monthly_commits: rest.github_commits_30d || 30,
    }),
  }).catch(() => {});
}

// 4. Bytecode Verification (only for on-chain programs)
const onChainProgramId = rest.program_id;
if (onChainProgramId && onChainProgramId !== finalProfileId) {
  fetch(`${functionsUrl}/verify-bytecode`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      program_id: onChainProgramId,
      profile_id: finalProfileId,
      github_url: githubUrl,
    }),
  }).catch(() => {});
}

// 5. Security Posture (if GitHub URL available)
if (githubUrl) {
  fetch(`${functionsUrl}/analyze-security-posture`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      github_url: githubUrl,
      profile_id: finalProfileId,
    }),
  }).catch(() => {});
}
```

### 2. No frontend changes needed

The frontend already:
- Shows "First analysis in progress" banner when timestamps are null
- Shows "Awaiting Analysis" states on health cards
- Uses react-query which will pick up fresh data on next poll/refetch

The only difference is that data will populate within seconds instead of up to 30 minutes.

## What Users Will Experience After This Fix

1. User completes the claim flow and hits "Register"
2. Profile is created instantly, user is redirected to their dashboard
3. Dashboard briefly shows "First analysis in progress" banner (1-3 seconds)
4. Dependency health, governance, TVL, and bytecode results appear automatically as they complete
5. Off-chain projects correctly skip bytecode (showing "Not On-Chain")
6. Non-DeFi projects correctly skip TVL

## Edge Cases Handled

- **No GitHub URL**: Dependency and security analyses are skipped (no-op)
- **No multisig**: Governance analysis is skipped
- **Not DeFi**: TVL analysis is skipped
- **Off-chain (no program ID)**: Bytecode verification is skipped
- **Analysis failure**: Each call has `.catch(() => {})` so failures are silent and non-blocking
- **Duplicate analysis**: The 30-minute cron will still run but will just refresh already-populated data (no harm)

## Files Modified

1. `supabase/functions/claim-profile/index.ts` -- Add fire-and-forget analysis calls after profile creation

