

# Prepopulate Verified Profile for Raydium AMM

## Overview
Add mock verified profile data for Raydium AMM (program id '3') with all collected information (media, socials, milestones, website) so you can see the full Heartbeat Dashboard when viewing this program.

---

## Changes

### 1. `src/data/mockData.ts`

Add a new export containing prepopulated verified profile data:

```typescript
export const mockVerifiedProfiles: Record<string, ClaimedProfile> = {
  'RaydiumPFKoXLY8HbXUqe6ZZ4D2jXZ5xCp1uxSp9yQB1': {
    id: 'profile_raydium_001',
    projectName: 'Raydium AMM',
    description: 'Leading Solana AMM powering the evolution of DeFi',
    category: 'defi',
    websiteUrl: 'https://raydium.io',
    logoUrl: 'https://raw.githubusercontent.com/raydium-io/media-assets/main/logo.png',
    programId: 'RaydiumPFKoXLY8HbXUqe6ZZ4D2jXZ5xCp1uxSp9yQB1',
    walletAddress: '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5',
    
    xUserId: 'raydium_x_001',
    xUsername: 'RaydiumProtocol',
    
    githubOrgUrl: 'https://github.com/raydium-io',
    githubUsername: 'raydium-io',
    
    socials: {
      xHandle: 'RaydiumProtocol',
      discordUrl: 'https://discord.gg/raydium',
      telegramUrl: 'https://t.me/raydiumprotocol',
    },
    
    mediaAssets: [
      { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800', order: 0, title: 'Platform Dashboard' },
      { id: 'm2', type: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1, title: 'Product Demo' },
      { id: 'm3', type: 'image', url: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800', order: 2, title: 'Architecture Overview' },
    ],
    
    milestones: [
      { id: 'ms1', title: 'Mainnet V3 Launch', targetDate: '2024-01-15', isLocked: true, status: 'completed' },
      { id: 'ms2', title: 'Concentrated Liquidity', targetDate: '2024-03-01', isLocked: true, status: 'upcoming' },
      { id: 'ms3', title: 'Cross-Chain Bridge', targetDate: '2024-06-15', isLocked: true, status: 'upcoming' },
      { id: 'ms4', title: 'Security Audit V2', targetDate: '2024-01-01', isLocked: true, status: 'overdue', varianceRequested: true },
    ],
    
    verified: true,
    verifiedAt: '2024-01-08T12:00:00Z',
    score: 88,
    livenessStatus: 'active',
  },
};
```

---

### 2. `src/pages/ProgramDetail.tsx`

Update the lookup logic to also check the mock data:

```typescript
import { getProgramById, mockVerifiedProfiles } from '@/data/mockData';

// In useEffect:
useEffect(() => {
  if (program) {
    // First check localStorage
    const verifiedPrograms = JSON.parse(localStorage.getItem('verifiedPrograms') || '{}');
    let profile = verifiedPrograms[program.programId];
    
    // Fallback: search localStorage profiles
    if (!profile) {
      Object.values(verifiedPrograms).forEach((p: unknown) => {
        const prof = p as ClaimedProfile;
        if (prof.programId === program.programId) {
          profile = prof;
        }
      });
    }
    
    // Fallback: check mock verified profiles
    if (!profile && mockVerifiedProfiles[program.programId]) {
      profile = mockVerifiedProfiles[program.programId];
    }
    
    if (profile) {
      setIsVerified(true);
      setClaimedProfile(profile);
    }
  }
}, [program, searchParams]);
```

---

## Result

When you navigate to `/program/3` (Raydium AMM), you will see:

| Section | Content |
|---------|---------|
| Verified Badge | "VERIFIED TITAN" banner with GitHub connected status |
| Description | "Leading Solana AMM powering the evolution of DeFi" |
| Media Gallery | 3 assets in carousel (2 images, 1 YouTube video) |
| Website Snippet | Live iframe preview of raydium.io with "Launch Site" button |
| Social Pulse | X (@RaydiumProtocol), Discord, Telegram, GitHub links |
| Verified Timeline | 4 milestones showing completed, upcoming, and overdue statuses |
| Development Stats | Existing metrics + charts |

---

## Summary

| Change | File | Description |
|--------|------|-------------|
| Add mock profiles | `mockData.ts` | Export `mockVerifiedProfiles` with full Raydium data |
| Update lookup | `ProgramDetail.tsx` | Check mock profiles as fallback after localStorage |

This lets you see all the rich profile information without going through the claim flow.

