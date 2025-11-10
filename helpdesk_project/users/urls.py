from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRegistrationViewSet # 1. Import ViewSet

router = DefaultRouter()


router.register(r'register', UserRegistrationViewSet, basename='register')

urlpatterns = [
    path('', include(router.urls)),
]