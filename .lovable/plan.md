
# Fix Program Detail to Display Full Profile Information

## Issues Identified

### Issue 1: ProgramDetail doesn't show collected profile data
The `ProgramDetail.tsx` page only shows the verification badge but doesn't display:
- Media gallery
- Website snippet/preview
- Social links (Discord, Telegram)
- Verified timeline (milestones)
- Description and category

### Issue 2: "Claim Profile" button shown on verified programs
When a program is already verified, the "UNVERIFIED" banner with "CLAIM PROFILE" button should not appear. Currently, this is correctly controlled by the `isVerified` state, but verified programs still only show a minimal banner instead of the full profile data.

### Issue 3: Storage lookup may fail
ProgramDetail looks up profiles by `program.programId`, but if the user didn't enter a programId during claiming, the profile is stored with a generated ID like `profile_123456_xUserId`. This means the lookup will fail.

---

## Solution

### Approach
Merge the rich profile display from `ProfileDetail.tsx` into `ProgramDetail.tsx` when a verified profile exists. When verified, show all the collected information (media, socials, milestones, website preview).

---

## Files to Modify

### 1. `src/pages/ProgramDetail.tsx`

**Changes:**
1. **Remove the "Claim Profile" CTA entirely for verified programs** - The unverified banner (lines 88-107) should only show when NOT verified
2. **Display full profile data when verified** - Import and render the same sections as ProfileDetail:
   - Media Gallery (carousel)
   - Website Snippet (iframe preview with external link)
   - Social Pulse (X, Discord, Telegram, GitHub)
   - Verified Timeline (milestones with status)
3. **Add fallback lookup** - Also search by profile ID patterns in localStorage

**New sections to add when `isVerified && claimedProfile`:**
- Media Gallery section with carousel
- Website preview with launch button
- Social pulse with all linked socials
- Verified timeline with milestones
- Description display

**Remove:**
- The "CLAIM PROFILE" button from the unverified banner (lines 101-106) - or only show it when NOT already in the verified programs list

### 2. Storage Lookup Enhancement

Update the useEffect to also check if this program's programId matches any stored profile's programId:

```typescript
useEffect(() => {
  if (program) {
    const verifiedPrograms = JSON.parse(localStorage.getItem('verifiedPrograms') || '{}');
    
    // Direct lookup by programId
    let profile = verifiedPrograms[program.programId];
    
    // Fallback: search all profiles for matching programId
    if (!profile) {
      Object.values(verifiedPrograms).forEach((p: ClaimedProfile) => {
        if (p.programId === program.programId) {
          profile = p;
        }
      });
    }
    
    if (profile) {
      setIsVerified(true);
      setClaimedProfile(profile);
    }
  }
}, [program]);
```

---

## Updated ProgramDetail Layout (When Verified)

```text
┌─────────────────────────────────────────────────────────┐
│ [← Back to Explorer]                                    │
├─────────────────────────────────────────────────────────┤
│ [VERIFIED TITAN] GitHub connected • Score validated     │
├─────────────────────────────────────────────────────────┤
│ PROGRAM HEADER (existing)                               │
│ Score: 94 | Rank: #1 | Status: Active                  │
├─────────────────────────────────────────────────────────┤
│ DESCRIPTION (from claimed profile)                      │
│ "Your decentralized exchange for..."                   │
├─────────────────────────────────────────────────────────┤
│ MEDIA GALLERY                                           │
│ [Carousel with images/videos]                           │
├─────────────────────────────────────────────────────────┤
│ WEBSITE SNIPPET      │ SOCIAL PULSE                     │
│ [iframe preview]     │ 𝕏 @handle | Discord | Telegram  │
│ [View Site ↗]        │ GitHub: linked                   │
├─────────────────────────────────────────────────────────┤
│ VERIFIED TIMELINE                                       │
│ ✓ Mainnet Launch - Jan 15  │ ○ V2 Release - Mar 01     │
├─────────────────────────────────────────────────────────┤
│ UPGRADE CHART (existing) │ RECENT EVENTS (existing)     │
├─────────────────────────────────────────────────────────┤
│ METRIC CARDS (existing)                                 │
├─────────────────────────────────────────────────────────┤
│ STAKE CTA (existing)                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### New Imports to Add
```typescript
import {
  ExternalLink,
  Github,
  MessageCircle,
  Send,
  Calendar,
  Lock,
  AlertTriangle,
  Youtube,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PROJECT_CATEGORIES } from '@/types';
```

### Helper Functions to Add
```typescript
const getEmbedUrl = (url: string, type: string) => {
  if (type === 'youtube') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};
```

---

## Summary of Changes

| Change | Description |
|--------|-------------|
| Remove "Claim Profile" button for verified | Don't show the unverified banner at all when verified |
| Add Media Gallery | Carousel with images/videos from claimed profile |
| Add Website Preview | Iframe snippet with external link button |
| Add Social Pulse | Display all linked social platforms |
| Add Verified Timeline | Show milestones with status indicators |
| Add Description | Display project description if available |
| Fix storage lookup | Search all profiles for matching programId |

This ensures that when someone clicks on a program in the Explorer, they see all the rich information that was collected during the claim profile flow.
