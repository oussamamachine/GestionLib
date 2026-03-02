import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Users, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Library,
  BookMarked
} from 'lucide-react';
import { clsx } from 'clsx';

export default function Sidebar({ activeTab, setActiveTab, role }) {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const adminTabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'loans', label: 'Loans', icon: History },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const librarianTabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books Management', icon: BookOpen },
    { id: 'loans', label: 'Loans Tracker', icon: History },
  ];

  const memberTabs = [
    { id: 'overview', label: 'My Library', icon: LayoutDashboard },
    { id: 'books', label: 'Browse Store', icon: BookMarked },
    { id: 'myloans', label: 'Active Loans', icon: Library },
  ];

  const tabs = role === 'Admin' ? adminTabs : role === 'Librarian' ? librarianTabs : memberTabs;

  return (
    <aside 
      className={clsx(
        "fixed left-0 top-0 h-screen bg-midnight-900 text-white transition-all duration-300 z-50 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center gap-3">
        <Library className="text-primary-500 w-8 h-8 flex-shrink-0" />
        {!isCollapsed && (
          <span className="font-bold text-lg tracking-tight whitespace-nowrap">GestionLib</span>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative",
                activeTab === tab.id 
                  ? "bg-primary-600 text-white" 
                  : "text-midnight-300 hover:bg-midnight-800 hover:text-white"
              )}
            >
              <Icon className={clsx("w-5 h-5", activeTab === tab.id ? "text-white" : "text-midnight-400 group-hover:text-primary-400")} />
              {!isCollapsed && <span className="font-medium text-sm">{tab.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-6 px-3 py-1 bg-midnight-950 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                  {tab.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-midnight-800">
        <div className={clsx("flex items-center gap-3 px-3 py-3 mb-4", isCollapsed ? "justify-center" : "")}>
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center font-bold text-xs uppercase">
            {user?.username?.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-xs text-midnight-400 truncate">{user?.role}</p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-primary-600 rounded-full p-1 border-2 border-midnight-900 hover:bg-primary-500 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
