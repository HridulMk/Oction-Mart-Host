"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auctionService, AuctionItem } from '@/api/services/auctions';
import { get } from 'http';

const feedbackData = [
  {
    id: '1',
    quote: 'Amazing platform! I found exactly what I was looking for at great prices.',
    name: 'Sarah Johnson',
    description: 'Verified Buyer',
    avatar: 'https://placehold.co/50x50/8A2BE2/white?text=S'
  },
  {
    id: '2',
    quote: 'Selling my items was so easy and I got better prices than expected.',
    name: 'Mike Chen',
    description: 'Verified Seller',
    avatar: 'https://placehold.co/50x50/8A2BE2/white?text=M'
  },
  {
    id: '3',
    quote: 'Professional auctioneering services with excellent customer support.',
    name: 'Emma Davis',
    description: 'Auctioneer',
    avatar: 'https://placehold.co/50x50/8A2BE2/white?text=E'
  },
];

// Fallback mock data for when backend is not available
const fallbackAuctions: AuctionItem[] = [
  {
    id: '1',
    title: 'Android TV',
    description: 'Modern Android TV with smart features and high resolution display.',
    timeLeft: '02h 30m',
    currentBid: '$450',
    image: '/products/product1.jpg',
    status: 'live',
    category: 'Electronics',
    endTime: '2024-02-15T18:00:00Z',
    participants: 12,
    bids: 8
  },
  {
    id: '2',
    title: 'Premium Sneakers',
    description: 'Premium quality sneakers with comfortable design and stylish look.',
    timeLeft: '1d 15h 05m',
    currentBid: '$120',
    image: '/products/product2.jpg',
    status: 'live',
    category: 'Fashion',
    endTime: '2024-02-16T20:00:00Z',
    participants: 8,
    bids: 5
  },
  {
    id: '3',
    title: 'Designer Handbag',
    description: 'Elegant quilted handbag with chain strap and premium materials.',
    timeLeft: '0h 20m 15s',
    currentBid: '$280',
    image: '/products/product3.webp',
    status: 'live',
    category: 'Fashion',
    endTime: '2024-02-15T16:00:00Z',
    participants: 15,
    bids: 12
  },
];

