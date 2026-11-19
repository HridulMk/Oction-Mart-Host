from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from ..models import Watchlist, Bid, AuctionItem
from rest_framework.views import APIView
from ..serializers import (
    WatchlistSerializer, CreateWatchlistSerializer,
    PlaceBidSerializer, BidSerializer
)


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

    def post(self, request, item_id):
        user = request.user

        try:
            auction_item = AuctionItem.objects.get(id=item_id)
        except AuctionItem.DoesNotExist:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            Bid.objects.create(
                bidder=user,
                auction=auction_item,
                amount=serializer.validated_data['amount']
            )
            return Response({"message": "Bid placed successfully"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class BidHistoryView(generics.ListAPIView):
    serializer_class = BidSerializer
    permission_classes = [permissions.AllowAny]  # Or IsAuthenticated if you want only logged-in users

    def get_queryset(self):
        auction_id = self.kwargs.get('auction_id')
        if auction_id is None:
            return Bid.objects.none()  # Return empty queryset if auction_id missing
        return Bid.objects.filter(auction_id=auction_id).order_by('-timestamp')
   
    


    



class BuyerWonItemsView(generics.ListAPIView):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bid.objects.filter(buyer=self.request.user, is_winner=True)
