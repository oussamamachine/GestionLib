import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Star,
  Calendar,
  Target
} from 'lucide-react';

/**
 * Reading Statistics with Interactive Charts
 * Displays member's reading patterns and progress
 */
export default function ReadingStatistics({ stats }) {
  if (!stats) return null;

  const COLORS = {
    primary: '#2563eb',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    purple: '#9333ea',
    teal: '#0d9488'
  };

  const CHART_COLORS = [
    COLORS.primary,
    COLORS.success,
    COLORS.warning,
    COLORS.danger,
    COLORS.purple,
    COLORS.teal
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.name}: <span className="font-bold" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Reading Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-8 h-8" />
            <div className="text-right">
              <p className="text-2xl font-bold">{stats.totalBooksRead || 0}</p>
              <p className="text-sm opacity-90">Books Read</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{stats.readingGoalProgress || 0}% of yearly goal</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8" />
            <div className="text-right">
              <p className="text-2xl font-bold">{stats.averageReadingTime || 0}h</p>
              <p className="text-sm opacity-90">Avg. Reading Time</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Per book</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Star className="w-8 h-8" />
            <div className="text-right">
              <p className="text-2xl font-bold">{stats.favoriteGenre || 'N/A'}</p>
              <p className="text-sm opacity-90">Favorite Genre</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4" />
            <span>{stats.genreCount || 0} books</span>
          </div>
        </motion.div>
      </div>

      {/* Reading Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Reading Progress</h3>
            <p className="text-sm text-gray-500">Books read per month</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-primary-500"></div>
            <span className="text-gray-600">Books Completed</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stats.readingProgressData || []}>
            <defs>
              <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="books"
              stroke={COLORS.primary}
              strokeWidth={3}
              fill="url(#colorBooks)"
              name="Books Read"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Genre Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Reading by Genre</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.genreDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.genreDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Reading Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Reading Consistency</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyActivityData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="minutes" 
                fill={COLORS.success} 
                radius={[8, 8, 0, 0]}
                name="Minutes Read"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Reading Goals Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">2026 Reading Goals</h3>
        
        <div className="space-y-6">
          {stats.readingGoals?.map((goal, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{goal.name}</span>
                <span className="text-sm font-bold text-gray-900">
                  {goal.current} / {goal.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((goal.current / goal.target) * 100).toFixed(0)}% complete
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
