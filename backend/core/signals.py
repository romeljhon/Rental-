from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Avg
from .models import RentalRequest, Notification, Item

@receiver(post_save, sender=RentalRequest)
def handle_rental_lifecycle_notifications(sender, instance, created, **kwargs):
    # Only notify on status changes (not just creation, though creation is a status change)
    # Map status to human friendly messages
    status_messages = {
        'Approved': ('Request Approved!', f'Your request for {instance.item.name} was approved.'),
        'Paid': ('Payment Confirmed', f'Payment for {instance.item.name} received. Ready for handover!'),
        'Rejected': ('Request Rejected', f'Your request for {instance.item.name} was rejected.'),
        'Returned': ('Item Returned', f'{instance.requester_name} has returned {instance.item.name}.'),
        'Completed': ('Rental Completed', f'Thank you for renting {instance.item.name}!'),
        'Disputed': ('Dispute Opened', f'A dispute has been opened for {instance.item.name}.'),
    }

    if instance.status in status_messages:
        title, message = status_messages[instance.status]
        
        # Determine who gets the notification
        # Usually renter for approval/payment/return-success
        # Usually owner for return-received
        if instance.status in ['Approved', 'Paid', 'Rejected', 'Completed']:
            target_id = instance.requester_id
        else: # Returned, Disputed
            target_id = instance.owner_id

        Notification.objects.create(
            target_user_id=target_id,
            event_type='request_update',
            title=title,
            message=message,
            link='/requests',
            related_item_id=str(instance.item.id),
            related_user_id=instance.owner_id if target_id == instance.requester_id else instance.requester_id,
            related_user_name=instance.owner_name if target_id == instance.requester_id else instance.requester_name
        )

@receiver(post_save, sender=RentalRequest)
def update_item_rating(sender, instance, **kwargs):
    if instance.status == 'Completed' and instance.rating_given:
        item = instance.item
        # Recalculate average
        avg_rating = RentalRequest.objects.filter(
            item=item, 
            status='Completed', 
            rating_given__isnull=False
        ).aggregate(Avg('rating_given'))['rating_given__avg']
        
        count = RentalRequest.objects.filter(
            item=item, 
            status='Completed', 
            rating_given__isnull=False
        ).count()
        
        item.rating = avg_rating or 0.0
        item.reviews_count = count
        item.save()
