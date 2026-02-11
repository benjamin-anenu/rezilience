

# Add KNOWLEDGE Node to Hero Orbital Illustration

## What Changes

Add an 8th orbital node -- **KNOWLEDGE** -- at the top-center of the hero illustration, directly opposite ASSURANCE (bottom-center), positioned between CODE (top-left) and DEPENDENCIES (top-right).

## Layout

The current 7 nodes form a ring with a gap at the top-center. KNOWLEDGE fills that gap perfectly:

```text
            KNOWLEDGE (NEW - top center)
     CODE                    DEPENDENCIES
ECONOMICS                        LIVENESS
     GOVERNANCE              ORIGINALITY
            ASSURANCE (bottom center)
```

## Technical Details (single file: `src/components/landing/HeroSection.tsx`)

1. **Import** `BookOpen` from `lucide-react` (semantically precise -- open book = knowledge/documentation)
2. **Add the KNOWLEDGE node** at `top: 0%, left: 50%, transform: translateX(-50%)` -- mirrors ASSURANCE's bottom-center position exactly
3. **Add a connection line** from the new node (~x=210, y=20) down to center (~210, 190) in the SVG
4. Uses identical styling to all other nodes: teal glow drop-shadow, mono 10px label, h-10 w-10 icon
