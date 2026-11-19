from rest_framework import generics, permissions, status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone

from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.response import Response
from .models import AuctionItem, Watchlist, Bid, User
from .serializers import (
    BuyerRegistrationSerializer, SellerRegistrationSerializer,
    AuctioneerRegistrationSerializer, LoginSerializer,AuctionItemSerializer,
    UserProfileSerializer, PendingUserSerializer, WatchlistSerializer, CreateWatchlistSerializer,AuctioneerListSerializer, 
    PlaceBidSerializer, BidSerializer, SellerAuctionItemSerializer, AuctionItemApprovalSerializer, AuctionScheduleSerializer
)


# ============ REGISTRATION VIEWS ============

class BuyerRegistrationView(generics.CreateAPIView):
    serializer_class = BuyerRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Buyer registration successful! Your account is pending approval.',
            'user_id': user.id,
            'username': user.username,
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)

class SellerRegistrationView(generics.CreateAPIView):
    serializer_class = SellerRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Seller registration successful! Your account is pending approval.',
            'user_id': user.id,
            'username': user.username,
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)

class AuctioneerRegistrationView(generics.CreateAPIView):
    serializer_class = AuctioneerRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Auctioneer registration successful! Your account is pending approval.',
            'user_id': user.id,
            'username': user.username,
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)
        
        
class FeaturedAuctionsList(generics.ListAPIView):
    # Specify the serializer to use
    serializer_class = AuctionItemSerializer
    
    # This is the most important part: the queryset filters the data.
    # It fetches all Auction objects and filters them to include only
    # those where the 'featured' field is True.
    queryset = AuctionItem.objects.filter(featured=True)        

# ============ AUTHENTICATION VIEWS ============


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Login shouldn't require authentication
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']

    # 🔹 Enforce role check
    user_type_from_request = request.data.get('user_type')
    if user.user_type != user_type_from_request:
        return Response(
            {"message": f"Only {user_type_from_request} accounts can login here."},
            status=status.HTTP_403_FORBIDDEN
        )

    # 🔑 Get or create DRF token
    token, created = Token.objects.get_or_create(user=user)

    return Response({
        'message': 'Login successful',
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'user_type': user.user_type,
            'approval_status': user.approval_status
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout"""
    try:
        # Delete the user's token
        request.user.auth_token.delete()
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except:
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_status(request):
    """Check user approval status"""
    user = request.user
    return Response({
        'username': user.username,
        'user_type': user.user_type,
        'approval_status': user.approval_status,
        'is_active': user.is_active,
        'approved_at': user.approved_at,
        'rejection_reason': user.rejection_reason
    }, status=status.HTTP_200_OK)

# ============ ADMIN VIEWS ============

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
    """Approve a pending user"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if user.approval_status != 'pending':
        return Response({
            'error': f'User is already {user.approval_status}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.approve(request.user)
    
    return Response({
        'message': f'User {user.username} approved successfully',
        'user_id': user.id,
        'username': user.username,
        'user_type': user.user_type,
        'approved_at': user.approved_at
    }, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def reject_user(request, user_id):
    """Reject a pending user"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if user.approval_status != 'pending':
        return Response({
            'error': f'User is already {user.approval_status}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    reason = request.data.get('reason', 'No reason provided')
    user.reject(request.user, reason)
    
    return Response({
        'message': f'User {user.username} rejected',
        'user_id': user.id,
        'username': user.username,
        'reason': reason
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_dashboard(request):
    """Simple admin dashboard with user statistics"""
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
    
    return Response(stats, status=status.HTTP_200_OK)

class BuyerWatchlistView(generics.ListAPIView):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(buyer=self.request.user)

class AddToWatchlistView(generics.CreateAPIView):
    serializer_class = CreateWatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_from_watchlist(request):
    item_id = request.data.get('item')
    try:
        watch = Watchlist.objects.get(buyer=request.user, item_id=item_id)
        watch.delete()
        return Response({'message': 'Item removed from watchlist'})
    except Watchlist.DoesNotExist:
        return Response({'error': 'Item not found in your watchlist'}, status=404)


class PlaceBidView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PlaceBidSerializer

    def post(self, request, auction_id):
        user = request.user

        try:
            auction_item = AuctionItem.objects.get(id=auction_id)
        except AuctionItem.DoesNotExist:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # Create bid
            Bid.objects.create(
                bidder=user,
                auction=auction_item,
                amount=serializer.validated_data['amount']
            )
            return Response({"message": "Bid placed successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BidHistoryView(generics.ListAPIView):
    serializer_class = BidSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        auction_id = self.kwargs.get('auction_id')  # get auction id from URL
        return Bid.objects.filter(auction_id=auction_id).order_by('-timestamp')


class BuyerWonItemsView(generics.ListAPIView):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bid.objects.filter(buyer=self.request.user, is_winner=True)
    

from rest_framework.parsers import MultiPartParser, FormParser

class SellerAuctionItemCreateView(generics.CreateAPIView):
    serializer_class = SellerAuctionItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class SellerAuctionItemListView(generics.ListAPIView):
    serializer_class = SellerAuctionItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SellerAuctionItem.objects.filter(seller=self.request.user).order_by('-created_at')

class SellerAuctionItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SellerAuctionItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return SellerAuctionItem.objects.filter(seller=self.request.user)


#auctioneer apis
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_items_for_approval(request):
    if request.user.user_type != 'auctioneer':
        return Response({'error': 'Only auctioneers can view this.'}, status=403)
    items = AuctionItem.objects.filter(approval_status='pending')
    serializer = AuctionItemApprovalSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def approve_item(request, item_id):
    if request.user.user_type != 'auctioneer':
        return Response({'error': 'Only auctioneers can approve items.'}, status=403)
    try:
        item = AuctionItem.objects.get(id=item_id, approval_status='pending')
        item.approval_status = 'approved'
        item.approved_by = request.user
        item.approved_at = timezone.now()
        item.save()
        return Response({'message': 'Item approved successfully'})
    except AuctionItem.DoesNotExist:
        return Response({'error': 'Item not found or already processed'}, status=404)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def reject_item(request, item_id):
    if request.user.user_type != 'auctioneer':
        return Response({'error': 'Only auctioneers can reject items.'}, status=403)
    reason = request.data.get('reason', 'No reason provided')
    try:
        item = AuctionItem.objects.get(id=item_id, approval_status='pending')
        item.approval_status = 'rejected'
        item.rejection_reason = reason
        item.approved_by = request.user
        item.approved_at = timezone.now()
        item.save()
        return Response({'message': 'Item rejected successfully'})
    except AuctionItem.DoesNotExist:
        return Response({'error': 'Item not found or already processed'}, status=404)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def schedule_auction(request, item_id):
    if request.user.user_type != 'auctioneer':
        return Response({'error': 'Only auctioneers can schedule auctions.'}, status=403)
    try:
        item = AuctionItem.objects.get(id=item_id, approval_status='approved')
    except AuctionItem.DoesNotExist:
        return Response({'error': 'Item not found or not approved yet'}, status=404)

    serializer = AuctionScheduleSerializer(item, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Auction scheduled successfully'})
    return Response(serializer.errors, status=400)





# ================= APPROVED AUCTIONEER LIST =================
class ApprovedAuctioneersListView(generics.ListAPIView):
    serializer_class = AuctioneerListSerializer
    permission_classes = [permissions.IsAuthenticated]  # or AllowAny if you want it public
    pagination_class = None  # no pagination for a small dropdown

    def get_queryset(self):
        return User.objects.filter(
            user_type='auctioneer',
            approval_status='approved',
            is_active=True
        ).order_by('username')