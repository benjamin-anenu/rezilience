

# Fix Blank Screen + Auto-Add Profile Owner to Team Tab

## Part 1: Fix the Blank Screen (Tiptap Crash)

The Team tab triggers a crash because tiptap v3's `StarterKit` now includes `Link` by default, and the code also adds `Link` separately -- causing a "Duplicate extension" error that crashes the entire page.

**File: `src/components/ui/rich-text-editor.tsx`**

Add `link: false` to the StarterKit config to prevent the duplicate:

```typescript
StarterKit.configure({
  heading: {
    levels: [1, 2, 3],
  },
  link: false, // Prevent duplicate -- Link is configured separately below
}),
```

---

## Part 2: Auto-Add Profile Owner as First Team Member

The person who claimed the project should automatically appear as the first entry on the Team tab. This entry is not editable or deletable -- it's derived from the profile's own data.

### How It Works

**On the public Team tab (`TeamTabContent.tsx`):**
- Accept new props: `ownerName` (x_username), `ownerImageUrl` (logo_url), and `isOwner` flag
- Before rendering the team members grid, construct a synthetic "owner" team member object from the profile data:
  - **Name**: The project's X username (e.g., `@rezilience_xyz`)
  - **Image**: The project's logo
  - **Role**: "Founder" (badge)
  - **Job Title**: "Project Owner"
  - **Visually distinct**: A subtle border or "Owner" crown badge to differentiate
- Prepend this owner card before the manually-added team members
- The owner card is always first (order: -1) and cannot be removed

**On the owner's Team Management (`TeamManagement.tsx`):**
- Show the owner's card at the top of the list with a "locked" visual (no edit/delete buttons)
- A small label like "Auto-generated from your profile" beneath it
- The "Add Member" functionality remains the same for additional team members

**Data flow -- no database changes needed:**
- The owner entry is constructed at render time from `profile.xUsername` and `profile.logoUrl`
- It's NOT stored in the `team_members` JSON column -- it's synthesized in the component
- This means it always stays in sync with the profile (if they change their logo, the team card updates automatically)

### Files Modified

1. **`src/components/ui/rich-text-editor.tsx`** -- Add `link: false` to StarterKit config (fixes crash)
2. **`src/components/program/tabs/TeamTabContent.tsx`** -- Accept `ownerUsername` and `ownerLogoUrl` props; prepend a non-editable owner card to the team grid
3. **`src/components/profile/tabs/TeamManagement.tsx`** -- Show the owner as a locked, non-editable first entry in the management list
4. **`src/pages/ProfileDetail.tsx`** -- Pass `ownerUsername={profile.xUsername}` and `ownerLogoUrl={profile.logoUrl}` to both `TeamTabContent` and `TeamManagement`

### What the Owner Card Looks Like

Same card design as other team members but:
- Role badge shows "Founder"
- A small crown icon or "Owner" label overlay
- Name shows the X username (since that's the identity they signed up with)
- Image uses the project logo
- No edit/delete buttons in management view
- Subtle "Auto-generated from your profile" note in management view

