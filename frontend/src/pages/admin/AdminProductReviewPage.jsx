import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

function getStatusBadgeClass(status) {
  const styles = {
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    MODIFICATION_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

function getStatusLabel(status) {
  const labels = {
    PENDING_APPROVAL: 'Pending Approval',
    MODIFICATION_REQUESTED: 'Modification Requested',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };
  return labels[status] || status;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText, confirmVariant = 'primary', children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{message}</p>
        {children}
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function AdminProductReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [modificationComments, setModificationComments] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => adminService.getProduct(id),
  });

  const approveMutation = useMutation({
    mutationFn: () => adminService.approveProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] });
      setShowApproveDialog(false);
      navigate('/admin/products');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => adminService.rejectProduct(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] });
      setShowRejectDialog(false);
      navigate('/admin/products');
    },
  });

  const modificationMutation = useMutation({
    mutationFn: () => adminService.requestModification(id, modificationComments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] });
      setShowModificationDialog(false);
      navigate('/admin/products');
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-6">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card className="p-12 text-center">
        <div className="text-slate-400 dark:text-slate-500 text-5xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Product Not Found</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/admin/products">
          <Button>Back to Products</Button>
        </Link>
      </Card>
    );
  }

  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : ['https://via.placeholder.com/600x400?text=No+Image'];

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        <Link to="/admin/products" className="hover:text-indigo-600 dark:hover:text-indigo-400">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800 dark:text-slate-200">Review Product</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{product.name}</h1>
          <p className="text-slate-600 dark:text-slate-400">Product ID: #{product.id}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getStatusBadgeClass(product.status)}`}>
          {getStatusLabel(product.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Product Images</h2>
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                <img
                  src={images[activeImageIndex]}
                  alt={`${product.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                  }}
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeImageIndex === index 
                          ? 'border-indigo-600 dark:border-indigo-400 shadow-md' 
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=N/A';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Product Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</label>
                <p className="text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap">{product.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Price</label>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">${product.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Stock Quantity</label>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{product.stock}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</label>
                <p className="text-slate-800 dark:text-slate-200 mt-1">{product.categoryName || 'Uncategorized'}</p>
              </div>
            </div>
          </Card>

          {/* Admin Comments / Rejection Reason */}
          {product.adminComments && (
            <Card className="p-6 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800">
              <h2 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-2">Previous Admin Comments</h2>
              <p className="text-orange-700 dark:text-orange-200">{product.adminComments}</p>
            </Card>
          )}
          {product.rejectionReason && (
            <Card className="p-6 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Rejection Reason</h2>
              <p className="text-red-700 dark:text-red-200">{product.rejectionReason}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Vendor Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Business Name</label>
                <p className="text-slate-800 dark:text-slate-100 font-medium">{product.vendorBusinessName}</p>
              </div>
              {product.vendorEmail && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                  <p className="text-slate-800 dark:text-slate-200">{product.vendorEmail}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Vendor ID</label>
                <p className="text-slate-800 dark:text-slate-200">#{product.vendorId}</p>
              </div>
            </div>
          </Card>

          {/* Submission Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Submission Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Submitted On</label>
                <p className="text-slate-800 dark:text-slate-200">{formatDate(product.createdAt)}</p>
              </div>
              {product.updatedAt && product.updatedAt !== product.createdAt && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</label>
                  <p className="text-slate-800 dark:text-slate-200">{formatDate(product.updatedAt)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Admin Actions</h2>
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => setShowApproveDialog(true)}
                disabled={product.status === 'APPROVED'}
              >
                ✓ Approve Product
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => setShowModificationDialog(true)}
                disabled={product.status === 'MODIFICATION_REQUESTED'}
              >
                📝 Request Modification
              </Button>
              <Button
                className="w-full"
                variant="danger"
                onClick={() => setShowRejectDialog(true)}
                disabled={product.status === 'REJECTED'}
              >
                ✗ Reject Product
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={() => approveMutation.mutate()}
        title="Approve Product"
        message="Are you sure you want to approve this product? It will become available in the marketplace."
        confirmText="Approve Product"
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          setRejectionReason('');
        }}
        onConfirm={() => rejectMutation.mutate()}
        title="Reject Product"
        message="Please provide a reason for rejecting this product:"
        confirmText="Reject Product"
        confirmVariant="danger"
      >
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          rows={4}
        />
      </ConfirmDialog>

      {/* Modification Dialog */}
      <ConfirmDialog
        isOpen={showModificationDialog}
        onClose={() => {
          setShowModificationDialog(false);
          setModificationComments('');
        }}
        onConfirm={() => modificationMutation.mutate()}
        title="Request Modification"
        message="Please provide comments explaining what changes are required:"
        confirmText="Request Modification"
        confirmVariant="secondary"
      >
        <textarea
          value={modificationComments}
          onChange={(e) => setModificationComments(e.target.value)}
          placeholder="Enter modification comments..."
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={4}
        />
      </ConfirmDialog>
    </div>
  );
}
