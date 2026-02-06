from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import RentalRequest
from datetime import timedelta

class Command(BaseCommand):
    help = 'Automatically cancel pending requests older than 24 hours'

    def handle(self, *args, **options):
        threshold = timezone.now() - timedelta(hours=24)
        expired_count = RentalRequest.objects.filter(
            status='Pending', 
            requested_at__lt=threshold
        ).update(status='Cancelled')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully cancelled {expired_count} expired requests'))
