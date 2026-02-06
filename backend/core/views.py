from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.db import models
from django.contrib.auth import authenticate
from .models import Item, Category, RentalRequest, Notification, Conversation, Message, ItemImage, Transaction, Dispute
from .serializers import (
    ItemSerializer, CategorySerializer, RentalRequestSerializer,
    NotificationSerializer, ConversationSerializer, MessageSerializer,
    UserSerializer, RegisterSerializer, ItemImageSerializer, 
    TransactionSerializer, DisputeSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.select_related('category').prefetch_related('item_images').all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = self.queryset
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def perform_create(self, serializer):
        # Set the owner
        item = serializer.save(owner_id=str(self.request.user.id))
        
        # Handle multiple images if provided in multipart request
        images = self.request.FILES.getlist('images')
        for i, img in enumerate(images):
            ItemImage.objects.create(
                item=item,
                image=img,
                is_primary=(i == 0) # First one is primary
            )

class ItemImageViewSet(viewsets.ModelViewSet):
    queryset = ItemImage.objects.all()
    serializer_class = ItemImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class RentalRequestViewSet(viewsets.ModelViewSet):
    queryset = RentalRequest.objects.select_related('item').all()
    serializer_class = RentalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = str(self.request.user.id)
        return self.queryset.filter(models.Q(requester_id=user_id) | models.Q(owner_id=user_id))

    def perform_create(self, serializer):
        item = serializer.validated_data['item']
        serializer.save(
            requester_id=str(self.request.user.id),
            owner_id=item.owner_id
        )

    @action(detail=True, methods=['post'])
    def confirm_handover(self, request, pk=None):
        rental_request = self.get_object()
        code = request.data.get('code')
        
        if rental_request.status != 'Paid':
            return Response({"error": "Item must be paid for before handover."}, status=status.HTTP_400_BAD_REQUEST)
            
        if code == rental_request.handover_code:
            rental_request.status = 'InHand'
            rental_request.save()
            
            # Update item availability
            item = rental_request.item
            item.is_available = False
            item.save()
            
            return Response({"status": "Handover confirmed. Happy renting!"})
            
        return Response({"error": "Invalid handover code."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def confirm_return(self, request, pk=None):
        rental_request = self.get_object()
        code = request.data.get('code')
        
        if rental_request.status != 'InHand':
            return Response({"error": "Item must be 'InHand' to be returned."}, status=status.HTTP_400_BAD_REQUEST)
            
        if code == rental_request.return_code:
            rental_request.status = 'Returned'
            rental_request.save()
            
            # Item is back, but needs owner final inspection or just make it available
            item = rental_request.item
            item.is_available = True
            item.save()
            
            return Response({"status": "Return confirmed. Item is now back with the owner."})
            
        return Response({"error": "Invalid return code."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def simulate_payment(self, request, pk=None):
        """Simulate a successful payment for testing the lifecycle."""
        rental_request = self.get_object()
        # Allows payment from Approved or AwaitingPayment
        if rental_request.status not in ['Approved', 'AwaitingPayment']:
             return Response({"error": f"Request status {rental_request.status} cannot be paid."}, status=status.HTTP_400_BAD_REQUEST)
             
        Transaction.objects.create(
            rental_request=rental_request,
            amount=rental_request.total_price + rental_request.deposit_amount,
            transaction_type='Payment',
            status='Success'
        )
        
        rental_request.status = 'Paid'
        rental_request.save()
        return Response({"status": "Payment simulated successfully."})

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = str(self.request.user.id)
        return self.queryset.filter(
            models.Q(rental_request__requester_id=user_id) | 
            models.Q(rental_request__owner_id=user_id)
        )

class DisputeViewSet(viewsets.ModelViewSet):
    queryset = Dispute.objects.all()
    serializer_class = DisputeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = str(self.request.user.id)
        return self.queryset.filter(
            models.Q(rental_request__requester_id=user_id) | 
            models.Q(rental_request__owner_id=user_id)
        )

    def perform_create(self, serializer):
        rental_request = serializer.validated_data['rental_request']
        rental_request.status = 'Disputed'
        rental_request.save()
        serializer.save(reporter_id=str(self.request.user.id))

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(target_user_id=str(self.request.user.id)).order_by('-timestamp')

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.select_related('item_context').prefetch_related('messages').all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = str(self.request.user.id)
        return self.queryset.filter(participant_ids__contains=user_id)

    def perform_create(self, serializer):
        participant_ids = self.request.data.get('participant_ids', [])
        user_id = str(self.request.user.id)
        if user_id not in participant_ids:
            participant_ids.append(user_id)
        serializer.save(participant_ids=participant_ids)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.request.query_params.get('conversation_id')
        user_id = str(self.request.user.id)
        
        if conversation_id:
            conv = Conversation.objects.filter(id=conversation_id, participant_ids__contains=user_id).first()
            if conv:
                return self.queryset.filter(conversation_id=conversation_id).order_by('timestamp')
            return self.queryset.none()
        
        return self.queryset.filter(conversation__participant_ids__contains=user_id).order_by('timestamp')

    def perform_create(self, serializer):
        serializer.save(sender_id=str(self.request.user.id))
