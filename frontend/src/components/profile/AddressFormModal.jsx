import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { addressService } from '../../services/addressService';
import { showToast } from '../ui/Toast';

export function AddressFormModal({ address, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    label: '',
    isDefault: false
  });

  useEffect(() => {
    if (address) {
      setFormData({
        fullName: address.fullName || '',
        phoneNumber: address.phoneNumber || '',
        streetAddress: address.streetAddress || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        country: address.country || 'India',
        label: address.label || '',
        isDefault: address.isDefault || false
      });
    }
  }, [address]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = address 
        ? await addressService.updateAddress(address.id, data)
        : await addressService.createAddress(data);
      return response;
    },
    onSuccess: () => {
      showToast.success(address ? 'Address updated successfully' : 'Address added successfully');
      onSuccess();
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to save address';
      showToast.error(message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {address ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                pattern="[0-9]{10}"
                placeholder="10-digit number"
                required
                className="glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Street Address *
            </label>
            <Input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              placeholder="House no., Building name, Street"
              required
              className="glass-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                City *
              </label>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                State *
              </label>
              <Input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pincode *
              </label>
              <Input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                pattern="[0-9]{6}"
                placeholder="6-digit pincode"
                required
                className="glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Country *
              </label>
              <Input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Address Label (Optional)
              </label>
              <select
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border 
                  bg-white/80 dark:bg-slate-800/80 
                  text-slate-900 dark:text-white 
                  border-slate-300 dark:border-slate-600
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 
                  focus:border-blue-500 dark:focus:border-blue-400
                  hover:bg-slate-50 dark:hover:bg-slate-700/80
                  shadow-sm hover:shadow-md
                  transition-all duration-300
                  backdrop-blur-xl
                  cursor-pointer
                  [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="">Select Label</option>
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="peer w-5 h-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 dark:border-slate-500
                  bg-white dark:bg-slate-700
                  checked:bg-blue-500 dark:checked:bg-blue-600
                  checked:border-blue-500 dark:checked:border-blue-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                  transition-all duration-200
                  hover:border-blue-400 dark:hover:border-blue-500"
              />
              <svg
                className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <label htmlFor="isDefault" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
              Set as default shipping address
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="glass-button flex-1"
            >
              {mutation.isPending ? 'Saving...' : (address ? 'Update Address' : 'Add Address')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="glass-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
