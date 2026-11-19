from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from django.utils import timezone
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from myapp.models import AuctionItem, AuctionReport
from myapp.serializers import AuctionReportSerializer
from myapp.utils.reports import generate_auction_report


@api_view(["POST"])
def end_auction(request, auction_id):
    """Mark auction as completed and generate a report."""
    try:
        auction_item = AuctionItem.objects.get(pk=auction_id)
    except AuctionItem.DoesNotExist:
        return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)

    if auction_item.is_auction_completed:
        return Response({"error": "Auction already completed"}, status=status.HTTP_400_BAD_REQUEST)

    auction_item.is_auction_completed = True
    auction_item.auction_end_time = timezone.now()
    auction_item.save()

    # Call utility function to generate the report
    report = generate_auction_report(auction_item)
    serializer = AuctionReportSerializer(report)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


class AuctionReportListView(generics.ListAPIView):
    """List all auction reports (Admin / Auctioneer / Seller filter possible)."""
    queryset = AuctionReport.objects.all().order_by("-generated_at")
    serializer_class = AuctionReportSerializer


class AuctionReportDetailView(APIView):
    
    def get(self, request, auction_id):
        # Ensure the auction item exists
        auction_item = get_object_or_404(AuctionItem, pk=auction_id)

        # Get or create the report
        report, created = AuctionReport.objects.get_or_create(auction_item=auction_item)

        # Always generate (update) the report to recalc duration and other fields
        report.generate_from_auction()

        # Serialize and return the report
        serializer = AuctionReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)