import React, { useState, useEffect, useCallback, memo } from 'react';
import { useFetch, useMutation } from '../hooks';
import { handleApiError } from '../utils/errorHandler';
import { formatDate } from '../utils/dateUtils';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';
import SearchableSelect from '../components/ComboBox';
import { LoanStatusBadge } from '../components/LoanStatusBadge';
import toast from 'react-hot-toast';
import { History, Plus, CheckCircle, Search } from 'lucide-react';

// Memoized timeline component
const LoanTimeline = memo(({ loan }) => {
  const { loanDate, dueDate, returnDate } = loan;
  const isReturned = !!returnDate;
  
  return (
    <div className="flex flex-col text-xs space-y-0.5">
      <span className="text-gray-500">Issued: {formatDate(loanDate)}</span>
      <span className={!isReturned && new Date(dueDate) < new Date() ? 'text-rose-600 font-bold' : 'text-gray-500'}>
        Due: {formatDate(dueDate)}
      </span>
    </div>
  );
});

LoanTimeline.displayName = 'LoanTimeline';

export default function LoansManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ userId: '', bookId: '' });

  // Use custom hooks for data fetching
  const { 
    data: loans = [], 
    loading: loansLoading, 
    refetch: refetchLoans 
  } = useFetch('/loans');
  
  const { 
    data: books = [], 
    loading: booksLoading 
  } = useFetch('/books');
  
  const { 
    data: users = [], 
    loading: usersLoading 
  } = useFetch('/users');

  const { mutate, loading: mutating } = useMutation();

  const loading = loansLoading || booksLoading || usersLoading;

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.bookId) {
      toast.error('Please select both a user and a book');
      return;
    }

    try {
      await mutate('post', '/loans', {
        userId: parseInt(formData.userId),
        bookId: parseInt(formData.bookId)
      });
      toast.success('Loan created successfully');
      refetchLoans();
      closeModal();
    } catch (error) {
      // Error handled by mutate
    }
  };

  const handleReturnBook = async (loanId) => {
    if (!window.confirm('Mark this book as returned?')) return;

    try {
      await mutate('post', `/loans/${loanId}/return`);
      toast.success('Book returned successfully');
      refetchLoans();
    } catch (error) {
      // Error handled by mutate
    }
  };

  const openCreateModal = useCallback(() => {
    setFormData({ userId: '', bookId: '' });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormData({ userId: '', bookId: '' });
  }, []);

  const columns = [
    { 
      header: 'Member', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{row.username}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: #{row.userId}</span>
        </div>
      )
    },
    { 
      header: 'Book Title', 
      render: (row) => <span className="font-medium text-gray-800 line-clamp-1">{row.bookTitle}</span> 
    },
    { 
      header: 'Timeline', 
      render: (row) => <LoanTimeline loan={row} />
    },
    { 
      header: 'Status', 
      render: (row) => <LoanStatusBadge loan={row} />
    },
    {
      header: 'Actions',
      render: (row) => (
        !row.returnDate ? (
          <Button 
            size="sm" 
            variant="success" 
            onClick={() => handleReturnBook(row.id)}
            disabled={mutating}
          >
            Return Item
          </Button>
        ) : (
          <span className="text-xs text-gray-400 italic">Returned on {formatDate(row.returnDate)}</span>
        )
      )
    }
  ];

  const bookOptions = books
    .filter(b => b.copiesAvailable > 0)
    .map(b => ({ id: b.id, label: `${b.title} (${b.copiesAvailable} copies)` }));
    
  const userOptions = users.map(u => ({ id: u.id, label: `${u.username} (${u.email})` }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Circulation Records</h2>
          <p className="text-sm text-gray-500">Track current loans, manage returns, and issue new items.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2 shadow-lg shadow-primary-500/20">
          <Plus className="w-4 h-4" /> Issue New Loan
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 text-primary-600 font-bold">
            <History className="w-5 h-5" />
            <span>Active Transactions</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter loans..." 
              className="pl-9 pr-4 py-1.5 bg-gray-50 border-none text-sm rounded-lg focus:ring-2 focus:ring-primary-500" 
            />
          </div>
        </div>

        <div className="bg-white">
          {loading ? (
             <div className="p-8"><TableSkeleton rows={6} cols={5} /></div>
          ) : (
            <Table columns={columns} data={loans} emptyMessage="No transactions history found." />
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Issue New Circulation"
      >
        <form onSubmit={handleCreateLoan} className="space-y-4">
          <SearchableSelect
            label="Select Member"
            placeholder="Search for a library member..."
            options={userOptions}
            value={formData.userId}
            onChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
          />
          <SearchableSelect
            label="Select Book"
            placeholder="Search for available books..."
            options={bookOptions}
            value={formData.bookId}
            onChange={(value) => setFormData(prev => ({ ...prev, bookId: value }))}
          />
          <div className="flex gap-3 justify-end mt-8">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutating}>
              Create Loan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
