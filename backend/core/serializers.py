from rest_framework import serializers
from .models import Item, Category, RentalRequest, Notification, Conversation, Message

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    
    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'price_per_day', 'category', 'category_name', 
            'image_url', 'location', 'rating', 'reviews_count', 'is_available', 
            'owner_id', 'delivery_method', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'category': {'required': True}
        }
    
    def validate_price_per_day(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

class ItemSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'image_url', 'price_per_day']

class RentalRequestSerializer(serializers.ModelSerializer):
    item_details = ItemSummarySerializer(source='item', read_only=True)
    
    class Meta:
        model = RentalRequest
        fields = '__all__'

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
    
    class Meta:
        model = Conversation
        fields = ['id', 'participant_ids', 'item_context', 'item_details', 'messages', 'created_at', 'updated_at']
