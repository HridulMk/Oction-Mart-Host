from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from myapp.models import AuctionItem, Bid
import csv
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated ,AllowAny
from rest_framework.views import APIView
from myapp.models import AuctionItem, Bid, User, Notification
from django.http import HttpResponse
from django.utils.timezone import now, timezone
from myapp.serializers import NotificationSerializer, AuctionCardSerializer, AuctioneerDashboardSerializer


class SellerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, seller_id):
        # Fetch the seller by ID
        seller = get_object_or_404(User, id=seller_id)

        total_sales = AuctionItem.objects.filter(
            seller=seller, auction_winner__isnull=False
        ).aggregate(total=Sum("final_price"))["total"] or 0

        orders = AuctionItem.objects.filter(
            seller=seller, auction_winner__isnull=False
        ).count()

        active_bids = Bid.objects.filter(
            auction_seller=seller, auction_is_active=True
        ).count()

        total_buyers = AuctionItem.objects.filter(
            seller=seller, auction_winner__isnull=False
        ).values("auction_winner").distinct().count()

        avg_order_value = AuctionItem.objects.filter(
            seller=seller, auction_winner__isnull=False
        ).aggregate(avg=Avg("final_price"))["avg"] or 0

        profit_margin = 28  

        revenue_trend = (
            AuctionItem.objects.filter(seller=seller, auction_winner__isnull=False)
            .annotate(month=TruncMonth("auction_end"))
            .values("month")
            .annotate(total=Sum("final_price"))
            .order_by("month")
        )

        orders_vs_sales = (
            AuctionItem.objects.filter(seller=seller, auction_winner__isnull=False)
            .annotate(month=TruncMonth("auction_end"))
            .values("month")
            .annotate(orders=Count("id"), sales=Sum("final_price"))
            .order_by("month")
        )

        category_share = (
            AuctionItem.objects.filter(seller=seller, auction_winner__isnull=False)
            .values("category")
            .annotate(sales=Sum("final_price"))
            .order_by("-sales")
        )

        top_buyers = (
            AuctionItem.objects.filter(seller=seller, auction_winner__isnull=False)
            .values("auction_winner__username")
            .annotate(total_spent=Sum("final_price"))
            .order_by("-total_spent")[:5]
        )

        return Response({
            "stats": {
                "total_sales": total_sales,
                "orders": orders,
                "active_bids": active_bids,
                "total_buyers": total_buyers,
                "avg_order_value": avg_order_value,
                "profit_margin": profit_margin,
            },
            "charts": {
                "revenue_trend": list(revenue_trend),
                "orders_vs_sales": list(orders_vs_sales),
                "category_share": list(category_share),
                "top_buyers": list(top_buyers),
            }
        })

class SellerDashboardCSVView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, seller_id):
        seller = get_object_or_404(User, id=seller_id)
        auctions = AuctionItem.objects.filter(seller=seller, auction_winner__isnull=False)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="seller_{seller.username}_dashboard.csv"'

        writer = csv.writer(response)
        writer.writerow(['Auction ID', 'Item Name', 'Category', 'Final Price', 'Winner', 'End Time'])

        for auction in auctions:
            writer.writerow([
                auction.id,
                auction.title,
                auction.category,
                auction.final_price,
                auction.auction_winner.username if auction.auction_winner else '',
                auction.auction_end,
            ])

        return response

class BuyerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, buyer_id):
        # Fetch the seller by ID
        buyer = get_object_or_404(User, id=buyer_id)
        

        total_bids = Bid.objects.filter(bidder=buyer).count()

        auctions_won = AuctionItem.objects.filter(auction_winner=buyer).count()

        total_spend = (
            AuctionItem.objects.filter(auction_winner=buyer)
            .aggregate(total=Sum("final_price"))["total"]
            or 0
        )

      
        avg_bid_value = (
            Bid.objects.filter(bidder=buyer).aggregate(avg=Avg("amount"))["avg"] or 0
        )

        active_bids = Bid.objects.filter(
            bidder=buyer, auction__auction_end__gt=now(), auction__is_active=True
        ).count()

        # --- Charts Data ---

        spend_over_time = (
            AuctionItem.objects.filter(auction_winner=buyer)
            .annotate(month=TruncMonth("auction_end"))
            .values("month")
            .annotate(total_spent=Sum("final_price"))
            .order_by("month")
        )

        spend_chart = [
            {"month": entry["month"].strftime("%b"), "amount": float(entry["total_spent"] or 0)}
            for entry in spend_over_time
        ]

        auctions_per_month = (
            Bid.objects.filter(bidder=buyer)
            .annotate(month=TruncMonth("timestamp"))
            .values("month")
            .annotate(total=Count("auction", distinct=True))
            .order_by("month")
        )

        auctions_chart = [
            {"month": entry["month"].strftime("%b"), "auctions": entry["total"]}
            for entry in auctions_per_month
        ]

        top_buyers = (
            AuctionItem.objects.filter(auction_winner__isnull=False)
            .values("auction_winner__username")
            .annotate(total_spent=Sum("final_price"))
            .order_by("-total_spent")[:5]
        )

        top_buyers_chart = [
            {"buyer": entry["auction_winner__username"], "total": float(entry["total_spent"] or 0)}
            for entry in top_buyers
        ]

        data = {
            "total_bids": total_bids,
            "auctions_won": auctions_won,
            "total_spend": float(total_spend),
            "avg_bid_value": float(avg_bid_value),
            "active_bids": active_bids,
            "spend_over_time": spend_chart,
            "auctions_per_month": auctions_chart,
            "top_buyers": top_buyers_chart,
        }

        return Response(data)
    
    
class AuctioneerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, auctioneer_id):
        auctioneer = get_object_or_404(User, id=auctioneer_id, user_type="auctioneer")

        auctions = AuctionItem.objects.filter(assigned_auctioneer=auctioneer)

        total_auctions = auctions.count()
        active_bids = Bid.objects.filter(auction__in=auctions, auction_is_active=True).count()
        participants = Bid.objects.filter(auction__in=auctions).values("bidder").distinct().count()
        revenue = auctions.aggregate(total=Sum("final_price"))["total"] or 0

        license_info = {
            "status": "Active" if auctioneer.approval_status == "approved" else "Inactive",
            "license_number": auctioneer.license_number,
            "issue_date": auctioneer.license_issue_date,
            "expiry_date": auctioneer.license_issue_date.replace(
                year=auctioneer.license_issue_date.year + 1
            ) if auctioneer.license_issue_date else None,
            "renewal_fee": 120,
        }

        notifications = Notification.objects.filter(user=auctioneer).order_by("-created_at")[:10]
        auctions_data = auctions.all()

        dashboard_data = {
            "stats": {
                "total_auctions": total_auctions,
                "active_bids": active_bids,
                "participants": participants,
                "revenue": revenue,
            },
            "license": license_info,
            "notifications": NotificationSerializer(notifications, many=True).data,
            "auctions": AuctionCardSerializer(auctions_data, many=True).data,
        }

        serializer = AuctioneerDashboardSerializer(dashboard_data)
        return Response(serializer.data)


class AuctioneerDashboardCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, auctioneer_id):
        auctioneer = get_object_or_404(User, id=auctioneer_id, user_type="auctioneer")
        auctions = AuctionItem.objects.filter(assigned_auctioneer=auctioneer)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="auctioneer_{auctioneer_id}_dashboard.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "Auction ID",
            "Title",
            "Category",
            "Start Price",
            "Final Price",
            "Total Bids",
            "Winner",
            "Status",
            "Auction Start",
            "Auction End",
        ])

        now = timezone.now()
        for auction in auctions:
            if auction.auction_start and auction.auction_end:
                if auction.auction_start > now:
                    status = "Upcoming"
                elif auction.auction_start <= now < auction.auction_end:
                    status = "Live"
                else:
                    status = "Completed"
            else:
                status = "Unknown"

            writer.writerow([
                auction.id,
                auction.title,
                auction.category,
                auction.start_price,
                auction.final_price or "",
                auction.bids.count(),
                auction.auction_winner if auction.auction_winner else "",
                status,
                auction.auction_start,
                auction.auction_end,
            ])

        return response    