from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Item(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    image_url = models.URLField(max_length=500, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    reviews_count = models.IntegerField(default=0)
    owner_id = models.CharField(max_length=100, default='user123', db_index=True)
    delivery_method = models.CharField(max_length=50, default='Both')
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class RentalRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
        ('AwaitingPayment', 'AwaitingPayment'),
        ('ReceiptConfirmed', 'ReceiptConfirmed'),
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='requests')
    requester_name = models.CharField(max_length=100)
    owner_name = models.CharField(max_length=100)
    requester_id = models.CharField(max_length=100, default='user123', db_index=True)
    owner_id = models.CharField(max_length=100, default='user456', db_index=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    requested_at = models.DateTimeField(auto_now_add=True)
    rating_given = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Request for {self.item.name} by {self.requester_name}"

class Notification(models.Model):
    target_user_id = models.CharField(max_length=100, db_index=True)
    event_type = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    related_item_id = models.CharField(max_length=100, blank=True, null=True)
    related_user_id = models.CharField(max_length=100, blank=True, null=True)
    related_user_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Notification for {self.target_user_id}: {self.title}"

class Conversation(models.Model):
    # Using string IDs for participants as well for now
    participant_ids = models.JSONField(default=list) 
    item_context = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Conversation {self.id} between {self.participant_ids}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender_id = models.CharField(max_length=100)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender_id} in conversation {self.conversation_id}"
