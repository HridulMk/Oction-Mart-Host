"use client";

const NewsletterForm = () => {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem'
    }}>
      <input
        type="email"
        placeholder="Enter your email"
        style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: '0.25rem',
          border: '1px solid #374151',
          backgroundColor: '#2c2c4a',
          color: 'white',
          fontSize: '0.875rem'
        }}
      />
      <button
        style={{
          backgroundColor: '#8A2BE2',
          color: 'white',
          fontWeight: 'bold',
          padding: '0.75rem 1rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6A1EB2'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8A2BE2'}
      >
        Subscribe
      </button>
    </div>
  );
};

export default NewsletterForm;