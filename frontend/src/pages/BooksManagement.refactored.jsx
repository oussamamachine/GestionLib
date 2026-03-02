import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePagination, useDebounce, useMutation } from '../hooks';
import api from '../services/api';
import { handleApiError, formatValidationErrors } from '../utils/errorHandler';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { TableSkeleton } from '../components/Skeleton';
import BookDetailsModal from '../components/BookDetailsModal';
import { SearchInput } from '../components/SearchInput';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';
import { Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';

// Memoized book actions component
const BookActions = memo(({ 
  book, 
  isAdmin, 
  isLibrarian, 
  isMember, 
  onView,
  onEdit, 
  onDelete, 
  onBorrow 
}) => {
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onView(book)}
        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      
      {(isAdmin || isLibrarian) && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(book); }}
            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit Book"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {isAdmin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(book); }}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Book"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </>
      )}
      
      {isMember && (
        <Button 
          size="sm" 
          disabled={book.copiesAvailable <= 0}
          onClick={(e) => { e.stopPropagation(); onBorrow(book); }}
        >
          Borrow
        </Button>
      )}
    </div>
  );
});

BookActions.displayName = 'BookActions';

export default function BooksManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isLibrarian = user?.role === 'Librarian';
  const isMember = user?.role === 'Member';

  // State management
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  
  // Pagination hook
  const { pagination, setPage, updatePaginationData, nextPage, prevPage } = usePagination(8);
  
  // Mutation hook for create/update/delete
  const { mutate, loading: mutating } = useMutation();
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    copiesAvailable: 1
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch books with pagination and search
  const fetchBooks = useCallback(async (page = pagination.page) => {
    try {
      setLoading(true);
      const response = await api.get('/books/paged', {
        params: {
          search: debouncedSearch,
          page,
          pageSize: pagination.pageSize
        }
      });
      setBooks(response.data.items);
      updatePaginationData({
        page: response.data.page,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.pageSize, updatePaginationData]);

  // Fetch on mount and when debounced search changes
  useEffect(() => {
    fetchBooks(1);
  }, [debouncedSearch]);

  // Form handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'copiesAvailable' ? parseInt(value) || 0 : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (formData.copiesAvailable < 0) errors.copiesAvailable = 'Cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingBook) {
        await mutate('put', `/books/${editingBook.id}`, formData);
        toast.success('Book updated successfully');
      } else {
        await mutate('post', '/books', formData);
        toast.success('Book created successfully');
      }
      fetchBooks();
      closeModal();
    } catch (error) {
      if (error.errors) {
        setFormErrors(formatValidationErrors(error.errors));
      }
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;

    try {
      await mutate('delete', `/books/${book.id}`);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      // Error already handled by mutate
    }
  };

  const handleBorrow = async (book) => {
    try {
      await mutate('post', '/loans', { bookId: book.id });
      toast.success(`Borrowed "${book.title}" successfully!`);
      fetchBooks();
    } catch (error) {
      // Error already handled by mutate
    }
  };

  const openEditModal = useCallback((book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author || '',
      isbn: book.isbn || '',
      copiesAvailable: book.copiesAvailable
    });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const openDetails = useCallback((book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingBook(null);
    setFormData({ title: '', author: '', isbn: '', copiesAvailable: 1 });
    setFormErrors({});
  }, []);

  // Table columns configuration
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
    { 
      header: 'ISBN', 
      accessor: 'isbn', 
      render: (row) => <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.isbn || 'N/A'}</code> 
    },
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
        <BookActions
          book={row}
          isAdmin={isAdmin}
          isLibrarian={isLibrarian}
          isMember={isMember}
          onView={openDetails}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onBorrow={handleBorrow}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Main Card */}
      <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-white">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, author or ISBN..."
            className="flex-1 max-w-md"
          />
          <button className="px-3 py-2 bg-gray-50 rounded-xl text-gray-500 hover:text-primary-600 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white">
          {loading ? (
            <div className="p-8"><TableSkeleton rows={8} cols={4} /></div>
          ) : (
            <>
              <Table 
                columns={columns} 
                data={books} 
                onRowClick={openDetails}
                emptyMessage="No books matched your search criteria." 
              />
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => fetchBooks(page)}
                  onPrevious={() => fetchBooks(pagination.page - 1)}
                  onNext={() => fetchBooks(pagination.page + 1)}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Modals */}
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
            <Button type="submit" disabled={mutating}>
              {editingBook ? 'Save Updates' : 'Add to Collection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
