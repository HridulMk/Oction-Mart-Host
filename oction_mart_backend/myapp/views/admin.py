from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from ..models import User
from ..serializers import PendingUserSerializer


class PendingUsersView(generics.ListAPIView):
    serializer_class = PendingUserSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['user_type', 'approval_status']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    def get_queryset(self):
        return User.objects.filter(approval_status='pending').order_by('-created_at')


class AllUsersView(generics.ListAPIView):
    serializer_class = PendingUserSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['user_type', 'approval_status']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    def get_queryset(self):
        return User.objects.all().order_by('-created_at')


@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def approve_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if user.approval_status != 'pending':
        return Response({'error': f'User is already {user.approval_status}'}, status=400)

    user.approve(request.user)
    return Response({
        'message': f'User {user.username} approved successfully',
        'user_id': user.id,
        'username': user.username,
        'user_type': user.user_type,
        'approved_at': user.approved_at
    })


@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def reject_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if user.approval_status != 'pending':
        return Response({'error': f'User is already {user.approval_status}'}, status=400)


    user.reject(request.user)

    return Response({
        'message': f'User {user.username} rejected',
        'user_id': user.id,
        'username': user.username,
        
    })


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_dashboard(request):
    stats = {
        'total_users': User.objects.count(),
        'pending_users': User.objects.filter(approval_status='pending').count(),
        'approved_users': User.objects.filter(approval_status='approved').count(),
        'rejected_users': User.objects.filter(approval_status='rejected').count(),
        'user_types': {
            'buyers': User.objects.filter(user_type='buyer').count(),
            'sellers': User.objects.filter(user_type='seller').count(),
            'auctioneers': User.objects.filter(user_type='auctioneer').count(),
        },
        'recent_registrations': User.objects.filter(
            approval_status='pending'
        ).order_by('-created_at')[:5].values(
            'id', 'username', 'user_type', 'created_at'
        )
    }
    return Response(stats)
