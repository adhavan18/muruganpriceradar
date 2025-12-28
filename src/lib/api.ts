import { supabase } from '@/integrations/supabase/client';

export interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
  base_url?: string;
}

export interface PriceData {
  platformId: string;
  price: number;
  mrp: number;
  discount: number;
  available: boolean;
  lastUpdated: Date;
  priceChange?: number;
  locationPincode?: string;
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

interface DBProduct {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  size: string;
  category: string;
  image: string | null;
  price_data: Array<{
    platform_id: string;
    price: number;
    mrp: number;
    discount: number;
    available: boolean;
    price_change: number | null;
    location_pincode: string | null;
    last_updated: string;
  }>;
}

interface DBPlatform {
  id: string;
  name: string;
  logo: string;
  color: string;
  base_url: string | null;
}

let cachedPlatforms: Platform[] | null = null;

export const priceApi = {
  async getProducts(search?: string, barcode?: string, category?: string): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (barcode) params.set('barcode', barcode);
      if (category) params.set('category', category);

      const { data, error } = await supabase.functions.invoke('get-products', {
        body: null,
        method: 'GET',
      });

      // If edge function is not available, try direct query
      if (error) {
        console.log('Edge function not available, using direct query');
        return this.getProductsDirect(search, barcode, category);
      }

      if (!data?.success || !data?.products) {
        return this.getProductsDirect(search, barcode, category);
      }

      cachedPlatforms = (data.platforms as DBPlatform[])?.map((p: DBPlatform) => ({
        id: p.id,
        name: p.name,
        logo: p.logo,
        color: p.color,
        base_url: p.base_url || undefined,
      })) || null;

      return this.transformProducts(data.products as DBProduct[]);
    } catch (err) {
      console.error('Error fetching products:', err);
      return this.getProductsDirect(search, barcode, category);
    }
  },

  async getProductsDirect(search?: string, barcode?: string, category?: string): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        price_data (
          platform_id,
          price,
          mrp,
          discount,
          available,
          price_change,
          location_pincode,
          last_updated
        )
      `);

    if (barcode) {
      query = query.eq('barcode', barcode);
    } else if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,barcode.ilike.%${search}%,category.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query.order('name');

    if (error) {
      console.error('Error fetching products directly:', error);
      return [];
    }

    return this.transformProducts(products as unknown as DBProduct[]);
  },

  transformProducts(dbProducts: DBProduct[]): Product[] {
    return dbProducts.map(p => ({
      id: p.id,
      barcode: p.barcode,
      name: p.name,
      brand: p.brand,
      size: p.size,
      category: p.category,
      image: p.image || 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=200&h=200&fit=crop',
      prices: (p.price_data || []).map(pd => ({
        platformId: pd.platform_id,
        price: Number(pd.price),
        mrp: Number(pd.mrp),
        discount: Number(pd.discount),
        available: pd.available,
        priceChange: pd.price_change ? Number(pd.price_change) : undefined,
        lastUpdated: new Date(pd.last_updated),
        locationPincode: pd.location_pincode || undefined,
      })),
    }));
  },

  async getPlatforms(): Promise<Platform[]> {
    if (cachedPlatforms) return cachedPlatforms;

    const { data, error } = await supabase
      .from('platforms')
      .select('*');

    if (error) {
      console.error('Error fetching platforms:', error);
      return [];
    }

    cachedPlatforms = (data as DBPlatform[]).map(p => ({
      id: p.id,
      name: p.name,
      logo: p.logo,
      color: p.color,
      base_url: p.base_url || undefined,
    }));

    return cachedPlatforms;
  },

  async scrapeProductPrices(productId: string, productName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-prices', {
        body: { productId, productName },
      });

      if (error) {
        console.error('Scrape error:', error);
        return false;
      }

      return data?.success || false;
    } catch (err) {
      console.error('Error scraping prices:', err);
      return false;
    }
  },

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    const products = await this.getProducts(undefined, barcode);
    return products.length > 0 ? products[0] : null;
  },

  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts(query);
  },
};

export const getCheapestPrice = (product: Product): PriceData | undefined => {
  const available = product.prices.filter(p => p.available);
  if (available.length === 0) return undefined;
  return available.reduce((min, p) => (p.price < min.price ? p : min));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
