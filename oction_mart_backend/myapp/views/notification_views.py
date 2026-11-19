
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from myapp.models import Notification, AuctionItem
from myapp.serializers import NotificationSerializer
from django.http import Http404
from django.utils import timezone
from rest_framework.views import APIView

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return notifications for the authenticated user only."""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """Ensure notifications are tied to the authenticated user."""
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve all notifications for a given buyer_id or seller_id."""
        user_id = kwargs.get('buyer_id') or kwargs.get('seller_id')
        if not user_id:
            raise Http404("User ID not provided.")
        
        # Ensure the authenticated user can only access their own notifications
        if int(user_id) != self.request.user.id:
            self.permission_denied(request, message="You can only access your own notifications.")
        
        notifications = Notification.objects.filter(user__id=user_id).order_by('-created_at')
        if not notifications.exists():
            raise Http404("No notifications found for this user.")
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """Disable update for user-based endpoints."""
        return Response({'detail': 'Update not supported for user-based notification endpoints.'}, status=405)

    def partial_update(self, request, *args, **kwargs):
        """Disable partial update for user-based endpoints."""
        return Response({'detail': 'Partial update not supported for user-based notification endpoints.'}, status=405)

    def destroy(self, request, *args, **kwargs):
        """Disable delete for user-based endpoints."""
        return Response({'detail': 'Delete not supported for user-based notification endpoints.'}, status=405)

    @action(detail=True, methods=['patch'], url_path='mark-as-read')
    def mark_as_read(self, request, buyer_id=None, seller_id=None):
        """Mark all notifications for a given buyer_id or seller_id as read."""
        user_id = buyer_id or seller_id
        if not user_id:
            raise Http404("User ID not provided.")
        
        # Ensure the authenticated user can only mark their own notifications
        if int(user_id) != self.request.user.id:
            self.permission_denied(request, message="You can only mark your own notifications as read.")
        
        notifications = Notification.objects.filter(user__id=user_id, is_read=False)
        count = notifications.update(is_read=True)
        return Response({'status': f'{count} notifications marked as read'})

    @action(detail=False, methods=['patch'])
    def mark_all_as_read(self, request):
        """Mark all notifications for the authenticated user as read."""
        count = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': f'{count} notifications marked as read'})
    
    @action(detail=False, methods=['get'], url_path=r'(?P<user_id>\d+)/unread-count')
    def unread_count(self, request, user_id=None):
        """
        Return the count of unread notifications for a specific user.
        `user_id` is passed in the URL.
        """
        if not user_id:
            return Response({"error": "User ID is required."}, status=400)

        # Ensure users can only check their own notifications
        if int(user_id) != request.user.id:
            self.permission_denied(request, message="You can only access your own notifications.")

        unread_count = Notification.objects.filter(user__id=user_id, is_read=False).count()
        return Response({"unread_count": unread_count})


class TriggerAuctionNotificationsView(APIView):
    permission_classes = [permissions.IsAdminUser]  # Restrict to admins for reliability

    def get(self, request, *args, **kwargs):
        now = timezone.now()
        # Auctions starting within a 5-minute window
        starting_auctions = AuctionItem.objects.filter(
            auction_start__lte=now,
            auction_start__gt=now - timezone.timedelta(minutes=5),
            is_started=False,
            approval_status='approved'
        )
        for auction in starting_auctions:
            # Notify seller
            Notification.objects.create(
                user=auction.seller,
                message=f"The auction for your item '{auction.title}' has started!",
                type='auction_start',
                related_auction=auction
            )
            # Notify watchlist users
            for watchlist in auction.watchlisted_by.all():
                Notification.objects.create(
                    user=watchlist.buyer,
                    message=f"The auction for '{auction.title}' you are watching has started!",
                    type='auction_start',
                    related_auction=auction
                )
            auction.is_started = True
            auction.save()  # Triggers notify_auction_start signal as well

        # Auctions ending within a 5-minute window
        ending_auctions = AuctionItem.objects.filter(
            auction_end__lte=now,
            auction_end__gt=now - timezone.timedelta(minutes=5),
            is_auction_completed=False,
            approval_status='approved'
        )
        for auction in ending_auctions:
            auction.finalize_auction()  # Creates auction_end notifications for seller, winner, and watchlist users

        return Response({'status': 'Notifications triggered'})