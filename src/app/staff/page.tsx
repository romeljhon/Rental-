
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
            <Users className="h-6 w-6" />
            Staff Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome to the Staff Dashboard. Access tools and information relevant to your role.
          </p>
          <div className="mt-6 p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-3">Common Staff Tools</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Manage Listings</li>
              <li>Handle Support Tickets</li>
              <li>View Rental Reports</li>
              <li>Internal Communications</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
