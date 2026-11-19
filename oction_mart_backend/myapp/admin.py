from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils import timezone
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required

from .models import (
    User, AuctionItem, Bid, AuctionReport, Watchlist,
    Buyer, Seller, Auctioneer
)

# -------------------- Inlines --------------------


# -------------------- User Admin --------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['id',
        'username', 'email', 'user_type', 'approval_status_display',
        'is_active', 'created_at', 'approved_by', 'admin_actions'
    ]
    list_filter = [
        'user_type', 'approval_status', 'is_active', 'is_staff',
        'created_at', 'approved_at'
    ]
    search_fields = [
        'username', 'email', 'first_name', 'last_name',
        'business_name', 'license_number'
    ]
    list_editable = ['is_active']
    ordering = ['-created_at']
    list_per_page = 25

    fieldsets = (
        ('Basic Information', {
            'fields': ('username', 'email', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'phone_number', 'address')
        }),
        ('User Type & Status', {
            'fields': ('user_type', 'approval_status', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Approval Information', {
            'fields': ('approved_by', 'approved_at', 'rejection_reason'),
            'classes': ('collapse',)
        }),
        ('Buyer Specific Fields', {
            'fields': ('preferred_categories', 'budget_range'),
            'classes': ('collapse',),
            'description': 'Only relevant for buyers'
        }),
        ('Seller Specific Fields', {
            'fields': ('business_name', 'business_type', 'tax_id'),
            'classes': ('collapse',),
            'description': 'Only relevant for sellers'
        }),
        ('Auctioneer Specific Fields', {
            'fields': ('license_number','license_issue_date','license_document'),
            'classes': ('collapse',),
            'description': 'Only relevant for auctioneers'
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
    )

    add_fieldsets = (
        ('Basic Information', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2')
        }),
        ('Personal Info', {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name', 'phone_number', 'address')
        }),
        ('User Type', {
            'classes': ('wide',),
            'fields': ('user_type',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined']

    

    # --- Approval Status Display ---
    def approval_status_display(self, obj):
        colors = {
            'pending': 'orange',
            'approved': 'green',
            'rejected': 'red'
        }
        color = colors.get(obj.approval_status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_approval_status_display()
        )
    approval_status_display.short_description = 'Status'
    approval_status_display.admin_order_field = 'approval_status'

    # --- Admin Actions ---
    def admin_actions(self, obj):
        if obj.approval_status == 'pending':
            return "Pending – Approve via change form"
        return "-"
    admin_actions.short_description = 'Actions'

    # --- Queryset optimization ---
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('approved_by')

    # --- Save model hook ---
    def save_model(self, request, obj, form, change):
        if change and 'approval_status' in form.changed_data:
            if obj.approval_status == 'approved':
                obj.approved_by = request.user
                obj.approved_at = timezone.now()
                obj.is_active = True
            elif obj.approval_status == 'rejected':
                obj.approved_by = request.user
                obj.is_active = False
        super().save_model(request, obj, form, change)

    # --- Bulk Actions ---
    actions = ['approve_selected_users', 'reject_selected_users', 'activate_users', 'deactivate_users']

    def approve_selected_users(self, request, queryset):
        updated = 0
        for user in queryset.filter(approval_status='pending'):
            user.approve(request.user)
            updated += 1
        self.message_user(request, f'{updated} users were successfully approved.')
    approve_selected_users.short_description = "Approve selected users"

    def reject_selected_users(self, request, queryset):
        updated = 0
        for user in queryset.filter(approval_status='pending'):
            user.reject(request.user, "Bulk rejection by admin")
            updated += 1
        self.message_user(request, f'{updated} users were successfully rejected.')
    reject_selected_users.short_description = "Reject selected users"

    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users were successfully activated.')
    activate_users.short_description = "Activate selected users"

    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users were successfully deactivated.')
    deactivate_users.short_description = "Deactivate selected users"


# -------------------- Other Models --------------------
# @admin.register(BuyerProfile)
# class BuyerProfileAdmin(admin.ModelAdmin):
#     list_display = [
#         'get_username', 'get_email', 'get_phone', 'get_dob', 'get_categories', 'get_approval_status'
#     ]
#     search_fields = ['user__username', 'user__email']
#     list_filter = ['user__approval_status']

#     def get_username(self, obj):
#         return obj.user.username
#     get_username.short_description = 'Username'

#     def get_email(self, obj):
#         return obj.user.email
#     get_email.short_description = 'Email'

#     def get_phone(self, obj):
#         return obj.user.phone_number
#     get_phone.short_description = 'Phone'

#     def get_dob(self, obj):
#         return obj.user.date_of_birth
#     get_dob.short_description = 'Date of Birth'

#     def get_categories(self, obj):
#         return obj.user.preferred_categories
#     get_categories.short_description = 'Preferred Categories'

#     def get_approval_status(self, obj):
#         return obj.user.get_approval_status_display()
#     get_approval_status.short_description = 'Approval Status'

# @admin.register(SellerProfile)
# class SellerProfileAdmin(admin.ModelAdmin):
#     list_display = [
#         'get_username', 'get_email', 'get_company', 'get_tax_id', 'get_business_type', 'get_approval_status'
#     ]
#     search_fields = ['user__username', 'user__email', 'user__company_name']
#     list_filter = ['user__business_type', 'user__approval_status']

#     def get_username(self, obj):
#         return obj.user.username
#     def get_email(self, obj):
#         return obj.user.email
#     def get_company(self, obj):
#         return obj.user.company_name
#     def get_tax_id(self, obj):
#         return obj.user.tax_id
#     def get_business_type(self, obj):
#         return obj.user.get_business_type_display()
#     def get_approval_status(self, obj):
#         return obj.user.get_approval_status_display()

#     get_username.short_description = 'Username'
#     get_email.short_description = 'Email'
#     get_company.short_description = 'Company Name'
#     get_tax_id.short_description = 'Tax ID'
#     get_business_type.short_description = 'Business Type'
#     get_approval_status.short_description = 'Approval Status'

# @admin.register(AuctioneerProfile)
# class AuctioneerProfileAdmin(admin.ModelAdmin):
#     list_display = [
#         'get_username', 'get_email', 'get_business_name', 'get_license_number', 'get_license_date', 'get_approval_status'
#     ]
#     search_fields = ['user__username', 'user__email', 'user__license_number']
#     list_filter = ['user__approval_status']

#     def get_username(self, obj):
#         return obj.user.username
#     def get_email(self, obj):
#         return obj.user.email
#     def get_business_name(self, obj):
#         return obj.user.business_name
#     def get_license_number(self, obj):
#         return obj.user.license_number
#     def get_license_date(self, obj):
#         return obj.user.license_issue_date
#     def get_approval_status(self, obj):
#         return obj.user.get_approval_status_display()

#     get_username.short_description = 'Username'
#     get_email.short_description = 'Email'
#     get_business_name.short_description = 'Business Name'
#     get_license_number.short_description = 'License No.'
#     get_license_date.short_description = 'License Date'
#     get_approval_status.short_description = 'Approval Status'


#  ✅ Buyer Admin
@admin.register(Buyer)
class BuyerAdmin(admin.ModelAdmin):
    list_display = ['id','username',
            'first_name', 'last_name', 'date_of_birth', 'phone_number','profile_pic',
            'residence_address', 'street_address', 'city', 'state_province', 'zip_code',
            'email', 'password' ,'preferred_categories', 'approval_status','rejection_reason']
    def get_queryset(self, request):
        return super().get_queryset(request).filter(user_type='buyer')

    def username(self, obj):
        return obj.user.username

    def first_name(self, obj):
        return obj.user.first_name

    def last_name(self, obj):
        return obj.user.last_name

    def date_of_birth(self, obj):
        return obj.user.date_of_birth

    def phone_number(self, obj):
        return obj.user.phone_number

    def residence_address(self, obj):
        return obj.user.residence_address

    def street_address(self, obj):
        return obj.user.street_address

    def city(self, obj):
        return obj.user.city

    def state_province(self, obj):
        return obj.user.state_province

    def zip_code(self, obj):
        return obj.user.zip_code

    def email(self, obj):
        return obj.user.email

# ✅ Seller Admin
@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ['id',
            'username','profile_pic',
            'company_name',
            'business_type',
            'bank_account_number',
            'tax_id',
            'residence_address',
            'street_address',
            'city',
            'state_province',
            'zip_code',
            'phone_number',
            'email',
            'password',
            
         'approval_status']
    def get_queryset(self, request):
        return super().get_queryset(request).filter(user_type='seller')

# ✅ Auctioneer Admin
@admin.register(Auctioneer)
class AuctioneerAdmin(admin.ModelAdmin):
    list_display = ['id', 'username',
            'business_name', 'phone_number', 'bank_account_number','street_address','profile_pic',
            'city',
            'state_province',
            'zip_code',
            'business_category',
            'email', 'password', 
            'license_number', 'license_issue_date', 'license_document','approval_status']
    def get_queryset(self, request):
        return super().get_queryset(request).filter(user_type='auctioneer')

class BidInline(admin.TabularInline):
    model = Bid
    extra = 0
    fields = ('bidder', 'amount', 'is_winner', 'timestamp')
    readonly_fields = ('bidder', 'amount', 'is_winner', 'timestamp')
    can_delete = False



# @admin.register(SellerAuctionItem)
# class SellerAuctionItemAdmin(admin.ModelAdmin):
#     list_display = ['title','description','category','assigned_auctioneer', 'seller', 'start_price','approval_status', 'is_active','image']

@admin.register(AuctionItem)
class AuctionItemAdmin(admin.ModelAdmin):
    list_display = ['id','title','created_at','assigned_auctioneer', 'seller','category', 'start_price','auction_start','auction_end','auction_status','final_price','auction_winner','approval_status','approved_by', 'is_active','image','featured','is_auction_completed']    
     # --- Admin Actions ---
    def admin_actions(self, obj):
        if obj.approval_status == 'pending':
            return "Pending – Approve via change form"
        return "-"
    admin_actions.short_description = 'Actions'

    # --- Queryset optimization ---
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('approved_by')

    # --- Save model hook ---
    def save_model(self, request, obj, form, change):
        if change and 'approval_status' in form.changed_data:
            if obj.approval_status == 'approved':
                obj.approved_by = request.user
                obj.approved_at = timezone.now()
                obj.is_active = True
            elif obj.approval_status == 'rejected':
                obj.approved_by = request.user
                obj.is_active = False
        super().save_model(request, obj, form, change)

    # --- Bulk Actions ---
    actions = ['approve_selected_auctions', 'reject_selected_auctions', 'activate_auctions', 'deactivate_auctions']

    def approve_selected_auctions(self, request, queryset):
        updated = 0
        for user in queryset.filter(approval_status='pending'):
            user.approve(request.user)
            updated += 1
        self.message_user(request, f'{updated} Auctions were successfully approved.')
    approve_selected_auctions.short_description = "Approve selected auctions"

    def reject_selected_auctions(self, request, queryset):
        updated = 0
        for user in queryset.filter(approval_status='pending'):
            user.reject(request.user, "Bulk rejection by admin")
            updated += 1
        self.message_user(request, f'{updated} Auctions were successfully rejected.')
    reject_selected_auctions.short_description = "Reject selected auctions"

    def activate_auctions(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} auctions were successfully activated.')
    activate_auctions.short_description = "Activate selected auctions"

    def deactivate_auctions(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} auctions were successfully deactivated.')
    deactivate_auctions.short_description = "Deactivate selected auctions"



@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['auction', 'bidder', 'amount', 'is_winner', 'timestamp','bidder_username']
    list_filter = ['auction', 'is_winner', 'timestamp']
    search_fields = ['bidder__username', 'auction__title']


@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ['buyer', 'item',]


@admin.register(AuctionReport)
class AuctionReportAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "auction_item", "seller", "auctioneer", "total_bids", "highest_bid", "winner")
    search_fields = ("auction_item",)
    list_filter = ("created_at",)

# ✅ Profiles still registered separately (optional if you want direct access too)


# -------------------- Admin UI Branding --------------------
admin.site.site_header = "Auction Management System"
admin.site.site_title = "Auction Admin"
admin.site.index_title = "Welcome to Auction Management System Administration"
