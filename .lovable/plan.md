

# Pitch Deck Image Performance: Preload All Images + Loading Animation

## Problem
The pitch deck has two images (`resilience-ecosystem.png` on slide 2, `founder-benjamin.png` on slide 10) that may not load instantly, causing visual lag when navigating to those slides.

## Solution
Two improvements:

### 1. Preload ALL images on mount (not just the ecosystem image)
Currently only `ecosystemImg` is preloaded. We will also preload `founderImg` so both are in the browser cache before the user reaches those slides.

### 2. Add a fade-in loading animation for images
Wrap each `<img>` in the slides with a loading state that shows a subtle skeleton/pulse placeholder, then fades the image in once it has loaded. This ensures the user never sees a broken or partially-loaded image -- instead they see a smooth reveal.

## Technical Details

### File: `src/pages/PitchDeck.tsx`
- Import `founderImg` alongside `ecosystemImg`
- Preload both images in the existing `useEffect`:
  ```typescript
  useEffect(() => {
    [ecosystemImg, founderImg].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);
  ```

### File: `src/components/pitch/slides.tsx`
- Create a small `FadeImage` component inside the file:
  ```typescript
  function FadeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [loaded, setLoaded] = useState(false);
    return (
      <div className="relative">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-card/60 rounded-sm" />}
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />
      </div>
    );
  }
  ```
- Replace the `<img>` in `VisionSlide` (ecosystem image, line 68) with `<FadeImage>`
- Replace the `<img>` in `FounderSlide` (founder photo, line 561) with `<FadeImage>`
- Add `useState` to the existing imports at the top of the file

### Result
- Both images begin downloading the moment `/pitch` loads (before the user leaves slide 1)
- If an image is already cached, it renders instantly with full opacity
- If still loading, the user sees a subtle pulsing placeholder that smoothly fades into the image once ready
- No layout shift -- the placeholder matches the image dimensions via the same className

