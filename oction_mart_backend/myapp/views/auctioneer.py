from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status, generics
from rest_framework.response import Response
from django.utils import timezone

from ..models import AuctionItem, Bid, AuctionReport, User
from ..serializers import AuctionItemReviewSerializer, AuctionItemSerializer, AuctioneerListSerializer, SellerAuctionItemSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def auctioneer_items(request):
    """
    Retrieves a list of auction items with a 'pending' status.
    This view is intended for auctioneers to see items awaiting their review.
    """
    auctioneer_items = AuctionItem.objects.filter(assigned_auctioneer=request.user)
    # Assuming 'status' is the field name on your AuctionItem model
    # and 'pending' is one of the choices.
    
    
    # Serialize the queryset.
    serializer = SellerAuctionItemSerializer(auctioneer_items, many=True)
    
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_items_for_approval(request):
    """
    Retrieves a list of auction items with a 'pending' status.
    This view is intended for auctioneers to see items awaiting their review.
    """
    # Assuming 'status' is the field name on your AuctionItem model
    # and 'pending' is one of the choices.
    pending_items = AuctionItem.objects.filter(approval_status='pending')
    
    # Serialize the queryset.
    serializer = SellerAuctionItemSerializer(pending_items, many=True)
    
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

    serializer = AuctionItemReviewSerializer(item, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Auction scheduled successfully'})
    return Response(serializer.errors, status=400)

# views/auctioneer.py
@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def approve_bid(request, bid_id):
    if request.user.user_type != 'auctioneer':
        return Response({'error': 'Only auctioneers can approve bids.'}, status=403)

    try:
        bid = Bid.objects.get(id=bid_id, approval_status='pending')
        bid.approval_status = 'approved'
        bid.approved_by = request.user
        bid.approved_at = timezone.now()
        bid.save()
        return Response({'message': 'Bid approved successfully'})
    except Bid.DoesNotExist:
        return Response({'error': 'Bid not found or already processed'}, status=404)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def reject_bid(request, bid_id):
    if request.user.user_type != 'auctioneer':
        return Response({'error': 'Only auctioneers can reject bids.'}, status=403)

    try:
        bid = Bid.objects.get(id=bid_id, approval_status='pending')
        bid.approval_status = 'rejected'
        bid.rejection_reason = request.data.get('reason', 'No reason provided')
        bid.approved_by = request.user
        bid.approved_at = timezone.now()
        bid.save()
        return Response({'message': 'Bid rejected successfully'})
    except Bid.DoesNotExist:
        return Response({'error': 'Bid not found or already processed'}, status=404)
    

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def finalize_auction(request, item_id):
    if request.user.user_type != 'auctioneer':
        return Response({'error': 'Only auctioneers can finalize auctions.'}, status=403)

    try:
        item = AuctionItem.objects.get(id=item_id)
        if not item.is_active:
            return Response({'error': 'Auction already finalized.'}, status=400)

        highest_bid = Bid.objects.filter(item=item, approval_status='approved').order_by('-amount').first()
        if not highest_bid:
            return Response({'error': 'No approved bids to finalize.'}, status=404)

        # Mark as winner
        highest_bid.is_winner = True
        highest_bid.save()

        # Mark auction as inactive
        item.is_active = False
        item.save()

        # Commission calculation
        commission_percentage = 10.00  # can make this configurable
        commission_amount = (highest_bid.amount * commission_percentage) / 100

        # Create Auction Report
        AuctionReport.objects.create(
            auction_item=item,
            winner=highest_bid.buyer,
            winning_bid=highest_bid.amount,
            seller=item.seller,
            auctioneer=request.user,
            commission_percentage=commission_percentage,
            commission_amount=commission_amount
        )

        return Response({'message': 'Auction finalized successfully and report generated.'})

    except AuctionItem.DoesNotExist:
        return Response({'error': 'Auction item not found'}, status=404)




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