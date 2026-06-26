from rest_framework import serializers
from .models import Message, Conversation
from users.serializers import UserProfileSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender = UserProfileSerializer(read_only=True, source='sender.profile')

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_username', 'encrypted_content', 'iv', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at', 'sender']

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserProfileSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'is_group', 'name', 'created_at', 'updated_at', 'last_message']

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return MessageSerializer(last_message).data
        return None
