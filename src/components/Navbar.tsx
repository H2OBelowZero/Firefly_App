import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Settings, 
  FolderKanban, 
  Calendar as CalendarIcon, 
  FileText, 
  BookOpen,
  LogOut 
} from 'lucide-react';

const Navbar = () => {
  const { user, profile } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position for navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Projects', path: '/projects', icon: <FolderKanban className="w-5 h-5" /> },
    { label: 'Calendar', path: '/calendar', icon: <CalendarIcon className="w-5 h-5" /> },
    { label: 'Templates', path: '/templates', icon: <FileText className="w-5 h-5" /> },
    { label: 'Resources', path: '/resources', icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-fire flex items-center justify-center">
            <span className="font-bold text-white">FF</span>
          </div>
          <span className="font-bold text-lg">FireFly</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {user ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="py-2 px-3 rounded-md text-sm font-medium transition-colors duration-300 hover:bg-muted flex items-center gap-2"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="w-px h-6 bg-border mx-2"></div>
              <Link 
                to="/settings" 
                className="py-2 px-3 rounded-md text-sm font-medium transition-colors duration-300 hover:bg-muted flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/auth" 
                className="py-2 px-3 rounded-md text-sm font-medium transition-colors duration-300 hover:bg-muted"
              >
                Login
              </Link>
              <Link
                to="/auth?register=true"
                className="ml-2 py-2 px-4 rounded-md bg-fire text-white hover:bg-fire/90 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass shadow-md py-3 px-4 animate-slide-down">
          <nav className="flex flex-col space-y-2">
            {user ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="py-2 px-3 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="border-t border-border my-2"></div>
                <Link
                  to="/settings"
                  className="py-2 px-3 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="py-2 px-3 rounded-md hover:bg-muted transition-colors text-fire"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth?register=true"
                  className="py-2 px-4 rounded-md bg-fire text-white hover:bg-fire/90 flex justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
