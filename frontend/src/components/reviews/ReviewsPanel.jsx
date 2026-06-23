import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquarePlus } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Input } from '../ui/Input';
import { StarRating } from '../ui/StarRating';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { showToast } from '../ui/Toast';
import { RatingBreakdown } from './RatingBreakdown';
import { ReviewImageGallery } from './ReviewImageGallery';
import { ReviewCard } from './ReviewCard';

const STAR_FILTERS = [
  { value: null, label: 'All Reviews' },
  { value: 5, label: '5 Star' },
  { value: 4, label: '4 Star' },
  { value: 3, label: '3 Star' },
  { value: 2, label: '2 Star' },
  { value: 1, label: '1 Star' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
];

function buildPayload(rating, title, comment, imageUrls) {
  return {
    rating,
    title: title.trim(),
    comment: comment.trim(),
    imageUrls: imageUrls.filter((u) => u.trim()),
  };
}

export function ReviewsPanel({ productId, averageRating, reviewCount, reviewSummary }) {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  const [starFilter, setStarFilter] = useState(null);
  const [reviewSort, setReviewSort] = useState('');
  const [reviewPage, setReviewPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrls, setImageUrls] = useState(['']);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: canReviewData } = useQuery({
    queryKey: ['canReview', productId],
    queryFn: () => reviewService.canReview(productId),
    enabled: !!productId && !!token,
  });

  const { data: reviewsPage, isLoading } = useQuery({
    queryKey: ['reviews', productId, reviewPage, reviewSort],
    queryFn: () => reviewService.getByProduct(productId, { page: reviewPage, size: 10, sort: reviewSort || undefined }),
    enabled: !!productId,
  });

  const canReview = canReviewData?.canReview === true;
  const alreadyReviewed = canReviewData?.alreadyReviewed === true;
  const existingReview = canReviewData?.existingReview;

  const reviews = useMemo(() => {
    const list = reviewsPage?.content ?? [];
    if (!starFilter) return list;
    return list.filter((r) => r.rating === starFilter);
  }, [reviewsPage, starFilter]);

  const resetForm = () => {
    setRating(5);
    setTitle('');
    setComment('');
    setImageUrls(['']);
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const addMutation = useMutation({
    mutationFn: () => reviewService.create(productId, buildPayload(rating, title, comment, imageUrls)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviewSummary', productId] });
      queryClient.invalidateQueries({ queryKey: ['canReview', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      resetForm();
      showToast.success('Review submitted!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => reviewService.update(editingId, buildPayload(rating, title, comment, imageUrls)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviewSummary', productId] });
      queryClient.invalidateQueries({ queryKey: ['canReview', productId] });
      resetForm();
      showToast.success('Review updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reviewService.delete(existingReview.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviewSummary', productId] });
      queryClient.invalidateQueries({ queryKey: ['canReview', productId] });
      setShowDeleteConfirm(false);
      showToast.success('Review deleted');
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ reviewId, helpful }) => reviewService.vote(reviewId, helpful),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', productId] }),
  });

  const startEdit = () => {
    if (!existingReview?.id) return;
    setIsEditing(true);
    setEditingId(existingReview.id);
    setShowForm(true);
    setRating(existingReview.rating || 5);
    setTitle(existingReview.title || '');
    setComment(existingReview.comment || '');
    setImageUrls(existingReview.imageUrls?.length ? existingReview.imageUrls : ['']);
  };

  const totalPages = reviewsPage?.totalPages ?? 0;
  const hasReviews = (reviewCount ?? 0) > 0;

  return (
    <Card className="p-5 md:p-8" id="reviews">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Customer Reviews</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real feedback from verified buyers</p>
        </div>
        {token && (canReview || alreadyReviewed) && !showForm && (
          <Button onClick={() => (alreadyReviewed ? startEdit() : setShowForm(true))} className="min-h-[44px]">
            {alreadyReviewed ? 'Edit Review' : 'Write a Review'}
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-4 mb-5">
            <div className="text-5xl font-bold text-slate-900 dark:text-white">{averageRating}</div>
            <div>
              <StarRating rating={averageRating} readonly />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {Number(reviewCount || 0).toLocaleString()} reviews
              </p>
            </div>
          </div>
          <RatingBreakdown breakdown={reviewSummary?.breakdown ?? []} totalReviews={reviewCount} />
        </div>
        {reviewSummary?.recentReviewImages?.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-slate-50/80 dark:bg-slate-800/50">
            <ReviewImageGallery images={reviewSummary.recentReviewImages} title="Customer photos" />
          </div>
        )}
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 p-5 md:p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your rating</label>
                <StarRating rating={rating} onChange={setRating} />
              </div>
              <Input label="Review title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Summarize your experience" />
              <div>
                <label className="block text-sm font-medium mb-2">Review description</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 2000))}
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Share details about quality, delivery, and value..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Photo URLs (optional)</label>
                {imageUrls.map((url, i) => (
                  <Input key={i} value={url} onChange={(e) => {
                    const next = [...imageUrls];
                    next[i] = e.target.value;
                    setImageUrls(next);
                  }} placeholder="https://..." />
                ))}
                {imageUrls.length < 5 && (
                  <Button size="sm" variant="outline" type="button" onClick={() => setImageUrls([...imageUrls, ''])}>Add photo</Button>
                )}
              </div>
              <Button
                onClick={() => (isEditing ? updateMutation.mutate() : addMutation.mutate())}
                disabled={!title.trim() || !comment.trim() || addMutation.isPending || updateMutation.isPending}
                className="min-h-[44px]"
              >
                {isEditing ? 'Update Review' : 'Submit Review'}
              </Button>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-semibold">Live preview</p>
              <ReviewCard
                review={{
                  userName: user?.fullName || 'You',
                  rating,
                  title,
                  comment,
                  imageUrls: imageUrls.filter(Boolean),
                  verifiedPurchase: true,
                  helpfulCount: 0,
                  createdAt: new Date().toISOString(),
                }}
                isOwnReview
                token={false}
              />
            </div>
          </div>
        </div>
      )}

      {!token && (
        <div className="mb-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4">
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Sign in</Link>
          {' '}to write a review after your purchase is delivered.
        </div>
      )}

      {token && alreadyReviewed && !showForm && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={startEdit}>Edit</Button>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" role="tablist" aria-label="Filter reviews by rating">
          {STAR_FILTERS.map((f) => (
            <Chip key={f.label} active={starFilter === f.value} onClick={() => { setStarFilter(f.value); setReviewPage(0); }}>
              {f.label}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" role="tablist" aria-label="Sort reviews">
          {SORT_OPTIONS.map((s) => (
            <Chip key={s.value || 'recent'} active={reviewSort === s.value} onClick={() => { setReviewSort(s.value); setReviewPage(0); }}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !hasReviews && (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
          <MessageSquarePlus className="w-12 h-12 mx-auto text-slate-400 mb-4" aria-hidden="true" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Reviews Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Be the first to share your experience with this product.</p>
          {token && canReview && (
            <Button onClick={() => setShowForm(true)}>Write the First Review</Button>
          )}
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwnReview={user && review.userId === user.id}
              isEdited={review.updatedAt && review.createdAt && new Date(review.updatedAt) > new Date(review.createdAt)}
              token={!!token}
              votePending={voteMutation.isPending}
              onHelpful={() => voteMutation.mutate({ reviewId: review.id, helpful: true })}
              onNotHelpful={() => voteMutation.mutate({ reviewId: review.id, helpful: false })}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button size="sm" variant="secondary" disabled={reviewPage === 0} onClick={() => setReviewPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm py-2">Page {reviewPage + 1} of {totalPages}</span>
          <Button size="sm" variant="secondary" disabled={reviewPage >= totalPages - 1} onClick={() => setReviewPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Review"
        message="Are you sure you want to delete your review?"
        confirmText="Delete"
        confirmVariant="danger"
      />
    </Card>
  );
}
