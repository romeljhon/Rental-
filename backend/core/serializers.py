from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Item, Category, RentalRequest, Notification, Conversation, Message, ItemImage, Transaction, Dispute

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class ItemSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'image_url', 'price_per_day']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image', 'is_primary']

class ItemSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    owner_details = serializers.SerializerMethodField()
    item_images = ItemImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'price_per_day', 'security_deposit', 
            'category', 'category_name', 'image_url', 'item_images', 'location', 
            'rating', 'reviews_count', 'is_available', 'owner_id', 'owner_details', 
            'delivery_method', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'category': {'required': True}
        }
    
    def get_owner_details(self, obj):
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(id=obj.owner_id)
            return {
                "id": str(user.id),
                "name": user.username,
                "avatarUrl": "https://placehold.co/100x100.png"
            }
        except (User.DoesNotExist, ValueError):
            return {
                "id": obj.owner_id,
                "name": f"User {obj.owner_id}",
                "avatarUrl": "https://placehold.co/100x100.png"
            }

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class DisputeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = '__all__'

class RentalRequestSerializer(serializers.ModelSerializer):
    item_details = ItemSummarySerializer(source='item', read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    dispute = DisputeSerializer(read_only=True)
    
    class Meta:
        model = RentalRequest
        fields = [
            'id', 'item', 'item_details', 'requester_name', 'owner_name', 
            'requester_id', 'owner_id', 'start_date', 'end_date', 'status', 
            'total_price', 'deposit_amount', 'handover_code', 'return_code', 
            'requested_at', 'rating_given', 'transactions', 'dispute'
        ]
        read_only_fields = ['handover_code', 'return_code', 'requester_id', 'owner_id']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    item_details = ItemSummarySerializer(source='item_context', read_only=True)
    participants_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participant_ids', 'participants_details', 'item_context', 'item_details', 'messages', 'created_at', 'updated_at']

    def get_participants_details(self, obj):
        from django.contrib.auth.models import User
        details = []
        for uid in obj.participant_ids:
            try:
                user = User.objects.get(id=uid)
                details.append({
                    "id": str(user.id),
                    "name": user.username,
                    "avatarUrl": "https://placehold.co/40x40.png"
                })
            except (User.DoesNotExist, ValueError):
                details.append({
                    "id": uid,
                    "name": f"User {uid}",
                    "avatarUrl": "https://placehold.co/40x40.png"
                })
        return details
