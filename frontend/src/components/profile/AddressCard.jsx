import { MapPin, Phone, Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '../ui/Button';

export function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  return (
    <div className={`
      relative p-4 rounded-xl border transition-all
      ${address.isDefault 
        ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
      }
      backdrop-blur-xl
    `}>
      {address.isDefault && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs font-medium rounded-full">
          <Star className="w-3 h-3 fill-current" />
          Default
        </div>
      )}

      <div className="space-y-3">
        {/* Name and Phone */}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {address.fullName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
            <Phone className="w-4 h-4" />
            {address.phoneNumber}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>{address.streetAddress}</p>
            <p>{address.city}, {address.state} - {address.pincode}</p>
            <p>{address.country}</p>
          </div>
        </div>

        {/* Label */}
        {address.label && (
          <div className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md">
            {address.label}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="flex-1 glass-button text-xs"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          
          {!address.isDefault && (
            <Button
              size="sm"
              variant="outline"
              onClick={onSetDefault}
              className="flex-1 glass-button text-xs"
            >
              <Star className="w-3 h-3 mr-1" />
              Set Default
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="glass-button text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
