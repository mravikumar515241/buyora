import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

export function ReviewLightbox({ images = [], initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const go = useCallback((dir) => {
    setZoom(1);
    setIndex((i) => (i + dir + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [go, onClose]);

  if (images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" role="dialog" aria-modal="true" aria-label="Review image viewer">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm">{index + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="p-2 rounded-full hover:bg-white/10" aria-label="Zoom out">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.5))} className="p-2 rounded-full hover:bg-white/10" aria-label="Zoom in">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden touch-pan-y">
        {images.length > 1 && (
          <button type="button" onClick={() => go(-1)} className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="Previous image">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <img
          src={images[index]}
          alt={`Review ${index + 1}`}
          className="max-h-[75vh] max-w-[92vw] object-contain transition-transform duration-200 select-none"
          style={{ transform: `scale(${zoom})` }}
          draggable={false}
        />
        {images.length > 1 && (
          <button type="button" onClick={() => go(1)} className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="Next image">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide justify-center">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => { setIndex(i); setZoom(1); }}
              className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 ${i === index ? 'border-indigo-400' : 'border-transparent opacity-70'}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
