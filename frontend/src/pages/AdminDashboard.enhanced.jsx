import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import RealTimeDashboard from '../components/RealTimeDashboard';
import AdvancedFilters, { ActiveFiltersDisplay } from '../components/AdvancedFilters';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Activity,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

/**
 * Enhanced Admin Dashboard with Real-time Metrics and Analytics
 */
export default function AdminDashboard({ role }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/statistics', { params: filters });
      setStats(res.data);
      
      // Fetch analytics data
      const analyticsRes = await api.get('/statistics/analytics');
      setAnalyticsData(analyticsRes.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Set up auto-refresh (data will be re-fetched by RealTimeDashboard component)
  }, [filters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('/statistics/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `library-stats-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      handleApiError(err);
    }
  };

  const isAdmin = role === 'Admin' || role === 'Librarian';

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isAdmin ? 'Library Pulse' : 'Personal Dashboard'}
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            {isAdmin 
              ? 'Real-time metrics and comprehensive analytics' 
              : 'Your reading journey at a glance'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <AdvancedFilters
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                activeFilters={filters}
                filterConfig={{
                  status: true,
                  dateRange: true,
                  userRole: true
                }}
              />
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-primary-200 hover:bg-primary-50 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <ActiveFiltersDisplay
          filters={filters}
          onRemove={(key) => {
            const newFilters = { ...filters };
            delete newFilters[key];
            setFilters(newFilters);
          }}
          onClearAll={handleClearFilters}
        />
      )}

      {/* Real-time Dashboard */}
      <RealTimeDashboard
        role={role}
        fetchStats={fetchStats}
        stats={stats}
        loading={loading}
        autoRefresh={true}
        refreshInterval={30000}
      />

      {isAdmin && analyticsData && (
        <>
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loan Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Loan Activity</h3>
                  <p className="text-sm text-gray-500">Last 7 days</p>
                </div>
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analyticsData.loanTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="loans" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    name="New Loans"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="returns" 
                    stroke="#059669" 
                    strokeWidth={3}
                    name="Returns"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Popular Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Popular Categories</h3>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
                <BookOpen className="w-5 h-5 text-primary-600" />
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData.popularCategories || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#2563eb" 
                    radius={[8, 8, 0, 0]}
                    name="Loans"
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/dashboard?tab=books"
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-8 h-8 text-primary-600" />
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Manage Books</h3>
              <p className="text-sm text-gray-500">Add, edit, or remove books from the collection</p>
            </Link>

            <Link
              to="/dashboard?tab=loans"
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-emerald-600" />
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Track Loans</h3>
              <p className="text-sm text-gray-500">Monitor active loans and returns</p>
            </Link>

            <Link
              to="/dashboard?tab=users"
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-600" />
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Manage Users</h3>
              <p className="text-sm text-gray-500">Handle member accounts and permissions</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
