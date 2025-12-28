-- Create platforms table
CREATE TABLE public.platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  color TEXT NOT NULL,
  base_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  size TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_data table for current prices
CREATE TABLE public.price_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  mrp NUMERIC NOT NULL,
  discount NUMERIC NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  price_change NUMERIC DEFAULT 0,
  location_pincode TEXT DEFAULT '603103',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, platform_id)
);

-- Create price_history table for tracking price changes
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  mrp NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scrape_logs table
CREATE TABLE public.scrape_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  platform_id TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies for all tables
CREATE POLICY "Anyone can read platforms" ON public.platforms FOR SELECT USING (true);
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can read price_data" ON public.price_data FOR SELECT USING (true);
CREATE POLICY "Anyone can read price_history" ON public.price_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read scrape_logs" ON public.scrape_logs FOR SELECT USING (true);

-- Service role policies for backend operations
CREATE POLICY "Service role can insert platforms" ON public.platforms FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update platforms" ON public.platforms FOR UPDATE USING (true);
CREATE POLICY "Service role can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Service role can insert price_data" ON public.price_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update price_data" ON public.price_data FOR UPDATE USING (true);
CREATE POLICY "Service role can delete price_data" ON public.price_data FOR DELETE USING (true);
CREATE POLICY "Service role can insert price_history" ON public.price_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert scrape_logs" ON public.scrape_logs FOR INSERT WITH CHECK (true);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platforms
INSERT INTO public.platforms (id, name, logo, color, base_url) VALUES
  ('blinkit', 'Blinkit', '🟡', 'platform-blinkit', 'https://blinkit.com'),
  ('zepto', 'Zepto', '🟣', 'platform-zepto', 'https://www.zeptonow.com'),
  ('swiggy', 'Swiggy Instamart', '🟠', 'platform-swiggy', 'https://www.swiggy.com/instamart'),
  ('amazon', 'Amazon Fresh', '🔶', 'platform-amazon', 'https://www.amazon.in/fresh'),
  ('flipkart', 'Flipkart Groceries', '🔵', 'platform-flipkart', 'https://www.flipkart.com/grocery-supermart-store'),
  ('bigbasket', 'BigBasket', '🟢', 'platform-bigbasket', 'https://www.bigbasket.com'),
  ('jiomart', 'JioMart', '🔴', 'platform-jiomart', 'https://www.jiomart.com'),
  ('dmart', 'DMart Ready', '🟤', 'platform-dmart', 'https://www.dmartready.com');

-- Insert expanded product inventory (popular grocery items in India)
INSERT INTO public.products (barcode, name, brand, size, category, image) VALUES
  ('8901030865824', 'Tata Salt', 'Tata', '1 kg', 'Essentials', 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=200&h=200&fit=crop'),
  ('8901058002003', 'Aashirvaad Atta', 'Aashirvaad', '5 kg', 'Flour & Grains', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop'),
  ('8901725181109', 'Fortune Sunflower Oil', 'Fortune', '1 L', 'Cooking Oil', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop'),
  ('8901063090019', 'Amul Butter', 'Amul', '500 g', 'Dairy', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop'),
  ('8901719100505', 'Maggi Noodles', 'Maggi', '420 g (Pack of 6)', 'Instant Food', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop'),
  ('8901030758003', 'Tata Tea Gold', 'Tata', '500 g', 'Beverages', 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop'),
  ('8901030740275', 'Tata Sampann Chana Dal', 'Tata', '1 kg', 'Pulses & Lentils', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop'),
  ('8901262150019', 'Parle-G Biscuits', 'Parle', '800 g', 'Snacks & Biscuits', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop'),
  ('8901491101028', 'Surf Excel Matic', 'Surf Excel', '2 kg', 'Household', 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=200&h=200&fit=crop'),
  ('8901396107279', 'Saffola Gold Oil', 'Saffola', '1 L', 'Cooking Oil', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop'),
  ('8901063010932', 'Amul Milk', 'Amul', '1 L', 'Dairy', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop'),
  ('8901072000018', 'Britannia Good Day', 'Britannia', '600 g', 'Snacks & Biscuits', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop'),
  ('8901088719926', 'India Gate Basmati Rice', 'India Gate', '5 kg', 'Rice', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop'),
  ('8901063090026', 'Amul Cheese Slices', 'Amul', '200 g', 'Dairy', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop'),
  ('8901491502016', 'Vim Dishwash Gel', 'Vim', '750 ml', 'Household', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200&h=200&fit=crop'),
  ('8901725121563', 'Fortune Rice Bran Oil', 'Fortune', '1 L', 'Cooking Oil', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop'),
  ('8901719100147', 'Nescafe Classic Coffee', 'Nescafe', '200 g', 'Beverages', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop'),
  ('8901030791741', 'Tata Sampann Turmeric', 'Tata', '100 g', 'Spices', 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200&h=200&fit=crop'),
  ('8901030830631', 'Tata Sampann Coriander Powder', 'Tata', '100 g', 'Spices', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=200&fit=crop'),
  ('8906002560011', 'Haldiram Bhujia', 'Haldiram', '400 g', 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop'),
  ('8904187000018', 'MTR Ready To Eat Pulao', 'MTR', '300 g', 'Instant Food', 'https://images.unsplash.com/photo-1596097635121-14b63a7e0c71?w=200&h=200&fit=crop'),
  ('8901725133931', 'Fortune Soya Chunks', 'Fortune', '1 kg', 'Protein', 'https://images.unsplash.com/photo-1614961908567-a3c2e7e89b06?w=200&h=200&fit=crop'),
  ('8901030797279', 'Tata Sampann Moong Dal', 'Tata', '1 kg', 'Pulses & Lentils', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop'),
  ('8901063010901', 'Amul Taaza Milk', 'Amul', '500 ml', 'Dairy', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop'),
  ('8901491502047', 'Harpic Power Plus', 'Harpic', '1 L', 'Household', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200&h=200&fit=crop');