from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Message, Conversation, MessageRead
from .serializers import MessageSerializer, ConversationSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.all()

    @action(detail=False, methods=['post'])
    def create_or_get(self, request):
        user_id = request.data.get('user_id')
        try:
            other_user = User.objects.get(id=user_id)
            conversation = Conversation.objects.filter(participants=request.user, is_group=False).filter(participants=other_user).first()
            if not conversation:
                conversation = Conversation.objects.create(is_group=False)
                conversation.participants.add(request.user, other_user)
            serializer = self.get_serializer(conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.request.query_params.get('conversation_id')
        if conversation_id:
            return Message.objects.filter(conversation_id=conversation_id)
        return Message.objects.filter(conversation__participants=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(sender=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        MessageRead.objects.get_or_create(message=message, user=request.user)
        return Response({"status": "Message marked as read"})
