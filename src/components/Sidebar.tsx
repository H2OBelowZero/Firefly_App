import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Home, Clipboard, MapPin, FileText, Users, Settings, BookOpen, X, User, LogOut, MessageSquare, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SansDocument {
  id: string;
  title: string;
  description: string;
}

const sansDocuments: SansDocument[] = [
  {
    id: "10400-A",
    title: "SANS 10400-A - 2022 Edition",
    description: "General Application of the National Building Regulations"
  },
  {
    id: "10400-T",
    title: "SANS 10400-T",
    description: "The application of the National Building Regulations: Fire Protection"
  },
  {
    id: "10400-S",
    title: "SANS 10400-S",
    description: "The application of the National Building Regulations: Facilities for People with Disabilities"
  },
  {
    id: "10400-M",
    title: "SANS 10400-M",
    description: "The application of the National Building Regulations: Stairways"
  },
  {
    id: "10400-W",
    title: "SANS 10400-W - 2011 Edition",
    description: "Fire Installation"
  },
  {
    id: "1186-5",
    title: "SANS 1186-5",
    description: "Symbolic safety signs: Part 5: Photoluminescent signs"
  },
  {
    id: "10287",
    title: "SANS 10287",
    description: "Automatic sprinkler installations for fire-fighting purposes"
  },
  {
    id: "10131",
    title: "SANS 10131",
    description: "Above-ground storage tanks for petroleum products"
  },
  {
    id: "10251-1",
    title: "SANS 10251-1",
    description: "Water supply and drainage for buildings"
  },
  {
    id: "FM-8-24",
    title: "FM Global Datasheet 8-24",
    description: "Idle pallet storage"
  }
];

interface SidebarProps {
  selectedSansDoc?: string;
  onSansDocChange?: (docId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedSansDoc, onSansDocChange, isOpen, onToggle }) => {
  const [hoveredDoc, setHoveredDoc] = useState<string | null>(null);
  const [sansDocsExpanded, setSansDocsExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userDetails, setUser } = useUser();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/auth');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border shadow-xl transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="h-full flex flex-col">
        {/* Create Button */}
        <div className="p-4 border-b border-border">
          <Link to="/project-wizard">
            <Button className="w-full gap-2">
              <Plus className="w-4 h-4" />
              {isOpen && <span>Create Project</span>}
            </Button>
          </Link>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-4">
          {/* Navigation */}
          <nav className="space-y-2">
            <Link 
              to="/dashboard" 
              className={cn(
                "flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200",
                isActive('/dashboard') && "bg-fire/10 text-fire"
              )}
            >
              <Home className="w-5 h-5" />
              {isOpen && <span>Dashboard</span>}
            </Link>
            <Link 
              to="/projects" 
              className={cn(
                "flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200",
                isActive('/projects') && "bg-fire/10 text-fire"
              )}
            >
              <Clipboard className="w-5 h-5" />
              {isOpen && <span>Projects</span>}
            </Link>
            <Link 
              to="/calendar" 
              className={cn(
                "flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200",
                isActive('/calendar') && "bg-fire/10 text-fire"
              )}
            >
              <MapPin className="w-5 h-5" />
              {isOpen && <span>Calendar</span>}
            </Link>
            <Link 
              to="/templates" 
              className={cn(
                "flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200",
                isActive('/templates') && "bg-fire/10 text-fire"
              )}
            >
              <FileText className="w-5 h-5" />
              {isOpen && <span>Templates</span>}
            </Link>
            <Link 
              to="/resources" 
              className={cn(
                "flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200",
                isActive('/resources') && "bg-fire/10 text-fire"
              )}
            >
              <Users className="w-5 h-5" />
              {isOpen && <span>Resources</span>}
            </Link>
            <Link 
              to="/team" 
              className={cn(
                "flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200",
                isActive('/team') && "bg-fire/10 text-fire"
              )}
            >
              <MessageSquare className="w-5 h-5" />
              {isOpen && <span>Team</span>}
            </Link>
          </nav>

          {/* SANS Documents Section */}
          {isOpen && (
            <div className="mt-8">
              <button
                onClick={() => setSansDocsExpanded(!sansDocsExpanded)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>SANS Documents</span>
                {sansDocsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {sansDocsExpanded && (
                <div className="mt-2 space-y-2">
                  {sansDocuments.map((doc) => (
                    <div key={doc.id} className="relative">
                      <button
                        onClick={() => onSansDocChange?.(doc.id)}
                        onMouseEnter={() => setHoveredDoc(doc.id)}
                        onMouseLeave={() => setHoveredDoc(null)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-colors",
                          selectedSansDoc === doc.id 
                            ? 'bg-fire/10 text-fire' 
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <BookOpen className="w-5 h-5" />
                        <span className="text-sm">{doc.title}</span>
                      </button>
                      
                      {/* Hover Description */}
                      {hoveredDoc === doc.id && (
                        <div className="absolute left-full top-0 ml-2 w-64 p-3 bg-background border border-border rounded-2xl shadow-lg z-[60]">
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </aside>
  );
};

export default Sidebar; 