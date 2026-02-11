

# Fix Vision Slide Image + Cinematic Reveal

## Problem
The `FadeImage` wrapper `<div className="relative">` has no dimensions. The image inside uses `absolute inset-0`, which needs a sized parent -- but the wrapper collapses to 0px, making the image invisible.

## Solution

### 1. Fix `FadeImage` to support absolute-positioned images
Update the `FadeImage` component to accept an optional `wrapperClassName` prop so the wrapper div can inherit sizing like `absolute inset-0` when needed. This fixes the collapse issue.

### 2. Resize the image (no longer full-screen)
Instead of covering the entire slide, center the ecosystem image at roughly 70% width/height so the text and image coexist more elegantly. Remove the `absolute inset-0` approach and use a centered layout with max dimensions.

### 3. Cinematic reveal animation
Replace the simple opacity fade with a cinematic entrance using `framer-motion`:
- Image starts slightly scaled down (0.92) and blurred (8px), then scales to 1.0 and un-blurs over 1.2 seconds with a smooth easing curve
- A subtle glow ring pulses behind the image as it loads
- Text fades up from below with a staggered delay (0.6s after image starts)

This creates a "documentary title card" feel.

## Technical Details

### File: `src/components/pitch/slides.tsx`

**1. Update imports** -- add `motion` from `framer-motion` and `useEffect`

**2. Rewrite `FadeImage`** to use framer-motion:
```typescript
function FadeImage({ src, alt, className, wrapperClassName }: { 
  src: string; alt: string; className?: string; wrapperClassName?: string 
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={wrapperClassName ?? 'relative'}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-card/60 rounded-sm" />}
      <motion.img
        src={src}
        alt={alt}
        className={className ?? ''}
        onLoad={() => setLoaded(true)}
        initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
        animate={loaded 
          ? { opacity: 1, scale: 1, filter: 'blur(0px)' } 
          : { opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </div>
  );
}
```

**3. Redesign `VisionSlide` layout:**
- Change from full-bleed absolute image to a centered composition
- Image sits in the upper ~60% of the slide, contained at `max-w-[750px] max-h-[500px]`
- Text content below, fading in with a 0.6s delay via `motion.div`
- A subtle teal glow ring behind the image for depth
- Dark gradient overlay remains but is softer

**4. Founder image (`FounderSlide`):**
- Same cinematic blur-to-sharp treatment via the updated `FadeImage`
- Pass `wrapperClassName` to keep the existing flex layout intact

### File: `src/pages/PitchDeck.tsx`
- No changes needed -- preloading is already in place

### Result
- Image is visible again (fixed the zero-height collapse)
- Smaller, centered image creates a more professional composition
- Cinematic blur-to-focus + scale-up entrance gives a polished, documentary-style reveal
- Founder photo gets the same premium treatment
- Both images still preload on mount for instant availability

