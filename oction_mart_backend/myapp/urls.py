# myapp/urls.py
from django.urls import path
from myapp import views
from myapp.views.notification_views import (
    NotificationViewSet
)
from myapp.views.watchlist_views import (
    WatchlistListView,
    WatchlistAddView,
    WatchlistRemoveView
)
from myapp.views.dashboard_view import SellerDashboardView, SellerDashboardCSVView, BuyerDashboardView, AuctioneerDashboardCSVView,AuctioneerDashboardView

from myapp.views.payment_views import list_payments, payment_success, create_payment_request, refund_payment

from rest_framework_simplejwt.views import TokenRefreshView
from myapp.views import auth
from myapp.views.auctioneer import (
    reject_bid, approve_bid, finalize_auction,
    ApprovedAuctioneersListView,
    pending_items_for_approval, approve_item, reject_item, schedule_auction
)
from myapp.views.reports import end_auction, AuctionReportListView, AuctionReportDetailView
from myapp.views_backup import BuyerRegistrationView, SellerRegistrationView, AuctioneerRegistrationView
from myapp.views.auctions import (
    featured_auctions,
    AuctionListView, AuctionDetailView, AuctionReviewDetailView,
    auctions_by_category, auction_bids, AuctionReviewUpdateView, AuctionView
)
from myapp.views.dashboard_view import SellerDashboardView, SellerDashboardCSVView, BuyerDashboardView
from rest_framework.routers import DefaultRouter
from myapp.views.chat_views import send_message, sse_event_stream, get_chat_history, admin_conversations


# Map NotificationViewSet actions
notification_viewset = NotificationViewSet.as_view({
    'get': 'list',    # List all notifications for authenticated user
    'post': 'create', # Create a new notification
})
notification_buyer = NotificationViewSet.as_view({
    'get': 'retrieve', # List notifications for a buyer
})
notification_seller = NotificationViewSet.as_view({
    'get': 'retrieve', # List notifications for a seller
})

