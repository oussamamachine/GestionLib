import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import RealTimeDashboard from '../components/RealTimeDashboard';
import PersonalizedRecommendations, { RecommendationInsights } from '../components/PersonalizedRecommendations';
import ReadingStatistics from '../components/ReadingStatistics';
import LoanHistoryTimeline from '../components/LoanHistoryTimeline';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Star,
  History,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Enhanced Member Dashboard
 * Personalized experience with recommendations and statistics
 */
export default function MemberDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [readingStats, setReadingStats] = useState(null);
  const [loanHistory, setLoanHistory] = useState([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/statistics/member');
      setStats(res.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/books/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      handleApiError(err);
    }
  };

  const fetchReadingStats = async () => {
    try {
      const res = await api.get('/statistics/reading-stats');
      setReadingStats(res.data);
    } catch (err) {
      handleApiError(err);
    }
  };

  const fetchLoanHistory = async () => {
    try {
      const res = await api.get('/loans/my-history');
      setLoanHistory(res.data);
    } catch (err) {
      handleApiError(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecommendations();
    fetchReadingStats();
    fetchLoanHistory();
  }, []);

  const handleBorrowBook = async (book) => {
    try {
      await api.post('/loans', { bookId: book.id });
      toast.success(`Successfully borrowed "${book.title}"!`);
      fetchStats();
      fetchRecommendations();
    } catch (err) {
      handleApiError(err);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'recommendations', label: 'For You', icon: Sparkles },
    { id: 'statistics', label: 'My Stats', icon: TrendingUp },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome back, {user?.username}! 📚
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            Your personalized reading hub
          </p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Real-time Dashboard */}
            <RealTimeDashboard
              role="Member"
              fetchStats={fetchStats}
              stats={stats}
              loading={loading}
              autoRefresh={true}
              refreshInterval={30000}
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setActiveSection('recommendations')}
                className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-left hover:shadow-lg transition-all border border-purple-100"
              >
                <Sparkles className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Discover New Books
                </h3>
                <p className="text-gray-600 mb-4">
                  Get personalized recommendations based on your reading history
                </p>
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  <span>View Recommendations</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => setActiveSection('statistics')}
                className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-left hover:shadow-lg transition-all border border-blue-100"
              >
                <TrendingUp className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Your Reading Stats
                </h3>
                <p className="text-gray-600 mb-4">
                  Track your progress and see your reading patterns over time
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <span>View Statistics</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Featured Recommendations Preview */}
            {recommendations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Top Picks for You
                  </h3>
                  <button
                    onClick={() => setActiveSection('recommendations')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    See all →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.slice(0, 3).map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-primary-400" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">
                          {book.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-3">{book.author}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-semibold text-gray-900">
                              {book.matchScore}%
                            </span>
                          </div>
                          <button
                            onClick={() => handleBorrowBook(book)}
                            disabled={book.availableCopies === 0}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              book.availableCopies > 0
                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Borrow
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'recommendations' && (
          <div className="space-y-6">
            <RecommendationInsights insights={stats?.recommendationInsights} />
            <PersonalizedRecommendations
              recommendations={recommendations}
              onBorrowBook={handleBorrowBook}
            />
          </div>
        )}

        {activeSection === 'statistics' && (
          <ReadingStatistics stats={readingStats} />
        )}

        {activeSection === 'history' && (
          <LoanHistoryTimeline loans={loanHistory} />
        )}
      </motion.div>
    </div>
  );
}
