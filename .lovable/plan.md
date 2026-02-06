

# Enhanced Auto-Save for Registry Flow

## Current State
Auto-save **is already implemented** for the basic form fields. When you type in any of these fields, they automatically save to localStorage:
- Project Name
- Description  
- Category
- Website URL
- Program ID
- GitHub Org URL
- Discord URL
- Telegram URL

## What's Missing
Three things are NOT being persisted:

1. **Current Step** - If you refresh, you start at Step 2 (Identity) instead of where you left off
2. **Media Assets** - Uploaded images in Step 4 are lost on refresh
3. **Milestones** - Roadmap items in Step 5 are lost on refresh

---

## Implementation Plan

### Fix 1: Persist Current Step

Save the current step to localStorage whenever it changes, and restore it on mount:

**File:** `src/pages/ClaimProfile.tsx`

Add `currentStep` to the persistence logic:
- Save step when it changes
- Restore step from localStorage on mount (already partially done for auth check)

### Fix 2: Persist Media Assets

Add `mediaAssets` to the localStorage save/restore:
- Media assets are objects with `id`, `type`, `url`, `name` properties
- Store the array as JSON

### Fix 3: Persist Milestones

Add `milestones` to the localStorage save/restore:
- Milestones have `id`, `title`, `description`, `targetDate`, `status` properties  
- Store the array as JSON

---

## Technical Changes

### Update Save Effect (lines 71-84)
```typescript
useEffect(() => {
  const formData = {
    projectName,
    description,
    category,
    websiteUrl,
    programId,
    githubOrgUrl,
    discordUrl,
    telegramUrl,
    currentStep,           // ADD
    mediaAssets,           // ADD
    milestones,            // ADD
  };
  localStorage.setItem('claimFormProgress', JSON.stringify(formData));
}, [projectName, description, category, websiteUrl, programId, githubOrgUrl, discordUrl, telegramUrl, currentStep, mediaAssets, milestones]);
```

### Update Restore Effect (lines 86-104)
```typescript
useEffect(() => {
  const saved = localStorage.getItem('claimFormProgress');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.projectName) setProjectName(data.projectName);
      if (data.description) setDescription(data.description);
      if (data.category) setCategory(data.category);
      if (data.websiteUrl) setWebsiteUrl(data.websiteUrl);
      if (data.programId) setProgramId(data.programId);
      if (data.githubOrgUrl) setGithubOrgUrl(data.githubOrgUrl);
      if (data.discordUrl) setDiscordUrl(data.discordUrl);
      if (data.telegramUrl) setTelegramUrl(data.telegramUrl);
      if (data.mediaAssets) setMediaAssets(data.mediaAssets);      // ADD
      if (data.milestones) setMilestones(data.milestones);          // ADD
      // Step is handled by initialization
    } catch (e) {
      // Invalid JSON, ignore
    }
  }
}, []);
```

### Update Step Initialization (line 32)
```typescript
const [currentStep, setCurrentStep] = useState(() => {
  const storedUser = localStorage.getItem('x_user');
  if (!storedUser) return 1;
  
  // Check for saved progress
  const saved = localStorage.getItem('claimFormProgress');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.currentStep && data.currentStep >= 2 && data.currentStep <= 5) {
        return data.currentStep;
      }
    } catch (e) {}
  }
  return 2;
});
```

---

## Bonus: Add Visual Feedback

Add a subtle toast or indicator when form auto-saves:
```typescript
// Optional: Show "Saved" indicator briefly
<span className="text-xs text-muted-foreground animate-pulse">Auto-saved</span>
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/ClaimProfile.tsx` | Add currentStep, mediaAssets, and milestones to persistence |

