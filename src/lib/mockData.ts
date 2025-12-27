// Mock data for PriceRadar demo

export interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export interface PriceData {
  platformId: string;
  price: number;
  mrp: number;
  discount: number;
  available: boolean;
  lastUpdated: Date;
  priceChange?: number; // percentage change from last cached price
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  size: string;
  category: string;
  image: string;
  prices: PriceData[];
}

export const platforms: Platform[] = [
  {
    id: "blinkit",
    name: "Blinkit",
    logo: "🟡",
    color: "platform-blinkit",
  },
  {
    id: "zepto",
    name: "Zepto",
    logo: "🟣",
    color: "platform-zepto",
  },
  {
    id: "swiggy",
    name: "Swiggy Instamart",
    logo: "🟠",
    color: "platform-swiggy",
  },
  {
    id: "amazon",
    name: "Amazon Fresh",
    logo: "🔶",
    color: "platform-amazon",
  },
  {
    id: "flipkart",
    name: "Flipkart Groceries",
    logo: "🔵",
    color: "platform-flipkart",
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    barcode: "8901030865824",
    name: "Tata Salt",
    brand: "Tata",
    size: "1 kg",
    category: "Essentials",
    image: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=200&h=200&fit=crop",
    prices: [
      { platformId: "blinkit", price: 28, mrp: 30, discount: 7, available: true, lastUpdated: new Date(), priceChange: -2 },
      { platformId: "zepto", price: 27, mrp: 30, discount: 10, available: true, lastUpdated: new Date(), priceChange: 0 },
      { platformId: "swiggy", price: 29, mrp: 30, discount: 3, available: true, lastUpdated: new Date(), priceChange: 1 },
      { platformId: "amazon", price: 26, mrp: 30, discount: 13, available: true, lastUpdated: new Date(), priceChange: -3 },
      { platformId: "flipkart", price: 28, mrp: 30, discount: 7, available: false, lastUpdated: new Date() },
    ],
  },
  {
    id: "2",
    barcode: "8901058002003",
    name: "Aashirvaad Atta",
    brand: "Aashirvaad",
    size: "5 kg",
    category: "Flour & Grains",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop",
    prices: [
      { platformId: "blinkit", price: 295, mrp: 320, discount: 8, available: true, lastUpdated: new Date(), priceChange: -5 },
      { platformId: "zepto", price: 299, mrp: 320, discount: 7, available: true, lastUpdated: new Date() },
      { platformId: "swiggy", price: 289, mrp: 320, discount: 10, available: true, lastUpdated: new Date(), priceChange: -8 },
      { platformId: "amazon", price: 285, mrp: 320, discount: 11, available: true, lastUpdated: new Date(), priceChange: -3 },
      { platformId: "flipkart", price: 292, mrp: 320, discount: 9, available: true, lastUpdated: new Date() },
    ],
  },
  {
    id: "3",
    barcode: "8901725181109",
    name: "Fortune Sunflower Oil",
    brand: "Fortune",
    size: "1 L",
    category: "Cooking Oil",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop",
    prices: [
      { platformId: "blinkit", price: 155, mrp: 175, discount: 11, available: true, lastUpdated: new Date() },
      { platformId: "zepto", price: 149, mrp: 175, discount: 15, available: true, lastUpdated: new Date(), priceChange: -4 },
      { platformId: "swiggy", price: 159, mrp: 175, discount: 9, available: false, lastUpdated: new Date() },
      { platformId: "amazon", price: 152, mrp: 175, discount: 13, available: true, lastUpdated: new Date(), priceChange: 2 },
      { platformId: "flipkart", price: 148, mrp: 175, discount: 15, available: true, lastUpdated: new Date(), priceChange: -6 },
    ],
  },
  {
    id: "4",
    barcode: "8901063090019",
    name: "Amul Butter",
    brand: "Amul",
    size: "500 g",
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop",
    prices: [
      { platformId: "blinkit", price: 280, mrp: 295, discount: 5, available: true, lastUpdated: new Date(), priceChange: -2 },
      { platformId: "zepto", price: 275, mrp: 295, discount: 7, available: true, lastUpdated: new Date() },
      { platformId: "swiggy", price: 285, mrp: 295, discount: 3, available: true, lastUpdated: new Date() },
      { platformId: "amazon", price: 270, mrp: 295, discount: 8, available: true, lastUpdated: new Date(), priceChange: -5 },
      { platformId: "flipkart", price: 278, mrp: 295, discount: 6, available: true, lastUpdated: new Date() },
    ],
  },
  {
    id: "5",
    barcode: "8901719100505",
    name: "Maggi Noodles",
    brand: "Maggi",
    size: "420 g (Pack of 6)",
    category: "Instant Food",
    image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop",
    prices: [
      { platformId: "blinkit", price: 126, mrp: 144, discount: 13, available: true, lastUpdated: new Date() },
      { platformId: "zepto", price: 129, mrp: 144, discount: 10, available: true, lastUpdated: new Date(), priceChange: 3 },
      { platformId: "swiggy", price: 124, mrp: 144, discount: 14, available: true, lastUpdated: new Date(), priceChange: -2 },
      { platformId: "amazon", price: 122, mrp: 144, discount: 15, available: true, lastUpdated: new Date(), priceChange: -4 },
      { platformId: "flipkart", price: 125, mrp: 144, discount: 13, available: true, lastUpdated: new Date() },
    ],
  },
  {
    id: "6",
    barcode: "8901030758003",
    name: "Tata Tea Gold",
    brand: "Tata",
    size: "500 g",
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop",
    prices: [
      { platformId: "blinkit", price: 285, mrp: 310, discount: 8, available: true, lastUpdated: new Date(), priceChange: -3 },
      { platformId: "zepto", price: 279, mrp: 310, discount: 10, available: true, lastUpdated: new Date() },
      { platformId: "swiggy", price: 289, mrp: 310, discount: 7, available: false, lastUpdated: new Date() },
      { platformId: "amazon", price: 275, mrp: 310, discount: 11, available: true, lastUpdated: new Date(), priceChange: -5 },
      { platformId: "flipkart", price: 282, mrp: 310, discount: 9, available: true, lastUpdated: new Date() },
    ],
  },
];

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery) ||
      p.barcode.includes(query) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
};

export const getProductByBarcode = (barcode: string): Product | undefined => {
  return mockProducts.find((p) => p.barcode === barcode);
};

export const getCheapestPrice = (product: Product): PriceData | undefined => {
  const available = product.prices.filter((p) => p.available);
  if (available.length === 0) return undefined;
  return available.reduce((min, p) => (p.price < min.price ? p : min));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
