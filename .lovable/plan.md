
# Hero Section Content Update

## Overview
Update the hero section copy and buttons to reflect the new brand messaging, with a disabled "STAKE NOW" button showing "COMING SOON" and replacing the wallet button text with "CLAIM MY PROFILE".

---

## Content Changes

### Headline
**Current:** `MAINTENANCE IS RESILIENCE`

**New:** `REPUTATION CAN'T BE FORKED.`

### Subhead
**Current:** "Quantified trust metrics for Solana programs. Track upgrade frequency, verify bytecode originality, and stake on program integrity."

**New:** "Any dev can copy a repo. You can't fake a heartbeat. We turn your development velocity into an immutable Resilience score that investors can bank on. Don't just launch. Outlast."

### Buttons

| Button | Current | New |
|--------|---------|-----|
| Primary | "EXPLORE PROGRAMS" with arrow | "CHECK PROGRAM VITALS" with arrow |
| Secondary | "STAKE NOW" (active link) | "STAKE NOW" with Lock icon, disabled, tooltip "COMING SOON" |
| Nav Wallet | "Select Wallet" (WalletMultiButton) | "CLAIM MY PROFILE" button |

---

## Technical Details

### Files to Modify

1. **`src/components/landing/HeroSection.tsx`**
   - Update headline text
   - Update subhead paragraph
   - Change primary button text from "EXPLORE PROGRAMS" to "CHECK PROGRAM VITALS"
   - Replace secondary button: remove Link wrapper, add `Lock` icon, add `disabled` prop, add "COMING SOON" tooltip/badge

2. **`src/components/layout/Navigation.tsx`**
   - Replace `WalletMultiButton` with a custom "CLAIM MY PROFILE" button
   - Use `User` icon from lucide-react for visual consistency

### New Icon Import
```tsx
import { Lock } from 'lucide-react';
```

### Disabled Button with Coming Soon
```tsx
<Button 
  variant="outline" 
  size="lg" 
  disabled 
  className="font-display font-semibold uppercase tracking-wider cursor-not-allowed"
>
  <Lock className="mr-2 h-4 w-4" />
  STAKE NOW
  <span className="ml-2 text-xs text-muted-foreground">(COMING SOON)</span>
</Button>
```

---

## Expected Result
- Bold new headline that emphasizes the unique value proposition
- Compelling subhead that speaks to developers and investors
- "CHECK PROGRAM VITALS" as the primary CTA
- Disabled staking button with padlock showing it's coming soon
- "CLAIM MY PROFILE" replacing the wallet connection button
