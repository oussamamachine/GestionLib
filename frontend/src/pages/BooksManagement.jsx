import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { handleApiError } from '../utils/errorHandler';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { TableSkeleton } from '../components/Skeleton';
import BookDetailsModal from '../components/BookDetailsModal';
import AdvancedFilters, { ActiveFiltersDisplay } from '../components/AdvancedFilters';
import { EmptyBooksState, EmptySearchState } from '../components/EmptyState';
import toast from 'react-hot-toast';
import { Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BooksManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isLibrarian = user?.role === 'Librarian';
  const isMember = user?.role === 'Member';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 8,
    totalCount: 0,
    totalPages: 0
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    copiesAvailable: 1
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBooks(1);
    }, 400); // Increased debounce for smoother UX
    return () => clearTimeout(handler);
  }, [searchTerm, filters]);

  useEffect(() => {
    // Fetch categories for filter dropdown
    const fetchCategories = async () => {
      try {
        const res = await api.get('/books/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchBooks = async (page = pagination.page) => {
    try {
      setLoading(true);
      const response = await api.get('/books/paged', {
        params: {
          search: searchTerm,
          page,
          pageSize: pagination.pageSize,
          ...filters // Include filters in request
        }
      });
      setBooks(response.data.items);
      setPagination({
        page: response.data.page,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'copiesAvailable' ? parseInt(value) || 0 : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (formData.copiesAvailable < 0) errors.copiesAvailable = 'Cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, formData);
        toast.success('Book updated successfully');
      } else {
        await api.post('/books', formData);
        toast.success('Book created successfully');
      }
      fetchBooks();
      closeModal();
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.errors) {
        setFormErrors(apiError.errors);
      }
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;

    try {
      await api.delete(`/books/${book.id}`);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      handleApiError(error);
    }
  };

  const openEditModal = (e, book) => {
    e.stopPropagation();
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author || '',
      isbn: book.isbn || '',
      copiesAvailable: book.copiesAvailable
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDetails = (book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    setFormData({ title: '', author: '', isbn: '', copiesAvailable: 1 });
    setFormErrors({});
  };

  const handleBorrow = async (book) => {
    try {
      await api.post('/loans', { bookId: book.id });
      toast.success(`Borrowed "${book.title}" successfully!`);
      fetchBooks();
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns = [
    { 
      header: 'Title & Author', 
      accessor: 'title',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{row.title}</span>
          <span className="text-xs text-gray-500">{row.author || 'Unknown Author'}</span>
        </div>
      )
    },
    { header: 'ISBN', accessor: 'isbn', render: (row) => <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.isbn || 'N/A'}</code> },
    { 
      header: 'Status', 
      accessor: 'copiesAvailable',
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
          row.copiesAvailable > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.copiesAvailable > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {row.copiesAvailable > 0 ? `Available (${row.copiesAvailable})` : 'Out of Stock'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openDetails(row)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {(isAdmin || isLibrarian) && (
            <button 
              onClick={(e) => openEditModal(e, row)}
              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Edit Book"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {isAdmin && (
            <button 
              onClick={() => handleDelete(row)}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Book"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          
          {isMember && (
            <Button 
              size="sm" 
              disabled={row.copiesAvailable <= 0}
              onClick={() => handleBorrow(row)}
            >
              Borrow
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Catalogue Management</h2>
          <p className="text-sm text-gray-500">Manage, search and track all library resources.</p>
        </div>
        {(isAdmin || isLibrarian) && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-primary-500/20">
            <Plus className="w-4 h-4" /> Add New Book
          </Button>
        )}
      </div>

      <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            onApply={setFilters}
            onClear={() => setFilters({})}
            activeFilters={filters}
            filterConfig={{
              category: true,
              categories: categories,
              availability: true
            }}
          />
        </div>

        {/* Active Filters Display */}
        {Object.keys(filters).length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <ActiveFiltersDisplay
              filters={filters}
              onRemove={(key) => {
                const newFilters = { ...filters };
                delete newFilters[key];
                setFilters(newFilters);
              }}
              onClearAll={() => setFilters({})}
            />
          </div>
        )}

        <div className="bg-white">
          {loading ? (
             <div className="p-8"><TableSkeleton rows={8} cols={4} /></div>
          ) : books.length === 0 ? (
            // Show empty state with CTA
            searchTerm || Object.keys(filters).length > 0 ? (
              <EmptySearchState 
                searchTerm={searchTerm || 'your filters'} 
                onClearSearch={() => {
                  setSearchTerm('');
                  setFilters({});
                }}
              />
            ) : (
              <EmptyBooksState 
                onAddBook={() => {
                  setIsModalOpen(true);
                  setEditingBook(null);
                  setFormData({ title: '', author: '', isbn: '', copiesAvailable: 1 });
                }}
              />
            )
          ) : (
            <>
              <Table 
                columns={columns} 
                data={books} 
                onRowClick={openDetails}
              />
              
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={(e) => { e.stopPropagation(); fetchBooks(pagination.page - 1); }}
                    className="rounded-lg"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={(e) => { e.stopPropagation(); fetchBooks(pagination.page + 1); }}
                    className="rounded-lg"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <BookDetailsModal 
        book={selectedBook}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onBorrow={handleBorrow}
        isMember={isMember}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBook ? 'Update Catalog Record' : 'Register New Resource'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Book Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={formErrors.title}
            required
            placeholder="e.g. The Great Gatsby"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Author Name"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="e.g. F. Scott Fitzgerald"
            />
            <Input
              label="ISBN Code"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              placeholder="10 or 13 digits"
            />
          </div>
          <Input
            label="Total Inventory Copies"
            name="copiesAvailable"
            type="number"
            value={formData.copiesAvailable}
            onChange={handleInputChange}
            error={formErrors.copiesAvailable}
            required
          />
          <div className="flex gap-3 justify-end mt-8">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Discard Changes
            </Button>
            <Button type="submit">
              {editingBook ? 'Save Updates' : 'Add to Collection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
