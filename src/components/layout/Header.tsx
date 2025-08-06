
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, PlusCircle, CalendarCheck, MessageCircle, Menu, X, Shield, Users, User, Bell, ChevronDown, Sun, Moon, ListChecks, LogOut, UserCog, Mail } from 'lucide-react';
import type { NavItem, UserProfile, Notification } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetClose, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import React, { useState, useEffect, useMemo } from 'react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { getActiveUserProfile, setActiveUserId, getAllMockUsers, getActiveUserId } from '@/lib/auth';
import { useNotifications } from '@/contexts/NotificationContext'; 
import { formatDistanceToNowStrict } from 'date-fns'; 
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navItems: NavItem[] = [
  { href: '/', label: 'Browse', icon: LayoutGrid, exact: true },
  { href: '/items/new', label: 'Add Item', icon: PlusCircle },
  { href: '/my-items', label: 'My Items', icon: ListChecks },
  { href: '/requests', label: 'My Requests', icon: CalendarCheck },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
];

interface ViewMode {
  label: string;
  icon: React.ElementType;
  href: string;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const currentActiveUserId = getActiveUserId(); 

  const { getNotificationsForUser, markAsRead, markAllAsRead, unreadCount } = useNotifications(); 
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const currentUnreadCount = unreadCount(currentActiveUserId || ''); 
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'read'>('all');


  useEffect(() => {
    setActiveUser(getActiveUserProfile());
  }, [pathname, currentActiveUserId]); 

  useEffect(() => {
    if (currentActiveUserId) {
      setUserNotifications(getNotificationsForUser(currentActiveUserId));
    }
  }, [currentActiveUserId, getNotificationsForUser, unreadCount]); 

  const handleUserSwitch = (userId: string) => {
    setActiveUserId(userId);
    setIsMobileMenuOpen(false); 
    router.refresh(); 
  };

  const handleNotificationClick = (notification: Notification) => {
    if (currentActiveUserId) {
      markAsRead(notification.id, currentActiveUserId);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };
  
  const handleMarkAllReadClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (currentActiveUserId) {
      markAllAsRead(currentActiveUserId);
    }
  }

