import React from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  FileText, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Mock data - replace with actual data from your backend
const notifications = [
  {
    id: 1,
    title: 'Project Deadline Approaching',
    description: 'The deadline for "Commercial Building Assessment" is in 3 days',
    type: 'deadline',
    time: '2 hours ago',
    read: false
  },
  {
    id: 2,
    title: 'New Project Created',
    description: 'A new project "Industrial Facility Review" has been created',
    type: 'project',
    time: '5 hours ago',
    read: false
  },
  {
    id: 3,
    title: 'Review Required',
    description: 'Your review is required for "Residential Complex Assessment"',
    type: 'review',
    time: '1 day ago',
    read: true
  },
  {
    id: 4,
    title: 'System Update',
    description: 'New features have been added to the platform',
    type: 'system',
    time: '2 days ago',
    read: true
  }
];

const NotificationMenu = () => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="w-4 h-4 text-red-500" />;
      case 'project':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'review':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'system':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-secondary/80">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-fire rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80" 
        align="end" 
        sideOffset={5}
        side="bottom"
        forceMount
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs font-medium text-fire">
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-1">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer ${
                  !notification.read ? 'bg-secondary/50' : ''
                }`}
              >
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {notification.time}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="flex items-center justify-center">
            View All Notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu; 