
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save, m2m_changed

from instamojo_wrapper import Instamojo

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('auctioneer', 'Auctioneer'),
    ]
    
    APPROVAL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    BUSINESS_TYPE_CHOICES = [
        ('retail', 'Retail'),
        ('wholesale', 'Wholesale'),
        ('manufacturing', 'Manufacturing'),
        ('services', 'Services'),
        ('other', 'Other'),
    ]
    
    ITEM_CATEGORY_CHOICES = [
        ('art', 'Art & Paintings'),
        ('antiques', 'Antiques & Collectibles'),
        ('jewelry', 'Jewelry & Watches'),
        ('furniture', 'Furniture & Home Décor'),
        ('electronics', 'Electronics & Gadgets'),
        ('vehicles', 'Vehicles (Cars, Bikes, etc.)'),
        ('real_estate', 'Real Estate'),
        ('fashion', 'Fashion & Accessories'),
        ('books', 'Books & Manuscripts'),
        ('sports', 'Sports & Memorabilia'),
        ('coins', 'Coins & Stamps'),
        ('industrial', 'Industrial & Machinery'),
        ('other', 'Other'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    profile_pic = models.ImageField(upload_to='profile_pic/', blank=True, null=True) 
    phone_number = models.CharField(max_length=15, blank=True, default="0000000000")
    bank_account_number = models.CharField(max_length=30, blank=True)
    residence_address = models.CharField(max_length=255, blank=True)  
    street_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state_province = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    business_category = models.CharField(max_length=250, choices=ITEM_CATEGORY_CHOICES, blank=True)
    
    approval_status = models.CharField(
        max_length=20, 
        choices=APPROVAL_STATUS_CHOICES, 
        default='pending'
    )
    approved_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_users'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    date_of_birth = models.DateField(null=True, blank=True)
    preferred_categories = models.CharField(max_length=255, blank=True)  
    
    company_name = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    business_type = models.CharField(max_length=50, choices=BUSINESS_TYPE_CHOICES, blank=True)
    
    business_name = models.CharField(max_length=255, blank=True)
    business_address = models.CharField(max_length=255, blank=True)
    license_number = models.CharField(max_length=50, blank=True)
    license_issue_date = models.DateField(null=True, blank=True)
    license_document = models.FileField(upload_to='license_docs/', null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()}) - {self.get_approval_status_display()}"
    
    def approve(self, admin_user):
        """Approve the user"""
        self.approval_status = 'approved'
        self.approved_by = admin_user
        self.approved_at = timezone.now()
        self.is_active = True
        self.save()
    
    def reject(self, admin_user, reason=""):
        """Reject the user"""
        self.approval_status = 'rejected'
        self.approved_by = admin_user
        self.rejection_reason = reason
        self.is_active = False
        self.save()

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.user_type = 'admin'
            self.approval_status = 'approved'
        super().save(*args, **kwargs)

class AuctionItem(models.Model):
    ITEM_CATEGORY_CHOICES = [
        ('art', 'Art & Paintings'),
        ('antiques', 'Antiques & Collectibles'),
        ('jewelry', 'Jewelry & Watches'),
        ('furniture', 'Furniture & Home Décor'),
        ('electronics', 'Electronics & Gadgets'),
        ('vehicles', 'Vehicles (Cars, Bikes, etc.)'),
        ('real_estate', 'Real Estate'),
        ('fashion', 'Fashion & Accessories'),
        ('books', 'Books & Manuscripts'),
        ('sports', 'Sports & Memorabilia'),
        ('coins', 'Coins & Stamps'),
        ('industrial', 'Industrial & Machinery'),
        ('other', 'Other'),
    ]
    
    seller = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'seller'})
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=250, choices=ITEM_CATEGORY_CHOICES, blank=True)
    start_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_started = models.BooleanField(default=False)  
    featured = models.BooleanField(default=False)
    image = models.ImageField(upload_to='auction_images/', blank=True, null=True) 
    approval_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )
    assigned_auctioneer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'auctioneer', 'approval_status': 'approved'},
        related_name='assigned_items'
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_items'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    auction_start = models.DateTimeField(null=True, blank=True)
    auction_end = models.DateTimeField(null=True, blank=True)
    highest_bid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    auction_winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='won_items'
    )
    is_auction_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title  
    
    def approve(self, admin_user):
        """Approve the auction item"""
        self.approval_status = 'approved'
        self.approved_by = admin_user
        self.approved_at = timezone.now()
        self.is_active = True
        self.save()
        # Notify seller of approval
        Notification.objects.create(
            user=self.seller,
            message=f"Your auction item '{self.title}' has been approved.",
            type='system',
            related_auction=self
        )
    
    def reject(self, admin_user, reason=""):
        """Reject the auction item"""
        self.approval_status = 'rejected'
        self.approved_by = admin_user
        self.rejection_reason = reason
        self.is_active = False
        self.save()
        # Notify seller of rejection
        Notification.objects.create(
            user=self.seller,
            message=f"Your auction item '{self.title}' was rejected. Reason: {reason or 'No reason provided'}",
            type='system',
            related_auction=self
        )
        
    def finalize_auction(self):
        """Set final price and winner after auction ends."""
        now = timezone.now()
        if not self.auction_end or now < self.auction_end or self.is_auction_completed:
            return
        highest_bid = self.bids.order_by('-amount').first()
        if highest_bid:
            self.final_price = highest_bid.amount 
            self.auction_winner = highest_bid.bidder
            highest_bid.is_winner = True
            highest_bid.save()
            # Notify winner
            Notification.objects.create(
                user=self.auction_winner,
                message=f"Congratulations! You won the auction for '{self.title}' with a bid of {self.final_price}.",
                type='auction_end',
                related_auction=self
            )
            # Notify seller
            Notification.objects.create(
                user=self.seller,
                message=f"Your auction for '{self.title}' has ended. Sold to {self.auction_winner.username} for {self.final_price}.",
                type='auction_end',
                related_auction=self
            )
        else:
            # Notify seller of no bids
            Notification.objects.create(
                user=self.seller,
                message=f"Your auction for '{self.title}' has ended with no bids.",
                type='auction_end',
                related_auction=self
            )
        self.is_auction_completed = True
        self.save()
        # Notify watchlist users
        for watchlist in self.watchlisted_by.all():
            Notification.objects.create(
                user=watchlist.buyer,
                message=f"The auction for '{self.title}' you were watching has ended.",
                type='auction_end',
                related_auction=self
            )

    @property
    def auction_status(self):
        now = timezone.now()
        if not self.auction_start or not self.auction_end:
            return "unknown"
        if now < self.auction_start:
            return "upcoming"
        elif self.auction_start <= now < self.auction_end:
            return "live"
        else:
            self.finalize_auction() 
            return "ended"
        
    @property
    def winner_name(self):
        return self.auction_winner.get_full_name() if self.auction_winner else '—'

    @property
    def is_running(self):
        now = timezone.now()
        return self.is_active and self.auction_start <= now <= self.auction_end

