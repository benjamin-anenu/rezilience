

# "Ask GPT" Tutor Modal -- Across the Entire Library

## Overview

Add a reusable "Ask GPT" button that opens a slide-up modal dialog with a self-contained mini chat interface. When clicked, it sends a pre-crafted tutoring prompt to the existing `chat-gpt` edge function and streams back a response. The user can then ask follow-up questions inside the modal without leaving the page.

The button will appear in **four locations**:
1. **Guided Learning** -- inside each expanded module's detail panel
2. **Solana Dictionary** -- inside each expanded dictionary entry
3. **Project Blueprints** -- on each blueprint step node
4. **Protocol Detail** -- below the "Full Documentation" button in the sidebar

## How It Works

1. User clicks "Ask GPT" on any item
2. A Dialog slides up with a pre-seeded first message like: *"Explain [topic] to me like I'm a beginner. Use real Solana examples with projects like Jupiter, Marinade, Raydium. Include code snippets where helpful. After explaining, ask me a follow-up question to test my understanding."*
3. The modal streams the response from the existing `chat-gpt` edge function (same SSE streaming logic already used on the /gpt page)
4. User can type follow-up questions in the modal -- full conversational thread
5. Close button dismisses the modal; conversation is ephemeral (not persisted)

## New Component: `AskGptModal`

**File: `src/components/library/AskGptModal.tsx`**

A self-contained Dialog component that:
- Accepts a `topic: string` and optional `context: string` prop
- Manages its own `messages[]` state, `isLoading`, and streaming logic
- Reuses the same SSE streaming approach from `ResilienceGPT.tsx` (extracted into a helper or duplicated inline since it's ~40 lines)
- Renders messages with `ReactMarkdown` + `remarkGfm` (same as `ChatMessage.tsx`)
- Has a compact input bar at the bottom
- Auto-scrolls on new tokens
- Shows the "R" branding and a "Searching database..." pulse while loading

### Prompt Engineering

The initial prompt sent to the edge function will be contextual:

- **Learning module**: "Teach me about '{module.title}'. Topics: {module.topics.join(', ')}. {module.description}. Explain like I'm a beginner using real Solana projects (Jupiter, Marinade, Helius, Metaplex) as examples. Include TypeScript/Rust code snippets where relevant. After your explanation, ask me one follow-up question to check my understanding."

- **Dictionary term**: "Explain the Solana concept '{entry.term}' ({entry.abbreviation}). Definition: {entry.definition}. When to use: {entry.whenToUse}. Teach me like I'm 10 years old, using real-world analogies and Solana project examples. Include a code snippet. Then ask me a question."

- **Blueprint step**: "Explain step {stepNumber}: '{step.label}' in building a {blueprintTitle}. It involves: {step.description}. Tools: {step.tools}. Dependencies: {step.dependencies}. Teach me the concepts with examples from Jupiter, Marinade, etc. Include code. Then quiz me."

- **Protocol**: "Teach me about the {protocol.name} protocol on Solana. {protocol.description}. Use cases: {protocol.whenToUse.join(', ')}. Explain it simply with practical examples and code snippets. Then ask me a question."

## Integration Points

### 1. Learning Page (`LibraryLearn.tsx`)
- Add an "Ask GPT" button inside the expanded detail panel (after the Resources section, before Prerequisites)
- Button styled as: teal outline, mono font, small icon

### 2. Dictionary Entry (`DictionaryEntry.tsx`)
- Add an "Ask GPT" button inside the expanded panel (after Related Terms section)

### 3. Blueprint Node (`BlueprintNode.tsx`)
- Add a small "Ask GPT" button at the bottom of each step node (not goal node)
- Uses `onClick={(e) => e.stopPropagation()}` to prevent node selection

### 4. Protocol Detail (`ProtocolDetail.tsx`)
- Add an "Ask GPT" button below the existing "Full Documentation" link in the sidebar

## Technical Details

### Files Created
- `src/components/library/AskGptModal.tsx` -- The reusable modal with streaming chat

### Files Modified
- `src/pages/LibraryLearn.tsx` -- Import `AskGptModal`, add button + state in expanded panel
- `src/components/library/DictionaryEntry.tsx` -- Import `AskGptModal`, add button + state in expanded panel
- `src/components/library/BlueprintNode.tsx` -- Import `AskGptModal`, add button on step nodes
- `src/pages/ProtocolDetail.tsx` -- Import `AskGptModal`, add button in sidebar

### No New Dependencies
- Uses existing `@radix-ui/react-dialog` (Dialog component)
- Uses existing `react-markdown` + `remark-gfm`
- Uses existing `framer-motion` for slide-up animation
- Calls existing `chat-gpt` edge function via the same `CHAT_URL` pattern

### No Edge Function Changes
The existing `chat-gpt` edge function already handles general Solana knowledge questions perfectly. The tutoring prompt is crafted on the frontend to instruct the AI to teach + quiz.

