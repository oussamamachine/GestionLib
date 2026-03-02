import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Star, 
  TrendingUp, 
  Sparkles,
  ThumbsUp,
  Clock,
  Tag
} from 'lucide-react';

/**
 * Personalized Book Recommendations
 * AI-powered suggestions based on reading history
 */
export default function PersonalizedRecommendations({ recommendations = [], onBorrowBook }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No recommendations available yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Borrow more books to get personalized suggestions
        </p>
      </div>
    );
  }

  const getMatchScore = (score) => {
    if (score >= 90) return { label: 'Perfect Match', color: 'emerald' };
    if (score >= 75) return { label: 'Great Match', color: 'blue' };
    if (score >= 60) return { label: 'Good Match', color: 'amber' };
    return { label: 'Worth Trying', color: 'gray' };
  };

  const getReasonIcon = (reason) => {
    switch (reason) {
      case 'genre':
        return <Tag className="w-4 h-4" />;
      case 'author':
        return <Star className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'similar':
        return <ThumbsUp className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
          <p className="text-sm text-gray-500">Curated based on your reading habits</p>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((book, index) => {
          const match = getMatchScore(book.matchScore);
          
          return (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Book Cover */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-primary-400" />
                
                {/* Match Score Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-${match.color}-100 text-${match.color}-700 flex items-center gap-1`}>
                  <Star className="w-3 h-3" />
                  {book.matchScore}%
                </div>

                {/* New Badge */}
                {book.isNew && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold bg-rose-500 text-white">
                    NEW
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="p-5 space-y-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-base mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-sm text-gray-500">{book.author}</p>
                </div>

                {/* Match Reason */}
                <div className="flex items-center gap-2 text-sm">
                  <div className={`p-1.5 rounded-lg bg-${match.color}-100`}>
                    {getReasonIcon(book.recommendationReason)}
                  </div>
                  <span className="text-gray-600">
                    {book.recommendationReason === 'genre' && 'Matches your taste'}
                    {book.recommendationReason === 'author' && 'Author you like'}
                    {book.recommendationReason === 'trending' && 'Popular now'}
                    {book.recommendationReason === 'similar' && 'Similar to books you read'}
                  </span>
                </div>

                {/* Rating & Availability */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {book.rating || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({book.reviews || 0})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs">
                    {book.availableCopies > 0 ? (
                      <span className="text-emerald-600 font-semibold">
                        {book.availableCopies} available
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold">
                        Not available
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onBorrowBook && onBorrowBook(book)}
                  disabled={book.availableCopies === 0}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    book.availableCopies > 0
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {book.availableCopies > 0 ? 'Borrow Now' : 'Unavailable'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Why These Recommendations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-200 rounded-lg flex-shrink-0">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">How we choose these books</h4>
            <p className="text-sm text-gray-600 mb-3">
              Our recommendation engine analyzes your reading history, favorite genres, and ratings to suggest books you'll love.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700">
                Your genre preferences
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700">
                Similar readers
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700">
                Community ratings
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700">
                New arrivals
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Recommendation Reasons Breakdown
 */
export function RecommendationInsights({ insights }) {
  const reasons = [
    {
      icon: Tag,
      title: 'Genre Match',
      description: 'Books in your favorite genres',
      count: insights?.genreMatches || 0,
      color: 'blue'
    },
    {
      icon: Star,
      title: 'Favorite Authors',
      description: 'New books from authors you love',
      count: insights?.authorMatches || 0,
      color: 'amber'
    },
    {
      icon: TrendingUp,
      title: 'Trending',
      description: 'Popular books right now',
      count: insights?.trendingBooks || 0,
      color: 'rose'
    },
    {
      icon: ThumbsUp,
      title: 'Similar Reads',
      description: 'Based on books you enjoyed',
      count: insights?.similarBooks || 0,
      color: 'emerald'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {reasons.map((reason, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-${reason.color}-50 rounded-xl p-4 border border-${reason.color}-100`}
        >
          <reason.icon className={`w-6 h-6 text-${reason.color}-600 mb-2`} />
          <p className="text-2xl font-bold text-gray-900 mb-1">{reason.count}</p>
          <p className="text-xs font-semibold text-gray-900 mb-1">{reason.title}</p>
          <p className="text-xs text-gray-500">{reason.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
