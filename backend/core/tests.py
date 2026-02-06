from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Item, Category, RentalRequest

class RentalLifecycleTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username='owner', password='password')
        self.renter = User.objects.create_user(username='renter', password='password')
        self.category = Category.objects.create(name='Tools')
        self.item = Item.objects.create(
            name='Drill', 
            description='Power drill', 
            price_per_day=100.0,
            category=self.category,
            owner_id=str(self.owner.id)
        )

    def test_rental_flow(self):
        # 1. Renter creates request
        self.client.force_authenticate(user=self.renter)
        response = self.client.post('/api/requests/', {
            'item': self.item.id,
            'requester_name': 'Renter',
            'owner_name': 'Owner',
            'start_date': '2026-02-10',
            'end_date': '2026-02-12',
            'total_price': 200.0
        })
        self.assertEqual(response.status_code, 201)
        request_id = response.data['id']

        # 2. Owner approves
        self.client.force_authenticate(user=self.owner)
        self.client.patch(f'/api/requests/{request_id}/', {'status': 'Approved'})
        
        # 3. Simulate Payment
        self.client.force_authenticate(user=self.renter)
        response = self.client.post(f'/api/requests/{request_id}/simulate_payment/')
        self.assertEqual(response.status_code, 200)

        # 4. Handover
        req = RentalRequest.objects.get(id=request_id)
        code = req.handover_code
        response = self.client.post(f'/api/requests/{request_id}/confirm_handover/', {'code': code})
        self.assertEqual(response.status_code, 200)
        
        # Check it is now 'InHand'
        req.refresh_from_db()
        self.assertEqual(req.status, 'InHand')
        self.assertFalse(req.item.is_available)
