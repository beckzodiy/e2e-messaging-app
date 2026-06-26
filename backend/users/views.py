from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .models import UserProfile, Contact
from .serializers import UserProfileSerializer, UserRegistrationSerializer, ContactSerializer

class UserRegistrationViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.all()

    @action(detail=False, methods=['get'])
    def me(self, request):
        profile = request.user.profile
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_status(self, request):
        profile = request.user.profile
        status_value = request.data.get('status')
        if status_value in ['online', 'offline', 'away']:
            profile.status = status_value
            profile.save()
            return Response({"status": profile.status})
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user, blocked=False)

    @action(detail=False, methods=['post'])
    def add_contact(self, request):
        contact_username = request.data.get('username')
        try:
            contact_user = User.objects.get(username=contact_username)
            contact, created = Contact.objects.get_or_create(user=request.user, contact=contact_user)
            if created:
                return Response({"message": "Contact added"}, status=status.HTTP_201_CREATED)
            return Response({"message": "Contact already exists"})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'])
    def remove_contact(self, request):
        contact_username = request.data.get('username')
        try:
            contact_user = User.objects.get(username=contact_username)
            Contact.objects.filter(user=request.user, contact=contact_user).delete()
            return Response({"message": "Contact removed"})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