export default function HomePage() {
  const router = useRouter();
  const [featuredAuctions, setFeaturedAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

    const [auction, setItem] = useState<AuctionItem | null>(null);

    const [timeLeft, setTimeLeft] = useState<string>("--:--:--");



   

  useEffect(() => {
    fetchFeaturedAuctions();
  }, []);

  const fetchFeaturedAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      const auctions = await auctionService.getFeaturedAuctions();
      setFeaturedAuctions(auctions);
    } catch (error: any) {
      console.error('Failed to fetch featured auctions:', error);
      
      // Check if it's a network error (backend not available)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        setError('Backend server is not available. Showing demo data.');
        setUsingFallback(true);
        setFeaturedAuctions(fallbackAuctions);
      } else {
        setError(error.response?.data?.message || 'Failed to load featured auctions');
        setFeaturedAuctions([]);
      }
    } finally {
      setLoading(false);
    }
  };


  // // countdown
  //   useEffect(() => {
      
  //     if (!auction?.auction_end) return;
  //     const interval = setInterval(() => {
  //       const end = new Date(auction.auction_end).getTime();
  //       const diff = end - Date.now();
  //       if (diff <= 0) {
  //         setTimeLeft("Auction Ended");
  //         clearInterval(interval);
  //       } else {
  //         const hours = Math.floor(diff / (1000 * 60 * 60));
  //         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  //         const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  //         setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
  //       }
  //     }, 1000);
  //     return () => clearInterval(interval);
  //   }, [auction?.auction_end]);
  const getTimeLeft = (endTime: string): string => {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return 'Auction Ended';
      
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}





  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading featured auctions...</div>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Backend Status Message */}
      {usingFallback && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          color: '#92400e',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          <strong>Demo Mode:</strong> Backend server is not available. Showing sample data for demonstration purposes.
        </div>
      )}
      
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, rgba(138, 43, 226, 0.2) 50%, #1a1a2e 100%)',
        padding: '8rem 1rem 4rem',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <img 
      src="/logo-nobg.png"
      alt="Oction Mart Logo" 
      style={{ 
        width: '120px', 
        marginTop: '-6rem',
        // marginBottom: '1em',
        // filter: 'drop-shadow(0 0 5px rgba(138, 43, 226, 0.7))',
        // borderRadius: '12px',
        alignContent: 'center',
        display: 'inline-block'
      
      


      }} 
    />

          <h1 style={{ 
            fontSize: '4rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            letterSpacing: '0.1em'
          }}>
            OCTION MART
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#d1d5db',
            marginBottom: '3rem',
            lineHeight: '1.6'
          }}>
            The premier online auction platform connecting buyers, sellers, and auctioneers. 
            Discover unique items, bid with confidence, and sell with ease.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/explore-auctions"
              style={{
                backgroundColor: '#8A2BE2',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6A1EB2';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#8A2BE2';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Explore Auctions
            </Link>
            <Link 
              href="/sell"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                textDecoration: 'none',
                border: '2px solid white',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#1a1a2e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Auction Section */}
      <section style={{ 
        padding: '4rem 1rem',
        backgroundColor: '#1a1a2e'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>Featured Auctions</h2>
          <p style={{
            color: '#d1d5db',
            fontSize: '1.125rem',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Discover trending items with competitive bidding
          </p>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {featuredAuctions.map((auction) => (
              <div key={auction.id} style={{
                backgroundColor: '#2c2c4a',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              >
                <div style={{ height: '200px', backgroundColor: '#374151', overflow: 'hidden' }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    
                    borderRadius: '8px',
                    background: `url(http://127.0.0.1:8000${auction.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0
                  }} />
                  {/* <img
                    src={auction.image}
                  
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  /> */}
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    {auction.title}
                  </h3>
                  <p style={{
                    color: '#d1d5db',
                    fontSize: '0.875rem',
                    marginBottom: '1rem'
                  }}>
                    {auction.description}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{ color: '#FFD700', fontSize: '1rem', fontWeight: 'bold' }}>
                        Current Bid: {auction.start_price}
                      </span>
                    </div>
                    <span style={{ color: '#FF6B6B', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      Ends in: {getTimeLeft(auction.auction_end || '')}

                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/product2/' + auction.id)}
                    style={{
                      backgroundColor: '#8A2BE2',
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                      width: '100%'
                    }}
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ 
        padding: '4rem 1rem',
        backgroundColor: '#2c2c4a'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#FFD700',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>How It Works</h2>
          <p style={{
            color: '#d1d5db',
            fontSize: '1.125rem',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Simple steps to start bidding and selling
          </p>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#8A2BE2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: 'white',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '1rem' }}>Register</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                Create your account as a buyer, seller, or auctioneer to get started.
              </p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#8A2BE2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: 'white',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '1rem' }}>Browse or List</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                Explore auctions or list your items for sale with detailed descriptions.
              </p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#8A2BE2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: 'white',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '1rem' }}>Bid & Win</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                Place bids on items you love and win auctions with competitive pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ position: 'relative', padding: '4rem 1rem', overflow: 'hidden' }}>
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 1
          }}
        >
          <source src="/wallpaper/10.mp4" type="video/mp4" />
        </video>
        {/* Overlay for readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(26,26,46,0.7)',
          zIndex: 1
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#FFD700',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>Popular Categories</h2>
          <p style={{
            color: '#d1d5db',
            fontSize: '1.125rem',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Find what you're looking for in our diverse categories
          </p>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {['Electronics', 'Fashion', 'Art & Collectibles', 'Home & Garden', 'Sports', 'Jewelry','Real Estate','Vehicles'].map((category) => (
              <div key={category} style={{
                backgroundColor: '#2c2c4a',
                borderRadius: '0.5rem',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a5a';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2c2c4a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              >
                <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>
                  {category}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section style={{ 
        padding: '4rem 1rem',
        backgroundColor: '#2c2c4a'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#FFD700',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>What Our Users Say</h2>
          <p style={{
            color: '#d1d5db',
            fontSize: '1.125rem',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Trusted by thousands of buyers, sellers, and auctioneers
          </p>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {feedbackData.map((feedback) => (
              <div key={feedback.id} style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '0.75rem',
                padding: '2rem',
                textAlign: 'center',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <p style={{
                  color: 'white',
                  fontSize: '1rem',
                  marginBottom: '1.5rem',
                  fontStyle: 'italic',
                  lineHeight: '1.6'
                }}>
                  "{feedback.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <img
                    src={feedback.avatar}
                    alt={feedback.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <p style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>{feedback.name}</p>
                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', margin: 0 }}>{feedback.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '4rem 1rem',
        backgroundColor: '#1a1a2e',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem'
          }}>Ready to Start?</h2>
          <p style={{
            color: '#d1d5db',
            fontSize: '1.125rem',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Join thousands of users who are already buying, selling, and auctioning on our platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/register"
              style={{
                backgroundColor: '#8A2BE2',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6A1EB2';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#8A2BE2';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Get Started
            </Link>
            <Link 
              href="/explore-auctions"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                textDecoration: 'none',
                border: '2px solid white',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#1a1a2e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Browse Auctions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