  const NavLink = ({ href, label, icon: Icon, exact }: NavItem) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link href={href} passHref>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'flex items-center gap-2 justify-start w-full lg:w-auto text-base lg:text-sm',
            isActive ? 'text-primary-foreground bg-primary hover:bg-primary/90' : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {Icon && <Icon className="h-5 w-5 lg:h-4 lg:w-4" />}
          {label}
        </Button>
      </Link>
    );
  };
  
  const viewModes: ViewMode[] = [
    { label: 'User View', icon: User, href: '/' },
    { label: 'Staff View', icon: Users, href: '/staff' },
    { label: 'Admin View', icon: Shield, href: '/admin' },
  ];

  let currentViewMode: ViewMode = viewModes[0]; 
  if (pathname.startsWith('/admin')) {
    currentViewMode = viewModes[2];
  } else if (pathname.startsWith('/staff')) {
    currentViewMode = viewModes[1];
  }
  
  const CurrentViewIcon = currentViewMode.icon;

  const renderViewSwitcherItems = (isMobile: boolean) => (
    <>
      {viewModes.map((mode) => (
        <DropdownMenuItem
          key={mode.href}
          onClick={() => {
            router.push(mode.href);
            if (isMobile) setIsMobileMenuOpen(false);
          }}
          className={cn(
            "cursor-pointer",
            (pathname === mode.href || (mode.href === '/' && (pathname === '/' || pathname.startsWith('/items/') || pathname.startsWith('/my-items') || pathname.startsWith('/requests') || pathname.startsWith('/messages') || pathname.startsWith('/users/')))) && "bg-accent/20"
          )}
        >
          <mode.icon className="mr-2 h-4 w-4" />
          {mode.label}
        </DropdownMenuItem>
      ))}
    </>
  );

  const notificationsToDisplay = useMemo(() => {
    if (notificationFilter === 'unread') {
      return userNotifications.filter(n => !n.isRead);
    }
    if (notificationFilter === 'read') {
      return userNotifications.filter(n => n.isRead);
    }
    return userNotifications.slice(0, 10); // show max 10 notifications
  }, [notificationFilter, userNotifications]);

  const NotificationBellDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary hover:bg-accent/10">
          <Bell className="h-5 w-5" />
          {currentUnreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background text-xs font-bold flex items-center justify-center">
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifications
          {currentUnreadCount > 0 && <Badge variant="default" className="bg-accent text-accent-foreground">{currentUnreadCount} New</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex justify-around p-1 border-b">
          <Button 
            variant={notificationFilter === 'all' ? 'secondary' : 'ghost'} 
            size="sm" 
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onClick={(e) => { e.stopPropagation(); setNotificationFilter('all');}} 
            className="flex-1 text-xs h-7"
          >
            All
          </Button>
          <Button 
            variant={notificationFilter === 'unread' ? 'secondary' : 'ghost'} 
            size="sm" 
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onClick={(e) => { e.stopPropagation(); setNotificationFilter('unread');}} 
            className="flex-1 text-xs h-7"
          >
            Unread
          </Button>
          <Button 
            variant={notificationFilter === 'read' ? 'secondary' : 'ghost'} 
            size="sm" 
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onClick={(e) => { e.stopPropagation(); setNotificationFilter('read');}} 
            className="flex-1 text-xs h-7"
          >
            Read
          </Button>
        </div>
        {notificationsToDisplay.length === 0 ? (
           <DropdownMenuItem disabled className="text-center text-muted-foreground py-4">
            {notificationFilter === 'unread' ? 'No unread notifications.' :
             notificationFilter === 'read' ? 'No read notifications.' :
             'No notifications yet.'}
           </DropdownMenuItem>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto">
              {notificationsToDisplay.map(notif => ( 
                <DropdownMenuItem 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)} 
                  className={cn("flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-muted/50", !notif.isRead && "bg-primary/5")}
                >
                  <div className="w-full flex justify-between items-center">
                     <span className={cn("font-semibold text-sm", !notif.isRead && "text-primary")}>{notif.title}</span>
                     <span className="text-xs text-muted-foreground">
                       {formatDistanceToNowStrict(notif.timestamp, { addSuffix: true })}
                     </span>
                  </div>
                  <p className="text-xs text-muted-foreground w-full truncate">{notif.message}</p>
                </DropdownMenuItem>
              ))}
            </div>
            {currentUnreadCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMarkAllReadClick} disabled={currentUnreadCount === 0} className="text-center justify-center">
                  <Mail className="mr-2 h-4 w-4" /> Mark all as read
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 mr-4" passHref>
          <Home className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-primary font-headline hidden sm:inline">RentalEase</span>
        </Link>

        {/* Desktop Navigation & Controls */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        
        <div className="hidden lg:flex items-center gap-1 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-foreground hover:bg-accent/10">
                <CurrentViewIcon className="h-4 w-4 mr-2" />
                {currentViewMode.label}
                <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {renderViewSwitcherItems(false)}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:bg-accent/10">
                  <UserCog className="h-4 w-4 mr-2" />
                  {activeUser.name.split('(')[0].trim()}
                  <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hi, {activeUser.name.split('(')[0].trim()}</DropdownMenuLabel>
                 <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2 h-4 w-4" /> My Profile</Link>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Switch User</DropdownMenuLabel>
                {getAllMockUsers().map(user => (
                  <DropdownMenuItem key={user.id} onClick={() => handleUserSwitch(user.id)} disabled={activeUser.id === user.id}>
                    <User className="mr-2 h-4 w-4" />
                    {user.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
           <NotificationBellDropdown />
           <ThemeToggleButton />
        </div>

        {/* Mobile Controls & Menu Setup */}
        <div className="lg:hidden flex items-center gap-1 ml-auto">
          <NotificationBellDropdown />
          <ThemeToggleButton />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-0">
               <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
               <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <div className="mb-4 flex items-center justify-between">
                    <SheetClose asChild>
                      <Link href="/" className="flex items-center gap-2" passHref>
                         <Home className="h-6 w-6 text-primary" />
                         <span className="text-xl font-bold text-primary font-headline">RentalEase</span>
                      </Link>
                    </SheetClose>
                  </div>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-foreground">
                        <CurrentViewIcon className="h-4 w-4 mr-2" />
                        {currentViewMode.label}
                        <ChevronDown className="h-4 w-4 ml-auto opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[calc(100vw-4rem)] max-w-[calc(theme(maxWidth.xs)-2rem)] sm:w-auto">
                      {renderViewSwitcherItems(true)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {activeUser && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-foreground mt-2">
                            <UserCog className="h-4 w-4 mr-2" />
                            {activeUser.name.split('(')[0].trim()}
                            <ChevronDown className="h-4 w-4 ml-auto opacity-70" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[calc(100vw-4rem)] max-w-[calc(theme(maxWidth.xs)-2rem)] sm:w-auto">
                        <DropdownMenuLabel>Hi, {activeUser.name.split('(')[0].trim()}</DropdownMenuLabel>
                        <DropdownMenuItem asChild onClick={() => setIsMobileMenuOpen(false)}>
                          <Link href="/profile"><User className="mr-2 h-4 w-4" /> My Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Switch User</DropdownMenuLabel>
                        {getAllMockUsers().map(user => (
                            <DropdownMenuItem key={user.id} onClick={() => handleUserSwitch(user.id)} disabled={activeUser.id === user.id}>
                            <User className="mr-2 h-4 w-4" />
                            {user.name}
                            </DropdownMenuItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <nav className="flex-grow p-4 flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
