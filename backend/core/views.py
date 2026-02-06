from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Item, Category, RentalRequest, Notification, Conversation, Message
from .serializers import (
    ItemSerializer, CategorySerializer, RentalRequestSerializer,
    NotificationSerializer, ConversationSerializer, MessageSerializer
)

@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok", "message": "Backend is running"})

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def get_queryset(self):
        queryset = Item.objects.all()
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

class RentalRequestViewSet(viewsets.ModelViewSet):
    queryset = RentalRequest.objects.all()
    serializer_class = RentalRequestSerializer

    def get_queryset(self):
        queryset = RentalRequest.objects.all()
        requester = self.request.query_params.get('requester')
        owner = self.request.query_params.get('owner')
        if requester:
            queryset = queryset.filter(requester_id=requester)
        if owner:
            queryset = queryset.filter(owner_id=owner)
        return queryset

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_queryset(self):
        queryset = Notification.objects.all()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(target_user_id=user_id)
        return queryset.order_by('-timestamp')

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer

    def get_queryset(self):
        queryset = Conversation.objects.all()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            # Simple check if user_id is in participant_ids list
            # Note: This is a hack for SQLite + JSONField. In Production use a more robust check.
            queryset = [c for c in queryset if user_id in c.participant_ids]
            return queryset
        return queryset

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        queryset = Message.objects.all()
        conversation_id = self.request.query_params.get('conversation_id')
        if conversation_id:
            queryset = queryset.filter(conversation_id=conversation_id)
        return queryset.order_by('timestamp')
