import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils/dateUtils';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';
import SearchableSelect from '../components/ComboBox';
import { EmptyLoansState } from '../components/EmptyState';
import toast from 'react-hot-toast';
import { History, Plus, CheckCircle, Clock, AlertCircle, Search, Calendar } from 'lucide-react';

export default function LoansManagement() {
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    bookId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, booksRes, usersRes] = await Promise.all([
        api.get('/loans'),
        api.get('/books'),
        api.get('/users')
      ]);
      setLoans(loansRes.data);
      setBooks(booksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.bookId) {
      toast.error('Please select both a user and a book');
      return;
    }
    try {
      await api.post('/loans', {
        userId: parseInt(formData.userId),
        bookId: parseInt(formData.bookId)
      });
      toast.success('Loan created successfully');
      fetchData();
      closeModal();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleReturnBook = async (loanId) => {
    if (!window.confirm('Mark this book as returned?')) return;

    try {
      await api.post(`/loans/${loanId}/return`);
      toast.success('Book returned successfully');
      fetchData();
    } catch (error) {
      handleApiError(error);
    }
  };

  const openCreateModal = () => {
    setFormData({ userId: '', bookId: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ userId: '', bookId: '' });
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
      render: (row) => (
        <div className="flex flex-col text-xs space-y-0.5">
          <span className="text-gray-500">Issued: {formatDate(row.loanDate)}</span>
          <span className={isOverdue(row.dueDate) && !row.returnDate ? 'text-rose-600 font-bold' : 'text-gray-500'}>
            Due: {formatDate(row.dueDate)}
          </span>
        </div>
      ) 
    },
    { header: 'Status', render: (row) => getStatusBadge(row) },
    {
      header: 'Actions',
      render: (row) => (
        !row.returnDate ? (
          <Button size="sm" variant="success" onClick={() => handleReturnBook(row.id)}>
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
          ) : loans.length === 0 ? (
            <EmptyLoansState 
              onCreateLoan={() => {
                setIsModalOpen(true);
                setFormData({ userId: '', bookId: '' });
              }}
            />
          ) : (
            <Table columns={columns} data={loans} />
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Create New Loan Record"
      >
        <form onSubmit={handleCreateLoan} className="space-y-6">
          <SearchableSelect
            label="Library Member"
            options={userOptions}
            value={formData.userId}
            onChange={(val) => setFormData({ ...formData, userId: val })}
            placeholder="Search by name or email..."
          />
          
          <SearchableSelect
            label="Item to Issue"
            options={bookOptions}
            value={formData.bookId}
            onChange={(val) => setFormData({ ...formData, bookId: val })}
            placeholder="Search by title or ISBN..."
          />

          <div className="bg-amber-50 p-4 rounded-xl flex gap-3">
             <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
             <div className="text-xs text-amber-800 leading-relaxed">
               <p className="font-bold mb-1">Due Date Calculation:</p>
               <p>The standard loan period is 14 days. This item will be due on <strong>{formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())}</strong>.</p>
             </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              Complete Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
