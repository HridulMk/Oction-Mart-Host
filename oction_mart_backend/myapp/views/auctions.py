from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from ..models import AuctionItem, Bid
from ..serializers import AuctionItemSerializer, AuctionScheduleSerializer, AuctionsSerializer



class AuctionView(generics.ListAPIView):
    """Get auction details by ID"""
    serializer_class = AuctionsSerializer
    
    queryset = AuctionItem.objects.filter(approval_status='approved', is_active=True)
    
      # Disable pagination
    pagination_class = None


class AuctionListView(generics.ListAPIView):
    """Get all auctions with optional filtering"""
    serializer_class = AuctionItemSerializer
    permission_classes = [permissions.AllowAny]  # Allow public access to view auctions

    def get_queryset(self):
        queryset = AuctionItem.objects.filter(
            approval_status='approved',
            is_active=True
        ).order_by('-created_at')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            if status_filter == 'live':
                queryset = queryset.filter(
                    auction_end__gt=timezone.now(),
                    is_auction_completed=False
                )
            elif status_filter == 'ended':
                queryset = queryset.filter(
                    Q(auction_end__lte=timezone.now()) | Q(is_auction_completed=True)
                )
            elif status_filter == 'upcoming':
                queryset = queryset.filter(
                    auction_end__gt=timezone.now(),
                    is_auction_completed=False
                )
        
        # Filter by category (if category field exists)
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(title__icontains=category)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset
    
    



class AuctionReviewDetailView(generics.RetrieveAPIView,generics.UpdateAPIView,generics.CreateAPIView):
    """Get auction details by ID (no filters applied)"""
    serializer_class = AuctionScheduleSerializer
    permission_classes = [permissions.AllowAny]
    queryset = AuctionItem.objects.all()
    
    




class AuctionReviewUpdateView(generics.UpdateAPIView):
    queryset = AuctionItem.objects.all()
    serializer_class = AuctionItemSerializer
    permission_classes = [permissions.AllowAny]
    
    



class AuctionDetailView(generics.RetrieveAPIView):
    """Get auction details by ID"""
    serializer_class = AuctionItemSerializer
    permission_classes = [permissions.AllowAny]
    queryset = AuctionItem.objects.filter(approval_status='approved', is_active=True)
    
    



@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_auctions(request):
    """Get featured auctions (most popular/bidding activity)"""
    # Get auctions with the most bids
    featured = AuctionItem.objects.filter(
        approval_status='approved',
        is_active=True
    ).annotate(
        bid_count=Count('bids')
    ).order_by('-bid_count', '-created_at')[:6]
    
    serializer = AuctionsSerializer(featured, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def auctions_by_category(request, category):
    """Get auctions by category"""
    auctions = AuctionItem.objects.filter(
        approval_status='approved',
        is_active=True,
        title__icontains=category
    ).order_by('-created_at')
    
    serializer = AuctionItemSerializer(auctions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def auction_bids(request, auction_id):
    """Get all bids for a specific auction"""
    try:
        auction = AuctionItem.objects.get(id=auction_id, approval_status='approved')
        bids = Bid.objects.filter(item=auction).order_by('-timestamp')
        
        bid_data = []
        for bid in bids:
            bid_data.append({
                'id': bid.id,
                'amount': str(bid.amount),
                'timestamp': bid.timestamp,
                'buyer_name': bid.buyer.username,
                'is_winner': bid.is_winner
            })
        
        return Response(bid_data)
    except AuctionItem.DoesNotExist:
        return Response(
            {'error': 'Auction not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


