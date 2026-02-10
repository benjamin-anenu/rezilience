

# Show Website Preview for All Projects (Not Just Verified)

## Problem
The website preview in the About tab is gated behind `isVerified && websiteUrl` (line 87 of `AboutTabContent.tsx`). Since seeded/unclaimed projects have `verified = false`, the website preview never appears -- even though a `website_url` was seeded into the database.

## Fix

**File: `src/components/program/tabs/AboutTabContent.tsx`** (line 87)

Change the condition from:
```
{isVerified && websiteUrl && (
```
to:
```
{websiteUrl && (
```

This removes the `isVerified` gate so any project with a website URL will show the preview card, regardless of verification status. The same change applies to the media gallery gate on line 172 if desired, but since media assets are only uploaded by verified owners, that gate can stay.

This is a single-character deletion on one line.

