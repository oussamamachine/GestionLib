import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';

/**
 * Notification Badge Component
 * Shows overdue alerts and notifications with badge count
 */
export default function NotificationBadge({ notifications = [], onClick }) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const overdueCount = notifications.filter(n => n.type === 'overdue').length;

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="relative text-gray-500 hover:text-primary-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
        aria-label={`${unreadCount} unread notifications`}
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge Count */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white ${
                overdueCount > 0 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-primary-500 text-white'
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

/**
 * Notification Dropdown Panel
 */
export function NotificationPanel({ notifications = [], onMarkAsRead, onMarkAllAsRead, isOpen }) {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'due_soon':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'returned':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (type) => {
    switch (type) {
      case 'overdue':
        return 'border-l-rose-500 bg-rose-50/50';
      case 'due_soon':
        return 'border-l-amber-500 bg-amber-50/50';
      case 'returned':
        return 'border-l-emerald-500 bg-emerald-50/50';
      default:
        return 'border-l-blue-500 bg-blue-50/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
        {notifications.some(n => !n.read) && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                  notification.read ? 'opacity-60' : ''
                } ${getPriorityColor(notification.type)}`}
                onClick={() => onMarkAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-gray-900 mb-1 ${
                      notification.read ? 'font-normal' : ''
                    }`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {notification.timeAgo}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
            View All Notifications
          </button>
        </div>
      )}
    </motion.div>
  );
}
