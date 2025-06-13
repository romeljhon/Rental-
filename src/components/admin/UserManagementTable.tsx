
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, User, Edit3, UserX, UserCheck, ShieldAlert, ShieldCheck, Mail, CalendarPlus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'User';
  status: 'Active' | 'Suspended' | 'Pending';
  joinedDate: string;
  avatarUrl?: string;
}

const mockAdminUsers: AdminManagedUser[] = [
  { id: 'usr_1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin', status: 'Active', joinedDate: '2023-01-15', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'usr_2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Staff', status: 'Active', joinedDate: '2023-02-20', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'usr_3', name: 'Charlie Chaplin', email: 'charlie@example.com', role: 'User', status: 'Suspended', joinedDate: '2023-03-10', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'usr_4', name: 'Diana Prince', email: 'diana@example.com', role: 'User', status: 'Active', joinedDate: '2023-04-05' },
  { id: 'usr_5', name: 'Edward Elric', email: 'edward@example.com', role: 'User', status: 'Pending', joinedDate: '2023-05-25', avatarUrl: 'https://placehold.co/40x40.png' },
];

const roleBadgeVariant: Record<AdminManagedUser['role'], 'default' | 'secondary' | 'outline'> = {
  Admin: 'default',
  Staff: 'secondary',
  User: 'outline',
};

const statusBadgeVariant: Record<AdminManagedUser['status'], 'default' | 'destructive' | 'outline'> = {
  Active: 'default', // Using 'default' for active, often green or primary
  Suspended: 'destructive',
  Pending: 'outline', // Using 'outline' for pending, often yellow or gray
};

const statusLucideIcon: Record<AdminManagedUser['status'], React.ElementType> = {
    Active: ShieldCheck,
    Suspended: ShieldAlert,
    Pending: UserX,
}


export function UserManagementTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminManagedUser[]>(mockAdminUsers);

  const handleEditRole = (userId: string, newRole: AdminManagedUser['role']) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, role: newRole } : user));
    toast({ title: "Role Updated", description: `User ${userId}'s role changed to ${newRole}. (Mock)` });
  };

  const handleChangeStatus = (userId: string, currentStatus: AdminManagedUser['status']) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, status: newStatus } : user));
    toast({ title: "Status Updated", description: `User ${userId}'s status changed to ${newStatus}. (Mock)` });
  };
  
  const handleViewProfile = (userId: string) => {
    toast({ title: "View Profile", description: `Viewing profile for user ${userId}. (Mock - Navigates to user page)` });
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <Users className="h-5 w-5" /> Manage Users
        </CardTitle>
        <CardDescription>View, edit roles, and manage user statuses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const StatusIcon = statusLucideIcon[user.status];
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile person" />
                          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5"/> {user.email}
                        </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant[user.role]} className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[user.status]} className="capitalize">
                        <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <CalendarPlus className="h-3.5 w-3.5"/> {user.joinedDate}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">User Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewProfile(user.id)}>
                            <User className="mr-2 h-4 w-4" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Edit Role</DropdownMenuLabel>
                          {['Admin', 'Staff', 'User'].map(role => (
                             <DropdownMenuItem key={role} onClick={() => handleEditRole(user.id, role as AdminManagedUser['role'])} disabled={user.role === role}>
                                {user.role === role ? <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                                Set as {role}
                             </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleChangeStatus(user.id, user.status)}>
                            {user.status === 'Active' ? <UserX className="mr-2 h-4 w-4 text-destructive" /> : <UserCheck className="mr-2 h-4 w-4 text-green-600" />}
                            {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>No users found.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
