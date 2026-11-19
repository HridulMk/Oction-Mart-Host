"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the NewsletterForm component, disabling SSR
const NewsletterForm = dynamic(() => import('./NewsletterForm'), { ssr: false });

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#1a1a2e',
      color: '#d1d5db',
      padding: '3rem 1rem 2rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Oction Mart
            </h3>
            <p style={{
              color: '#d1d5db',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              The premier online auction platform connecting buyers, sellers, and auctioneers worldwide.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <a href="#" style={{
                color: '#8A2BE2',
                fontSize: '1.5rem',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#6A1EB2'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#8A2BE2'}>
                📘
              </a>
              <a href="#" style={{
                color: '#8A2BE2',
                fontSize: '1.5rem',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#6A1EB2'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#8A2BE2'}>
                🐦
              </a>
              <a href="#" style={{
                color: '#8A2BE2',
                fontSize: '1.5rem',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#6A1EB2'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#8A2BE2'}>
                📷
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Quick Links
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/explore-auctions" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Explore Auctions
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/sell" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Sell with Us
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/categories" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Categories
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/about" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Support
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/help" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Help Center
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/contact" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Contact Us
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/faq" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  FAQ
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/chat" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Live Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 style={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Stay Updated
            </h4>
            <p style={{
              color: '#d1d5db',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              Get notified about new auctions and exclusive deals.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Link href="/privacy" style={{
              color: '#d1d5db',
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{
              color: '#d1d5db',
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
              Terms of Service
            </Link>
            <Link href="/cookies" style={{
              color: '#d1d5db',
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
              Cookie Policy
            </Link>
            <Link href="/visual-sitemap" style={{
              color: '#d1d5db',
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
              Sitemap
            </Link>
          </div>
          <div style={{
            color: '#d1d5db',
            fontSize: '0.875rem'
          }}>
            © 2025 Oction Mart. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;