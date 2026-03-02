import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils/dateUtils';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyMyLoansState } from '../components/EmptyState';
import toast from 'react-hot-toast';
import { BookOpen, CheckCircle, Clock, AlertCircle, RefreshCcw, History } from 'lucide-react';

export default function MyLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loans/my-loans');
      setLoans(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const handleReturnBook = async (loanId) => {
    if (!window.confirm('Return this book?')) return;

    try {
      await api.post(`/loans/${loanId}/return`);
      toast.success('Book returned successfully');
      fetchMyLoans();
    } catch (error) {
      handleApiError(error);
    }
  };

  const getStatusBadge = (loan) => {
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 uppercase">
          <Clock className="w-3 h-3" /> Due in {days} days
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">
        <Clock className="w-3 h-3" /> Active
      </span>
    );
  };

  const columns = [
    { 
      header: 'Book Title', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-10 bg-gray-100 rounded flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-gray-400" />
          </div>
          <span className="font-bold text-gray-900">{row.bookTitle}</span>
        </div>
      )
    },
    { 
      header: 'Loan Details', 
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="text-gray-500">Borrowed: {formatDate(row.loanDate)}</p>
          <p className={isOverdue(row.dueDate) && !row.returnDate ? 'text-rose-600 font-bold' : 'text-gray-400'}>
            Due: {formatDate(row.dueDate)}
          </p>
        </div>
      )
    },
    { header: 'Status', render: (row) => getStatusBadge(row) },
    {
      header: 'Actions',
      render: (row) => (
        !row.returnDate ? (
          <Button size="sm" variant="success" onClick={() => handleReturnBook(row.id)}>
            Check In
          </Button>
        ) : (
          <span className="text-xs text-gray-400">Archived</span>
        )
      )
    }
  ];

  if (loading) {
    return <div className="space-y-6"><TableSkeleton rows={4} /><TableSkeleton rows={4} /></div>;
  }

  const activeLoans = loans.filter(l => !l.returnDate);
  const returnedLoans = loans.filter(l => l.returnDate);

  return (
    <div className="space-y-10 pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">My Borrowing Activity</h2>
          <p className="text-sm text-gray-500">Manage your active loans and view your reading history.</p>
        </div>
        <button 
          onClick={fetchMyLoans}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-primary-600 font-bold mb-2">
          <Clock className="w-5 h-5" />
          <h3>Current Read ({activeLoans.length})</h3>
        </div>
        <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
          <div className="bg-white">
            {activeLoans.length === 0 ? (
              <EmptyMyLoansState />
            ) : (
              <Table
                columns={columns}
                data={activeLoans}
              />
            )}
          </div>
        </Card>
      </section>

      <section className="space-y-4 opacity-80">
        <div className="flex items-center gap-2 text-gray-500 font-bold mb-2">
          <History className="w-5 h-5" />
          <h3>Loan History</h3>
        </div>
        <Card className="overflow-hidden border-none shadow-md shadow-gray-200/30">
          <div className="bg-white">
            <Table
              columns={columns}
              data={returnedLoans}
              emptyMessage="No historical records found."
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
