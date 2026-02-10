

# Update Hero Orbital Nodes to Match Blue Ocean Style

## What Changes

### Current State
The 4 orbital nodes around the Solana icon each sit inside a bordered card container (`border border-border bg-card rounded-sm`) with labels like "CODE 40%", "DEPS 25%", etc.

### New State
- Expand from 4 to 7 orbital nodes to include the 3 Blue Ocean metrics: **Liveness Score** (HeartPulse), **Originality Index** (Fingerprint), **Staked Assurance** (Shield)
- Remove the card containers from ALL orbital nodes so icons float freely with a teal glow effect, matching the Blue Ocean panel style
- Each icon gets `drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))` for the signature glow
- Labels remain as small monochrome text beneath each icon

### Updated Orbital Layout (7 nodes arranged around center)
The nodes will be repositioned to fit 7 around the Solana logo in a roughly circular arrangement:

1. **GitBranch** - "CODE" (top-left)
2. **Network** - "DEPS" (top-right)
3. **HeartPulse** - "LIVENESS" (right)
4. **Fingerprint** - "ORIGINALITY" (bottom-right)
5. **Shield** - "ASSURANCE" (bottom)
6. **Heart** - "GOV" (bottom-left)
7. **Coins** - "ECON" (left)

### Connection lines
SVG dashed lines will be updated to connect all 7 nodes back to the center.

## Technical Details

**File: `src/components/landing/HeroSection.tsx`**

- Add `HeartPulse`, `Fingerprint`, `Shield` to the lucide-react imports
- Replace the 4 orbital node blocks (lines 159-183) with 7 nodes using the containerless style:
  ```tsx
  {/* Example node - no container, just icon + glow + label */}
  <div className="absolute ..." style={{ top: '...', left: '...' }}>
    <div className="flex flex-col items-center gap-1.5">
      <HeartPulse 
        className="h-10 w-10 text-primary" 
        style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }}
      />
      <span className="font-mono text-[10px] text-primary">LIVENESS</span>
    </div>
  </div>
  ```
- Update the SVG connection lines section to draw 7 lines from each node position to the center
- May need to slightly increase the container from `h-96 w-96` to accommodate 7 nodes cleanly

## Files Modified
1. `src/components/landing/HeroSection.tsx`
