# 🚀 RentSnap - Fast & Snappy Rentals

**RentSnap** is a modern, full-stack rental platform where users can list items for rent and browse available listings. Built with Next.js 15, Django, and a premium UI design.

![RentSnap](https://placehold.co/1200x630/10b981/ffffff?text=RentSnap+Platform)

## ✨ Features

### 🎯 Core Features
- **User Authentication** - Secure login and registration with Django backend
- **Item Listings** - Create, edit, and manage rental items
- **Smart Filtering** - Search by category, price range, location, and availability
- **Rental Requests** - Request to rent items with status tracking
- **Real-time Notifications** - Get notified of requests, approvals, and messages
- **Messaging System** - Chat with renters and owners
- **User Profiles** - Manage your profile and view rental history
- **Image Upload** - Upload multiple images for your listings
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile

### 🎨 Premium UI
- Modern glass morphism design
- Dark/Light theme support
- Smooth animations and transitions
- Mobile-optimized interface
- Accessibility-first approach

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Date**: date-fns
- **State**: React Context API

### Backend
- **Framework**: Django 5.x
- **API**: Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Token-based auth

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rentsnap.git
cd rentsnap
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local and set:
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install django djangorestframework django-cors-headers

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Create some categories (run in Django shell)
python manage.py shell
```

In the Django shell:
```python
from core.models import Category
Category.objects.create(name='Electronics')
Category.objects.create(name='Vehicles')  
Category.objects.create(name='Tools')
Category.objects.create(name='Sports Equipment')
exit()
```

### 4. Run the Application

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```
Backend will run on http://127.0.0.1:8000

#### Terminal 2 - Frontend
```bash
npm run dev
```
Frontend will run on http://localhost:9002

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### Backend (backend/.env) - Optional
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:9002,http://localhost:3000
```

## 📁 Project Structure

```
rentsnap/
├── src/
│   ├── app/                 # Next.js pages (App Router)
│   │   ├── page.tsx        # Home/Browse page
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── my-items/       # User's listed items
│   │   ├── requests/       # Rental requests
│   │   ├── messages/       # Messaging
│   │   └── items/          # Item pages
│   ├── components/         # React components
│   │   ├── auth/          # Auth-related components
│   │   ├── items/         # Item components
│   │   ├── layout/        # Layout components
│   │   ├── ui/            # UI components (shadcn)
│   │   └── upload/        # Upload components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and helpers
│   ├── services/          # API service layer
│   │   ├── auth.service.ts
│   │   ├── items.service.ts
│   │   ├── requests.service.ts
│   │   └── ...
│   └── types/             # TypeScript types
│
├── backend/
│   ├── core/              # Django app
│   │   ├── models.py     # Database models
│   │   ├── views.py      # API views
│   │   ├── serializers.py # DRF serializers
│   │   └── urls.py       # URL routing
│   └── config/           # Django configuration
│
├── public/               # Static assets
├── .agent/              # AI agent workflows
└── docs/                # Documentation
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your repository
2. Set environment variables
3. Deploy!

### Backend (Railway/Render/Heroku)
1. Add `requirements.txt`:
   ```
   django
   djangorestframework
   django-cors-headers
   gunicorn
   psycopg2-binary
   ```
2. Add `Procfile`:
   ```
   web: gunicorn config.wsgi
   ```
3. Configure environment variables
4. Deploy!

## 🎯 API Endpoints

### Authentication
- `POST /api/register/` - Register new user
- `POST /api/login/` - Login user
- `GET /api/health/` - Health check

### Items
- `GET /api/items/` - List all items
- `GET /api/items/:id/` - Get item details
- `POST /api/items/` - Create new item
- `PATCH /api/items/:id/` - Update item
- `DELETE /api/items/:id/` - Delete item

### Requests
- `GET /api/requests/` - List requests
- `POST /api/requests/` - Create rental request
- `PATCH /api/requests/:id/` - Update request status

### Notifications
- `GET /api/notifications/` - Get user notifications
- `PATCH /api/notifications/:id/` - Mark as read

### Messages
- `GET /api/conversations/` - Get conversations
- `GET /api/messages/` - Get messages
- `POST /api/messages/` - Send message

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by the RentSnap Team

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Django](https://www.djangoproject.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Happy Renting! 🎉**
