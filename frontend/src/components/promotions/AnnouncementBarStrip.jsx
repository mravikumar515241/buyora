import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useState } from 'react';

export function AnnouncementBarStrip({ announcements = [] }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !announcements.length) return null;

  const bar = announcements[0];

  const content = (
    <span className="text-sm font-semibold truncate">{bar.text}</span>
  );

  return (
    <div
      className="relative z-40 py-2.5 px-4 text-center"
      style={{ backgroundColor: bar.backgroundColor || '#4f46e5', color: bar.textColor || '#fff' }}
      role="region"
      aria-label="Site announcement"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 pr-10">
        {bar.link ? (
          <Link to={bar.link} className="hover:underline min-h-[44px] flex items-center">
            {content}
          </Link>
        ) : (
          content
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
