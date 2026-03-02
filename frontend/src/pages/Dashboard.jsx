import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Overview from './Overview';
import AdminDashboard from './AdminDashboard.enhanced';
import MemberDashboard from './MemberDashboard.enhanced';
import BooksManagement from './BooksManagement';
import LoansManagement from './LoansManagement';
import UsersManagement from './UsersManagement';
import MyLoans from './MyLoans';
import Sidebar from '../components/Sidebar';
import NotificationBadge, { NotificationPanel } from '../components/NotificationBadge';
import { LogOut, Bell, Search } from 'lucide-react';
import api from '../services/api';
import { handleApiError } from '../utils/errorHandler';

export default function Dashboard({ role }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Sync active tab with URL query param for better UX (deep linking)
  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') !== activeTab) {
      params.set('tab', activeTab);
      navigate(`?${params.toString()}`, { replace: true });
    }
  }, [activeTab]);

  // Fetch notifications for overdue alerts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        // Silent fail for notifications
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      handleApiError(err);
    }
  };

  const renderContent = () => {
    const isAdmin = role === 'Admin' || role === 'Librarian';
    const isMember = role === 'Member';

    switch (activeTab) {
      case 'overview':
        if (isMember) return <MemberDashboard />;
        if (isAdmin) return <AdminDashboard role={role} />;
        return <Overview role={role} />;
      case 'books': return <BooksManagement />;
      case 'loans': return <LoansManagement />;
      case 'users': return <UsersManagement />;
      case 'myloans': return <MyLoans />;
      default: 
        if (isMember) return <MemberDashboard />;
        if (isAdmin) return <AdminDashboard role={role} />;
        return <Overview role={role} />;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ml-20 lg:ml-64">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 rounded-lg py-2 pl-10 pr-4 text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Badge with Dropdown */}
            <div className="relative">
              <NotificationBadge
                notifications={notifications}
                onClick={() => setShowNotifications(!showNotifications)}
              />
              {showNotifications && (
                <NotificationPanel
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  isOpen={showNotifications}
                />
              )}
              {showNotifications && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
              )}
            </div>
            
            <div className="h-8 w-px bg-gray-200"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.username}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
