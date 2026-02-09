
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, PlusCircle, CalendarCheck, MessageCircle, Menu, X, Shield, Users, User, Bell, ChevronDown, Sun, Moon, ListChecks, LogOut, UserCog, Mail, LogIn, UserPlus, Settings, Zap } from 'lucide-react';
import type { NavItem, UserProfile, Notification } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetClose, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import React, { useState, useEffect, useMemo } from 'react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { getActiveUserProfile, getActiveUserId, logout, initializeAuth } from '@/lib/auth';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNowStrict } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const navItems: NavItem[] = [
  { href: '/', label: 'Browse', icon: LayoutGrid, exact: true, protected: false },
  { href: '/items/new', label: 'Add Item', icon: PlusCircle, protected: true },
  { href: '/my-items', label: 'My Items', icon: ListChecks, protected: true },
  { href: '/requests', label: 'My Requests', icon: CalendarCheck, protected: true },
  { href: '/messages', label: 'Messages', icon: MessageCircle, protected: true },
];

// ViewMode interface removed as requested

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  // Hydration fix: Ensure dynamic client-side data is only loaded after initial mount
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [currentActiveUserId, setCurrentActiveUserId] = useState<string | null>(null);

  const { getNotificationsForUser, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const currentUnreadCount = currentActiveUserId ? unreadCount(currentActiveUserId || '') : 0;
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    setIsMounted(true);
    const idValue = getActiveUserId();
    setCurrentActiveUserId(idValue);
    setActiveUser(getActiveUserProfile());
  }, [pathname]);

  useEffect(() => {
    if (isMounted && currentActiveUserId) {
      setUserNotifications(getNotificationsForUser(currentActiveUserId));
    }
  }, [currentActiveUserId, getNotificationsForUser, unreadCount, isMounted]);

  const [visibleNavItems, setVisibleNavItems] = useState<NavItem[]>(navItems.filter(item => !item.protected));

  useEffect(() => {
    if (isMounted) {
      const isAuthenticated = !!localStorage.getItem('rentsnapToken');
      if (isAuthenticated) {
        setVisibleNavItems(navItems);
      } else {
        setVisibleNavItems(navItems.filter(item => !item.protected));
      }
    }
  }, [isMounted, activeUser]);

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

  const NavLink = ({ href, label, icon: Icon, exact, isMobile }: NavItem & { isMobile?: boolean }) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link href={href} passHref>
        <Button
          variant="ghost"
          className={cn(
            'flex items-center gap-3 transition-all group duration-300 rounded-2xl',
            isMobile ? 'w-full justify-start px-4 h-12 text-[11px] font-black uppercase tracking-[0.2em]' : 'px-4 h-10 text-[10px] font-black uppercase tracking-widest',
            isActive
              ? 'text-primary bg-primary/10 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.2)]'
              : 'text-muted-foreground/60 hover:text-primary hover:bg-primary/5'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className={cn(
            "rounded-xl transition-all duration-300 flex items-center justify-center",
            isMobile ? "p-2" : "p-1.5",
            isActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-primary/5 text-primary group-hover:bg-primary/10"
          )}>
            {Icon && <Icon className={isMobile ? "h-4 w-4" : "h-3.5 w-3.5"} />}
          </div>
          <span>{label}</span>
          {isMobile && isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
        </Button>
      </Link>
    );
  };

  const notificationsToDisplay = useMemo(() => {
    if (notificationFilter === 'unread') {
      return userNotifications.filter(n => !n.isRead);
    }
    if (notificationFilter === 'read') {
      return userNotifications.filter(n => n.isRead);
    }
    return userNotifications.slice(0, 5);
  }, [notificationFilter, userNotifications]);

  const NotificationBellDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-primary/10 transition-colors">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {currentUnreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl glass border-primary/10 overflow-hidden">
        <div className="p-4 border-b border-primary/10 bg-primary/5 flex justify-between items-center">
          <h3 className="font-bold text-sm">Notifications</h3>
          {currentUnreadCount > 0 && <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/20 text-[10px] uppercase font-bold tracking-wider">{currentUnreadCount} New</Badge>}
        </div>

        <div className="flex p-1 gap-1 bg-muted/30">
          {(['all', 'unread', 'read'] as const).map((filter) => (
            <Button
              key={filter}
              variant={notificationFilter === filter ? 'secondary' : 'ghost'}
              size="sm"
              onClick={(e) => { e.stopPropagation(); setNotificationFilter(filter); }}
              className="flex-1 text-[11px] h-7 font-semibold"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notificationsToDisplay.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Mail className="h-8 w-8 opacity-20" />
              <p className="text-xs">No notifications here</p>
            </div>
          ) : (
            notificationsToDisplay.map(notif => (
              <DropdownMenuItem
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={cn("flex flex-col items-start gap-1 p-4 cursor-pointer border-b border-primary/5 last:border-0 hover:bg-primary/5 transition-colors", !notif.isRead && "bg-primary/[0.02]")}
              >
                <div className="w-full flex justify-between items-center">
                  <span className={cn("font-bold text-xs uppercase tracking-tight", !notif.isRead ? "text-primary" : "text-muted-foreground")}>{notif.title}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatDistanceToNowStrict(notif.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">{notif.message}</p>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {currentUnreadCount > 0 && (
          <Button variant="ghost" className="w-full rounded-none h-10 text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5" onClick={handleMarkAllReadClick}>
            Mark all as read
          </Button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-primary/5 transition-all duration-300">
      <div className="w-full relative flex h-20 items-center px-4 sm:px-8">
        {/* Left Side: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group" passHref>
            <div className="p-2.5 rounded-[1.25rem] bg-primary shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-black text-foreground font-headline tracking-tighter ml-1">Rent<span className="text-primary">Snap</span></span>
          </Link>
        </div>

        {/* Center: Absolute Centered Navigation */}
        {visibleNavItems.length > 0 && (
          <div className="hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <nav className="flex items-center gap-1 bg-white/40 dark:bg-black/20 p-2 rounded-[1.5rem] border border-primary/10 shadow-sm backdrop-blur-xl">
              {visibleNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </div>
        )}

        {/* Right Side: Controls */}
        <div className="ml-auto flex items-center gap-4">
          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-3 mr-2">
            {!isMounted ? <div className="w-20" /> : (
              !localStorage.getItem('rentsnapToken') ? (
                <div className="flex items-center gap-3 mr-2">
                  <Button variant="ghost" size="sm" asChild className="rounded-full px-6 h-10 font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="default" size="sm" asChild className="rounded-full px-6 h-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all active:scale-95">
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              ) : activeUser && (
                <div className="flex items-center gap-3 mr-2">
                  <NotificationBellDropdown />
                  <div className="h-6 w-[1px] bg-primary/10 mx-1" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 px-4 rounded-full hover:bg-primary/10 border border-primary/10 bg-white/50 dark:bg-black/20">
                        <UserCog className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-bold text-xs">{activeUser.name.split('(')[0].trim()}</span>
                        <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 glass shadow-2xl border-primary/10 p-2 rounded-3xl mt-2">
                      <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">My Account</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center p-3 rounded-2xl hover:bg-primary/10 cursor-pointer transition-colors">
                          <User className="mr-3 h-4 w-4 text-primary" /> <span className="font-bold text-sm">Profile Details</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-primary/5 my-2" />
                      <DropdownMenuItem onClick={() => logout()} className="p-3 rounded-2xl text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-colors">
                        <LogOut className="mr-3 h-4 w-4" /> <span className="font-black text-sm uppercase tracking-wider">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            )}

            <div className="h-10 w-10 flex items-center justify-center">
              <ThemeToggleButton />
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10 hover:bg-primary/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-[300px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl p-0 border-l border-primary/10 shadow-2xl flex flex-col">
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>

              {/* Drawer Header */}
              <div className="p-8 flex items-center justify-between border-b border-primary/5">
                <Link href="/" className="flex items-center gap-3" passHref onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                    <Zap className="h-5 w-5 text-white fill-white" />
                  </div>
                  <span className="text-xl font-black text-foreground tracking-tighter">Rent<span className="text-primary">Snap</span></span>
                </Link>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 bg-primary/5 hover:bg-primary/10 text-primary">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar">
                {/* User Section */}
                <div className="p-6">
                  {isMounted && !localStorage.getItem('rentsnapToken') ? (
                    <div className="space-y-3 bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 text-center">Join the Community</p>
                      <Button variant="default" className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20" asChild onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/register">Create Account</Link>
                      </Button>
                      <Button variant="ghost" className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:bg-primary/10" asChild onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </div>
                  ) : activeUser && (
                    <div className="bg-white dark:bg-slate-900 shadow-xl shadow-black/5 dark:shadow-none p-5 rounded-[2.5rem] border border-primary/5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-primary/10 p-1 border-2 border-primary/20">
                          <img src={activeUser.avatarUrl} alt={activeUser.name} className="h-full w-full rounded-full object-cover shadow-sm" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground leading-none mb-1">{activeUser.name.split('(')[0].trim()}</span>
                          <span className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Premium Member
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button variant="ghost" className="justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/5 hover:bg-primary/10 text-primary" asChild onClick={() => setIsMobileMenuOpen(false)}>
                          <Link href="/profile"><User className="h-3.5 w-3.5" /> Profile</Link>
                        </Button>
                        <Button variant="ghost" className="justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                          <LogOut className="h-3.5 w-3.5" /> Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nav Links */}
                <nav className="p-6 pt-0 space-y-1.5">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-4 ml-4">Explore Platform</p>
                  {visibleNavItems.map((item) => (
                    <NavLink key={item.href} {...item} isMobile />
                  ))}
                </nav>
              </div>

              {/* Theme Toggle Footer */}
              <div className="p-8 border-t border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Current Theme</span>
                  <span className="text-xs font-black text-foreground uppercase tracking-tight">{theme === 'dark' ? 'Midnight Dark' : 'Crystal Light'}</span>
                </div>
                <div className="p-1 rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-primary/5 flex items-center gap-1">
                  <Button variant={theme === 'light' ? 'default' : 'ghost'} size="icon" onClick={() => setTheme('light')} className="h-10 w-10 rounded-xl transition-all">
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="icon" onClick={() => setTheme('dark')} className="h-10 w-10 rounded-xl transition-all">
                    <Moon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header >
  );
}
