from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponseRedirect
from django.conf import settings
from myapp.models import Payment, AuctionItem
from myapp.serializers import PaymentSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_request(request, auction_id):
    """Buyer initiates payment (returns redirect URL)"""
    if request.user.user_type != 'buyer':
        return Response({'error': 'Only buyers can pay'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        auction = AuctionItem.objects.get(id=auction_id, auction_winner=request.user, is_auction_completed=True)
        payment, created = Payment.objects.get_or_create(
            auction=auction,
            buyer=request.user,
            seller=auction.seller,
            defaults={'status': 'pending'}
        )
        if not created and payment.status != 'pending':
            return Response({'error': 'Payment already processed'}, status=status.HTTP_400_BAD_REQUEST)
        
        long_url = payment.create_payment_request(auction.final_price)
        return Response({'redirect_url': long_url})
    except AuctionItem.DoesNotExist:
        return Response({'error': 'Auction not found or not won by you'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def payment_success(request):
    """Handle callback (verify and redirect to frontend)"""
    payment_request_id = request.GET.get('payment_request_id')
    payment_id = request.GET.get('payment_id')
    if payment_request_id and payment_id:
        try:
            payment = Payment.objects.get(instamojo_payment_request_id=payment_request_id)
            if payment.verify_payment(payment_id, payment_request_id):
                # Redirect to Next.js success page with token or ID
                return HttpResponseRedirect(f"{settings.FRONTEND_URL}/payment/success?payment_id={payment.id}")
            else:
                return HttpResponseRedirect(f"{settings.FRONTEND_URL}/payment/failed")
        except Payment.DoesNotExist:
            pass
    return HttpResponseRedirect(f"{settings.FRONTEND_URL}/payment/failed")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_payments(request):
    """Admin lists all payments"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Only admins can view payments'}, status=status.HTTP_403_FORBIDDEN)
    
    payments = Payment.objects.select_related('auction', 'buyer', 'seller').all()
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refund_payment(request, payment_id):
    """Admin refunds a payment"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Only admins can refund'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        payment = Payment.objects.get(id=payment_id, status='succeeded')
        payment.refund(request.user)
        return Response({'message': 'Refund processed'})
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)