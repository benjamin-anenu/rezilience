
# Add "Pre-Chain Data Validation" to Roadmap Feature List

## What Changes
Add a new item to the Phase 1 feature list (the selected element) that highlights testing/validation as an ongoing process ensuring data integrity before anything goes on-chain.

## Details
In `src/pages/Readme.tsx` around line 835-845, add a new entry to the array with `ongoing: true` (to show the yellow clock icon indicating it's an active process):

```
{ text: 'Pre-chain data validation testing to ensure metric authenticity', ongoing: true }
```

This will appear in the list with the yellow "ongoing" clock icon, signaling it's a continuous process rather than a completed checkbox item.

## File Changed
- **`src/pages/Readme.tsx`** -- Add one line to the features array inside the Phase 1 accordion content (around line 845)
