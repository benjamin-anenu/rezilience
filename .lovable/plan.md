

# Harden Bonds Table & Subscriber Insert Rate Limiting

## Finding 1: Bonds Table Exposes Wallet Addresses

**Current state**: The `bonds` table has a single RLS policy `"Bonds are publicly readable"` with `USING (true)`, making all bond data (wallet addresses, staked amounts, yield) visible to anyone. The table currently has 0 rows and bonding is a Phase 2 feature, but the policy should be locked down before any data is written.

**Solution**: Create a `bonds_public` view that excludes the `user_wallet` column (similar to the `claimed_profiles_public` pattern). The view will expose `id`, `project_id`, `staked_amount`, `locked_until`, `created_at`, and `yield_earned` -- enough for aggregate project stats without linking to individual wallets. Then restrict the base table's SELECT policy to only the bond owner (`user_wallet` matches a request header or parameter).

However, since this app uses wallet-based auth (SIWS) rather than Supabase Auth, there's no `auth.uid()` to reference in RLS. The practical approach is:

1. **Drop** the permissive `"Bonds are publicly readable"` SELECT policy
2. **Add** a deny-all SELECT policy on the base table (`USING (false)`)
3. **Create** a `bonds_public` view (without `user_wallet`) with `security_invoker = on` for public aggregate/project-level queries
4. **Update** `useProjectBonds` to query the view (it doesn't need wallet addresses)
5. **Keep** `useWalletBonds` querying the base table -- but since RLS now denies reads, route it through an edge function that takes the wallet address and returns only that wallet's bonds using `service_role`

**Revised simpler approach** (given Phase 2 status and 0 data): Since bonding is not yet live and there are 0 bonds, the simplest secure fix is:
- Replace the public-read policy with deny-all on the base table
- Create a public view excluding `user_wallet` for project-level aggregate queries
- Update `useProjectBonds` to use the view
- Update `useWalletBonds`/`useWalletBondStats` to use the view (they won't need `user_wallet` in the response since the caller already knows the wallet)

---

## Finding 2: Subscriber INSERT Abuse

**Current state**: The `project_subscribers` INSERT policy allows anyone to insert with basic email validation (`email IS NOT NULL AND email <> '' AND length(email) <= 255`). No rate limiting exists, enabling:
- Email bombing (subscribing a victim's email to every project)
- Spam list building (inserting thousands of emails)

**Solution**: Add a database function + trigger to rate-limit inserts per IP or email. Since we don't have IP access in RLS, rate-limit per email address -- max 5 subscriptions per hour per email:

1. Create a PL/pgSQL trigger function that counts recent inserts for the same email
2. Attach it as a BEFORE INSERT trigger on `project_subscribers`
3. Reject with an exception if the limit is exceeded

---

## Technical Plan

### Step 1: Database Migration

```sql
-- ==========================================
-- BONDS: Replace public-read with deny-all + public view
-- ==========================================

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Bonds are publicly readable" ON public.bonds;

-- Deny all direct reads
CREATE POLICY "No direct bond reads"
  ON public.bonds FOR SELECT
  USING (false);

-- Public view excluding user_wallet
CREATE VIEW public.bonds_public
WITH (security_invoker = on) AS
  SELECT id, project_id, staked_amount, locked_until, created_at, yield_earned
  FROM public.bonds;

-- ==========================================
-- SUBSCRIBERS: Rate-limit inserts per email
-- ==========================================

CREATE OR REPLACE FUNCTION public.check_subscriber_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.project_subscribers
  WHERE email = NEW.email
    AND subscribed_at > now() - interval '1 hour';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 5 subscriptions per hour per email';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_subscriber_rate_limit
  BEFORE INSERT ON public.project_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_subscriber_rate_limit();
```

### Step 2: Frontend Changes

**`src/hooks/useBonds.ts`**:
- `useProjectBonds`: change `.from('bonds')` to `.from('bonds_public' as any)` and remove `user_wallet` from the return type
- `useWalletBonds`: change `.from('bonds')` to `.from('bonds_public' as any)` -- the caller already passes `walletAddress` as a param, but since `user_wallet` is excluded from the view, this query will need adjustment. Since there are 0 bonds and this is Phase 2, the simplest fix is to also use the view but note that wallet-specific filtering won't work without the column. Given the Phase 2 status, we'll disable the wallet filter and return empty until the feature is built with proper auth.

Actually, the cleanest approach: `useWalletBonds` filters by `user_wallet` which won't exist in the view. Since bonds is Phase 2 with 0 data, we'll keep the hook but have it return empty results gracefully. When Phase 2 launches, a proper edge function will handle authenticated wallet queries.

**`src/components/staking/BondSummary.tsx`**: No changes needed (doesn't query DB directly).

### Step 3: Security Finding Updates

- Update/delete the bonds wallet exposure finding
- Update/delete the subscriber email bombing finding

### What Does NOT Change
- The `project_subscribers` INSERT policy stays as-is (the trigger handles rate limiting)
- Edge functions using `service_role` bypass RLS and can still read the base `bonds` table
- The MyBonds page is a static placeholder with no DB queries

