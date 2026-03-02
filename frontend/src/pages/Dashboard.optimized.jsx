import React, { useState, useEffect, lazy, Suspense, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Spinner from '../components/Spinner';
import { LogOut, Bell, Search } from 'lucide-react';

// Lazy load tab components for better performance
const Overview = lazy(() => import('./Overview'));
const BooksManagement = lazy(() => import('./BooksManagement.refactored'));
const LoansManagement = lazy(() => import('./LoansManagement'));
const UsersManagement = lazy(() => import('./UsersManagement'));
const MyLoans = lazy(() => import('./MyLoans'));

// Memoized header component
const DashboardHeader = memo(({ user, role, onLogout }) => {
  return (
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
        <button className="relative text-gray-500 hover:text-primary-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
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
  );
});

DashboardHeader.displayName = 'DashboardHeader';

// Loading fallback for lazy loaded components
const ContentLoader = () => (
  <div className="flex items-center justify-center py-20">
    <Spinner size="lg" />
  </div>
);

export default function Dashboard({ role }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview role={role} />;
      case 'books': return <BooksManagement />;
      case 'loans': return <LoansManagement />;
      case 'users': return <UsersManagement />;
      case 'myloans': return <MyLoans />;
      default: return <Overview role={role} />;
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
        <DashboardHeader user={user} role={role} onLogout={logout} />

        <main className="flex-1 p-8">
          <Suspense fallback={<ContentLoader />}>
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
          </Suspense>
        </main>
      </div>
    </div>
  );
}
