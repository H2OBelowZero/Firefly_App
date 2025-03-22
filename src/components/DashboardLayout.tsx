import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Bell, Settings, User, FileIcon, BarChart3, Calendar, Filter, Book, LogOut } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, userDetails } = useUser();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Projects', path: '/projects', icon: <FileIcon className="h-5 w-5" /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Templates', path: '/templates', icon: <FileIcon className="h-5 w-5" /> },
    { label: 'Resources', path: '/resources', icon: <Book className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-background border-r border-border z-10">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-fire flex items-center justify-center">
              <span className="font-bold text-white">FF</span>
            </div>
            <span className="font-bold text-lg">FireFly</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-4 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {userDetails?.avatar_url ? (
                <img
                  src={userDetails.avatar_url}
                  alt={userDetails.full_name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{userDetails?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground">{userDetails?.role || 'Fire Engineer'}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Link to="/settings" className="p-1 rounded-md hover:bg-muted">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Link>
              <button onClick={handleLogout} className="p-1 rounded-md hover:bg-muted">
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-background border-b border-border sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex-1 flex items-center px-4 md:px-0 md:ml-0">
              <div className="max-w-lg w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="search"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <button className="p-2 rounded-md hover:bg-muted relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-fire rounded-full"></span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 