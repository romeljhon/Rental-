
import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from core.models import Item, Category, RentalRequest, Notification, Conversation, Message

class Command(BaseCommand):
    help = 'Seeds the database with initial data for RentalEase'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # 1. Clear existing data
        self.stdout.write('Clearing old data...')
        RentalRequest.objects.all().delete()
        Notification.objects.all().delete()
        Message.objects.all().delete()
        Conversation.objects.all().delete()
        Item.objects.all().delete()
        Category.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        # 2. Create Users
        self.stdout.write('Creating users...')
        users = []
        user_data = [
            ('john_doe', 'john@example.com', 'password123'),
            ('jane_smith', 'jane@example.com', 'password123'),
            ('mike_renter', 'mike@example.com', 'password123'),
            ('alice_lender', 'alice@example.com', 'password123'),
            ('bob_builder', 'bob@example.com', 'password123'),
        ]

        for username, email, password in user_data:
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(username=username, email=email, password=password)
                users.append(user)
            else:
                users.append(User.objects.get(username=username))

        # 3. Create Categories
        self.stdout.write('Creating categories...')
        categories = ['Electronics', 'Tools', 'Camping Gear', 'Party Supplies', 'Sports Equipment', 'Vehicles']
        cat_objs = {}
        for cat_name in categories:
            cat, _ = Category.objects.get_or_create(name=cat_name)
            cat_objs[cat_name] = cat

        # 4. Create Items
        self.stdout.write('Creating items...')
        item_data = [
            {
                'name': 'Canon EOS R5 Camera',
                'description': 'Professional mirrorless camera, great for weddings and events. Includes 24-70mm lens.',
                'price': 85.00,
                'category': 'Electronics',
                'owner': users[0], # John
                'image': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
                'location': 'Downtown Metro',
                'delivery_method': 'Pickup',
            },
            {
                'name': 'Bosch Hammer Drill',
                'description': 'Heavy duty drill for concrete and masonry. Comes with bit set.',
                'price': 25.00,
                'category': 'Tools',
                'owner': users[1], # Jane
                'image': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80',
                'location': 'Westside Suburbs',
                'delivery_method': 'Both',
            },
            {
                'name': '4-Person Tent',
                'description': 'Spacious waterproof tent, easy setup. Perfect for weekend getaways.',
                'price': 15.00,
                'category': 'Camping Gear',
                'owner': users[3], # Alice
                'image': 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80',
                'location': 'North Hills',
                'delivery_method': 'Delivery',
            },
            {
                'name': 'DJ Speaker Set',
                'description': 'Pair of 1000W active speakers with stands and cables. Bluetooth compatible.',
                'price': 120.00,
                'category': 'Party Supplies',
                'owner': users[0],
                'image': 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80',
                'location': 'Downtown Metro',
                'delivery_method': 'Pickup',
            },
            {
                'name': 'Mountain Bike',
                'description': 'Full suspension trail bike, size L. Helmet included upon request.',
                'price': 45.00,
                'category': 'Sports Equipment',
                'owner': users[2], # Mike
                'image': 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80',
                'location': 'East Riverside',
                'delivery_method': 'Both',
            },
             {
                'name': 'Projector 4K',
                'description': 'High brightness 4K projector for home cinema or presentations.',
                'price': 55.00,
                'category': 'Electronics',
                'owner': users[4], # Bob
                'image': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80',
                'location': 'South Tech Park',
                'delivery_method': 'Delivery',
            },
        ]

        created_items = []
        for data in item_data:
            item = Item.objects.create(
                name=data['name'],
                description=data['description'],
                price_per_day=data['price'],
                category=cat_objs[data['category']],
                owner_id=str(data['owner'].id),
                image_url=data['image'],
                location=data['location'],
                rating=random.choice([4.0, 4.5, 4.8, 5.0]),
                reviews_count=random.randint(1, 20),
                delivery_method=data['delivery_method']
            )
            created_items.append(item)

        # 5. Create Rental Requests
        self.stdout.write('Creating rental requests...')
        
        # Request: Mike wants John's Camera
        req1 = RentalRequest.objects.create(
            item=created_items[0], # Camera
            requester_name=users[2].username, # Mike
            owner_name=users[0].username, # John
            requester_id=str(users[2].id),
            owner_id=str(users[0].id),
            start_date=timezone.now().date() + timedelta(days=2),
            end_date=timezone.now().date() + timedelta(days=5),
            status='Pending',
            total_price=created_items[0].price_per_day * 3,
        )

        # Request: Alice wants Jane's Drill
        req2 = RentalRequest.objects.create(
            item=created_items[1], # Drill
            requester_name=users[3].username, # Alice
            owner_name=users[1].username, # Jane
            requester_id=str(users[3].id),
            owner_id=str(users[1].id),
            start_date=timezone.now().date() - timedelta(days=5),
            end_date=timezone.now().date() - timedelta(days=2),
            status='Completed',
            total_price=created_items[1].price_per_day * 3,
            rating_given=5
        )

         # Request: Bob wants John's Speakers
        req3 = RentalRequest.objects.create(
            item=created_items[3], # Speakers
            requester_name=users[4].username, # Bob
            owner_name=users[0].username, # John
            requester_id=str(users[4].id),
            owner_id=str(users[0].id),
            start_date=timezone.now().date() + timedelta(days=10),
            end_date=timezone.now().date() + timedelta(days=12),
            status='Approved',
            total_price=created_items[3].price_per_day * 2,
        )

        # 6. Create Notifications
        self.stdout.write('Creating notifications...')
        
        # Notify John about Mike's request
        Notification.objects.create(
            target_user_id=str(users[0].id),
            event_type='rental_request',
            title='New Rental Request',
            message=f'{users[2].username} requested to rent {created_items[0].name}',
            link=f'/requests',
            is_read=False,
            related_item_id=str(created_items[0].id),
            related_user_id=str(users[2].id),
            related_user_name=users[2].username
        )

        # Notify Mike (welcome)
        Notification.objects.create(
            target_user_id=str(users[2].id),
            event_type='system',
            title='Welcome to RentalEase',
            message='Thanks for joining! Start browsing items near you.',
            link='/profile',
            is_read=True
        )

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
