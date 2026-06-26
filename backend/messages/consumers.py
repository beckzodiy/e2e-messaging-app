import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message, Conversation

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope['user']
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        if message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'typing':
            await self.handle_typing(data)

    async def handle_chat_message(self, data):
        message = await self.save_message(
            self.conversation_id,
            self.user.id,
            data.get('encrypted_content'),
            data.get('iv')
        )
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'chat_message',
            'message': {
                'id': message.id,
                'sender_id': message.sender.id,
                'sender_username': message.sender.username,
                'encrypted_content': message.encrypted_content,
                'iv': message.iv,
                'created_at': message.created_at.isoformat(),
            }
        })

    async def handle_typing(self, data):
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'user_typing',
            'user_id': self.user.id,
            'username': self.user.username,
        })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'chat_message', 'message': event['message']}))

    async def user_typing(self, event):
        await self.send(text_data=json.dumps({'type': 'user_typing', 'user_id': event['user_id'], 'username': event['username']}))

    @database_sync_to_async
    def save_message(self, conversation_id, sender_id, encrypted_content, iv):
        conversation = Conversation.objects.get(id=conversation_id)
        sender = User.objects.get(id=sender_id)
        message = Message.objects.create(conversation=conversation, sender=sender, encrypted_content=encrypted_content, iv=iv)
        return message
