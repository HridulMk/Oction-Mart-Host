// src/app/seller/products/new/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { fetchAuctioneers, auctionItemService, Auctioneer, AuctionItem } from "@/api/services/products";
import { useRouter } from "next/navigation";

interface AuctionItem {
  id: number;
  title: string;
  description: string;
  category: string;
  start_price: number;
  approval_status: "pending" | "approved" | "rejected";
  image?: string;
}

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
      const token = localStorage.getItem("authToken");
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
      const token = localStorage.getItem("authToken");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "orange"; // pending
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px", background: "DarkSlateGray", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "16px" }}>List New Product</h1>

      {error && <div style={{ marginBottom: "10px", color: "red" }}>{error}</div>}
      {success && <div style={{ marginBottom: "10px", color: "green" }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Title */}
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required style={{ color: "black", width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} required style={{ color: "black", width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        </div>

        {/* Category */}
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Category</label>
          <input type="text" name="category" value={form.category} onChange={handleChange} required style={{ color: "black", width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        </div>

        {/* Starting Price */}
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Starting Price</label>
          <input type="number" name="start_price" value={form.start_price} onChange={handleChange} required style={{ color: "black", width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        </div>

        {/* Image */}
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Product Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* Auctioneer */}
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Assign Auctioneer</label>
          <select name="assigned_auctioneer" value={form.assigned_auctioneer} onChange={handleChange} style={{ color: "black", width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
            <option value="">-- Select Auctioneer --</option>
            {auctioneers.map((a) => (
              <option key={a.id} value={a.id}>
                {a.username}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} style={{ padding: "10px", background: "#2563eb", color: "white", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
          {loading ? "Submitting..." : "Submit for Review"}
        </button>
      </form>

      {/* Submitted Items */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginTop: "30px", marginBottom: "12px" }}>My Submitted Items</h2>
      <div style={{ display: "grid", gap: "12px" }}>
        {items.map((item) => (
          <div key={item.id} style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600" }}>{item.title}</h3>
              <p style={{ fontSize: "14px", color: "#555" }}>{item.description}</p>
              <p style={{ fontSize: "14px", fontWeight: "500" }}>₹{item.start_price}</p>
              <span
  style={{
    fontWeight: "bold",
    color: getStatusColor(item.approval_status),
  }}
>
  {item.approval_status ? item.approval_status.toUpperCase() : "N/A"}
</span>

            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ padding: "6px 10px", background: "orange", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }} onClick={() => router.push(`/seller/products/edit/${item.id}`)}>Edit</button>
              <button style={{ padding: "6px 10px", background: "red", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }} onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const getStatusColor = (status?: string) => {
  switch (status) {
    case "approved":
      return "green";
    case "pending":
      return "orange";
    case "rejected":
      return "red";
    default:
      return "gray";
  }
};
