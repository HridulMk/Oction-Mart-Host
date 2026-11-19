from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from myapp.models import AuctionItem, Watchlist

User = get_user_model()


class WatchlistListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, buyer_id):
        try:
            buyer = User.objects.get(id=buyer_id, user_type="buyer")
        except User.DoesNotExist:
            return Response({"error": "Buyer not found"}, status=status.HTTP_404_NOT_FOUND)

        watchlist = Watchlist.objects.filter(buyer=buyer).select_related("item")
        data = [
            {
                "id": w.item.id,
                "title": w.item.title,
                "start_price": w.item.start_price,
                
                "description": w.item.description,
                "seller": w.item.seller.username,
                "auction_end": w.item.auction_end,
                "is_active": w.item.is_active,
                "created_at": w.item.created_at,
                
                "status": w.item.auction_status,
                "category": w.item.category,
                
                
            }
            for w in watchlist
        ]
        return Response(data, status=status.HTTP_200_OK)


from myapp.models import AuctionItem, Watchlist, Notification
class WatchlistAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id):
        buyer = request.user  # already authenticated

        try:
            item = AuctionItem.objects.get(id=item_id)
        except AuctionItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        watch, created = Watchlist.objects.get_or_create(buyer=buyer, item=item)
        if not created:
            return Response({"message": "Already in watchlist"}, status=status.HTTP_200_OK)

        Notification.objects.create(user=buyer, message=f"Added {item.title} to your watchlist.")
        Notification.objects.create(user=item.seller, message=f"Buyer {buyer.username} added your item '{item.title}' to watchlist.")

        return Response({"message": f"Added {item.title} to watchlist"}, status=status.HTTP_201_CREATED)

class WatchlistRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, buyer_id, item_id):
        try:
            buyer = User.objects.get(id=buyer_id, user_type="buyer")
        except User.DoesNotExist:
            return Response({"error": "Buyer not found"}, status=status.HTTP_404_NOT_FOUND)

        deleted, _ = Watchlist.objects.filter(buyer=buyer, item_id=item_id).delete()
        if deleted:
            return Response({"message": "Removed from watchlist"}, status=status.HTTP_200_OK)
        return Response({"message": "Not in watchlist"}, status=status.HTTP_404_NOT_FOUND)
