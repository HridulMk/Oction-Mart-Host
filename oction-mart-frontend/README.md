# Oction Mart Frontend

A modern auction platform frontend built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Multi-role Authentication**: Support for buyers, sellers, and auctioneers
- **Real-time Auctions**: Live bidding and auction management
- **Responsive Design**: Mobile-first approach with modern UI
- **Backend Integration**: Ready for backend API connection
- **Demo Mode**: Fallback data when backend is not available

## 🏗️ Backend Integration Status

This frontend is **ready for backend integration** but currently operates in **demo mode** when the backend is not available.

### Demo Mode Features

- ✅ **Fallback Data**: Shows sample auctions and products when backend is unavailable
- ✅ **User-Friendly Messages**: Clear indicators when running in demo mode
- ✅ **Graceful Degradation**: App continues to work with mock data
- ✅ **Error Handling**: Comprehensive error handling for network issues

### Backend Requirements

See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for complete backend requirements and integration guide.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oction-mart-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your backend URL:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Current Status

### ✅ Completed
- Frontend UI/UX implementation
- Authentication system (ready for backend)
- Auction browsing and management
- Product management
- User registration and login
- Responsive design
- Error handling and fallback mechanisms

### 🔄 In Progress
- Backend integration (waiting for backend team)
- Real-time bidding features
- Payment integration
- Advanced search and filtering

### 📋 Next Steps
1. **Backend Integration**: Connect to your backend API
2. **Testing**: Test all features with real data
3. **Deployment**: Deploy to production environment
4. **Monitoring**: Add error monitoring and analytics

## 🎨 Demo Mode

When the backend is not available, the app automatically switches to demo mode:

- **Sample Data**: Shows realistic auction and product data
- **Full Functionality**: All UI features work with mock data
- **Clear Indicators**: Users are informed when viewing demo data
- **Seamless Experience**: No interruption to user experience

## 📁 Project Structure

```
src/
├── api/                 # API services and configuration
│   ├── index.ts        # Axios configuration
│   └── services/       # API service functions
├── app/                # Next.js app router pages
├── components/         # Reusable UI components
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── config/            # Configuration files
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Authentication
NEXT_PUBLIC_AUTH_TOKEN_KEY=authToken
NEXT_PUBLIC_USER_KEY=user
```

### Backend Integration

1. **Start your backend server**
2. **Update environment variables** with correct backend URL
3. **Test integration** by refreshing the app
4. **Verify features** work with real data

## 🐛 Troubleshooting

### Common Issues

1. **Network Error**: Backend server not running
   - Solution: Start your backend server or check the API URL

2. **CORS Errors**: Backend not configured for frontend domain
   - Solution: Configure CORS in your backend

3. **Authentication Issues**: Token not being sent
   - Solution: Check localStorage for authToken

### Demo Mode

If you see "Demo Mode" messages:
- Backend server is not available
- App is using fallback data
- All features work with sample data
- No action required unless you want real data

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues related to:
- **Frontend**: Check this README and documentation
- **Backend Integration**: See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
- **Deployment**: Check deployment documentation
