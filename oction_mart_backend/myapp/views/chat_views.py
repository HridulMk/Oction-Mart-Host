from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import StreamingHttpResponse
from django.db.models import Q, Max
import json
import time
from django.contrib.auth import get_user_model
from myapp.models import ChatMessage
from myapp.serializers import ChatMessageSerializer

User = get_user_model()

# -------------------------------
# Send a chat message
# -------------------------------
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def send_message(request):
    receiver_id = request.data.get('receiver_id')
    message_text = request.data.get('message')

    if not receiver_id or not message_text:
        return Response({'error': 'Missing receiver_id or message'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)

    sender = request.user

    # Only allow buyer/seller ↔ admin
    if sender.user_type in ['buyer', 'seller'] and receiver.user_type == 'admin':
        pass
    elif sender.user_type == 'admin' and receiver.user_type in ['buyer', 'seller']:
        pass
    else:
        return Response({'error': 'Chat support is only available between buyers/sellers and admin.'},
                        status=status.HTTP_403_FORBIDDEN)

    room_name = ChatMessage.get_or_create_room(sender, receiver)

    msg = ChatMessage.objects.create(
        sender=sender,
        receiver=receiver,
        message=message_text,
        room_name=room_name
    )

    serializer = ChatMessageSerializer(msg)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# -------------------------------
# Get chat history with a user
# -------------------------------
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_chat_history(request, receiver_id):
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)

    sender = request.user

    # Restrict
    if not (
        (sender.user_type in ['buyer', 'seller'] and receiver.user_type == 'admin') or
        (sender.user_type == 'admin' and receiver.user_type in ['buyer', 'seller'])
    ):
        return Response({'error': 'Chat support is only available between buyers/sellers and admin.'},
                        status=status.HTTP_403_FORBIDDEN)

    messages = ChatMessage.objects.filter(
        Q(sender=sender, receiver=receiver) | Q(sender=receiver, receiver=sender)
    ).order_by('timestamp')[:50]

    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)


# -------------------------------
# SSE Stream for new messages
# -------------------------------
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def sse_event_stream(request, receiver_id):
    last_id = int(request.GET.get('last_id', 0))

    def event_stream():
        nonlocal last_id
        while True:
            new_messages = ChatMessage.objects.filter(
                Q(sender_id=receiver_id, receiver=request.user, id__gt=last_id) |
                Q(sender=request.user, receiver_id=receiver_id, id__gt=last_id)
            ).order_by('id')

            for msg in new_messages:
                data = json.dumps(ChatMessageSerializer(msg).data, default=str)
                yield f"data: {data}\n\n"
                last_id = msg.id

            time.sleep(1)

    return StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'Connection': 'keep-alive'}
    )


# -------------------------------
# Admin: List conversations
# -------------------------------
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_conversations(request):
    admin_user = request.user

    if admin_user.user_type != 'admin':
        return Response({'error': 'Not authorized'}, status=403)

    # Get all messages involving admin
    messages = ChatMessage.objects.filter(
        Q(sender=admin_user) | Q(receiver=admin_user)
    ).order_by('timestamp')

    # One conversation per user, store last message
    conversations_dict = {}
    for msg in messages:
        other_user = msg.sender if msg.receiver == admin_user else msg.receiver
        conversations_dict[other_user.id] = msg

    conversations = [
    {
        "id": u.id,
        "name": u.username,
        "type": u.user_type,  
        "last_message": msg.message,
        "last_time": msg.timestamp,
    }
        for u, msg in [(msg.sender if msg.sender != admin_user else msg.receiver, msg) for msg in conversations_dict.values()]
    ]

    return Response(conversations, status=200)