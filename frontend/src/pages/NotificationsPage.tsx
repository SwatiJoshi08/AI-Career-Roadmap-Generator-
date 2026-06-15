import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../features/acrg/api/notifications.api';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.getNotifications({ limit: 50 }),
  });

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      try {
        await notificationsApi.markAsRead(notification._id);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
    
    // Navigate based on type
    if (notification.type === 'MENTOR_FEEDBACK') {
      navigate('/roadmap');
    } else if (notification.type === 'GAP_ANALYSIS_COMPLETED') {
      navigate('/gap-analysis');
    }
  };

  const notifications = data?.data || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-gray-800" />
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-20" />)}
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <EmptyState
          icon={<Bell className="w-12 h-12" />}
          title="All caught up"
          description="You don't have any notifications right now."
        />
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {notifications.map((n: any) => (
              <div 
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={twMerge(clsx(
                  "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                  !n.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : "border-l-4 border-l-transparent"
                ))}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className={twMerge(clsx("text-sm font-medium", !n.isRead ? "text-gray-900" : "text-gray-600"))}>
                      {n.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
