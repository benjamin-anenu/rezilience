import { useCallback, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { TreeControls } from '@/components/dependency-tree/TreeControls';

export function BlueprintControls() {
  const { getViewport, setViewport, zoomIn, zoomOut } = useReactFlow();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const step = 50;
      const vp = getViewport();

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setViewport({ ...vp, y: vp.y + step }, { duration: 100 });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setViewport({ ...vp, y: vp.y - step }, { duration: 100 });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setViewport({ ...vp, x: vp.x + step }, { duration: 100 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setViewport({ ...vp, x: vp.x - step }, { duration: 100 });
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn({ duration: 150 });
          break;
        case '-':
          e.preventDefault();
          zoomOut({ duration: 150 });
          break;
      }
    },
    [getViewport, setViewport, zoomIn, zoomOut]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return <TreeControls />;
}
