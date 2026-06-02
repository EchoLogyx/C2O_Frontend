export type Tier = "Budget" | "Everyday" | "Premium" | "Retail" | "Designer";

export type QuoteStatus = "New" | "Contacted" | "Quoted" | "Won" | "Lost";

export interface Product {
  id: string;
  category: string;
  code: string;
  vendorProductId: string;
  name: string;
  brand: string;
  tier: Tier;
  price: number;
  availableWith: string[];
  nextDay: boolean;
  colours: string[];
  sizes: string[];
  gender: string;
  image: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  visible: boolean;
  featured: boolean;
  productCount: number;
  image: string;
  displayOrder: number;
}

export interface TierConfig {
  id: string;
  name: Tier;
  description: string;
  priceMin: number;
  priceMax: number;
  displayOrder: number;
  active: boolean;
  productIds: string[];
  colour: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  category: string;
  product: string;
  quantity: number;
  tier: Tier;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  featuredCategories: number;
  totalQuotes: number;
  newQuotes: number;
  wonQuotes: number;
}
