from decimal import Decimal
from django.db import transaction
from myapp.models import AuctionReport, Bid, AuctionItem

@transaction.atomic
def generate_auction_report(auction_item):
    """
    Generate a single auction report for a given auction item.
    Calculates:
    - Total bids
    - Total unique buyers
    - Highest bid (winning bid)
    - Commission, seller earnings, auctioneer earnings
    """
    # Fetch all bids for this auction item
    bids = Bid.objects.filter(item=auction_item)
    total_bids = bids.count()
    total_buyers = bids.values("buyer").distinct().count()
    highest_bid = bids.order_by("-amount").first()

    # Calculate amounts safely (if no bids, set to 0)
    commission_percentage = Decimal("10.00")
    winning_amount = highest_bid.amount if highest_bid else Decimal("0.00")
    commission_amount = (winning_amount * commission_percentage) / Decimal("100.00")
    seller_earnings = winning_amount - commission_amount if winning_amount > 0 else Decimal("0.00")
    auctioneer_earnings = commission_amount  # Or your custom logic

    # Create the report
    report = AuctionReport.objects.create(
        image=auction_item.image,
        auction_item=auction_item,
        seller=auction_item.seller,
        auctioneer=auction_item.assigned_auctioneer,
        winner=highest_bid.buyer if highest_bid else None,
        winning_bid=winning_amount,
        total_bids=total_bids,
        total_buyers=total_buyers,
        commission_percentage=commission_percentage,
        commission_amount=commission_amount,
        seller_earnings=seller_earnings,
        auctioneer_earnings=auctioneer_earnings,
    )

    return report