urlpatterns = [
    # --------- AUTH ----------
    path('auth/register/buyer/', auth.BuyerRegistrationView.as_view(), name='buyer-register'),
    path('auth/register/seller/', auth.SellerRegistrationView.as_view(), name='seller-register'),
    path('auth/register/auctioneer/', auth.AuctioneerRegistrationView.as_view(), name='auctioneer-register'),
    path('auth/login/', auth.CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', auth.logout_view, name='logout'),
    path('auth/profile/', auth.UserProfileView.as_view(), name='profile'),
    path('auth/status/', auth.check_status, name='check-status'),

    # --------- ADMIN ----------
    path('admin/users/pending/', views.PendingUsersView.as_view(), name='pending-users'),
    path('admin/users/all/', views.AllUsersView.as_view(), name='all-users'),
    path('admin/users/<int:user_id>/approve/', views.approve_user, name='approve-user'),
    path('admin/users/<int:user_id>/reject/', views.reject_user, name='reject-user'),
    path('admin/dashboard/', views.admin_dashboard, name='admin-dashboard'),

    # --------- BUYER ----------
    path('buyer/<int:buyer_id>/dashboard/', BuyerDashboardView.as_view(), name='buyer-dashboard'),
    path('buyer/bids/place/<int:item_id>/', views.PlaceBidView.as_view(), name='place-bid'),
    path('buyer/bids/history/<int:auction_id>/', views.BidHistoryView.as_view(), name='bid-history'),
    path('buyer/bids/won/', views.BuyerWonItemsView.as_view(), name='won-items'),

    # --------- SELLER ----------
    path('seller/items/', views.SellerAuctionItemListView.as_view(), name='seller-items'),
    path('seller/items/add/', views.SellerAuctionItemCreateView.as_view(), name='seller-item-add'),
    path('seller/items/<int:pk>/', views.SellerAuctionItemDetailView.as_view(), name='seller-item-detail'),
    path('seller/<int:seller_id>/dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),
    path('seller/<int:seller_id>/dashboard/csv/', SellerDashboardCSVView.as_view(), name='seller-dashboard-csv'),

    # --------- AUCTIONEER ----------
    path('auctioneers/approved/', ApprovedAuctioneersListView.as_view(), name='approved-auctioneers'),
    path('auctioneer/items/', views.auctioneer_items, name='auctioneer-items'),
    path('auctioneer/items/pending/', pending_items_for_approval, name='pending-auction-items'),
    path('auctioneer/items/<int:item_id>/approve/', approve_item, name='approve-auction-item'),
    path('auctioneer/items/<int:item_id>/reject/', reject_item, name='reject-auction-item'),
    path('auctioneer/items/<int:item_id>/schedule/', schedule_auction, name='schedule-auction'),
    path('auctioneer/bid/<int:bid_id>/approve/', approve_bid, name='approve-bid'),
    path('auctioneer/bid/<int:bid_id>/reject/', reject_bid, name='reject-bid'),
    path('auctioneer/finalize/<int:item_id>/', finalize_auction, name='finalize-auction'),
    path("auctioneer/<int:auctioneer_id>/dashboard/", AuctioneerDashboardView.as_view(), name="auctioneer_dashboard"),
    path("auctioneer/<int:auctioneer_id>/dashboard/csv/", AuctioneerDashboardCSVView.as_view(), name="auctioneer_dashboard_csv"),


    # --------- AUCTIONS ----------
    path('auctions/', AuctionView.as_view(), name='auction-list'),
    path('auctions/review/<int:pk>/', AuctionReviewDetailView.as_view(), name='auction-review-detail'),
    path('auctions/review/up/<int:pk>/', AuctionReviewUpdateView.as_view(), name='auction-review-update'),
    path('auctions/<int:auction_id>/end/', end_auction, name='end-auction'),
    path('auctions/<int:pk>/', AuctionDetailView.as_view(), name='auction-detail'),
    path('auctions/featured/', featured_auctions, name='featured-auctions'),
    path('auctions/category/<str:category>/', auctions_by_category, name='auctions-by-category'),
    path('auctions/<int:auction_id>/bids/', auction_bids, name='auction-bids'),

    # --------- REPORTS ----------
    path('reports/', AuctionReportListView.as_view(), name='auction-report-list'),
    path('auction-report/<int:auction_id>/', AuctionReportDetailView.as_view(), name='auction-report-detail'),

    # --------- WATCHLIST ----------
    path('buyer/<int:buyer_id>/watchlist/', WatchlistListView.as_view(), name='buyer-watchlist'),
    path('watchlist/<int:item_id>/add/', WatchlistAddView.as_view(), name='watchlist-add'),
    path('buyer/<int:buyer_id>/watchlist/<int:item_id>/remove/', WatchlistRemoveView.as_view(), name='buyer-watchlist-remove'),

    # --------- NOTIFICATIONS ----------
    path('buyer/<int:buyer_id>/notifications/', notification_buyer, name='buyer-notifications'),
    path('buyer/<int:buyer_id>/notifications/mark-as-read/', NotificationViewSet.as_view({'patch': 'mark_as_read'}), name='buyer-notifications-mark-as-read'),
    path('seller/<int:seller_id>/notifications/', notification_seller, name='seller-notifications'),
    path('seller/<int:seller_id>/notifications/mark-as-read/', NotificationViewSet.as_view({'patch': 'mark_as_read'}), name='seller-notifications-mark-as-read'),
     path(
        'notifications/<int:user_id>/unread-count/', 
        NotificationViewSet.as_view({'get': 'unread_count'}), 
        name='notifications-unread-count'
    ),
    path('notifications/', notification_viewset, name='notification-list'),
    path('notifications/mark-all-as-read/', NotificationViewSet.as_view({'patch': 'mark_all_as_read'}), name='notification-mark-all-as-read'),
    
    
    path('payments/<int:item_id>/request/', create_payment_request, name='create_payment_request'),
    path('payment/success/', payment_success, name='payment_success'),
    path('payments/', list_payments, name='list_payments'),
    path('payments/<int:payment_id>/refund/', refund_payment, name='refund_payment'),
    
    path('chat/send/', send_message, name='send_message'),
    path('chat/<int:receiver_id>/history/',get_chat_history, name='chat_history'),
    path('chat/<int:receiver_id>/stream/', sse_event_stream, name='chat_stream'),
    path('chat/admin/conversations/', admin_conversations, name='admin_conversations'),
    
]