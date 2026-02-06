
# Rich Text Description Editor

## Summary
Replace the simple textarea description field with a full-featured rich text editor using Tiptap, allowing users to format their project descriptions with headings, lists, links, bold, italic, code blocks, and more.

---

## Technical Approach

### Library Choice: Tiptap
Tiptap is a headless, extensible rich text editor built on ProseMirror. It integrates seamlessly with React and provides:
- Modular architecture (only include features you need)
- Full TypeScript support
- Headless design (you control the UI)
- Built-in extensions for common formatting

### New Dependencies
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

---

## Implementation Steps

### Step 1: Create the RichTextEditor Component

Create a new reusable component at `src/components/ui/rich-text-editor.tsx`:

```text
+------------------------------------------+
|  B  I  U  S  |  H1  H2  |  - * 1. |  <>  |  <- Toolbar
+------------------------------------------+
|                                          |
|  Your project description here...        |  <- Editor area
|  - **Bold** and *italic* text            |
|  - Bullet lists                          |
|  - Code snippets                         |
|                                          |
+------------------------------------------+
```

Features included:
- **Text formatting**: Bold, Italic, Strikethrough, Code
- **Headings**: H1, H2, H3
- **Lists**: Bullet list, Ordered list
- **Links**: Insert/edit hyperlinks
- **Code blocks**: For technical content
- **Character count**: Display remaining characters (optional limit)

### Step 2: Update CoreIdentityForm

Replace the `<Textarea>` with the new `<RichTextEditor>`:

**Before (line 75-81)**:
```tsx
<Textarea
  id="description"
  placeholder="A short tagline for your project..."
  value={description}
  onChange={(e) => setDescription(e.target.value.slice(0, maxDescriptionLength))}
  className="min-h-[80px] font-mono text-sm"
/>
```

**After**:
```tsx
<RichTextEditor
  content={description}
  onChange={setDescription}
  placeholder="Describe your project in detail..."
  className="min-h-[200px]"
/>
```

Also remove the 140-character limit since rich text allows more content.

### Step 3: Update Profile Display

Modify `ProfileDetail.tsx` to render HTML content safely:

**Before (line 185-187)**:
```tsx
{profile.description && (
  <p className="mt-4 text-sm text-muted-foreground">{profile.description}</p>
)}
```

**After**:
```tsx
{profile.description && (
  <div 
    className="mt-4 prose prose-sm prose-invert max-w-none"
    dangerouslySetInnerHTML={{ __html: profile.description }}
  />
)}
```

### Step 4: Enable Tailwind Typography Plugin

Update `tailwind.config.ts` to include the typography plugin (already installed):

```typescript
plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
```

### Step 5: Update Form Persistence

The localStorage persistence in `ClaimProfile.tsx` already handles the description field, so no changes needed there. The HTML content will be stored as a string.

---

## RichTextEditor Component Design

### Toolbar Buttons
| Button | Action | Icon |
|--------|--------|------|
| Bold | Toggle bold | Bold icon |
| Italic | Toggle italic | Italic icon |
| Strikethrough | Toggle strikethrough | Strikethrough icon |
| H1 | Heading 1 | Heading1 icon |
| H2 | Heading 2 | Heading2 icon |
| Bullet List | Unordered list | List icon |
| Ordered List | Numbered list | ListOrdered icon |
| Code | Inline code | Code icon |
| Code Block | Code block | CodeBlock icon |
| Link | Insert link | Link icon |
| Undo | Undo action | Undo icon |
| Redo | Redo action | Redo icon |

### Styling
- Dark theme compatible using existing color variables
- Toolbar uses toggle buttons with active state highlighting
- Editor area has subtle border matching the design system
- Placeholder text in muted color

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/rich-text-editor.tsx` | CREATE | New Tiptap editor component with toolbar |
| `src/components/claim/CoreIdentityForm.tsx` | MODIFY | Replace Textarea with RichTextEditor |
| `src/pages/ProfileDetail.tsx` | MODIFY | Render HTML description with prose styling |
| `tailwind.config.ts` | MODIFY | Add typography plugin |
| `package.json` | AUTO | Dependencies added via npm install |

---

## Security Considerations

The Tiptap editor produces sanitized HTML output by default. The StarterKit extension only allows specific safe HTML elements (p, strong, em, ul, ol, li, h1-h6, code, pre, etc.). No script tags or event handlers are permitted, making it safe to render with `dangerouslySetInnerHTML`.

---

## Character/Word Limit (Optional)

If you want to maintain some limit on description length, we can add a word count indicator instead of character count:

```tsx
const wordCount = editor.storage.characterCount.words();
// Display: "124 words"
```

This allows rich formatting while still providing guidance on length.
