
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, PlusCircle, CalendarCheck, MessageCircle, Menu, X, Shield, Users, User, Bell, ChevronDown, Sun, Moon, ListChecks, LogOut, UserCog } from 'lucide-react';
import type { NavItem, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetClose, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import React, { useState, useEffect } from 'react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { getActiveUserProfile, setActiveUserId, ALL_MOCK_USERS } from '@/lib/auth';


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

  useEffect(() => {
    setActiveUser(getActiveUserProfile());
  }, [pathname]); // Re-check active user on path change, useful after router.refresh()

  const handleUserSwitch = (userId: string) => {
    setActiveUserId(userId);
    setActiveUser(ALL_MOCK_USERS.find(u => u.id === userId) || null);
    setIsMobileMenuOpen(false); // Close mobile menu if open
    router.refresh(); // Force re-fetch of server components & re-run client effects
  };


  const isUserManagementPage = pathname.startsWith('/admin') || pathname.startsWith('/staff');

  const NavLink = ({ href, label, icon: Icon, exact }: NavItem) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link href={href} passHref>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'flex items-center gap-2 justify-start w-full sm:w-auto text-sm',
            isActive ? 'text-primary-foreground bg-primary hover:bg-primary/90' : 'text-foreground hover:bg-accent/10 hover:text-accent-foreground'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {Icon && <Icon className="h-4 w-4" />}
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
            (pathname === mode.href || (mode.href === '/' && (pathname === '/' || pathname.startsWith('/items/') || pathname.startsWith('/my-items')))) && "bg-accent/20"
          )}
        >
          <mode.icon className="mr-2 h-4 w-4" />
          {mode.label}
        </DropdownMenuItem>
      ))}
    </>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" passHref>
          <Home className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-primary font-headline">RentalEase</span>
        </Link>

        <nav className="hidden sm:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-foreground hover:bg-accent/10 hover:text-accent-foreground">
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
                <Button variant="ghost" className="text-foreground hover:bg-accent/10 hover:text-accent-foreground">
                  <UserCog className="h-4 w-4 mr-2" />
                  {activeUser.name.split('(')[0].trim()} {/* Show name before parenthesis */}
                  <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Switch User</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ALL_MOCK_USERS.map(user => (
                  <DropdownMenuItem key={user.id} onClick={() => handleUserSwitch(user.id)} disabled={activeUser.id === user.id}>
                    <User className="mr-2 h-4 w-4" />
                    {user.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary hover:bg-accent/10">
            <Bell className="h-5 w-5" />
            {isUserManagementPage && ( 
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
            )}
            <span className="sr-only">Notifications</span>
          </Button>
          <ThemeToggleButton />
        </nav>

        <div className="sm:hidden flex items-center gap-1">
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
                <div className="p-6 border-b">
                  <div className="mb-6 flex items-center justify-between">
                    <SheetClose asChild>
                      <Link href="/" className="flex items-center gap-2" passHref>
                         <Home className="h-6 w-6 text-primary" />
                         <span className="text-xl font-bold text-primary font-headline">RentalEase</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                       <Button variant="ghost" size="icon">
                         <X className="h-6 w-6" />
                         <span className="sr-only">Close menu</span>
                       </Button>
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
                        <DropdownMenuLabel>Switch User</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {ALL_MOCK_USERS.map(user => (
                            <DropdownMenuItem key={user.id} onClick={() => handleUserSwitch(user.id)} disabled={activeUser.id === user.id}>
                            <User className="mr-2 h-4 w-4" />
                            {user.name}
                            </DropdownMenuItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <nav className="flex-grow p-6 flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                   <Button variant="ghost" className={cn(
                      'flex items-center gap-2 justify-start w-full sm:w-auto text-sm text-foreground hover:bg-accent/10 hover:text-accent-foreground relative'
                    )}
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                      }} 
                    >
                    <Bell className="h-4 w-4" />
                    Notifications
                    {isUserManagementPage && ( 
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 block h-2 w-2 rounded-full bg-accent" />
                    )}
                  </Button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
