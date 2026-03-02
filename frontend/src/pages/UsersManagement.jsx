import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import { TableSkeleton } from '../components/Skeleton';
import Input from '../components/Input';
import { EmptyUsersState, EmptySearchState } from '../components/EmptyState';
import toast from 'react-hot-toast';
import { Users, Search, Shield, UserPlus, Trash2, ShieldCheck, Mail } from 'lucide-react';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(`User updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete account for "${user.username}"?`)) return;

    try {
      await api.delete(`/users/${user.id}`);
      toast.success('User profile removed.');
      fetchUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  const getRoleBadge = (role) => {
    const configs = {
      Admin: { color: 'bg-purple-100 text-purple-700', icon: ShieldCheck },
      Librarian: { color: 'bg-indigo-100 text-indigo-700', icon: Shield },
      Member: { color: 'bg-emerald-100 text-emerald-700', icon: Users }
    };
    const config = configs[role] || configs.Member;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${config.color}`}>
        <Icon className="w-3 h-3" />
        {role}
      </span>
    );
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'Identity', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">
            {row.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{row.username}</span>
            <span className="text-xs text-gray-400">UID: #{row.id}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Contact Info', 
      render: (row) => (
        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
          <Mail className="w-3.5 h-3.5 opacity-50" />
          {row.email}
        </div>
      )
    },
    { header: 'Access Level', render: (row) => getRoleBadge(row.role) },
    {
      header: 'Manage',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.role === 'Member' && (
            <button 
              onClick={() => handleUpdateRole(row.id, 'Librarian')}
              className="text-xs font-bold text-primary-600 hover:text-primary-800 underline underline-offset-4"
              title="Promote to Librarian"
            >
              Set Librarian
            </button>
          )}
          {row.role === 'Librarian' && (
            <button 
              onClick={() => handleUpdateRole(row.id, 'Admin')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 underline underline-offset-4"
              title="Promote to Admin"
            >
              Set Admin
            </button>
          )}
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button 
            onClick={() => handleDelete(row)}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">User Directory</h2>
          <p className="text-sm text-gray-500">Manage library staff and member accounts.</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Manual Register
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 rounded-xl text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white">
          {loading ? (
             <div className="p-8"><TableSkeleton rows={8} cols={4} /></div>
          ) : filteredUsers.length === 0 ? (
            // Show empty state
            searchTerm ? (
              <EmptySearchState 
                searchTerm={searchTerm} 
                onClearSearch={() => setSearchTerm('')}
              />
            ) : (
              <EmptyUsersState 
                onAddUser={() => {
                  // This would open a user creation modal
                  toast.info('User creation feature - navigate to /register or create via API');
                }}
              />
            )
          ) : (
            <Table columns={columns} data={filteredUsers} />
          )}
        </div>
      </Card>
    </div>
  );
}
