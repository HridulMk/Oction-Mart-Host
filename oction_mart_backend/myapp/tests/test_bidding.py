import pytest
import json
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from asgiref.sync import sync_to_async  # ✅ needed for ORM in async tests

from myapp.models import AuctionItem, Bid
from auction_system.asgi import application 

User = get_user_model()

@pytest.mark.django_db(transaction=True)
class TestBiddingConsumer:
    async def asyncSetUp(self):
        """Create test data asynchronously using sync_to_async"""
        # ✅ Wrap ORM calls in sync_to_async
        self.buyer = await sync_to_async(User.objects.create_user)(
            username="testbuyer",
            password="password123",
            approval_status="approved",
        )
        self.auction_item = await sync_to_async(AuctionItem.objects.create)(
            name="Test Item",
            description="A test auction item",
            auction_start=timezone.now() - timedelta(minutes=5),
            auction_end=timezone.now() + timedelta(minutes=5),
            is_auction_completed=False,
        )

    @pytest.mark.asyncio
    async def test_valid_bid(self):
        await self.asyncSetUp()

        communicator = WebsocketCommunicator(
            application, f"/ws/bid/{self.auction_item.id}/"
        )
        communicator.scope["user"] = self.buyer
        connected, _ = await communicator.connect()
        assert connected

        await communicator.send_json_to({"bid_amount": 100})
        response = await communicator.receive_json_from()

        assert "bid_amount" in response
        assert response["bid_amount"] == "100"
        await communicator.disconnect()

    @pytest.mark.asyncio
    async def test_bid_lower_than_highest(self):
        await self.asyncSetUp()

        # ✅ wrap Bid.objects.create in sync_to_async
        await sync_to_async(Bid.objects.create)(
            item=self.auction_item, buyer=self.buyer, amount=200
        )

        communicator = WebsocketCommunicator(
            application, f"/ws/bid/{self.auction_item.id}/"
        )
        communicator.scope["user"] = self.buyer
        connected, _ = await communicator.connect()
        assert connected

        await communicator.send_json_to({"bid_amount": 150})
        response = await communicator.receive_json_from()

        assert "error" in response
        assert "higher than 200" in response["error"]
        await communicator.disconnect()

    @pytest.mark.asyncio
    async def test_bid_after_auction_end(self):
        await self.asyncSetUp()

        self.auction_item.is_auction_completed = True
        await sync_to_async(self.auction_item.save)()

        communicator = WebsocketCommunicator(
            application, f"/ws/bid/{self.auction_item.id}/"
        )
        communicator.scope["user"] = self.buyer
        connected, _ = await communicator.connect()
        assert connected

        await communicator.send_json_to({"bid_amount": 500})
        response = await communicator.receive_json_from()

        assert "error" in response
        assert "Auction has already ended" in response["error"]
        await communicator.disconnect()

    @pytest.mark.asyncio
    async def test_multiple_bidders_receive_updates(self):
        await self.asyncSetUp()

        buyer2 = await sync_to_async(User.objects.create_user)(
            username="buyer2", password="pass123", approval_status="approved"
        )

        communicator1 = WebsocketCommunicator(
            application, f"/ws/bid/{self.auction_item.id}/"
        )
        communicator2 = WebsocketCommunicator(
            application, f"/ws/bid/{self.auction_item.id}/"
        )

        communicator1.scope["user"] = self.buyer
        communicator2.scope["user"] = buyer2

        connected1, _ = await communicator1.connect()
        connected2, _ = await communicator2.connect()
        assert connected1 and connected2

        await communicator1.send_json_to({"bid_amount": 300})
        response1 = await communicator1.receive_json_from()
        response2 = await communicator2.receive_json_from()

        assert response1["bid_amount"] == "300"
        assert response2["bid_amount"] == "300"

        await communicator1.disconnect()
        await communicator2.disconnect()

