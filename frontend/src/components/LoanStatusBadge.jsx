import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { isOverdue, getDaysUntilDue } from '../utils/dateUtils';

/**
 * Reusable loan status badge component
 */
export const LoanStatusBadge = ({ loan }) => {
  if (loan.returnDate) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 uppercase">
        <CheckCircle className="w-3 h-3" /> Returned
      </span>
    );
  }
  
  if (isOverdue(loan.dueDate)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 uppercase">
        <AlertCircle className="w-3 h-3" /> Overdue
      </span>
    );
  }
  
  const days = getDaysUntilDue(loan.dueDate);
  if (days <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 uppercase animate-pulse">
        <Clock className="w-3 h-3" /> Due Soon
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">
      <Clock className="w-3 h-3" /> Active
    </span>
  );
};