class Bid(models.Model):
    auction = models.ForeignKey(AuctionItem, related_name='bids', on_delete=models.CASCADE)
    bidder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_winner = models.BooleanField(default=False)
    bidder_username = models.CharField(max_length=150, blank=True)
    auction_is_active = models.BooleanField(default=True)
    auction_seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bids_as_seller',
        limit_choices_to={'user_type': 'seller'},
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-amount']

    def save(self, *args, **kwargs):
        self.bidder_username = self.bidder.username
        self.auction_seller = self.auction.seller
        super().save(*args, **kwargs)
        # Notify seller of new bid
        Notification.objects.create(
            user=self.auction.seller,
            message=f"A new bid of {self.amount} was placed on your auction '{self.auction.title}' by {self.bidder.username}.",
            type='bid',
            related_auction=self.auction
        )
        # Notify watchlist users
        for watchlist in self.auction.watchlisted_by.all():
            if watchlist.buyer != self.bidder:  # Don't notify the bidder themselves
                Notification.objects.create(
                    user=watchlist.buyer,
                    message=f"A new bid of {self.amount} was placed on '{self.auction.title}' you are watching.",
                    type='bid',
                    related_auction=self.auction
                )

class AuctionReport(models.Model):
    auction_item = models.OneToOneField(
        AuctionItem,
        on_delete=models.CASCADE,
        related_name='report'
    )
    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'seller'},
        related_name='+',
        null=True
    )
    auctioneer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'auctioneer'},
        related_name='+'
    )
    winner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'buyer'},
        related_name='won_reports'
    )
    total_bids = models.PositiveIntegerField(default=0)
    total_participants = models.PositiveIntegerField(default=0)
    highest_bid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    generated_at = models.DateTimeField(default=timezone.now)
    duration = models.DurationField(null=True, blank=True)
    start_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Report for {self.auction_item.title}"

    def generate_from_auction(self):
        if not self.auction_item.is_auction_completed:
            self.auction_item.finalize_auction()
        self.seller = self.auction_item.seller
        self.auctioneer = self.auction_item.assigned_auctioneer
        self.winner = self.auction_item.auction_winner
        self.final_price = self.auction_item.final_price
        bids = self.auction_item.bids.all()
        self.total_participants = bids.values_list('bidder', flat=True).distinct().count()
        self.start_price = self.auction_item.start_price
        if self.auction_item.auction_start and self.auction_item.auction_end:
            self.duration = self.auction_item.auction_end - self.auction_item.auction_start
        self.total_bids = bids.count()
        highest_bid_obj = bids.order_by('-amount').first()
        self.highest_bid = highest_bid_obj.amount if highest_bid_obj else None
        self.generated_at = timezone.now()
        self.save()

