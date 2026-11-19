// app/explore-auctions/page.tsx
// This is a Server Component by default in Next.js App Router, meaning it runs on the server.
// It can directly fetch data.

// Header and Footer are now handled by app/layout.tsx, so no need to import them here.
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';

import AuctionCard from '@/components/AuctionCard'; // Adjust path if your structure is different

// This function simulates fetching auction data.
// In a real app, this would make an API call to your Django backend.
async function getAuctions() {
  // --- IMPORTANT: This is MOCK DATA for now! ---
  // When your Django backend API is ready, you'll replace this
  // with a real fetch call like:
  // const res = await fetch('http://localhost:8000/api/auctions/', { cache: 'no-store' });
  // if (!res.ok) {
  //   throw new Error('Failed to fetch auctions');
  // }
  // return res.json();

  return [
    {
      id: '1',
      title: 'Designer Quilted Bag',
      description: 'Premium quilted crossbody bag with chain strap.',
      currentBid: '2,100',
      timeLeft: '03h 12m 45s',
      imageUrl: '/product1.jpg', // Replace with actual image in public/
    },
    {
      id: '2',
      title: 'Roadster Sneakers',
      description: 'Trendy beige sneakers, size 10, brand new.',
      currentBid: '1,350',
      timeLeft: '12h 05m 10s',
      imageUrl: '/product2.jpg', // Replace with actual image in public/
    },
    {
      id: '3',
      title: 'Modern TV Console',
      description: 'Elegant wooden TV unit, fits up to 65" TVs.',
      currentBid: '3,800',
      timeLeft: '1d 02h 20m',
      imageUrl: '/product3.jpg', // Replace with actual image in public/
    },
    {
      id: '4',
      title: '1960s Fender Stratocaster',
      description: 'Classic electric guitar, excellent condition.',
      currentBid: '4,200',
      timeLeft: '2d 08h 10m',
      imageUrl: 'https://placehold.co/400x250/374151/d1d5db?text=Vintage+Guitar', // Updated placeholder color
    },
  ];
}

// This is your main page component. It's an 'async' function because it fetches data.
export default async function ExploreAuctionsPage() {
  const auctions = await getAuctions(); // Call the async function to get auction data

  return (
    // The main div no longer needs min-h-screen, flex, flex-col, or bg-dark-gradient
    // as these are now handled by app/layout.tsx and app/globals.css
    <>
      {/* Main content area is wrapped by <main> in layout.tsx */}
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">Available Auctions</h1>

        {/* Search and Filter Section (simplified for example) */}
        <div className="flex flex-col md:flex-row flex-wrap justify-center items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Search auctions..."
            className="bg-dark-text text-light-gray rounded-full py-2 px-4 focus:ring-purple-accent focus:border-purple-accent flex-grow max-w-sm md:max-w-xs"
          />
          <select className="bg-dark-text text-light-gray rounded-full py-2 px-4 focus:ring-purple-accent focus:border-purple-accent md:w-auto w-full">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="art">Art</option>
          </select>
          <button className="bg-purple-accent hover:bg-purple-darker text-white font-bold py-2 px-5 rounded-full text-sm transition duration-300 w-full md:w-auto">
            Apply Filters
          </button>
        </div>

        {/* Auction Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} item={auction} />
          ))}
        </div>
      </div>
    </>
  );
}
