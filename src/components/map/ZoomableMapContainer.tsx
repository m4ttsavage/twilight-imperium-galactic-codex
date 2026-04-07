import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface ZoomableMapContainerProps {
  children: ReactNode;
  defaultZoom?: number;
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.15;

const ZoomableMapContainer = ({ children, defaultZoom }: ZoomableMapContainerProps) => {
  const [zoom, setZoom] = useState(defaultZoom ?? 1);
  const [autoZoom, setAutoZoom] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  // Auto-fit: measure content vs container width on mount
  useEffect(() => {
    if (defaultZoom != null) return; // skip if explicit default
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => {
      const containerWidth = container.clientWidth - 16; // padding
      const contentWidth = content.scrollWidth;
      if (contentWidth > 0 && containerWidth > 0) {
        const fitZoom = clampZoom(containerWidth / contentWidth);
        setZoom(fitZoom);
        setAutoZoom(fitZoom);
      }
    };

    // Small delay for layout to settle
    const timer = setTimeout(measure, 100);
    return () => clearTimeout(timer);
  }, [defaultZoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => clampZoom(prev + delta));
    }
  }, []);

  const zoomIn = () => setZoom((prev) => clampZoom(prev + ZOOM_STEP));
  const zoomOut = () => setZoom((prev) => clampZoom(prev - ZOOM_STEP));
  const resetZoom = () => setZoom(autoZoom ?? defaultZoom ?? 1);

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
          ref={contentRef}
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
