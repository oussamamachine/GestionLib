import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { StatsSkeleton } from '../components/Skeleton';
import { handleApiError } from '../utils/errorHandler';
import { 
  Book, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  ArrowRight,
  RefreshCw,
  Search,
  Star,
  History,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/dateUtils';
import Card from '../components/Card';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

export default function Overview({ role }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/statistics');
      setStats(res.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <StatsSkeleton />;
  if (!stats) return null;

  const isAdmin = role === 'Admin' || role === 'Librarian';

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isAdmin ? 'Library Pulse' : 'Personal Shelf'}
          </h2>
          <p className="text-gray-500 font-medium">
            {isAdmin 
              ? 'Comprehensive system diagnostics and circulation metrics.' 
              : 'Keep track of your reading journey and discover new gems.'}
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatsCard 
              title="Global Catalog" 
              value={stats.totalBooks} 
              icon={<Book className="w-6 h-6" />}
              color="indigo"
            />
            <StatsCard 
              title="Currently Available" 
              value={stats.availableBooks} 
              icon={<CheckCircle className="w-6 h-6" />}
              color="emerald"
            />
            <StatsCard 
              title="In Circulation" 
              value={stats.activeLoans} 
              icon={<Clock className="w-6 h-6" />}
              color="amber"
            />
            <StatsCard 
              title="Overdue" 
              value={stats.overdueLoans} 
              icon={<AlertCircle className="w-6 h-6" />}
              color="rose"
            />
          </>
        ) : (
          <>
            <StatsCard 
              title="Books Read" 
              value={stats.totalLoans} 
              icon={<History className="w-6 h-6" />}
              color="indigo"
            />
            <StatsCard 
              title="In My Bag" 
              value={stats.activeLoans} 
              icon={<Book className="w-6 h-6" />}
              color="emerald"
            />
            <StatsCard 
              title="Due Soon" 
              value={stats.overdueLoans} 
              icon={<Clock className="w-6 h-6" />}
              color="amber"
            />
            <StatsCard 
              title="Reading Goal" 
              value="85%" 
              icon={<TrendingUp className="w-6 h-6" />}
              color="primary"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm font-bold text-primary-600 hover:text-primary-700">View All</button>
          </div>
          
          <div className="space-y-4">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/5 transition-all group"
                >
                  <div className={`p-3 rounded-xl ${
                    activity.type === 'Loan' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {activity.type === 'Loan' ? <Book className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(activity.timestamp)}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No recent activity detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Features */}
        <div className="space-y-8">
          {isAdmin ? (
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <Link to="/dashboard?tab=loans" className="flex items-center justify-between p-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all group shadow-lg shadow-primary-600/20">
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5" />
                    <span className="font-bold">Issue New Book</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/dashboard?tab=books" className="flex items-center justify-between p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:border-primary-200 hover:bg-primary-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-primary-500" />
                    <span className="font-bold">Manage Catalog</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>
          ) : (
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Discovery</h3>
              <Card className="bg-gradient-to-br from-indigo-900 to-primary-900 text-white border-none p-6 shadow-2xl shadow-primary-900/40">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Featured Pick</span>
                </div>
                <h4 className="text-lg font-black leading-tight mb-2">The Midnight Library</h4>
                <p className="text-sm text-indigo-100 opacity-80 mb-6">Explore millions of lives you could have lived in this modern masterpiece.</p>
                <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm">
                  View Book Details
                </Button>
              </Card>

              <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  Popular Genres
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Fiction', 'Sci-Fi', 'Biography', 'History', 'Crime'].map(g => (
                    <span key={g} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100 hover:border-primary-200 hover:text-primary-600 cursor-pointer transition-all">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
