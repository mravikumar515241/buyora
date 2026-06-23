import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import { NotificationBellButton, NotificationDropdown } from './NotificationDropdown';

export function NotificationBell({ className = '' }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 30000,
  });

  return (
    <div className={`relative ${className}`} ref={anchorRef}>
      <NotificationBellButton
        onClick={() => setOpen((v) => !v)}
        unreadCount={unreadData?.count ?? 0}
        highestPriority={unreadData?.highestPriority ?? 'MEDIUM'}
      />
      <NotificationDropdown
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
      />
    </div>
  );
}
