'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAuctioneers, auctionItemService, Auctioneer } from "@/api/services/products";

interface AuctionItem {
  id: number;
  title: string;
  description: string;
  category: string;
  start_price: number;
  approval_status: "pending" | "approved" | "rejected";
  image?: string;
  business_category?: string;
}

const CATEGORIES = [
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

export default function SellerEditPage() {
  const router = useRouter();
  const { id } = useParams(); // item id from URL
  const [auctioneers, setAuctioneers] = useState<Auctioneer[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    start_price: "",
    image: null as File | null,
    assigned_auctioneer: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load auctioneers
  useEffect(() => {
    const loadAuctioneers = async () => {
      const list = await fetchAuctioneers();
      setAuctioneers(list);
    };
    loadAuctioneers();
  }, []);

  // Load item details
  useEffect(() => {
    const loadItem = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token || !id) return;

        const item: AuctionItem = await auctionItemService.getAuctionItemDetail(Number(id), token);
        setForm({
          title: item.title,
          description: item.description,
          category: item.category,
          start_price: String(item.start_price),
          image: null, // keep null unless new file selected
          assigned_auctioneer: item.business_category || "",
        });
      } catch (err) {
        console.error("Failed to load item", err);
        setError("Failed to load item details");
      }
    };
    loadItem();
  }, [id]);

  // Handle form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  // Handle update submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("User not authenticated");

      await auctionItemService.updateSellerAuctionItem(
        Number(id),
        {
          title: form.title,
          description: form.description,
          category: form.category,
          start_price: Number(form.start_price),
          image: form.image || undefined,
          assigned_auctioneer: form.assigned_auctioneer ? Number(form.assigned_auctioneer) : undefined,
        },
        token
      );

      setSuccess("✅ Item updated successfully!");
      setTimeout(() => {
        router.push("/seller-new-product"); // go back after update
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #132a3a 0%, #1e3647 100%)',
        color: 'white',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Edit Auction Item</h1>
        </header>

        <form onSubmit={handleSubmit}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
        >
          {error && (
            <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.35)', color: '#fecaca', padding: '8px 10px', borderRadius: 10, marginBottom: 12, fontSize: 14 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.35)', color: '#d1fae5', padding: '8px 10px', borderRadius: 10, marginBottom: 12, fontSize: 14 }}>
              {success}
            </div>
          )}

          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label htmlFor="title" style={labelStyle}>Title</label>
              <input id="title" type="text" name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label htmlFor="description" style={labelStyle}>Description</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={5} required style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div>
              <label htmlFor="category" style={labelStyle}>Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange} required style={inputStyle}>
                <option value="">-- Select a category --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="start_price" style={labelStyle}>Start Price</label>
              <input id="start_price" type="number" name="start_price" value={form.start_price} onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label htmlFor="image" style={labelStyle}>Product Image (Upload new to replace)</label>
              <input id="image" type="file" name="image" accept="image/*" onChange={handleFileChange} style={{ ...inputStyle, padding: '10px 12px' }} />
            </div>

            <div>
              <label htmlFor="assigned_auctioneer" style={labelStyle}>Assign Auctioneer</label>
              <select id="assigned_auctioneer" name="assigned_auctioneer" value={form.assigned_auctioneer} onChange={handleChange} style={inputStyle} disabled={!form.category}>
                <option value="">-- Select Auctioneer --</option>
                {auctioneers
                  .filter((a) => a.business_category === form.category)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.username} ({a.business_category})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(147,197,253,1) 100%)',
              color: '#032320',
              fontWeight: 700,
              marginTop: 16,
            }}
          >
            {loading ? "Updating..." : "Update Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(255,255,255,0.08)',
  color: 'grey',
  padding: '10px 12px',
  outline: 'none',
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  marginBottom: 6,
  opacity: 0.9,
};
