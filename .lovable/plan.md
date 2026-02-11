

# ResilienceGPT -- AI Assistant Integration

## Advisory Council Assessment

Before diving in, here is the honest stress-test of this document:

**What is realistic today:**
- A beautiful chat page at `/gpt` with a nav link
- An edge function calling Lovable AI models (no API key needed -- we have google/gemini-2.5-flash and others built in)
- A system prompt loaded with Resilience platform knowledge + Solana ecosystem referral logic
- Chat history saved to database for authenticated users (X login already exists)
- LocalStorage-only ephemeral chat for unauthenticated visitors (with clear disclaimer)
- Rich markdown rendering (bold, code blocks, tables, links) via existing TipTap or a markdown renderer
- Thumbs up/down feedback stored in a database table
- Branded UI matching the Bloomberg Terminal aesthetic

**What the document asks for but is NOT buildable in one pass:**
- RAG with vector embeddings and pgvector (requires infrastructure not available here)
- Daily scraping of Stack Exchange, Discord, GitHub, Twitter (requires external cron jobs, API keys, scraping infrastructure)
- Self-learning knowledge graph that improves over time (requires ML pipeline)
- Three distinct "modes" with different behavior (over-engineering -- one good system prompt with context detection achieves 90% of this)
- Admin dashboard with analytics (separate feature, build later)
- WebSocket real-time streaming (not supported in edge functions)
- Community contributions and voting system (separate feature)

**The council's recommendation:** Build a polished V1 that delivers 80% of the user value with 20% of the complexity. The system prompt does the heavy lifting -- not infrastructure.

---

## What Gets Built

### 1. New Page: `/gpt` (ResilienceGPT)

A full-page chat interface accessible from navigation. No Layout wrapper (immersive experience like the pitch deck).

**UI Structure:**
- Header bar with logo, "ResilienceGPT" title, and a "New Chat" button
- Chat message area (scrollable) with user/AI message bubbles
- Input area at bottom with textarea, send button, and attachment indicator
- Suggested questions shown when chat is empty (4-6 starter prompts)
- Thumbs up/down on each AI response
- Disclaimer banner for unauthenticated users: "Chat history is stored locally and will be lost when you close this page. Sign in to save your conversations."

**Design tokens:** Resilience brand -- dark background, primary (teal) accents, font-mono for code, card borders matching the Bloomberg Terminal aesthetic. No purple/blue gradients (that is generic Solana branding, not Resilience branding).

### 2. Navigation Update

Add "GPT" link to `navLinks` array in `Navigation.tsx` between GRANTS and STAKING:
```
{ href: '/gpt', label: 'GPT', external: false }
```

### 3. Edge Function: `chat-gpt`

A new edge function at `supabase/functions/chat-gpt/index.ts` that:
- Receives: `{ message, conversationHistory, mode? }`
- Calls Lovable AI (google/gemini-2.5-flash) with a comprehensive system prompt
- Returns: `{ reply, confidence? }`

**System prompt includes:**
- Full Resilience platform knowledge (what it is, scoring formula, phases, vision)
- Solana ecosystem referral logic (when confidence is low, suggest official docs, Stack Exchange, Discord, X developers)
- Personality: friendly senior developer, asks clarifying questions, adapts to skill level
- Formatting instructions: use markdown, code blocks, tables, bold text, links

### 4. Database Tables

**Table: `chat_conversations`**
- `id` (uuid, PK)
- `user_id` (text, nullable -- X user ID from auth context)
- `title` (text -- auto-generated from first message)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Table: `chat_messages`**
- `id` (uuid, PK)
- `conversation_id` (uuid, FK to chat_conversations)
- `role` (text -- 'user' or 'assistant')
- `content` (text)
- `feedback` (text, nullable -- 'up' or 'down')
- `created_at` (timestamptz)

RLS policies: Users can only read/write their own conversations (matched by `user_id`). No anonymous access to database -- unauthenticated users use localStorage only.

### 5. Frontend Components

**New files:**
- `src/pages/ResilienceGPT.tsx` -- Page component with chat logic
- `src/components/gpt/ChatMessage.tsx` -- Individual message bubble with markdown rendering and feedback buttons
- `src/components/gpt/ChatInput.tsx` -- Input area with textarea, send button, suggested questions
- `src/components/gpt/ChatHeader.tsx` -- Top bar with branding and new chat button

**Key behavior:**
- Authenticated users: conversations auto-save to database, chat history list in sidebar/dropdown
- Unauthenticated users: messages stored in React state only (lost on page close), disclaimer shown
- Markdown rendering using a lightweight renderer (react-markdown or manual parsing)
- Code syntax highlighting via pre/code blocks with Tailwind styling
- Typing indicator while waiting for AI response
- Auto-scroll to bottom on new messages

### 6. Route Registration

Add to `App.tsx`:
```tsx
import ResilienceGPT from './pages/ResilienceGPT';
// ...
<Route path="/gpt" element={<ResilienceGPT />} />
```

---

## What Is NOT Built (Deferred)

| Feature | Why Deferred |
|---------|-------------|
| RAG / vector search | Requires pgvector extension and embedding pipeline |
| Daily scraping of external sources | Requires cron infrastructure and API keys |
| Self-learning knowledge graph | Requires ML pipeline, not just a chat UI |
| Three distinct modes toggle | One system prompt with context detection is sufficient |
| Admin analytics dashboard | Separate feature, build after traction data exists |
| Community contributions / voting | Separate feature, requires moderation system |
| Conversation history sidebar | Can be added in V2 after core chat works |

---

## Risk Analysis

| Risk | Mitigation |
|------|-----------|
| AI hallucinating Solana answers | System prompt explicitly instructs to say "I'm not sure" and refer to official docs when uncertain |
| Users treating this as official Solana support | Disclaimer: "ResilienceGPT is a community tool, not official Solana Foundation support" |
| Cost of AI calls | Rate limiting in edge function (max 20 messages per minute per user) |
| Chat history data privacy | RLS policies ensure users only see their own data; unauthenticated data never hits the database |
| Over-promising vs. delivery | V1 is a clean chat with good system prompt -- no claims about "self-learning" or "RAG" |

---

## Technical Details

### Files Created
1. `supabase/functions/chat-gpt/index.ts` -- Edge function with AI call and system prompt
2. `src/pages/ResilienceGPT.tsx` -- Main chat page
3. `src/components/gpt/ChatMessage.tsx` -- Message bubble component
4. `src/components/gpt/ChatInput.tsx` -- Input component with suggestions
5. `src/components/gpt/ChatHeader.tsx` -- Header bar

### Files Modified
1. `src/components/layout/Navigation.tsx` -- Add GPT nav link
2. `src/App.tsx` -- Add `/gpt` route

### Database Migration
- Create `chat_conversations` and `chat_messages` tables with RLS policies

### Dependencies
- No new npm packages required (markdown can be rendered with dangerouslySetInnerHTML on sanitized content, or we add `react-markdown` if needed)
- Uses existing: framer-motion, lucide-react, Lovable AI models

