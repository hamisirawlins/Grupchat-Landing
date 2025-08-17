'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Bell,
  Check,
  Trash2,
  Settings,
  ArrowLeft,
  Users,
  FolderOpen,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  MoreHorizontal
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Mock notifications data
  const allNotifications = [
    {
      id: "notif_001",
      type: "pool_invite",
      title: "Pool Invitation",
      message: "You've been invited to join 'Team Vacation Fund' pool by John Doe",
      data: { poolId: "550e8400-e29b-41d4-a716-446655440001", inviterName: "John Doe" },
      readAt: null,
      createdAt: "2024-10-15T10:30:00Z",
      actionRequired: true
    },
    {
      id: "notif_002",
      type: "deposit",
      title: "Deposit Successful",
      message: "Your contribution of KSh 5,000 to 'Office Equipment' has been processed successfully",
      data: { poolId: "550e8400-e29b-41d4-a716-446655440002", amount: 5000 },
      readAt: "2024-10-15T11:00:00Z",
      createdAt: "2024-10-15T09:15:00Z",
      actionRequired: false
    },
    {
      id: "notif_003",
      type: "withdrawal",
      title: "Withdrawal Request",
      message: "Sarah requested a withdrawal of KSh 15,000 from 'Emergency Fund'. Please review.",
      data: { poolId: "550e8400-e29b-41d4-a716-446655440003", amount: 15000, requesterName: "Sarah" },
      readAt: null,
      createdAt: "2024-10-14T16:20:00Z",
      actionRequired: true
    },
    {
      id: "notif_004",
      type: "approval_request",
      title: "Approval Required",
      message: "Your approval is needed for a withdrawal request in 'Team Vacation Fund'",
      data: { poolId: "550e8400-e29b-41d4-a716-446655440001", transactionId: "txn_003" },
      readAt: null,
      createdAt: "2024-10-14T14:45:00Z",
      actionRequired: true
    },
    {
      id: "notif_005",
      type: "pool_milestone",
      title: "Pool Milestone Reached",
      message: "'Emergency Fund' has reached 90% of its target amount!",
      data: { poolId: "550e8400-e29b-41d4-a716-446655440003", percentage: 90 },
      readAt: "2024-10-14T13:00:00Z",
      createdAt: "2024-10-14T12:30:00Z",
      actionRequired: false
    },
    {
      id: "notif_006",
      type: "payment_failed",
      title: "Payment Failed",
      message: "Your contribution of KSh 3,000 to 'Conference Fund' could not be processed. Please try again.",
      data: { poolId: "550e8400-e29b-41d4-a716-446655440004", amount: 3000 },
      readAt: null,
      createdAt: "2024-10-13T18:20:00Z",
      actionRequired: true
    },
    {
      id: "notif_007",
      type: "pool_complete",
      title: "Pool Completed",
      message: "'Conference Fund' has reached its target! Congratulations to all contributors.",
      data: { poolId: "550e8400-e29b-41d4-a716-446655440004" },
      readAt: "2024-10-13T15:30:00Z",
      createdAt: "2024-10-13T15:15:00Z",
      actionRequired: false
    }
  ];

  useEffect(() => {
    setNotifications(allNotifications);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.readAt;
    if (filter === 'action') return notification.actionRequired;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.readAt).length;
  const actionCount = notifications.filter(n => n.actionRequired).length;

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, readAt: new Date().toISOString() }
        : notif
    ));
  };

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    setNotifications(prev => prev.map(notif => 
      !notif.readAt ? { ...notif, readAt: now } : notif
    ));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      pool_invite: Users,
      deposit: ArrowDownLeft,
      withdrawal: ArrowUpRight,
      approval_request: AlertCircle,
      pool_milestone: CheckCircle,
      payment_failed: AlertCircle,
      pool_complete: CheckCircle
    };
    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      pool_invite: 'bg-blue-100 text-blue-600',
      deposit: 'bg-green-100 text-green-600',
      withdrawal: 'bg-purple-100 text-purple-600',
      approval_request: 'bg-orange-100 text-orange-600',
      pool_milestone: 'bg-emerald-100 text-emerald-600',
      payment_failed: 'bg-red-100 text-red-600',
      pool_complete: 'bg-green-100 text-green-600'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-600';
  };

  const NotificationCard = ({ notification }) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);

    return (
      <div className={`bg-white rounded-xl p-4 sm:p-6 border transition-all duration-300 hover:shadow-lg ${
        notification.readAt ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold ${notification.readAt ? 'text-gray-900' : 'text-gray-900'}`}>
                {notification.title}
              </h3>
              <div className="flex items-center gap-2 ml-4">
                {!notification.readAt && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className={`text-sm mb-3 ${notification.readAt ? 'text-gray-600' : 'text-gray-700'}`}>
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              
              {notification.actionRequired && (
                <div className="flex items-center gap-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                    Take Action
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout 
      title="Notifications"
      subtitle="Stay updated with your pool activities"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Mark All Read
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Notifications</p>
              <p className="text-xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unread</p>
              <p className="text-xl font-bold text-orange-600">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Action Required</p>
              <p className="text-xl font-bold text-red-600">{actionCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('action')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'action' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Action Required ({actionCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'unread' ? 'All notifications have been read' :
             filter === 'action' ? 'No actions required at this time' :
             'Your notifications will appear here'}
          </p>
          <button
            onClick={() => router.push('/pools')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Pools
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
