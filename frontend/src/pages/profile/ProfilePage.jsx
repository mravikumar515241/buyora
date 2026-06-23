import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Calendar, Edit2, Check, X, Heart, Bell } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { profileService } from '../../services/profileService';
import { addressService } from '../../services/addressService';
import { wishlistService } from '../../services/wishlistService';
import { discoveryService } from '../../services/discoveryService';
import { getSessionId } from '../../utils/sessionId';
import { ProductGrid } from '../../components/search/ProductGrid';
import { showToast } from '../../components/ui/Toast';
import { AddressCard } from '../../components/profile/AddressCard';
import { AddressFormModal } from '../../components/profile/AddressFormModal';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '' });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, addressId: null, addressName: '' });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileService.getProfile();
      const profileData = response.data.data;
      setFormData({
        fullName: profileData.fullName || '',
        phoneNumber: profileData.phoneNumber || ''
      });
      return profileData;
    }
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await addressService.getAddresses();
      return response.data.data;
    }
  });

  const { data: recentWishlist = [] } = useQuery({
    queryKey: ['wishlist-recent'],
    queryFn: () => wishlistService.getRecent(5),
  });

  const sessionId = getSessionId();
  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ['recently-viewed-profile', sessionId],
    queryFn: () => discoveryService.recentlyViewed(sessionId, 8),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      setIsEditing(false);
      showToast.success('Profile updated successfully');
    },
    onError: () => {
      showToast.error('Failed to update profile');
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      showToast.success('Address deleted successfully');
    },
    onError: () => {
      showToast.error('Failed to delete address');
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id) => addressService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      showToast.success('Default address updated');
    },
    onError: () => {
      showToast.error('Failed to set default address');
    }
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleDeleteClick = (address) => {
    setDeleteConfirm({
      show: true,
      addressId: address.id,
      addressName: address.fullName
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.addressId) {
      deleteAddressMutation.mutate(deleteConfirm.addressId);
    }
    setDeleteConfirm({ show: false, addressId: null, addressName: '' });
  };

  if (profileLoading || addressesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your personal information and addresses
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/wishlist"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-300 hover:shadow-md transition-all"
            >
              <Heart className="w-4 h-4 text-red-500" />
              My Wishlist
            </Link>
            <Link
              to="/settings/notifications"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-300 hover:shadow-md transition-all"
            >
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Notification settings
            </Link>
          </div>
        </div>

        {/* Profile Information Card */}
        <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Personal Information
            </h2>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="glass-button"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  pattern="[0-9]{10}"
                  placeholder="10-digit phone number"
                  className="glass-input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="glass-button flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: profile.fullName || '',
                      phoneNumber: profile.phoneNumber || ''
                    });
                  }}
                  className="glass-button"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Full Name</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {profile?.fullName || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-medium text-slate-900 dark:text-white">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {profile?.phoneNumber || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Member Since</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Wishlist */}
        <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Recent Wishlist
            </h2>
            <Link to="/wishlist">
              <Button variant="outline" size="sm" className="glass-button">View All</Button>
            </Link>
          </div>

          {recentWishlist.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-6">
              No saved items yet.{' '}
              <Link to="/products" className="text-indigo-600 dark:text-indigo-400 hover:underline">Browse products</Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentWishlist.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.productId}`}
                  className="flex gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{item.productName}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                      ₹{Number(item.currentPrice).toLocaleString('en-IN')}
                    </p>
                    {item.priceChanged && item.currentPrice < item.priceAtAdd && (
                      <p className="text-xs text-green-600 dark:text-green-400">Price dropped!</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recently Viewed</h2>
            <Link to="/search">
              <Button variant="outline" size="sm" className="glass-button">Browse More</Button>
            </Link>
          </div>
          {recentlyViewed.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-6">
              No recently viewed products.{' '}
              <Link to="/search" className="text-indigo-600 dark:text-indigo-400 hover:underline">Start shopping</Link>
            </p>
          ) : (
            <ProductGrid products={recentlyViewed.slice(0, 4)} />
          )}
        </Card>

        {/* Saved Addresses Section */}
        <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Saved Addresses
            </h2>
            <Button
              onClick={handleAddNewAddress}
              className="glass-button"
            >
              Add Address
            </Button>
          </div>

          {addresses?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No addresses found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Add your first shipping address
              </p>
              <Button onClick={handleAddNewAddress} className="glass-button">
                Add Address
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses?.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={() => handleEditAddress(address)}
                  onDelete={() => handleDeleteClick(address)}
                  onSetDefault={() => setDefaultMutation.mutate(address.id)}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Address Form Modal */}
      {showAddressModal && (
        <AddressFormModal
          address={editingAddress}
          onClose={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
          onSuccess={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
            queryClient.invalidateQueries(['addresses']);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, addressId: null, addressName: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Address"
        message={
          <>
            <p className="mb-2">Are you sure you want to delete this address?</p>
            <p className="font-semibold text-slate-900 dark:text-white">{deleteConfirm.addressName}</p>
          </>
        }
        confirmText="Delete Address"
        confirmVariant="danger"
      />
    </div>
  );
}
