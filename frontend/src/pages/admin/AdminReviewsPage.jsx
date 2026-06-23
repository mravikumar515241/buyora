import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StarRating } from '../../components/ui/StarRating';
import { ReviewImageGallery } from '../../components/reviews/ReviewImageGallery';

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ActionDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel, confirmVariant = 'danger', requireReason = false }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{message}</p>
        {requireReason && (
          <Input
            label="Reason (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter moderation reason"
            className="mb-4"
          />
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={requireReason && !reason.trim()}>
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [productId, setProductId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [hideTarget, setHideTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'reviews', page, productId, vendorId],
    queryFn: () =>
      adminService.reviews({
        page,
        size: 20,
        productId: productId.trim() || undefined,
        vendorId: vendorId.trim() || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      setDeleteTarget(null);
    },
  });

  const hideMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.hideReview(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      setHideTarget(null);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.restoreReview(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      setRestoreTarget(null);
    },
  });

  const reviews = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Review Moderation</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Hide, restore, or delete reviews. A reason is required for moderation actions.
      </p>

      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product ID</label>
            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Filter by product"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 w-32 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor ID</label>
            <input
              type="number"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="Filter by vendor"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 w-32 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setProductId('');
              setVendorId('');
              setPage(0);
            }}
          >
            Clear filters
          </Button>
        </div>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-red-600 dark:text-red-400">Failed to load reviews: {error.message}</p>
        </Card>
      )}

      {!isLoading && !error && reviews.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">No reviews found.</p>
        </Card>
      )}

      {!isLoading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{review.userName}</span>
                    <StarRating rating={review.rating ?? 0} readonly />
                    <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(review.createdAt)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      review.moderationStatus === 'HIDDEN'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}>
                      {review.moderationStatus || 'VISIBLE'}
                    </span>
                  </div>
                  {review.productName && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Product: {review.productName}
                    </p>
                  )}
                  {review.moderationReason && (
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                      Moderation reason: {review.moderationReason}
                    </p>
                  )}
                  {review.title && (
                    <p className="font-medium text-slate-800 dark:text-slate-100 mt-1">&ldquo;{review.title}&rdquo;</p>
                  )}
                  {review.comment && (
                    <p className="text-slate-700 dark:text-slate-300 mt-2">{review.comment}</p>
                  )}
                  {review.imageUrls?.length > 0 && (
                    <div className="mt-3">
                      <ReviewImageGallery images={review.imageUrls} title="" />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {review.moderationStatus !== 'HIDDEN' ? (
                    <Button size="sm" variant="secondary" onClick={() => setHideTarget(review)}>
                      Hide
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setRestoreTarget(review)}>
                      Restore
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(review)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Previous
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400 py-1">Page {page + 1} of {totalPages}</span>
          <Button size="sm" variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
            Next
          </Button>
        </div>
      )}

      <ActionDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete review"
        message="Are you sure you want to permanently delete this review?"
        confirmLabel="Delete"
      />

      <ActionDialog
        isOpen={!!hideTarget}
        onClose={() => setHideTarget(null)}
        onConfirm={(reason) => hideTarget && hideMutation.mutate({ id: hideTarget.id, reason })}
        title="Hide review"
        message="This review will be hidden from the product page."
        confirmLabel="Hide Review"
        confirmVariant="secondary"
        requireReason
      />

      <ActionDialog
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={(reason) => restoreTarget && restoreMutation.mutate({ id: restoreTarget.id, reason })}
        title="Restore review"
        message="This review will be visible on the product page again."
        confirmLabel="Restore Review"
        confirmVariant="primary"
        requireReason
      />
    </div>
  );
}
