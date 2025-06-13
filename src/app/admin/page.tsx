
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';
import { UserManagementTable } from '@/components/admin/UserManagementTable';

export default function AdminPage() {
  return (
    <div className="space-y-8"> {/* Increased spacing between cards */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
            <Shield className="h-6 w-6" />
            Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome to the Admin Dashboard. Manage users, site settings, and critical operations.
          </p>
          <div className="mt-6 p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-3">Key Admin Areas</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>User Management (Detailed below)</li>
              <li>Content Moderation</li>
              <li>Platform Analytics</li>
              <li>System Configuration</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <UserManagementTable />

      {/* Placeholder for Content Moderation */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            Content Moderation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Review and manage user-generated content. (Coming soon)
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for Platform Analytics */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            Platform Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            View key metrics and site performance. (Coming soon)
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for System Configuration */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage site-wide settings and integrations. (Coming soon)
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
