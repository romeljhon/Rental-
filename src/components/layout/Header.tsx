
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, PlusCircle, CalendarCheck, MessageCircle, Menu, X, Shield, Users } from 'lucide-react';
import type { NavItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import React from 'react';

const navItems: NavItem[] = [
  { href: '/', label: 'Browse', icon: LayoutGrid, exact: true },
  { href: '/items/new', label: 'Add Item', icon: PlusCircle },
  { href: '/requests', label: 'My Requests', icon: CalendarCheck },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/staff', label: 'Staff', icon: Users },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
  
  const commonClasses = "text-foreground hover:text-primary transition-colors";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" passHref>
          <Home className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-primary font-headline">RentalEase</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center space-x-2">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
              <div className="mb-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2" passHref onClick={() => setIsMobileMenuOpen(false)}>
                   <Home className="h-6 w-6 text-primary" />
                   <span className="text-xl font-bold text-primary font-headline">RentalEase</span>
                </Link>
                <SheetClose asChild>
                   <Button variant="ghost" size="icon">
                     <X className="h-6 w-6" />
                     <span className="sr-only">Close menu</span>
                   </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// Helper needed for Button className
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
