import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import NotificationMenu from './NotificationMenu';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-[100]">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left side with Logo and Sidebar Toggle */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-secondary/80 rounded-2xl transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-2xl bg-fire flex items-center justify-center shadow-lg">
                <span className="font-bold text-white">FF</span>
              </div>
              <span className="font-bold text-lg">FireFly</span>
            </Link>
          </div>

          {/* Center with Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-secondary/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-fire/50"
              />
            </div>
          </div>

          {/* Right side with Notifications and UserMenu */}
          <div className="flex items-center space-x-2">
            <NotificationMenu />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="pt-16 flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-16'}`}>
          <main className="p-6 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 