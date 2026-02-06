from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    health_check, ItemViewSet, CategoryViewSet, RentalRequestViewSet, 
    NotificationViewSet, ConversationViewSet, MessageViewSet,
    RegisterAPI, LoginAPI
)

router = DefaultRouter()
router.register(r'items', ItemViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'requests', RentalRequestViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'conversations', ConversationViewSet)
router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/register/', RegisterAPI.as_view(), name='register'),
    path('auth/login/', LoginAPI.as_view(), name='login'),
    path('', include(router.urls)),
]
