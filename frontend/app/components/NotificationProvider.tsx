'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/lib/store';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';
import { onChallengeSolved } from '@/lib/socket';
import { useAuthStore } from '@/lib/store';

export function NotificationProvider() {
  const { notifications, removeNotification, addNotification } = useNotificationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onChallengeSolved((data) => {
      addNotification({
        type: 'info',
        message: `${data.username} solved ${data.challengeTitle} (+${data.points})`,
      });
    });

    return () => unsubscribe();
  }, [user, addNotification]);

  useEffect(() => {
    const timers = notifications.map((n) =>
      setTimeout(() => removeNotification(n.id), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-success/20 border border-success text-success'
              : notification.type === 'error'
              ? 'bg-error/20 border border-error text-error'
              : 'bg-secondary/20 border border-secondary text-secondary-foreground'
          }`}
        >
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <XCircle className="w-5 h-5" />}
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
