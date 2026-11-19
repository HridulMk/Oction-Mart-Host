from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from ..models import AuctionItem
from ..serializers import SellerAuctionItemSerializer

class SellerAuctionItemCreateView(generics.CreateAPIView):
    queryset = AuctionItem.objects.all()
    serializer_class = SellerAuctionItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    # No need to override perform_create if the serializer's create method handles it
    # We remove the status/approval_status argument here because it's managed by the serializer.
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class SellerAuctionItemListView(generics.ListAPIView):
    serializer_class = SellerAuctionItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AuctionItem.objects.filter(seller=self.request.user).order_by('-created_at')

class SellerAuctionItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SellerAuctionItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return AuctionItem.objects.filter(seller=self.request.user)

    def perform_destroy(self, instance):
        # Additional checks before deletion
        if instance.approval_status == 'approved' or instance.is_auction_completed:
            # You might return a Forbidden response here
            raise permissions.exceptions.PermissionDenied("Cannot delete an approved or completed auction item.")
        instance.delete()