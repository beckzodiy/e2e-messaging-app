from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRegistrationViewSet, UserProfileViewSet, ContactViewSet

router = DefaultRouter()
router.register(r'register', UserRegistrationViewSet, basename='register')
router.register(r'profile', UserProfileViewSet, basename='profile')
router.register(r'contacts', ContactViewSet, basename='contacts')

urlpatterns = [path('', include(router.urls))]
