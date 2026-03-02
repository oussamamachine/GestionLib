import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils/dateUtils';

/**
 * Loan History Timeline
 * Visual timeline of member's borrowing history
 */
export default function LoanHistoryTimeline({ loans = [] }) {
  if (!loans || loans.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No loan history yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Start borrowing books to build your reading timeline
        </p>
      </div>
    );
  }

  // Group loans by month
  const groupedLoans = loans.reduce((acc, loan) => {
    const date = new Date(loan.loanDate);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(loan);
    return acc;
  }, {});

  const getStatusConfig = (loan) => {
    if (loan.returnDate) {
      const loanDate = new Date(loan.loanDate);
      const returnDate = new Date(loan.returnDate);
      const daysToReturn = Math.floor((returnDate - loanDate) / (1000 * 60 * 60 * 24));
      
      return {
        icon: CheckCircle,
        color: 'emerald',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        label: 'Returned',
        subLabel: `Finished in ${daysToReturn} days`
      };
    }
    
    if (isOverdue(loan.dueDate)) {
      const daysOverdue = Math.abs(getDaysUntilDue(loan.dueDate));
      return {
        icon: AlertCircle,
        color: 'rose',
        bgColor: 'bg-rose-100',
        textColor: 'text-rose-700',
        borderColor: 'border-rose-200',
        label: 'Overdue',
        subLabel: `${daysOverdue} days overdue`
      };
    }
    
    const daysLeft = getDaysUntilDue(loan.dueDate);
    return {
      icon: Clock,
      color: daysLeft <= 3 ? 'amber' : 'blue',
      bgColor: daysLeft <= 3 ? 'bg-amber-100' : 'bg-blue-100',
      textColor: daysLeft <= 3 ? 'text-amber-700' : 'text-blue-700',
      borderColor: daysLeft <= 3 ? 'border-amber-200' : 'border-blue-200',
      label: 'Active',
      subLabel: `${daysLeft} days left`
    };
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
              <p className="text-xs text-gray-600">Total Loans</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {loans.filter(l => l.returnDate).length}
              </p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <Clock className="w-8 h-8 text-amber-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {loans.filter(l => !l.returnDate && !isOverdue(l.dueDate)).length}
              </p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200">
          <div className="flex items-center justify-between">
            <AlertCircle className="w-8 h-8 text-rose-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {loans.filter(l => !l.returnDate && isOverdue(l.dueDate)).length}
              </p>
              <p className="text-xs text-gray-600">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-bold text-gray-900">Reading Timeline</h3>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedLoans).map(([monthYear, monthLoans], groupIndex) => (
            <motion.div
              key={monthYear}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              {/* Month Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl">
                  <span className="text-sm font-bold text-primary-700">
                    {monthLoans.length}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{monthYear}</h4>
                  <p className="text-xs text-gray-500">
                    {monthLoans.length} {monthLoans.length === 1 ? 'book' : 'books'}
                  </p>
                </div>
              </div>

              {/* Loans in this month */}
              <div className="ml-6 border-l-4 border-gray-200 pl-6 space-y-4">
                {monthLoans.map((loan, loanIndex) => {
                  const status = getStatusConfig(loan);
                  const Icon = status.icon;

                  return (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (groupIndex * 0.1) + (loanIndex * 0.05) }}
                      className={`relative bg-white rounded-xl border-2 ${status.borderColor} p-4 hover:shadow-md transition-all`}
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[31px] w-4 h-4 ${status.bgColor} rounded-full border-4 border-white`} />

                      <div className="flex items-start gap-4">
                        {/* Book Icon */}
                        <div className={`flex-shrink-0 w-12 h-16 ${status.bgColor} rounded-lg flex items-center justify-center`}>
                          <BookOpen className={`w-6 h-6 ${status.textColor}`} />
                        </div>

                        {/* Loan Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-base">
                              {loan.book?.title || 'Unknown Book'}
                            </h4>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 ${status.bgColor} rounded-full flex-shrink-0`}>
                              <Icon className={`w-3 h-3 ${status.textColor}`} />
                              <span className={`text-xs font-bold ${status.textColor} uppercase`}>
                                {status.label}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {loan.book?.author || 'Unknown Author'}
                          </p>

                          {/* Dates */}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Borrowed: {formatDate(loan.loanDate)}</span>
                            </div>
                            
                            {loan.returnDate ? (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Returned: {formatDate(loan.returnDate)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Due: {formatDate(loan.dueDate)}</span>
                              </div>
                            )}
                          </div>

                          {/* Status Info */}
                          <div className={`mt-3 pt-3 border-t ${status.borderColor}`}>
                            <p className={`text-xs font-semibold ${status.textColor}`}>
                              {status.subLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reading Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-200 rounded-lg flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">Your Reading Journey</h4>
            <p className="text-sm text-gray-600 mb-3">
              You've borrowed {loans.length} books total. 
              {loans.filter(l => l.returnDate).length > 0 && 
                ` You've completed ${loans.filter(l => l.returnDate).length} books so far!`
              }
              {loans.filter(l => !l.returnDate && isOverdue(l.dueDate)).length > 0 && 
                ` You have ${loans.filter(l => !l.returnDate && isOverdue(l.dueDate)).length} overdue book(s).`
              }
            </p>
            {loans.filter(l => !l.returnDate).length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-gray-700">
                  Currently reading {loans.filter(l => !l.returnDate).length} {loans.filter(l => !l.returnDate).length === 1 ? 'book' : 'books'}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
