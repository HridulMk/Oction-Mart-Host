'use client';

import React, { useEffect, useState } from 'react';
import { fetchAuctioneers, auctionItemService, Auctioneer } from "@/api/services/products";
import { useRouter } from "next/navigation";

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

// Define the categories to match the Django model
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

export default function SellerNewProductPage() {
  const [auctioneers, setAuctioneers] = useState<Auctioneer[]>([]);
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    start_price: "",
    image: null as File | null,
    assigned_auctioneer: "",
  });

  const router = useRouter();

  // Fetch auctioneers
  useEffect(() => {
    const loadAuctioneers = async () => {
      const list = await fetchAuctioneers();
      setAuctioneers(list);
    };
    loadAuctioneers();
  }, []);

  // Fetch submitted items
  const loadItems = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await auctionItemService.getMyItems(token);
      setItems(res);
    } catch (err) {
      console.error("Failed to load seller items", err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("User not authenticated");

      await auctionItemService.createAuctionItem(
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

      setSuccess("✅ Product submitted for auctioneer review!");
      setForm({
        title: "",
        description: "",
        category: "",
        start_price: "",
        image: null,
        assigned_auctioneer: "",
      });

      await loadItems(); // refresh list
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to submit product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await auctionItemService.deleteAuctionItem(id, token);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color:'white' }}>Seller – Auction Items</h1>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              fontSize: 12,
            }}
          >
            Submit items for auctioneer review
          </span>
        </header>
        
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {/* Create Item Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: 700 }}>New Auction Item</h2>
            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,.15)',
                  border: '1px solid rgba(239,68,68,.35)',
                  color: '#fecaca',
                  padding: '8px 10px',
                  borderRadius: 10,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                style={{
                  background: 'rgba(16,185,129,.15)',
                  border: '1px solid rgba(16,185,129,.35)',
                  color: '#d1fae5',
                  padding: '8px 10px',
                  borderRadius: 10,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              >
                {success}
              </div>
            )}
            <div style={{ display: 'grid', gap: 12 }}>
              {/* Title */}
              <div>
                <label htmlFor="title" style={labelStyle}>Title</label>
                <input id="title" type="text" name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" style={labelStyle}>Description</label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={5} required style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" style={labelStyle}>Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange} required style={inputStyle}>
                  <option value="">-- Select a category --</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Starting Price */}
              <div>
                <label htmlFor="start_price" style={labelStyle}>Start Price</label>
                <input id="start_price" type="number" name="start_price" value={form.start_price} onChange={handleChange} required style={inputStyle} />
              </div>

              {/* Image */}
              <div>
                <label htmlFor="image" style={labelStyle}>Product Image</label>
                <input id="image" type="file" name="image" accept="image/*" onChange={handleFileChange} style={{ ...inputStyle, padding: '10px 12px' }} />
              </div>

              {/* Auctioneer */}
<div>
  <label htmlFor="assigned_auctioneer" style={labelStyle}>
    Assign Auctioneer
  </label>
  <select
    id="assigned_auctioneer"
    name="assigned_auctioneer"
    value={form.assigned_auctioneer}
    onChange={handleChange}
    style={inputStyle}
    disabled={!form.category} // disable if no category selected
  >
    <option value="">-- Select Auctioneer --</option>
    {auctioneers
      .filter((a) => a.business_category === form.category) // ✅ filter by category
      .map((a) => (
        <option key={a.id} value={a.id}>
          {a.username} ({a.business_category})
        </option>
      ))}
  </select>
</div>

            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(90deg, rgba(16,185,129,1) 0%, rgba(52,211,153,1) 100%)',
                color: '#032320',
                fontWeight: 700,
                marginTop: 16,
              }}
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </button>
          </form>

          {/* Submitted Items List */}
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              padding: 20,
              minHeight: 708,
              maxHeight: 600,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>My Submitted Items</h2>
            </div>
            {items.length === 0 ? (
              <div style={{ opacity: 0.8 }}>No items yet. Create your first listing!</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                {items.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      display: 'grid',
                      gap: 12,
                      gridTemplateColumns: '1fr',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ fontSize: 16 }}>{item.title}</strong>
                        <StatusPill status={item.approval_status} />
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                        Start price: <b>₹{Number(item.start_price).toFixed(2)}</b>
                      </div>
                      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>{item.description}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: 10 }}>
                      <button style={{ ...actionButtonStyle, background: "#f97316" }} onClick={() => router.push(`/seller-edit/${item.id}`)}>Edit</button>
                      <button style={{ ...actionButtonStyle, background: "#ef4444" }} onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
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

const actionButtonStyle: React.CSSProperties = {
  padding: '6px 10px',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 'bold',
  flex: 1,
};

function StatusPill({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const map: Record<typeof status, { label: string; bg: string; text: string; border: string }> = {
    pending: {
      label: 'Pending',
      bg: 'rgba(251,191,36,.18)',
      text: '#fcd34d',
      border: 'rgba(251,191,36,.45)',
    },
    approved: {
      label: 'Approved',
      bg: 'rgba(16,185,129,.18)',
      text: '#34d399',
      border: 'rgba(16,185,129,.45)',
    },
    rejected: {
      label: 'Rejected',
      bg: 'rgba(239,68,68,.18)',
      text: '#f87171',
      border: 'rgba(239,68,68,.45)',
    },
  };

  const defaultStatus = {
    label: 'Unknown',
    bg: 'rgba(100, 100, 100, .18)',
    text: '#ccc',
    border: 'rgba(100, 100, 100, .45)',
  };

  // Check if status is in the map, otherwise use the default
  const s = map[status] || defaultStatus;

  return (
    <span
      style={{
        fontSize: 11,
        padding: '4px 8px',
        borderRadius: 999,
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        fontWeight: 700,
        letterSpacing: 0.2,
      }}
    >
      {s.label}
    </span>
  );
}