from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Contact
import nacl.utils
import nacl.public
import base64

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'public_key', 'avatar', 'status']
        read_only_fields = ['id', 'public_key']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data.pop('password2'):
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        private_key = nacl.public.PrivateKey.generate()
        public_key = private_key.public_key
        UserProfile.objects.create(
            user=user,
            public_key=base64.b64encode(bytes(public_key)).decode('utf-8'),
            private_key_encrypted=base64.b64encode(bytes(private_key)).decode('utf-8'),
        )
        return user

class ContactSerializer(serializers.ModelSerializer):
    contact_username = serializers.CharField(source='contact.username', read_only=True)
    contact_email = serializers.EmailField(source='contact.email', read_only=True)
    contact_public_key = serializers.CharField(source='contact.profile.public_key', read_only=True)

    class Meta:
        model = Contact
        fields = ['id', 'contact', 'contact_username', 'contact_email', 'contact_public_key', 'blocked', 'added_at']