class Watchlist(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watchlist")
    item = models.ForeignKey("AuctionItem", on_delete=models.CASCADE, related_name="watchlisted_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('buyer', 'item')

    def __str__(self):
        return f"{self.buyer.username} watching {self.item.title}"

class Buyer(User):
    class Meta:
        proxy = True
        verbose_name = "Buyer"
        verbose_name_plural = "Buyers"

class Seller(User):
    class Meta:
        proxy = True
        verbose_name = "Seller"
        verbose_name_plural = "Sellers"

class Auctioneer(User):
    class Meta:
        proxy = True
        verbose_name = "Auctioneer"
        verbose_name_plural = "Auctioneers"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("watchlist", "Watchlist"),
        ("auction_start", "Auction Start"),
        ("auction_end", "Auction End"),
        ("bid", "Bid Placed"),
        ("system", "System"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default="system")
    created_at = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)
    related_auction = models.ForeignKey(
        AuctionItem,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications"
    )

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:20]}"

# Signal to notify watchlist users and seller when auction starts
@receiver(post_save, sender=AuctionItem)
def notify_auction_start(sender, instance, **kwargs):
    if instance.is_started and instance.auction_status == "live":
        # Notify seller
        Notification.objects.create(
            user=instance.seller,
            message=f"The auction for your item '{instance.title}' has started!",
            type='auction_start',
            related_auction=instance
        )
        # Notify watchlist users
        for watchlist in instance.watchlisted_by.all():
            Notification.objects.create(
                user=watchlist.buyer,
                message=f"The auction for '{instance.title}' you are watching has started!",
                type='auction_start',
                related_auction=instance
            )

# Signal to notify watchlist users when item is added to watchlist
@receiver(post_save, sender=Watchlist)
def notify_watchlist_add(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.buyer,
            message=f"You added '{instance.item.title}' to your watchlist.",
            type='watchlist',
            related_auction=instance.item
        )
        
        
        
        
