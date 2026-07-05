import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-side-by-side";

/* ─── Helper: Find raster by type and year ─────────────────────── */
function findRaster(rasters, layerType, year, modelVariant = "cnn") {
  const list = Array.isArray(rasters) ? rasters : [];
  if (!list.length) return null;

  const n = (r) => (r.name || "").toLowerCase();
  const typeToken =
    layerType === "ndvi" ? "ndvi" :
    layerType === "change" ? "change" :
    "lulc";

  if (typeToken === "lulc") {
    let r = null;
    if (modelVariant === "cnn") {
      r = list.find((x) => {
        const name = n(x);
        return name.includes("lulc") && name.includes(year) &&
               (name.includes("cnn") || (!name.includes("rf") && !name.includes("svm")));
      });
      if (!r) {
        r = list.find((x) => {
          const name = n(x);
          return name.includes("lulc") && name.includes(year) &&
                 !name.includes("rf") && !name.includes("svm");
        });
      }
    } else {
      const modelLower = modelVariant.toLowerCase();
      r = list.find((x) => {
        const name = n(x);
        return name.includes("lulc") && name.includes(year) &&
               (name.includes(`_${modelLower}`) ||
                name.includes(` ${modelLower}`) ||
                name.endsWith(modelLower));
      });
    }
    if (r) {
      const url = r.tile_url || `http://localhost:8000/tiles/${r.id}/{z}/{x}/{y}.png`;
      return { ...r, resolvedUrl: url };
    }
  }

  if (typeToken === "ndvi" || typeToken === "change") {
    const r = list.find((x) => {
      const name = n(x);
      return name.includes(typeToken) && name.includes(year);
    });
    if (r) {
      const url = r.tile_url || `http://localhost:8000/tiles/${r.id}/{z}/{x}/{y}.png`;
      return { ...r, resolvedUrl: url };
    }
  }

  return null;
}

/* ─── Main Compare View Component ──────────────────────────────── */
export default function CompareView({
  layerType,
  modelVariant = "cnn",
  selectedYear = "2025",
  rasters = [],
  isDragging,
  onDragStart,
  onDragEnd,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const leftLayerRef = useRef(null);
  const rightLayerRef = useRef(null);
  const controlRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  // Determine years for comparison
  const leftYear = selectedYear;
  const rightYear = selectedYear === "2025" ? "2020" : "2025";

  // Find rasters for each year
  const leftRaster = useMemo(() => 
    findRaster(rasters, layerType, leftYear, modelVariant), 
    [rasters, layerType, leftYear, modelVariant]
  );
  const rightRaster = useMemo(() => 
    findRaster(rasters, layerType, rightYear, modelVariant), 
    [rasters, layerType, rightYear, modelVariant]
  );

  // Debug logging
  useEffect(() => {
    console.log('[CompareView] leftRaster:', leftRaster);
    console.log('[CompareView] rightRaster:', rightRaster);
  }, [leftRaster, rightRaster]);

  // Init map once
  useEffect(() => {
    if (mapInstance.current) return;
    
    mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([36.45, 10.73], 9);
    L.control.zoom({ position: 'topright' }).addTo(mapInstance.current);
    
    // Add base OSM layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Rebuild slider when left/right selection changes
  useEffect(() => {
    if (!mapInstance.current || !rasters.length) return;

    // Tear down previous slider + layers
    if (controlRef.current) { 
      controlRef.current.remove(); 
      controlRef.current = null; 
    }
    if (leftLayerRef.current) { 
      mapInstance.current.removeLayer(leftLayerRef.current);  
      leftLayerRef.current = null; 
    }
    if (rightLayerRef.current) { 
      mapInstance.current.removeLayer(rightLayerRef.current); 
      rightLayerRef.current = null; 
    }

    if (!leftRaster?.resolvedUrl || !rightRaster?.resolvedUrl) {
      console.log('[CompareView] Missing raster URLs');
      return;
    }

    console.log('[CompareView] Adding left layer:', leftRaster.resolvedUrl);
    console.log('[CompareView] Adding right layer:', rightRaster.resolvedUrl);

    // Create tile layers
    leftLayerRef.current = L.tileLayer(leftRaster.resolvedUrl, { 
      opacity: 1,
      tms: false,
    }).addTo(mapInstance.current);

    rightLayerRef.current = L.tileLayer(rightRaster.resolvedUrl, { 
      opacity: 1,
      tms: false,
    }).addTo(mapInstance.current);

    // Add error handling
    leftLayerRef.current.on('tileerror', (err, tile) => {
      console.error('[CompareView] Left tile error:', err, tile?.tile?.src);
    });

    rightLayerRef.current.on('tileerror', (err, tile) => {
      console.error('[CompareView] Right tile error:', err, tile?.tile?.src);
    });

    // Create side-by-side control
    controlRef.current = L.control.sideBySide(leftLayerRef.current, rightLayerRef.current, {
      position: 'topleft',
      cursor: 'ew-resize',
    }).addTo(mapInstance.current);

    // Listen for slider position changes
    controlRef.current.on('moved', function(e) {
      setSliderPos(e.ratio * 100);
    });

    // Fit to bounds if available
    if (leftRaster.min_lat && leftRaster.min_lon && leftRaster.max_lat && leftRaster.max_lon) {
      mapInstance.current.fitBounds([
        [leftRaster.min_lat, leftRaster.min_lon],
        [leftRaster.max_lat, leftRaster.max_lon],
      ], { padding: [20, 20] });
    }

    return () => {
      // Cleanup handled by next effect run or unmount
    };
  }, [rasters, leftRaster, rightRaster]);

  // Handle drag start (for custom slider if needed)
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStart?.();
  }, [onDragStart]);

  // Handle drag move (global listener)
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const newPos = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      setSliderPos(newPos);
    };

    const onUp = () => {
      onDragEnd?.();
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, onDragEnd]);

  // Keyboard support for slider
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos(p => Math.max(0, p - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos(p => Math.min(100, p + 5));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: '560px',
        width: '100%',
        overflow: 'hidden',
        userSelect: isDragging ? 'none' : 'auto',
        zIndex: 1,
        pointerEvents: 'auto',
      }}
    >
      {/* Map container */}
      <div 
        ref={mapRef} 
        style={{ 
          height: '100%', 
          width: '100%',
          background: '#f0f0f0',
          position: 'relative',
          zIndex: 0,
        }} 
      />

      {/* Left year badge */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 999,
          background: 'rgba(28,25,23,0.85)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '99px',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          pointerEvents: 'none',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {leftYear}
      </div>

      {/* Right year badge */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          zIndex: 999,
          background: 'rgba(28,25,23,0.85)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '99px',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          pointerEvents: 'none',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {rightYear}
      </div>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          background: 'rgba(28,25,23,0.88)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '99px',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
          pointerEvents: 'none',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.15)',
          textAlign: 'center',
        }}
      >
        Drag the slider or use ← → keys to compare {leftYear} ↔ {rightYear}
      </div>
    </div>
  );
}