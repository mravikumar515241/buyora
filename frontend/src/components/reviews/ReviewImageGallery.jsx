import { useState } from 'react';
import { ReviewLightbox } from './ReviewLightbox';

export function ReviewImageGallery({ images = [], title = 'Review photos' }) {
  const [previewIndex, setPreviewIndex] = useState(null);

  if (!images.length) return null;

  return (
    <>
      <div>
        {title && (
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h4>
        )}
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setPreviewIndex(index)}
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={`Open review image ${index + 1}`}
            >
              <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {previewIndex !== null && (
        <ReviewLightbox
          images={images}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  );
}
