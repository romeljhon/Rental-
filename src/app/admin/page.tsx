
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, ListChecks, BarChart3, Settings } from 'lucide-react';
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
              <li>Content Moderation (Detailed below)</li>
              <li>Platform Analytics</li>
              <li>System Configuration</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <UserManagementTable />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <ListChecks className="h-5 w-5" />
            Content Moderation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3">
            Review and manage user-generated content to maintain community standards.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30 text-sm">
            <h4 className="font-semibold mb-2">Key Moderation Tasks:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Review reported items and listings</li>
              <li>Moderate user comments and reviews</li>
              <li>Manage flagged user accounts</li>
              <li>Define and update content policies</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground italic">(Full feature coming soon)</p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Platform Analytics */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
           <BarChart3 className="h-5 w-5" />
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
            <Settings className="h-5 w-5" />
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
