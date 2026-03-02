import React, { useState, useCallback } from 'react';
import { Plus, Download, Upload, Edit2, Trash2, BookOpen, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Enhanced Components
import Table from '../components/Table.enhanced';
import Button, { IconButton, ButtonGroup } from '../components/Button.enhanced';
import Input from '../components/Input.enhanced';
import Modal, { ConfirmModal } from '../components/Modal.enhanced';
import { EmptyBooksState, ErrorState } from '../components/EmptyState';
import { TableSkeleton } from '../components/Skeleton.enhanced';

// Hooks
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import useMutation from '../hooks/useMutation';
import usePagination from '../hooks/usePagination';

// Services
import bookService from '../services/bookService';

/**
 * Books Management Page - Enhanced with Enterprise UX
 * 
 * Features:
 * - Skeleton loading states
 * - Empty states with CTAs
 * - Error states with retry
 * - Sortable, selectable table
 * - Debounced search
 * - Accessible modals
 * - Loading feedback on all actions
 * - Smooth animations
 * - Keyboard navigation
 * - Mobile responsive
 */
export default function BooksManagement() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  
  // Pagination
  const { page, pageSize, setPage, updatePaginationData, totalPages, totalItems } = usePagination();
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Fetch books with search and pagination
  const { 
    data: booksData, 
    loading, 
    error, 
    refetch 
  } = useFetch('/books', {
    params: {
      search: debouncedSearchTerm,
      page,
      pageSize,
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction
    }
  });
  
  // Update pagination when data changes
  React.useEffect(() => {
    if (booksData?.pagination) {
      updatePaginationData(booksData.pagination);
    }
  }, [booksData, updatePaginationData]);
  
  // Mutations
  const { mutate: createBook, loading: creating } = useMutation(bookService.createBook);
  const { mutate: updateBook, loading: updating } = useMutation(bookService.updateBook);
  const { mutate: deleteBook, loading: deleting } = useMutation(bookService.deleteBook);
  const { mutate: bulkDelete, loading: bulkDeleting } = useMutation(bookService.bulkDelete);
  
  // Table columns configuration
  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (book) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 bg-primary-100 rounded flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{book.title}</p>
            <p className="text-sm text-gray-500 truncate">{book.author}</p>
          </div>
        </div>
      )
    },
    {
      key: 'isbn',
      label: 'ISBN',
      sortable: true,
      render: (book) => (
        <span className="text-sm font-mono text-gray-600">{book.isbn}</span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (book) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {book.category}
        </span>
      )
    },
    {
      key: 'availableCopies',
      label: 'Available',
      sortable: true,
      render: (book) => (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${
            book.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {book.availableCopies}
          </span>
          <span className="text-sm text-gray-500">/ {book.totalCopies}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (book) => (
        <ButtonGroup>
          <IconButton
            icon={<Edit2 className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(book);
            }}
            ariaLabel={`Edit ${book.title}`}
            title="Edit book"
          />
          <IconButton
            icon={<Trash2 className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(book);
            }}
            variant="danger"
            ariaLabel={`Delete ${book.title}`}
            title="Delete book"
          />
        </ButtonGroup>
      )
    }
  ];
  
  // Handlers
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  }, [setPage]);
  
  const handleAdd = useCallback(() => {
    setCurrentBook(null);
    setIsAddModalOpen(true);
  }, []);
  
  const handleEdit = useCallback((book) => {
    setCurrentBook(book);
    setIsEditModalOpen(true);
  }, []);
  
  const handleDeleteClick = useCallback((book) => {
    setCurrentBook(book);
    setIsDeleteModalOpen(true);
  }, []);
  
  const handleBulkDelete = useCallback(async () => {
    if (selectedRows.length === 0) {
      toast.error('No books selected');
      return;
    }
    
    try {
      await bulkDelete({ ids: selectedRows });
      toast.success(`${selectedRows.length} book(s) deleted`);
      setSelectedRows([]);
      refetch();
    } catch (error) {
      toast.error('Failed to delete books');
    }
  }, [selectedRows, bulkDelete, refetch]);
  
  const handleSubmitAdd = async (formData) => {
    try {
      await createBook(formData);
      toast.success('Book added successfully');
      setIsAddModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error.message || 'Failed to add book');
    }
  };
  
  const handleSubmitEdit = async (formData) => {
    try {
      await updateBook({ id: currentBook.id, ...formData });
      toast.success('Book updated successfully');
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error.message || 'Failed to update book');
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      await deleteBook(currentBook.id);
      toast.success('Book deleted successfully');
      setIsDeleteModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error.message || 'Failed to delete book');
    }
  };
  
  const handleExport = useCallback(async () => {
    try {
      const blob = await bookService.exportBooks();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'books.csv';
      a.click();
      toast.success('Books exported successfully');
    } catch (error) {
      toast.error('Failed to export books');
    }
  }, []);
  
  const books = booksData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Books Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your library collection
            </p>
          </div>
          
          <ButtonGroup>
            <Button
              onClick={handleAdd}
              icon={<Plus className="w-4 h-4" />}
              ariaLabel="Add new book"
            >
              Add Book
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              ariaLabel="Export books"
            >
              Export
            </Button>
          </ButtonGroup>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search books by title, author, or ISBN..."
                value={searchTerm}
                onChange={handleSearch}
                icon={<Search className="w-4 h-4" />}
                iconPosition="left"
                ariaLabel="Search books"
              />
            </div>
            
            {selectedRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  onClick={handleBulkDelete}
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  loading={bulkDeleting}
                  ariaLabel={`Delete ${selectedRows.length} selected books`}
                >
                  Delete {selectedRows.length}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Table
            columns={columns}
            data={books}
            loading={loading}
            error={error}
            onRetry={refetch}
            sortable
            sort={sortConfig}
            onSort={handleSort}
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            emptyState={
              <EmptyBooksState 
                onAddBook={handleAdd}
                searchTerm={debouncedSearchTerm}
              />
            }
            stickyHeader
            hoverable
            striped
            ariaLabel="Books inventory table"
            pagination={{
              page,
              pageSize,
              totalPages,
              totalItems,
              onPageChange: setPage
            }}
          />
        </motion.div>
      </div>

      {/* Add Book Modal */}
      <BookFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitAdd}
        loading={creating}
        title="Add New Book"
      />

      {/* Edit Book Modal */}
      <BookFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
        loading={updating}
        title="Edit Book"
        book={currentBook}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Book"
        description={`Are you sure you want to delete "${currentBook?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

/**
 * Book Form Modal Component
 */
function BookFormModal({ isOpen, onClose, onSubmit, loading, title, book = null }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publicationYear: '',
    totalCopies: 1,
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // Initialize form with book data when editing
  React.useEffect(() => {
    if (book) {
      setFormData(book);
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publisher: '',
        publicationYear: '',
        totalCopies: 1,
        description: ''
      });
    }
    setErrors({});
  }, [book, isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.author?.trim()) {
      newErrors.author = 'Author is required';
    }
    if (!formData.isbn?.trim()) {
      newErrors.isbn = 'ISBN is required';
    } else if (!/^[0-9]{10,13}$/.test(formData.isbn.replace(/-/g, ''))) {
      newErrors.isbn = 'ISBN must be 10 or 13 digits';
    }
    if (!formData.category?.trim()) {
      newErrors.category = 'Category is required';
    }
    if (formData.totalCopies < 1) {
      newErrors.totalCopies = 'At least 1 copy is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors');
      return;
    }
    
    await onSubmit(formData);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Fill in the book information"
      size="lg"
      footer={
        <>
          <Button onClick={onClose} variant="outline" fullWidth>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} fullWidth>
            {book ? 'Save Changes' : 'Add Book'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Book Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
          maxLength={200}
          showCharCount
          icon={<BookOpen className="w-4 h-4" />}
          iconPosition="left"
          placeholder="Enter book title"
        />
        
        <Input
          label="Author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          error={errors.author}
          required
          maxLength={100}
          placeholder="Enter author name"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="ISBN"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            error={errors.isbn}
            required
            hint="10 or 13 digits"
            placeholder="978-0-1234-5678-9"
          />
          
          <Input
            label="Copies"
            name="totalCopies"
            type="number"
            value={formData.totalCopies}
            onChange={handleChange}
            error={errors.totalCopies}
            required
            min="1"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            required
            placeholder="Fiction, Non-Fiction, etc."
          />
          
          <Input
            label="Publication Year"
            name="publicationYear"
            type="number"
            value={formData.publicationYear}
            onChange={handleChange}
            min="1000"
            max={new Date().getFullYear()}
            placeholder="2024"
          />
        </div>
        
        <Input
          label="Publisher"
          name="publisher"
          value={formData.publisher}
          onChange={handleChange}
          placeholder="Publisher name"
        />
        
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          maxLength={500}
          showCharCount
          placeholder="Brief description of the book..."
        />
      </form>
    </Modal>
  );
}

// Import Textarea component
import { Textarea } from '../components/Input.enhanced';
