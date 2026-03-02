# 🚀 Enhanced Components Quick Reference

## Table of Contents
- [Loading States](#loading-states)
- [Empty States](#empty-states)
- [Error States](#error-states)
- [Buttons](#buttons)
- [Forms](#forms)
- [Tables](#tables)
- [Modals](#modals)
- [Cards](#cards)
- [Common Patterns](#common-patterns)

---

## Loading States

### Basic Skeleton
```jsx
import { Skeleton } from '../components/Skeleton.enhanced';

<Skeleton className="h-12 w-full" ariaLabel="Loading content" />
```

### Table Loading
```jsx
import { TableSkeleton } from '../components/Skeleton.enhanced';

<TableSkeleton rows={5} columns={4} showActions />
```

### Stats Cards Loading
```jsx
import { StatsSkeleton } from '../components/Skeleton.enhanced';

<StatsSkeleton count={4} />
```

### Form Loading
```jsx
import { FormSkeleton } from '../components/Skeleton.enhanced';

<FormSkeleton fields={6} />
```

---

## Empty States

### Generic Empty State
```jsx
import EmptyState from '../components/EmptyState';
import { BookOpen } from 'lucide-react';

<EmptyState
  icon={BookOpen}
  title="No items found"
  description="Get started by adding your first item"
  action={handleAdd}
  actionLabel="Add Item"
/>
```

### Empty Books Library
```jsx
import { EmptyBooksState } from '../components/EmptyState';

<EmptyBooksState onAddBook={handleAdd} />
```

### Empty Search Results
```jsx
import { EmptySearchState } from '../components/EmptyState';

<EmptySearchState 
  searchTerm={searchTerm}
  onClearSearch={() => setSearchTerm('')}
/>
```

### All Pre-built Empty States
- `<EmptyBooksState onAddBook={} />` - Empty library
- `<EmptyLoansState onCreateLoan={} />` - No active loans
- `<EmptyUsersState onAddUser={} />` - No registered users
- `<EmptySearchState searchTerm={} onClearSearch={} />` - No results
- `<EmptyMyLoansState onBrowseBooks={} />` - User has no borrowed books

---

## Error States

### Generic Error with Retry
```jsx
import { ErrorState } from '../components/EmptyState';

<ErrorState
  title="Something went wrong"
  description="We encountered an error loading your data"
  onRetry={refetch}
  error={errorObject}
  showDetails={isDevelopment}
/>
```

### Network Error
```jsx
import { NetworkErrorState } from '../components/EmptyState';

<NetworkErrorState onRetry={refetch} />
```

### Permission Error
```jsx
import { PermissionErrorState } from '../components/EmptyState';

<PermissionErrorState />
```

---

## Buttons

### Basic Button
```jsx
import Button from '../components/Button.enhanced';

<Button onClick={handleClick} variant="primary" size="md">
  Click Me
</Button>
```

### Button with Icon
```jsx
import { Plus } from 'lucide-react';

<Button 
  icon={<Plus className="w-4 h-4" />}
  iconPosition="left"
  onClick={handleAdd}
>
  Add Item
</Button>
```

### Loading Button
```jsx
<Button 
  onClick={handleSubmit}
  loading={isSubmitting}
  disabled={!isValid}
>
  Save Changes
</Button>
```

### Button Variants
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Button Sizes
```jsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Icon Button
```jsx
import { IconButton } from '../components/Button.enhanced';
import { Edit2 } from 'lucide-react';

<IconButton
  icon={<Edit2 className="w-4 h-4" />}
  onClick={handleEdit}
  ariaLabel="Edit item"
  title="Edit"
/>
```

### Button Group
```jsx
import { ButtonGroup } from '../components/Button.enhanced';

<ButtonGroup>
  <Button onClick={handleSave}>Save</Button>
  <Button onClick={handleCancel} variant="outline">Cancel</Button>
</ButtonGroup>
```

### Floating Action Button
```jsx
import { FloatingActionButton } from '../components/Button.enhanced';
import { Plus } from 'lucide-react';

<FloatingActionButton
  icon={<Plus className="w-5 h-5" />}
  onClick={handleAdd}
  position="bottom-right"
  ariaLabel="Add new item"
/>
```

---

## Forms

### Text Input
```jsx
import Input from '../components/Input.enhanced';

<Input
  label="Book Title"
  name="title"
  value={title}
  onChange={handleChange}
  error={errors.title}
  success={isValid ? "Looks good!" : null}
  hint="Enter the full title"
  required
  maxLength={200}
  showCharCount
  icon={<BookOpen />}
  iconPosition="left"
  placeholder="Enter title..."
/>
```

### Password Input
```jsx
<Input
  label="Password"
  type="password"
  name="password"
  value={password}
  onChange={handleChange}
  error={errors.password}
  hint="At least 8 characters"
  required
/>
// Automatically includes visibility toggle
```

### Textarea
```jsx
import { Textarea } from '../components/Input.enhanced';

<Textarea
  label="Description"
  name="description"
  value={description}
  onChange={handleChange}
  rows={4}
  maxLength={500}
  showCharCount
  placeholder="Enter description..."
/>
```

### Select Dropdown
```jsx
import { Select } from '../components/Input.enhanced';

<Select
  label="Category"
  name="category"
  value={category}
  onChange={handleChange}
  options={[
    { value: 'fiction', label: 'Fiction' },
    { value: 'non-fiction', label: 'Non-Fiction' },
    { value: 'science', label: 'Science' }
  ]}
  error={errors.category}
  required
/>
```

### Checkbox
```jsx
import { Checkbox } from '../components/Input.enhanced';

<Checkbox
  label="I agree to the terms"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
  error={errors.agreed}
/>
```

---

## Tables

### Basic Table
```jsx
import Table from '../components/Table.enhanced';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' }
];

<Table
  columns={columns}
  data={data}
  loading={loading}
  error={error}
  onRetry={refetch}
  ariaLabel="Users table"
/>
```

### Table with Custom Rendering
```jsx
const columns = [
  {
    key: 'title',
    label: 'Title',
    sortable: true,
    render: (book) => (
      <div className="flex items-center gap-3">
        <BookOpen className="w-5 h-5" />
        <span className="font-semibold">{book.title}</span>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (book) => (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
        {book.status}
      </span>
    )
  }
];
```

### Sortable Table
```jsx
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

<Table
  columns={columns}
  data={data}
  sortable
  sort={sortConfig}
  onSort={(key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc'
    });
  }}
/>
```

### Selectable Table
```jsx
const [selectedRows, setSelectedRows] = useState([]);

<Table
  columns={columns}
  data={data}
  selectable
  selectedRows={selectedRows}
  onSelectionChange={setSelectedRows}
/>

// Access selected rows
console.log('Selected:', selectedRows); // Array of IDs
```

### Table with Empty State
```jsx
import { EmptyBooksState } from '../components/EmptyState';

<Table
  columns={columns}
  data={data}
  emptyState={<EmptyBooksState onAddBook={handleAdd} />}
/>
```

### Table with Pagination
```jsx
<Table
  columns={columns}
  data={data}
  pagination={{
    page: currentPage,
    pageSize: 10,
    totalPages: 5,
    totalItems: 50,
    onPageChange: setCurrentPage
  }}
/>
```

### Compact Table (Dense)
```jsx
import { CompactTable } from '../components/Table.enhanced';

<CompactTable
  columns={columns}
  data={data}
/>
```

### Card Table (Mobile)
```jsx
import { CardTable } from '../components/Table.enhanced';

<CardTable
  columns={columns}
  data={data}
/>
```

---

## Modals

### Basic Modal
```jsx
import Modal from '../components/Modal.enhanced';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Edit Item"
  description="Update item information"
  size="lg"
>
  <p>Modal content goes here</p>
</Modal>
```

### Modal with Footer
```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  footer={
    <>
      <Button onClick={handleClose} variant="outline">Cancel</Button>
      <Button onClick={handleSave} loading={saving}>Save</Button>
    </>
  }
>
  <p>Are you sure?</p>
</Modal>
```

### Confirmation Modal
```jsx
import { ConfirmModal } from '../components/Modal.enhanced';

<ConfirmModal
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleConfirm}
  loading={deleting}
  title="Delete Item"
  description="Are you sure? This action cannot be undone."
  confirmLabel="Delete"
  confirmVariant="danger"
/>
```

### Drawer (Slide Panel)
```jsx
import { Drawer } from '../components/Modal.enhanced';

<Drawer
  isOpen={isOpen}
  onClose={handleClose}
  title="Filters"
  position="right"
  size="sm"
>
  <div className="space-y-4">
    {/* Filter content */}
  </div>
</Drawer>
```

### Modal Sizes
```jsx
<Modal size="sm">Small Modal</Modal>
<Modal size="md">Medium Modal (default)</Modal>
<Modal size="lg">Large Modal</Modal>
<Modal size="xl">Extra Large Modal</Modal>
<Modal size="full">Full Screen Modal</Modal>
```

---

## Cards

### Basic Card
```jsx
import Card from '../components/Card.enhanced';

<Card className="p-6">
  <h3 className="font-bold">Card Title</h3>
  <p>Card content</p>
</Card>
```

### Clickable Card
```jsx
<Card 
  onClick={handleClick}
  hoverable
  ariaLabel="View details"
>
  <div className="p-6">Content</div>
</Card>
```

### Stats Card
```jsx
import { StatsCard } from '../components/Card.enhanced';
import { BookOpen } from 'lucide-react';

<StatsCard
  title="Total Books"
  value="1,234"
  icon={BookOpen}
  trend={12.5}
  trendLabel="vs last month"
  color="primary"
  onClick={handleViewDetails}
/>
```

### Feature Card
```jsx
import { FeatureCard } from '../components/Card.enhanced';

<FeatureCard
  icon={BookOpen}
  title="Easy Management"
  description="Manage your entire library with ease"
  action={handleLearnMore}
  actionLabel="Learn More"
/>
```

### Item Card
```jsx
import { ItemCard } from '../components/Card.enhanced';

<ItemCard
  title="Book Title"
  subtitle="Author Name"
  description="Brief description of the book"
  image="/book-cover.jpg"
  badge={<span className="text-green-600">Available</span>}
  actions={
    <>
      <Button size="sm">View</Button>
      <Button size="sm" variant="outline">Edit</Button>
    </>
  }
  onClick={handleView}
/>
```

### Collapsible Card
```jsx
import { CollapsibleCard } from '../components/Card.enhanced';

<CollapsibleCard
  title="Advanced Settings"
  icon={Settings}
  defaultExpanded={false}
  badge={<span className="text-xs text-gray-500">Optional</span>}
>
  <div className="space-y-3">
    {/* Collapsible content */}
  </div>
</CollapsibleCard>
```

---

## Common Patterns

### Page with Loading State
```jsx
function BooksPage() {
  const { data, loading, error, refetch } = useFetch('/books');

  if (loading) return <TableSkeleton rows={10} />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data?.length) return <EmptyBooksState onAddBook={handleAdd} />;

  return <Table data={data} columns={columns} />;
}
```

### Form with Validation
```jsx
function BookForm() {
  const [formData, setFormData] = useState({ title: '', author: '' });
  const [errors, setErrors] = useState({});
  const { mutate, loading } = useMutation(bookService.create);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Required';
    if (!formData.author) newErrors.author = 'Required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    await mutate(formData);
    toast.success('Book added!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        required
      />
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </form>
  );
}
```

### Searchable Paginated Table
```jsx
function DataTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { page, setPage } = usePagination();

  const { data, loading, error, refetch } = useFetch('/items', {
    params: { search: debouncedSearch, page }
  });

  return (
    <>
      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={<Search />}
      />

      {selectedRows.length > 0 && (
        <Button onClick={handleBulkDelete} variant="danger">
          Delete {selectedRows.length}
        </Button>
      )}

      <Table
        data={data?.items}
        columns={columns}
        loading={loading}
        error={error}
        onRetry={refetch}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        pagination={{
          page,
          onPageChange: setPage,
          ...data?.pagination
        }}
      />
    </>
  );
}
```

### CRUD Operations
```jsx
function CRUDPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const { data, loading, error, refetch } = useFetch('/items');
  const { mutate: create, loading: creating } = useMutation(api.create);
  const { mutate: update, loading: updating } = useMutation(api.update);
  const { mutate: remove, loading: deleting } = useMutation(api.delete);

  const handleAdd = () => {
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (currentItem) {
      await update({ id: currentItem.id, ...formData });
      toast.success('Updated!');
    } else {
      await create(formData);
      toast.success('Created!');
    }
    setIsModalOpen(false);
    refetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    await remove(id);
    toast.success('Deleted!');
    refetch();
  };

  return (
    <>
      <Button onClick={handleAdd}>Add New</Button>

      <Table
        data={data}
        loading={loading}
        error={error}
        onRetry={refetch}
        columns={[
          { key: 'name', label: 'Name' },
          {
            key: 'actions',
            label: 'Actions',
            render: (item) => (
              <>
                <IconButton icon={<Edit2 />} onClick={() => handleEdit(item)} />
                <IconButton icon={<Trash2 />} onClick={() => handleDelete(item.id)} />
              </>
            )
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentItem ? 'Edit' : 'Add New'}
      >
        <ItemForm
          item={currentItem}
          onSubmit={handleSubmit}
          loading={creating || updating}
        />
      </Modal>
    </>
  );
}
```

---

## Accessibility Checklist

When using enhanced components, ensure:

- ✅ All buttons have `ariaLabel` or descriptive text
- ✅ All inputs have `label` prop
- ✅ Tables have `ariaLabel` describing the data
- ✅ Modals have `title` and `description`
- ✅ Loading states use proper ARIA labels
- ✅ Error messages use `role="alert"`
- ✅ Icons have descriptive titles
- ✅ Interactive elements are keyboard accessible
- ✅ Focus management in modals
- ✅ Form validation errors are announced

---

## Performance Tips

1. **Debounce search inputs:**
   ```jsx
   const debouncedSearch = useDebounce(searchTerm, 500);
   ```

2. **Lazy load heavy components:**
   ```jsx
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

3. **Memoize callbacks:**
   ```jsx
   const handleClick = useCallback(() => {}, [deps]);
   ```

4. **Use skeleton loaders for perceived performance:**
   ```jsx
   {loading ? <TableSkeleton /> : <Table data={data} />}
   ```

5. **Optimize table rendering with pagination:**
   ```jsx
   // Load only 20 items at a time
   <Table data={data} pagination={{ pageSize: 20 }} />
   ```

---

## 🎉 You're Ready!

All enhanced components are production-ready with:
- ✅ Full accessibility support
- ✅ Mobile responsiveness
- ✅ Loading states
- ✅ Error handling
- ✅ Smooth animations
- ✅ Keyboard navigation

**Happy coding!** 🚀