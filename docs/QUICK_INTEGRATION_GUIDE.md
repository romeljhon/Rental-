# Quick Integration Guide

This guide will help you quickly integrate all the new improvements into your existing RentSnap application.

## 🚀 Step-by-Step Integration

### Step 1: Test the New Services (5 minutes)

First, verify that the backend is working with your new service layer:

```bash
# In your browser console (F12), try:
import { authService } from '@/services';

// Test health check
fetch('http://127.0.0.1:8000/api/health/')
  .then(res => res.json())
  .then(console.log);
```

---

### Step 2: Update Browse/Home Page (15 minutes)

Replace localStorage with API calls in `/src/app/page.tsx`:

```tsx
// OLD:
import { getAllItems } from '@/lib/item-storage';

// NEW:
import { itemsService } from '@/services';
import { AdvancedItemFilters, type FilterState } from '@/components/items/ItemFilters';

// In your component:
const [filters, setFilters] = useState<FilterState>({ search: '' });

const loadItems = async () => {
  const items = await itemsService.getAll(filters);
  setItems(items);
};

// Add filters to your UI:
<AdvancedItemFilters
  filters={filters}
  onChange={setFilters}
  onSearch={loadItems}
/>
```

---

### Step 3: Update My Items Page (10 minutes)

Replace in `/src/app/my-items/page.tsx`:

```tsx
// OLD:
import { getAllItems, deleteItem } from '@/lib/item-storage';

// NEW:
import { itemsService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

// In component:
const { user } = useAuth();

const loadItems = async () => {
  if (!user) return;
  const items = await itemsService.getByOwner(user.id);
  setMyItems(items);
};

const handleDelete = async (id: string) => {
  await itemsService.delete(id);
  loadItems(); // Refresh
};
```

---

### Step 4: Update Login Page (10 minutes)

Replace in `/src/app/login/page.tsx`:

```tsx
// NEW:
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PublicOnlyRoute } from '@/components/auth/ProtectedRoute';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      router.push('/'); // Will auto-redirect via PublicOnlyRoute
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <PublicOnlyRoute>
      {/* Your login form */}
    </PublicOnlyRoute>
  );
}
```

---

### Step 5: Update Register Page (10 minutes)

Similar to login:

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { PublicOnlyRoute } from '@/components/auth/ProtectedRoute';

export default function RegisterPage() {
  const { register } = useAuth();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <PublicOnlyRoute>
      {/* Your register form */}
    </PublicOnlyRoute>
  );
}
```

---

### Step 6: Add Image Upload to Item Forms (15 minutes)

Update `/src/app/items/new/page.tsx`:

```tsx
import { ImageUpload } from '@/components/upload/ImageUpload';
import { itemsService } from '@/services';

// In your form:
const [imageUrl, setImageUrl] = useState<string>('');

// In JSX:
<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  maxSizeMB={5}
  className="mb-6"
/>

// On submit:
const handleSubmit = async (formData) => {
  const newItem = await itemsService.create({
    name: formData.name,
    description: formData.description,
    price_per_day: formData.pricePerDay,
    category: formData.categoryId,
    image_url: imageUrl,
    location: formData.location,
    delivery_method: formData.deliveryMethod,
    owner_id: user.id,
  });
  
  router.push('/my-items');
};
```

---

### Step 7: Protect Routes (5 minutes)

Wrap protected pages with ProtectedRoute:

```tsx
// In any protected page:
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyItemsPage() {
  return (
    <ProtectedRoute>
      {/* Your page content */}
    </ProtectedRoute>
  );
}
```

---

### Step 8: Add Error Boundaries (5 minutes)

Wrap your layout with ErrorBoundary:

```tsx
// In app/layout.tsx:
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ErrorBoundary>
                <Header />
                <main>{children}</main>
                <Footer />
              </ErrorBoundary>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### Step 9: Update Header Component (10 minutes)

Update `/src/components/layout/Header.tsx` to use Auth context:

```tsx
// OLD:
import { getActiveUserProfile, logout } from '@/lib/auth';

// NEW:
import { useAuth } from '@/contexts/AuthContext';

// In component:
const { user, logout, isAuthenticated } = useAuth();

// Replace all getActiveUserProfile() with user
// Replace old logout with new logout function
```

---

### Step 10: Test Everything (20 minutes)

1. ✅ Register a new user
2. ✅ Login with credentials
3. ✅ Create a new item
4. ✅ Upload images
5. ✅ Browse items with filters
6. ✅ Send messages
7. ✅ View/edit profile
8. ✅ Logout

---

## 🎯 Priority Order

**Start with these pages first:**
1. Login page → Most critical
2. Register page → Second most critical
3. Header component → Used everywhere
4. My Items page → Demonstrates full CRUD
5. Browse page → Main user interface

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@/services'"

**Solution**: Make sure TypeScript can resolve the path. Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: CORS errors when calling API

**Solution**: Ensure Django CORS settings allow your frontend:
```python
# backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:9002",
    "http://localhost:3000",
]
```

### Issue: Authentication not persisting

**Solution**: Check that token is being stored:
```tsx
// Should see token in localStorage
console.log(localStorage.getItem('rentsnapToken'));
```

---

## ✨ New Features You Can Now Use

1. **Real Authentication** - No more mock users!
2. **Image Upload** - Add to any form
3. **Advanced Filters** - Add to browse page
4. **Messaging** - Already works at `/messages`
5. **User Profile** - Already works at `/profile`
6. **Error Boundaries** - Wrap any component
7. **Protected Routes** - Wrap any page

---

## 📝 Files to Update

**High Priority:**
- [ ] `/src/app/page.tsx` - Browse page
- [ ] `/src/app/login/page.tsx` - Login
- [ ] `/src/app/register/page.tsx` - Register  
- [ ] `/src/app/my-items/page.tsx` - My items
- [ ] `/src/components/layout/Header.tsx` - Header

**Medium Priority:**
- [ ] `/src/app/items/new/page.tsx` - Create item
- [ ] `/src/app/items/[id]/edit/page.tsx` - Edit item
- [ ] `/src/app/requests/page.tsx` - Rental requests

**Low Priority:**
- [ ] Update any other components using old auth or localStorage

---

## 🎉 You're Done!

Once you've integrated these changes, your app will have:
- ✅ Real backend authentication
- ✅ Persistent data storage
- ✅ Image uploads
- ✅ Advanced filtering
- ✅ Messaging system
- ✅ User profiles
- ✅ Error handling

**Need Help?** Check the docs folder for more detailed guides!

---

**Last Updated**: 2026-02-09