api = Instamojo(
    api_key=settings.INSTAMOJO_API_KEY,
    auth_token=settings.INSTAMOJO_AUTH_TOKEN,
    endpoint=settings.INSTAMOJO_ENDPOINT  # Optional, for test/live
)

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    auction = models.OneToOneField('AuctionItem', on_delete=models.CASCADE, related_name='payment')
    buyer = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name="payments_as_buyer",
        limit_choices_to={'user_type': 'buyer'}
    )
    seller = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name="payments_as_seller",
        limit_choices_to={'user_type': 'seller'}
    )
    instamojo_payment_request_id = models.CharField(max_length=200, unique=True)
    payment_id = models.CharField(max_length=200, blank=True)  # From callback
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # In INR
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    refunded_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return f"Payment for {self.auction.title} - {self.status}"

    def create_payment_request(self, amount):
        """Create Instamojo Payment Request (returns long_url for redirect)"""
        try:
            response = api.payment_request_create(
                amount=str(amount * 100),  # Paisa
                purpose=f"Payment for {self.auction.title}",
                send_email=False,  # Handle notifications yourself
                redirect_url=f"{settings.SITE_URL}/payment/success/",  # Your success URL
                buyer_name=self.buyer.get_full_name() or self.buyer.username,
                buyer_email=self.buyer.email or '',
                buyer_phone=self.buyer.phone_number or '',
                notes={
                    'auction_id': self.auction.id,
                    'buyer_id': self.buyer.id,
                    'seller_id': self.seller.id,
                }
            )
            self.instamojo_payment_request_id = response['id']
            self.amount = amount
            self.save()
            return response['longurl']  # Redirect buyer here
        except Exception as e:
            raise ValueError(f"Payment request failed: {str(e)}")

    def verify_payment(self, payment_id, payment_request_id):
        """Verify on success callback"""
        try:
            response = api.payment_request_read(payment_request_id)
            if response['payments'][0]['payment_id'] == payment_id and response['status'] == 'Completed':
                self.payment_id = payment_id
                self.status = 'succeeded'
                self.auction.is_active = False  # Close auction
                self.auction.save()
                # Notify
                Notification.objects.create(
                    user=self.seller,
                    message=f"Payment of ₹{self.amount} received for '{self.auction.title}' from {self.buyer.username}.",
                    type='system',
                    related_auction=self.auction
                )
                Notification.objects.create(
                    user=self.buyer,
                    message=f"Payment successful for '{self.auction.title}'. Item will be shipped soon.",
                    type='system',
                    related_auction=self.auction
                )
                self.save()
                return True
            else:
                self.status = 'failed'
                self.save()
                return False
        except Exception:
            self.status = 'failed'
            self.save()
            return False

    def refund(self, admin_user, amount=None):
        """Admin refund (full only, as Instamojo supports simple refunds)"""
        if amount is None:
            amount = self.amount
        if not self.payment_id:
            raise ValueError("No payment to refund")
        try:
            api.payment_request_refund(self.instamojo_payment_request_id, self.payment_id, str(amount * 100))
            self.refunded_amount = amount
            self.status = 'refunded'
            self.save()
            # Notify
            Notification.objects.create(
                user=self.buyer,
                message=f"Full refund of ₹{amount} processed for '{self.auction.title}' by admin {admin_user.username}.",
                type='system',
                related_auction=self.auction
            )
            Notification.objects.create(
                user=self.seller,
                message=f"Refund of ₹{amount} issued for '{self.auction.title}'.",
                type='system',
                related_auction=self.auction
            )
        except Exception as e:
            raise ValueError(f"Refund failed: {str(e)}")        
        
        
        
        
class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    room_name = models.CharField(max_length=100, blank=True)  # e.g., 'buyer_1_admin'

    class Meta:
        ordering = ['timestamp']

    def _str_(self):
        return f"{self.sender.username} to {self.receiver.username}: {self.message[:50]}"

    @classmethod
    def get_or_create_room(cls, user1, user2):
        ids = sorted([user1.id, user2.id])
        return f"user_{ids[0]}user{ids[1]}"        