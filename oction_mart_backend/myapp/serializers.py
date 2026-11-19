from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, AuctionItem, Bid, Watchlist
from rest_framework import serializers
from .models import AuctionItem, User, AuctionReport, Bid, Watchlist, Payment, ChatMessage
from myapp.models import Notification


# ============================
# Registration Serializers
# ============================
class BuyerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'date_of_birth', 'phone_number',
            'residence_address', 'street_address', 'city', 'state_province', 'zip_code',
            'email', 'password', 'password_confirm'
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        email = validated_data.get('email')
        validated_data['username'] = email.split('@')[0] if email else None

        user = User.objects.create_user(
            user_type='buyer',
            is_active=False,  # Pending admin approval
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


class SellerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'company_name', 'business_type',
            'bank_account_number', 'tax_id',
            'residence_address', 'street_address', 'city', 'state_province', 'zip_code',
            'phone_number', 'email', 'password', 'password_confirm',
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        email = validated_data.get('email')
        validated_data['username'] = email.split('@')[0] if email else None

        user = User.objects.create_user(
            user_type='seller',
            is_active=False,  # Pending approval
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


class AuctioneerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)


    class Meta:
        model = User
        fields = [
            'username', 'business_name', 'phone_number',
            'bank_account_number','street_address', 'city', 'state_province', 'zip_code',
            'business_category',
             'email', 'password', 'password_confirm',
            'license_number', 'license_issue_date', 'license_document'
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        email = validated_data.get('email')
        validated_data['username'] = email.split('@')[0] if email else None

        user = User.objects.create_user(
            user_type='auctioneer',
            is_active=False,  # Pending approval
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=['buyer', 'seller', 'auctioneer', 'admin'])

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            # Authenticate using only username and password (no user_type__in parameter)
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            
        
            # Check account status
            if not user.is_active:
                if user.approval_status == 'pending':
                    raise serializers.ValidationError('Your account is pending approval')
                elif user.approval_status == 'rejected':
                    raise serializers.ValidationError('Your account has been rejected. Reason: ' + (user.rejection_reason or 'Not specified'))
                else:
                    raise serializers.ValidationError('Account is inactive')
            
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','profile_pic', 'username', 'email', 'user_type', 'approval_status', 'street_address', 'city', 'state_province', 'zip_code', 'phone_number']


class PendingUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone_number', 'street_address', 'approval_status','company_name',
              # Buyer fields
            'business_name', 'business_type', 'tax_id',  # Seller fields
            'license_number','license_issue_date', 'license_document',  # Auctioneer fields
            'created_at'
        ]
        read_only_fields = ['approval_status', 'created_at']



class AuctionReportSerializer(serializers.ModelSerializer):
    auction_item_title = serializers.CharField(source='auction_item.title', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    auctioneer_name = serializers.CharField(source='auctioneer.username', read_only=True)
    winner_name = serializers.CharField(source='auction_item.winner_name', read_only=True) 
    image = serializers.ImageField(source='auction_item.image', read_only=True)
    description = serializers.CharField(source='auction_item.description', read_only=True)  
    class Meta:
        model = AuctionReport
        fields = [
            'id',
            'auction_item_title',
            'seller_name',
            'auctioneer_name',
            'winner_name',
            'total_bids',
            'total_participants',
            'duration',
            'start_price',
            'highest_bid',
            'created_at',
            'generated_at',
            'image',
            'description',
        ]
      
  # or include bid_count if using explicit fields
class AuctionsSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AuctionItem
        fields = ['id', 'title', 'description', 'start_price','highest_bid', 'image', 'approval_status',
        'featured', 'created_at','approved_by', 'approved_at', 'rejection_reason','auction_start',
         'auction_end','final_price', 'auction_status','auction_winner', 'is_auction_completed','assigned_auctioneer','is_active']        
        

class AuctionItemSerializer(serializers.ModelSerializer):
    bid_count = serializers.IntegerField(read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    assigned_auctioneer_username = serializers.CharField(source='assigned_auctioneer.username', read_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    assigned_auctioneer_email = serializers.EmailField(source='assigned_auctioneer.email', read_only=True)
    
   
    
    
    


    class Meta:
        model = AuctionItem
        fields = '__all__'  # or include bid_count if using explicit fields
        
        

class WatchlistSerializer(serializers.ModelSerializer):
    item = AuctionItemSerializer()
    
    class Meta:
        model = Watchlist
        fields = ['id', 'item', 'created_at']

class CreateWatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['item']
        
        
class PlaceBidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = ['amount']  # only amount is provided by user        

class BidSerializer(serializers.ModelSerializer):
    bidder_username = serializers.CharField(source="bidder.username", read_only=True)
    auction_status = serializers.CharField(source="auction.auction_status", read_only=True)
    bidder_first_name = serializers.CharField(source="bidder.first_name", read_only=True)
    bidder_last_name = serializers.CharField(source="bidder.last_name", read_only=True)

    class Meta:
        model = Bid
        fields = ['id', 'auction', 'bidder', 'bidder_username', 'amount', 'timestamp', 'auction_status','bidder_first_name',
            'bidder_last_name','is_winner'] 

# class CreateBidSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Bid
#         fields = ['auction', 'amount']

# ..serializers.py
# ..serializers.py

# In myapp/serializers.py
# myapp/serializers.py


class SellerAuctionItemSerializer(serializers.ModelSerializer):
    
    # This field correctly handles setting the assigned_auctioneer
    # Inside SellerAuctionItemSerializer
    # assigned_auctioneer_name = serializers.CharField(source='assigned_auctioneer.username', read_only=True)

    # assigned_auctioneer = serializers.PrimaryKeyRelatedField(
    #     queryset=User.objects.filter(user_type='auctioneer', approval_status='approved'),
    #     required=True
    # )
    # # The SerializerMethodField now correctly points to the `get_seller` method.
    # seller = serializers.SerializerMethodField()

    class Meta:
        model = AuctionItem
        fields = [
            'id', 'title', 'description','category', 'start_price','image', 'is_active',
            'assigned_auctioneer','approval_status', 'created_at', 'seller', 'auction_start','auction_end',
        ]
        read_only_fields = ['id', 'created_at', 'is_active', 'seller']

    # Renamed the method to `get_seller` to match the SerializerMethodField.
    # This method is now properly indented within the class.
    def get_seller(self, obj):
        # The 'obj' is the AuctionItem instance
        # Return the username from the related seller object
        if obj.seller:
            return obj.seller.username
        return Response (serializers.data)
        return None 

#auctioneer
class AuctionItemApprovalSerializer(serializers.ModelSerializer):
    assigned_auctioneer_name = serializers.CharField(source='assigned_auctioneer.username', read_only=True)

    class Meta:
        model = AuctionItem
        fields = ['id', 'title', 'description', 'start_price', 'approval_status', 'rejection_reason', 'assigned_auctioneer_name']

class AuctionItemReviewSerializer(serializers.ModelSerializer):
    assigned_auctioneer_name = serializers.CharField(source='assigned_auctioneer.username', read_only=True)

    class Meta:
        model = AuctionItem
        fields = [
            'id', 'title', 'description', 'start_price',
            'approval_status', 'rejection_reason',
            'auction_start', 'auction_end',
            'assigned_auctioneer_name'
        ]
        read_only_fields = ['id', 'title', 'description', 'start_price', 'assigned_auctioneer_name']



class AuctionScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionItem
        fields = ['auction_start', 'auction_end','id', 'title', 'description', 'start_price']
        







# class AuctioneerListSerializer1(serializers.ModelSerializer):
#     # Nice display label for your dropdown (business name > full name > username)
#     display_name = serializers.SerializerMethodField()

#     class Meta:
#         model = User
#         fields = ("id", "username", "business_name")
#         read_only_fields = ['id','license_number']

#     def get_display_name(self, obj):
#         business_name = (obj.get_business_name() or "").strip()
#         return obj.business_name or (business_name if business_name else obj.username)


class AuctioneerListSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email','display_name','business_category']  

    def get_display_name(self, obj):
        # Example: combine name and email
        return f"{obj.username} ({obj.email})"

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'type', 'created_at', 'is_read', 'related_auction']
        
        
        
class PaymentSerializer(serializers.ModelSerializer):
    auction_title = serializers.CharField(source='auction.title', read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Payment
        fields = '_all_'
        read_only_fields = ('instamojo_payment_request_id', 'payment_id', 'created_at', 'updated_at')     
        
        
        
        
class AuctionCardSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    current_bid = serializers.SerializerMethodField()
    bids = serializers.SerializerMethodField()

    class Meta:
        model = AuctionItem
        fields = ["id", "title", "category", "current_bid", "bids", "status", "auction_end", "image", "start_price","description","assigned_auctioneer"]

    def get_status(self, obj):
        from django.utils import timezone
        now = timezone.now()
        if obj.auction_start and obj.auction_end:
            if obj.auction_start > now:
                return "upcoming"
            elif obj.auction_start <= now < obj.auction_end:
                return "live"
            return "completed"
        return "unknown"

    def get_current_bid(self, obj):
        return obj.highest_bid or 0

    def get_bids(self, obj):
        return obj.bids.count()


class LicenseInfoSerializer(serializers.Serializer):
    status = serializers.CharField()
    license_number = serializers.CharField()
    issue_date = serializers.DateField()
    expiry_date = serializers.DateField()
    renewal_fee = serializers.IntegerField()

    @staticmethod
    def from_user(user):
        return {
            "status": "Active" if user.approval_status == "approved" else "Inactive",
            "license_number": user.license_number,
            "issue_date": user.license_issue_date,
            "expiry_date": user.license_issue_date.replace(
                year=user.license_issue_date.year + 1
            ) if user.license_issue_date else None,
            "renewal_fee": 120,
        }

class AuctioneerDashboardSerializer(serializers.Serializer):
    stats = serializers.DictField()
    license = LicenseInfoSerializer()
    notifications = NotificationSerializer(many=True)
    auctions = serializers.ListField()  # treat as plain list


# class ChatMessageSerializer(serializers.ModelSerializer):
#     sender_username = serializers.CharField(source='sender.username', read_only=True)
#     receiver_username = serializers.CharField(source='receiver.username', read_only=True)

#     class Meta:
#         model = ChatMessage
#         fields = ['id', 'sender_username', 'receiver_username', 'message', 'timestamp', 'is_read']   

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender_username', 'receiver_username', 'message', 'timestamp', 'is_read']        