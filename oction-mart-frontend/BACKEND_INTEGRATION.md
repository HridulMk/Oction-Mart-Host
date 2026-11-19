# Backend Integration Guide

This guide outlines the steps to connect your Oction Mart frontend to a backend API.

## Prerequisites

1. **Backend API**: Ensure your backend team has implemented the required API endpoints
2. **Environment Setup**: Configure environment variables for API communication
3. **CORS Configuration**: Backend should allow requests from your frontend domain

## Required Backend Endpoints

### Authentication Endpoints

```
POST /api/v1/auth/login/
POST /api/v1/auth/register/
POST /api/v1/auth/logout/
GET /api/v1/auth/profile/
POST /api/v1/auth/refresh/
```

### Auction Endpoints

```
GET /api/v1/auctions/
GET /api/v1/auctions/{id}/
POST /api/v1/auctions/
PUT /api/v1/auctions/{id}/
DELETE /api/v1/auctions/{id}/
POST /api/v1/auctions/bid/
GET /api/v1/auctions/{id}/bids/
GET /api/v1/auctions/featured/
GET /api/v1/auctions/category/{category}/
```

### Product Endpoints

```
GET /api/v1/products/
GET /api/v1/products/{id}/
POST /api/v1/products/
PUT /api/v1/products/{id}/
DELETE /api/v1/products/{id}/
GET /api/v1/products/seller/{sellerId}/
PATCH /api/v1/products/{id}/status/
```

## Environment Configuration

1. Create a `.env.local` file in your project root:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Authentication
NEXT_PUBLIC_AUTH_TOKEN_KEY=authToken
NEXT_PUBLIC_USER_KEY=user
```

2. For production, update the API base URL:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/v1
```

## API Response Formats

### Authentication Response

```json
{
  "token": "your-jwt-token",
  "user": {
    "id": "user-id",
    "loginId": "username",
    "role": "buyer|seller|auctioneer|admin",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

### Auction Response

```json
{
  "id": "auction-id",
  "title": "Auction Title",
  "description": "Auction description",
  "currentBid": "$1,200",
  "timeLeft": "2h 30m",
  "imageUrl": "/path/to/image.jpg",
  "status": "live|upcoming|ended",
  "category": "Electronics",
  "endTime": "2024-02-15T18:00:00Z",
  "participants": 15,
  "bids": 25,
  "seller": {
    "id": "seller-id",
    "name": "Seller Name"
  },
  "auctioneer": {
    "id": "auctioneer-id",
    "name": "Auctioneer Name"
  }
}
```

## Error Handling

The frontend includes comprehensive error handling:

- **401 Unauthorized**: Automatically redirects to login page
- **403 Forbidden**: Shows access denied message
- **404 Not Found**: Shows resource not found message
- **500 Server Error**: Shows server error message
- **Network Errors**: Shows network connection error

## Testing Backend Integration

1. **Start your backend server** (e.g., Django development server)
2. **Update environment variables** with correct backend URL
3. **Test authentication flow**:
   - Try registering a new user
   - Try logging in with valid credentials
   - Verify token storage and retrieval
4. **Test auction functionality**:
   - Browse auctions
   - View auction details
   - Place bids (if authenticated)
5. **Test error scenarios**:
   - Invalid credentials
   - Network errors
   - Server errors

## Common Issues and Solutions

### CORS Errors

If you encounter CORS errors, ensure your backend includes:

```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Frontend development server
    "https://your-frontend-domain.com"  # Production frontend
]

CORS_ALLOW_CREDENTIALS = True
```

### Authentication Issues

1. **Token not being sent**: Check if `authToken` is stored in localStorage
2. **Token expired**: Implement token refresh logic
3. **Invalid token format**: Ensure backend expects `Bearer` token format

### API Endpoint Issues

1. **404 errors**: Verify endpoint URLs match backend implementation
2. **Method not allowed**: Check HTTP methods (GET, POST, PUT, DELETE)
3. **Request format**: Ensure request body matches backend expectations

## Development Workflow

1. **Backend First**: Implement and test backend endpoints
2. **Frontend Integration**: Update frontend to use real API calls
3. **Error Handling**: Test various error scenarios
4. **User Experience**: Ensure smooth transitions and loading states
5. **Testing**: Test with real data and edge cases

## Production Deployment

1. **Environment Variables**: Set production API URLs
2. **HTTPS**: Ensure both frontend and backend use HTTPS
3. **CORS**: Configure CORS for production domains
4. **Monitoring**: Implement error monitoring and logging
5. **Performance**: Optimize API calls and caching

## Support

For issues related to:
- **Frontend Integration**: Check this guide and API documentation
- **Backend API**: Contact your backend development team
- **Environment Setup**: Review environment configuration
- **Deployment**: Check deployment documentation
