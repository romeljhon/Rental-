from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import Item, Category, RentalRequest, Notification, Conversation, Message
from .serializers import (
    ItemSerializer, CategorySerializer, RentalRequestSerializer,
    NotificationSerializer, ConversationSerializer, MessageSerializer,
    UserSerializer, RegisterSerializer
)

class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token.key
        })

class LoginAPI(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "user": UserSerializer(user).data,
                "token": token.key
            })
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok", "message": "Backend is running"})

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.select_related('category').all()
    serializer_class = ItemSerializer

    def get_queryset(self):
        queryset = self.queryset
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

class RentalRequestViewSet(viewsets.ModelViewSet):
    queryset = RentalRequest.objects.select_related('item').all()
    serializer_class = RentalRequestSerializer

    def get_queryset(self):
        queryset = self.queryset
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
    queryset = Conversation.objects.select_related('item_context').prefetch_related('messages').all()
    serializer_class = ConversationSerializer

    def get_queryset(self):
        queryset = self.queryset
        user_id = self.request.query_params.get('user_id')
        if user_id:
            # Better way for JSONField on SQLite/Postgres
            queryset = queryset.filter(participant_ids__contains=user_id)
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
