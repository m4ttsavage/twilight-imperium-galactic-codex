import { useState, useCallback, useRef, type ReactNode } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface ZoomableMapContainerProps {
  children: ReactNode;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.15;

const ZoomableMapContainer = ({ children }: ZoomableMapContainerProps) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => clampZoom(prev + delta));
    }
  }, []);

  const zoomIn = () => setZoom((prev) => clampZoom(prev + ZOOM_STEP));
  const zoomOut = () => setZoom((prev) => clampZoom(prev - ZOOM_STEP));
  const resetZoom = () => setZoom(1);

  return (
    <div className="relative rounded-xl border border-border bg-card/40 overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={zoomIn}
          className="w-7 h-7 rounded-md bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          title="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={zoomOut}
          className="w-7 h-7 rounded-md bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          title="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetZoom}
          className="w-7 h-7 rounded-md bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          title="Reset zoom"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <span className="text-[9px] text-center text-muted-foreground/60 font-body tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Scrollable + zoomable area */}
      <div
        ref={containerRef}
        className="overflow-auto p-2"
        style={{ maxHeight: "85vh" }}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ZoomableMapContainer;
