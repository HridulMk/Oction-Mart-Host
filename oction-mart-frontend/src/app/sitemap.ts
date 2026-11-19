import { MetadataRoute } from "next";
import { generateSitemap, PageInfo } from "../api/services/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "http://localhost:3000"; // change to your domain in production

  // List your pages manually (or generate dynamically)
  const pages: PageInfo[] = [
    {
      url: baseUrl + "/",
      lastModified: new Date().toISOString(),
      changefreq: "weekly",
      priority: 1.0,
    },
    {
      url: baseUrl + "/about",
      lastModified: new Date().toISOString(),
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: baseUrl + "/admin",
      lastModified: new Date().toISOString(),
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: baseUrl + "/admin-dashboard",
      lastModified: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.9,
    },
    {
      url: baseUrl + "/auctioneer-dashboard",
      lastModified: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.9,
    },
  ];

  // Generate the XML string (optional)
  const sitemapXml = generateSitemap(pages);

  // Next.js App Router automatically serves /sitemap.xml
  return pages;
}