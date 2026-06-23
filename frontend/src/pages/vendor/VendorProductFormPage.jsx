import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ImageCarousel } from '../../components/ui/ImageCarousel';

const schema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  categoryId: z.number({ required_error: 'Please select a category' }),
});

export function VendorProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageInput, setCurrentImageInput] = useState('');
  const [imageInputError, setImageInputError] = useState('');

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    enabled: isEdit,
  });

  const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
  });

  const categories = Array.isArray(categoriesRes) ? categoriesRes : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        imageUrls: imageUrls,
      };
      return isEdit ? productService.update(id, payload) : productService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-products-stats'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-recent-products'] });
      navigate('/dashboard/products');
    },
  });

  // Update form when product data loads
  useEffect(() => {
    if (productData) {
      reset({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || 0,
        stock: productData.stock || 0,
        categoryId: productData.categoryId || '',
      });
      if (productData.imageUrls && productData.imageUrls.length > 0) {
        setImageUrls(productData.imageUrls);
      }
    }
  }, [productData, reset]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleAddImage = () => {
    const trimmedUrl = currentImageInput.trim();
    
    if (!trimmedUrl) {
      setImageInputError('Please enter an image URL');
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setImageInputError('Please enter a valid URL');
      return;
    }

    if (imageUrls.includes(trimmedUrl)) {
      setImageInputError('This image URL is already added');
      return;
    }

    if (imageUrls.length >= 5) {
      setImageInputError('Maximum 5 images allowed');
      return;
    }

    setImageUrls([...imageUrls, trimmedUrl]);
    setCurrentImageInput('');
    setImageInputError('');
  };

  const handleRemoveImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  if (isEdit && productLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-64" />
        <Card className="p-6">
          <div className="space-y-4 max-w-2xl">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400">Dashboard</Link>
        <span>/</span>
        <Link to="/dashboard/products" className="hover:text-indigo-600 dark:hover:text-indigo-400">My Products</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{isEdit ? 'Edit Product' : 'Add Product'}</span>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {isEdit 
            ? 'Update your product information and inventory' 
            : 'Create a new product listing for your store'}
        </p>
      </div>

      {/* Admin Comments Alert */}
      {isEdit && productData?.status === 'MODIFICATION_REQUESTED' && productData?.adminComments && (
        <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex gap-3">
            <div className="text-orange-600 dark:text-orange-400 text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">Modification Requested by Admin</h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">{productData.adminComments}</p>
              <p className="text-orange-600 dark:text-orange-400 text-xs mt-2">
                Please make the requested changes and save the product to resubmit for approval.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              {/* Product Name */}
              <Input
                label="Product Name *"
                placeholder="Enter product name"
                error={errors.name?.message}
                {...register('name')}
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 tracking-tight">
                  Product Description *
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Describe your product in detail"
                  rows="4"
                  className={`w-full rounded-xl border px-4 py-3 
                    bg-white dark:bg-slate-800
                    text-slate-900 dark:text-slate-100 
                    placeholder-slate-400 dark:placeholder-slate-500 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 
                    focus:border-indigo-500 dark:focus:border-indigo-400
                    hover:bg-slate-50 dark:hover:bg-slate-700
                    shadow-sm hover:shadow-md
                    transition-all duration-300
                    resize-none
                    ${errors.description 
                      ? 'border-red-400 dark:border-red-500 focus:ring-red-500/50 dark:focus:ring-red-400/50' 
                      : 'border-slate-200 dark:border-slate-600'
                    }`}
                />
                {errors.description && (
                  <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Price and Stock */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Price (₹) *"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.price?.message}
                  {...register('price', { valueAsNumber: true })}
                />
                <Input
                  label="Stock Quantity *"
                  type="number"
                  placeholder="0"
                  error={errors.stock?.message}
                  {...register('stock', { valueAsNumber: true })}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  className={`w-full rounded-lg border ${
                    errors.categoryId ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
                  } px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent`}
                  {...register('categoryId', { valueAsNumber: true })}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoryId.message}</p>
                )}
                {categories.length === 0 && !categoriesLoading && (
                  <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    No categories available. Please contact an admin to add categories.
                  </p>
                )}
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product Images (Max 5)
                </label>
                <div className="space-y-3">
                  {/* Image Input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={currentImageInput}
                      onChange={(e) => {
                        setCurrentImageInput(e.target.value);
                        setImageInputError('');
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="https://example.com/image.jpg"
                      className={`flex-1 rounded-lg border ${
                        imageInputError ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
                      } px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent`}
                    />
                    <Button
                      type="button"
                      onClick={handleAddImage}
                      disabled={imageUrls.length >= 5}
                      className="flex-shrink-0"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </Button>
                  </div>
                  
                  {imageInputError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{imageInputError}</p>
                  )}

                  {/* Image List */}
                  {imageUrls.length > 0 && (
                    <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                        {imageUrls.length} image{imageUrls.length > 1 ? 's' : ''} added
                      </p>
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /%3E%3C/svg%3E';
                            }}
                          />
                          <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">
                            Image {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {imageUrls.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No images added yet. Add at least one product image.
                    </p>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {mutation.isError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-200">
                        {isEdit ? 'Failed to update product' : 'Failed to create product'}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        {mutation.error?.response?.data?.message || 'Please check your input and try again.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full sm:flex-1"
                >
                  {mutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {isEdit ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard/products')}
                  disabled={mutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Image Preview */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Image Preview</h3>
              <ImageCarousel images={imageUrls} alt="Product preview" />
            </Card>

            {/* Help Card */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-1">Product Tips</h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Use clear, descriptive product names</li>
                    <li>• Add detailed descriptions (features, specs)</li>
                    <li>• Upload 3-5 high-quality images</li>
                    <li>• Show product from different angles</li>
                    <li>• Set competitive pricing</li>
                    <li>• Keep stock levels updated</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Approval Notice */}
            {!isEdit && (
              <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-orange-900 dark:text-orange-200 text-sm mb-1">Admin Approval Required</h4>
                    <p className="text-xs text-orange-800 dark:text-orange-300">
                      New products will be reviewed by admins before appearing in the marketplace.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
