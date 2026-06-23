import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag, CheckCircle2 } from 'lucide-react';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';
import { ReviewImageGallery } from './ReviewImageGallery';

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function ReviewCard({
  review,
  isOwnReview,
  isEdited,
  token,
  onHelpful,
  onNotHelpful,
  votePending,
}) {
  const [reported, setReported] = useState(false);

  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-5 shadow-sm hover:shadow-md transition-shadow animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0" aria-hidden="true">
          {getInitials(review.userName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">{review.userName || 'Customer'}</h4>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                Verified Purchase
              </span>
            )}
            {isOwnReview && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                Your Review
              </span>
            )}
          </div>
          <StarRating rating={review.rating ?? 0} readonly />
          {review.title && (
            <p className="font-semibold text-slate-800 dark:text-slate-100 mt-2">{review.title}</p>
          )}
          {review.comment && (
            <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{review.comment}</p>
          )}
          {review.imageUrls?.length > 0 && (
            <div className="mt-3">
              <ReviewImageGallery images={review.imageUrls} title="" />
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {formatDate(review.createdAt)}
            {isEdited && <span className="ml-2 italic">(edited)</span>}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            {review.helpfulCount > 0 && (
              <span className="text-sm text-slate-600 dark:text-slate-400 mr-2">
                {review.helpfulCount} found helpful
              </span>
            )}
            {token && !isOwnReview && (
              <>
                <Button
                  size="sm"
                  variant={review.userMarkedHelpful === true ? 'primary' : 'outline'}
                  disabled={votePending}
                  onClick={onHelpful}
                  className="min-h-[40px]"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" aria-hidden="true" />
                  Helpful
                </Button>
                <Button
                  size="sm"
                  variant={review.userMarkedHelpful === false ? 'primary' : 'outline'}
                  disabled={votePending}
                  onClick={onNotHelpful}
                  className="min-h-[40px]"
                >
                  <ThumbsDown className="w-4 h-4 mr-1" aria-hidden="true" />
                  Not Helpful
                </Button>
              </>
            )}
            {!isOwnReview && (
              <button
                type="button"
                onClick={() => setReported(true)}
                disabled={reported}
                className="inline-flex items-center gap-1 min-h-[40px] px-3 text-sm text-slate-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <Flag className="w-4 h-4" aria-hidden="true" />
                {reported ? 'Reported' : 'Report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
