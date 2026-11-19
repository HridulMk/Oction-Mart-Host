
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const ITEM_CATEGORY_CHOICES = [
  { value: 'art', label: 'Art & Paintings' },
  { value: 'antiques', label: 'Antiques & Collectibles' },
  { value: 'jewelry', label: 'Jewelry & Watches' },
  { value: 'furniture', label: 'Furniture & Home Décor' },
  { value: 'electronics', label: 'Electronics & Gadgets' },
  { value: 'vehicles', label: 'Vehicles (Cars, Bikes, etc.)' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'fashion', label: 'Fashion & Accessories' },
  { value: 'books', label: 'Books & Manuscripts' },
  { value: 'sports', label: 'Sports & Memorabilia' },
  { value: 'coins', label: 'Coins & Stamps' },
  { value: 'industrial', label: 'Industrial & Machinery' },
  { value: 'other', label: 'Other' },
];

export default function CategoriesPage() {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    // Navigate to category-specific auction listing page
    router.push(`/auctions/category/${category}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">Auction Categories</h1> 

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ITEM_CATEGORY_CHOICES.map((cat) => (
          <Card
            key={cat.value}
            className="cursor-pointer hover:shadow-xl transition-shadow duration-300"
            onClick={() => handleCategoryClick(cat.value)}
          >
            <CardContent className="text-center py-8">
              <h2 className="text-lg font-semibold">{cat.label}</h2>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
