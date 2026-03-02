import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import StatsCard from './StatsCard';
import { StatsSkeleton } from './Skeleton';

/**
 * Real-time Dashboard with Auto-refresh
 * Polls data every 30 seconds for live metrics
 */
export default function RealTimeDashboard({ 
  role, 
  fetchStats, 
  stats, 
  loading,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchStats();
      setLastUpdate(new Date());
    } finally {
      // Add small delay for UX (shows spinner)
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [fetchStats]);

  const getTimeElapsed = () => {
    const seconds = Math.floor((new Date() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const isAdmin = role === 'Admin' || role === 'Librarian';

  if (loading && !stats) return <StatsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Real-time Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-emerald-500 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">Live Dashboard</p>
            <p className="text-xs text-gray-500">
              Last updated: {getTimeElapsed()}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-primary-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Grid with Live Updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <motion.div
              key={stats?.totalBooks}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <StatsCard 
                title="Total Books" 
                value={stats?.totalBooks || 0}
                icon={<Book className="w-6 h-6" />}
                color="indigo"
                trend={stats?.booksTrend}
                trendLabel="vs last month"
                realTime
              />
            </motion.div>

            <motion.div
              key={stats?.activeLoans}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <StatsCard 
                title="Active Loans" 
                value={stats?.activeLoans || 0}
                icon={<Clock className="w-6 h-6" />}
                color="blue"
                trend={stats?.loansTrend}
                trendLabel="vs last week"
                realTime
              />
            </motion.div>

            <motion.div
              key={stats?.overdueLoans}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <StatsCard 
                title="Overdue" 
                value={stats?.overdueLoans || 0}
                icon={<AlertCircle className="w-6 h-6" />}
                color="rose"
                alert={stats?.overdueLoans > 0}
                realTime
              />
            </motion.div>

            <motion.div
              key={stats?.totalUsers}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              <StatsCard 
                title="Active Users" 
                value={stats?.totalUsers || 0}
                icon={<Users className="w-6 h-6" />}
                color="emerald"
                trend={stats?.usersTrend}
                trendLabel="this month"
                realTime
              />
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              key={stats?.myActiveLoans}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <StatsCard 
                title="My Books" 
                value={stats?.myActiveLoans || 0}
                icon={<Book className="w-6 h-6" />}
                color="indigo"
                realTime
              />
            </motion.div>

            <motion.div
              key={stats?.myOverdueLoans}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <StatsCard 
                title="Overdue" 
                value={stats?.myOverdueLoans || 0}
                icon={<AlertCircle className="w-6 h-6" />}
                color="rose"
                alert={stats?.myOverdueLoans > 0}
                realTime
              />
            </motion.div>

            <motion.div
              key={stats?.totalBooksRead}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <StatsCard 
                title="Books Read" 
                value={stats?.totalBooksRead || 0}
                icon={<CheckCircle className="w-6 h-6" />}
                color="emerald"
                realTime
              />
            </motion.div>

            <motion.div
              key={stats?.readingStreak}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              <StatsCard 
                title="Reading Streak" 
                value={`${stats?.readingStreak || 0} days`}
                icon={<Activity className="w-6 h-6" />}
                color="purple"
                realTime
              />
            </motion.div>
          </>
        )}
      </div>

      {/* Real-time Activity Feed */}
      {isAdmin && stats?.recentActivity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 text-sm"
              >
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5" />
                <div className="flex-1">
                  <p className="text-gray-900">{activity.message}</p>
                  <p className="text-gray-500 text-xs">{activity.timeAgo}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
