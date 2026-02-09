export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} RentSnap. All rights reserved.</p>
        <p className="mt-1">Fast, secure, and snappy rentals.</p>
      </div>
    </footer>
  );
}
