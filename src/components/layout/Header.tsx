
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, PlusCircle, CalendarCheck, MessageCircle, Menu, X, Shield, Users, User, Bell, ChevronDown, Sun, Moon, ListChecks, LogOut, UserCog, Mail, LogIn, UserPlus, Settings } from 'lucide-react';
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
  { href: '/', label: 'Browse', icon: LayoutGrid, exact: true },
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
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const currentActiveUserId = getActiveUserId();

  const { getNotificationsForUser, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const currentUnreadCount = unreadCount(currentActiveUserId || '');
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    const init = async () => {
      setIsMounted(true);
      const profile = await initializeAuth();
      if (profile) {
        setActiveUser(profile);
      }
    };
    init();
  }, [pathname, currentActiveUserId]);

  useEffect(() => {
    if (currentActiveUserId) {
      setUserNotifications(getNotificationsForUser(currentActiveUserId));
    }
  }, [currentActiveUserId, getNotificationsForUser, unreadCount]);

  const [visibleNavItems, setVisibleNavItems] = useState<NavItem[]>(navItems.filter(item => !item.protected));

  useEffect(() => {
    if (isMounted) {
      const isAuthenticated = !!activeUser || !!localStorage.getItem('rentaleaseToken');
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

  const NavLink = ({ href, label, icon: Icon, exact }: NavItem) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link href={href} passHref>
        <Button
          variant="ghost"
          className={cn(
            'flex items-center gap-2 justify-center px-3 h-9 text-[11px] font-black uppercase tracking-[0.14em] transition-all group duration-300 rounded-xl',
            isActive
              ? 'text-primary bg-primary/10 shadow-sm'
              : 'text-muted-foreground/70 hover:text-primary hover:bg-primary/5'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {Icon && <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />}
          {label}
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
    <header className="sticky top-0 z-50 w-full glass border-b border-primary/10 transition-all duration-300">
      <div className="w-full relative flex h-16 items-center px-4 sm:px-6">
        {/* Left Side: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group" passHref>
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors shadow-sm">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-black text-primary font-headline tracking-tighter uppercase whitespace-nowrap hidden sm:inline-block">RentalEase</span>
          </Link>
        </div>

        {/* Center: Absolute Centered Navigation */}
        <div className="hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <nav className="flex items-center gap-0.5 bg-primary/[0.04] p-1.5 rounded-2xl border border-primary/10 shadow-sm backdrop-blur-md">
            {visibleNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        {/* Right Side: Controls */}
        <div className="ml-auto flex items-center gap-3">
          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-2 mr-2">
            {!isMounted ? <div className="w-20" /> : (
              !localStorage.getItem('rentaleaseToken') ? (
                <div className="flex items-center gap-3 mr-2">
                  <Button variant="outline" size="sm" asChild className="rounded-full px-5 h-9 font-black uppercase tracking-widest text-[10px] border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="default" size="sm" asChild className="rounded-full px-5 h-9 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all active:scale-95">
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              ) : activeUser && (
                <div className="flex items-center gap-2 mr-2">
                  <NotificationBellDropdown />
                  <div className="h-4 w-[1px] bg-primary/10 mx-0.5" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-9 px-3 rounded-full hover:bg-primary/10 border border-primary/10">
                        <UserCog className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-bold text-xs">{activeUser.name.split('(')[0].trim()}</span>
                        <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass shadow-2xl border-primary/10 p-1">
                      <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">My Account</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center p-2 rounded-md hover:bg-primary/10 cursor-pointer">
                          <User className="mr-2 h-4 w-4" /> <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-primary/5" />
                      <DropdownMenuItem onClick={() => logout()} className="p-2 rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> <span className="font-bold">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            )}


            <ThemeToggleButton />
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10 hover:bg-primary/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs glass p-0 border-l border-primary/10 shadow-2xl">
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-primary/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2" passHref onClick={() => setIsMobileMenuOpen(false)}>
                      <Home className="h-6 w-6 text-primary" />
                      <span className="text-xl font-black text-primary tracking-tighter">RentalEase</span>
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  <div className="space-y-4">
                    {isMounted && !localStorage.getItem('rentaleaseToken') ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" asChild onClick={() => setIsMobileMenuOpen(false)} className="rounded-full font-bold">
                          <Link href="/login">Login</Link>
                        </Button>
                        <Button variant="default" size="sm" asChild onClick={() => setIsMobileMenuOpen(false)} className="rounded-full font-bold shadow-lg shadow-primary/20">
                          <Link href="/register">Register</Link>
                        </Button>
                      </div>
                    ) : activeUser && (
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-between rounded-full h-10 border-primary/10 font-bold px-4">
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4" />
                            <span>{activeUser.name.split('(')[0].trim()}</span>
                          </div>
                          <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter">Active</Badge>
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="ghost" className="justify-start gap-2 h-9 p-0 text-xs" asChild onClick={() => setIsMobileMenuOpen(false)}>
                            <Link href="/profile"><User className="h-4 w-4" /> Profile</Link>
                          </Button>
                          <Button variant="ghost" className="justify-start gap-2 h-9 p-0 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                            <LogOut className="h-4 w-4" /> Logout
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <nav className="flex-grow p-6 flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Main Navigation</p>
                  {visibleNavItems.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}

                </nav>

                <div className="p-6 border-t border-primary/10 flex justify-between items-center bg-primary/5">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <ThemeToggleButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header >
  );
}
