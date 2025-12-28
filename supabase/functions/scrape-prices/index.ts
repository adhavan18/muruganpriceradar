import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHENNAI_PINCODE = '603103';

interface ScrapedPrice {
  price: number;
  mrp: number;
  available: boolean;
  productName?: string;
}

// Platform-specific search URLs with location
const getPlatformSearchUrl = (productName: string, platform: string): string => {
  const encodedName = encodeURIComponent(productName);
  
  switch (platform) {
    case 'blinkit':
      return `https://blinkit.com/s/?q=${encodedName}`;
    case 'zepto':
      return `https://www.zeptonow.com/search?query=${encodedName}`;
    case 'swiggy':
      return `https://www.swiggy.com/instamart/search?query=${encodedName}`;
    case 'amazon':
      return `https://www.amazon.in/s?k=${encodedName}&i=nowstore`;
    case 'flipkart':
      return `https://www.flipkart.com/search?q=${encodedName}&otracker=search&marketplace=GROCERY`;
    case 'bigbasket':
      return `https://www.bigbasket.com/ps/?q=${encodedName}`;
    case 'jiomart':
      return `https://www.jiomart.com/search/${encodedName}`;
    case 'dmart':
      return `https://www.dmartready.com/search/${encodedName}`;
    default:
      return '';
  }
};

// Extract price from scraped content using patterns
const extractPriceFromContent = (content: string, productName: string): ScrapedPrice | null => {
  try {
    // Multiple regex patterns to find prices
    const pricePatterns = [
      /₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g,
      /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gi,
      /INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gi,
      /"price":\s*(\d+(?:\.\d{2})?)/g,
      /"selling_price":\s*(\d+(?:\.\d{2})?)/g,
      /"offer_price":\s*(\d+(?:\.\d{2})?)/g,
    ];
    
    const mrpPatterns = [
      /M\.?R\.?P\.?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gi,
      /"mrp":\s*(\d+(?:\.\d{2})?)/g,
      /"original_price":\s*(\d+(?:\.\d{2})?)/g,
      /~~₹\s*(\d+(?:,\d+)*)/g,
    ];
    
    let prices: number[] = [];
    let mrps: number[] = [];
    
    // Extract all prices
    for (const pattern of pricePatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price > 0 && price < 100000) {
          prices.push(price);
        }
      }
    }
    
    // Extract MRPs
    for (const pattern of mrpPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const mrp = parseFloat(match[1].replace(/,/g, ''));
        if (mrp > 0 && mrp < 100000) {
          mrps.push(mrp);
        }
      }
    }
    
    if (prices.length === 0) {
      return null;
    }
    
    // Use the most common/median price
    prices.sort((a, b) => a - b);
    const price = prices[Math.floor(prices.length / 2)];
    
    // Use MRP if found, otherwise estimate
    mrps.sort((a, b) => a - b);
    const mrp = mrps.length > 0 ? mrps[Math.floor(mrps.length / 2)] : Math.ceil(price * 1.1);
    
    // Check availability
    const unavailablePatterns = [
      /out of stock/i,
      /currently unavailable/i,
      /not available/i,
      /sold out/i,
      /notify me/i,
    ];
    
    let available = true;
    for (const pattern of unavailablePatterns) {
      if (pattern.test(content)) {
        available = false;
        break;
      }
    }
    
    return {
      price,
      mrp: mrp >= price ? mrp : price,
      available,
    };
  } catch (error) {
    console.error('Error extracting price:', error);
    return null;
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, productName, platforms } = await req.json();
    
    if (!productName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Product name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const platformsToScrape = platforms || ['blinkit', 'zepto', 'swiggy', 'amazon', 'flipkart', 'bigbasket', 'jiomart', 'dmart'];
    const results: Record<string, ScrapedPrice | null> = {};
    
    console.log(`Scraping prices for "${productName}" in Chennai ${CHENNAI_PINCODE}`);

    // Scrape each platform
    for (const platform of platformsToScrape) {
      const searchUrl = getPlatformSearchUrl(productName, platform);
      if (!searchUrl) continue;
      
      console.log(`Scraping ${platform}: ${searchUrl}`);
      
      try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: searchUrl,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 3000,
            location: {
              country: 'IN',
              languages: ['en'],
            },
          }),
        });

        const data = await response.json();
        
        if (data.success && data.data?.markdown) {
          const extracted = extractPriceFromContent(data.data.markdown, productName);
          results[platform] = extracted;
          
          // Log scrape result
          await supabase.from('scrape_logs').insert({
            product_id: productId,
            platform_id: platform,
            status: extracted ? 'success' : 'no_price_found',
          });
          
          console.log(`${platform}: ${extracted ? `₹${extracted.price}` : 'No price found'}`);
        } else {
          console.log(`${platform}: Scrape failed - ${data.error || 'Unknown error'}`);
          
          await supabase.from('scrape_logs').insert({
            product_id: productId,
            platform_id: platform,
            status: 'failed',
            error_message: data.error || 'Unknown error',
          });
          
          results[platform] = null;
        }
      } catch (error) {
        console.error(`Error scraping ${platform}:`, error);
        results[platform] = null;
        
        await supabase.from('scrape_logs').insert({
          product_id: productId,
          platform_id: platform,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Update database with scraped prices
    if (productId) {
      for (const [platformId, priceData] of Object.entries(results)) {
        if (!priceData) continue;
        
        // Get previous price for calculating change
        const { data: existingPrice } = await supabase
          .from('price_data')
          .select('price')
          .eq('product_id', productId)
          .eq('platform_id', platformId)
          .maybeSingle();
        
        const priceChange = existingPrice 
          ? ((priceData.price - existingPrice.price) / existingPrice.price * 100)
          : 0;
        
        // Record price history if there was a previous price
        if (existingPrice) {
          await supabase.from('price_history').insert({
            product_id: productId,
            platform_id: platformId,
            price: existingPrice.price,
            mrp: priceData.mrp,
          });
        }
        
        // Upsert current price
        await supabase
          .from('price_data')
          .upsert({
            product_id: productId,
            platform_id: platformId,
            price: priceData.price,
            mrp: priceData.mrp,
            discount: Math.round((priceData.mrp - priceData.price) / priceData.mrp * 100),
            available: priceData.available,
            price_change: Math.round(priceChange * 10) / 10,
            location_pincode: CHENNAI_PINCODE,
            last_updated: new Date().toISOString(),
          }, {
            onConflict: 'product_id,platform_id',
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        location: CHENNAI_PINCODE,
        message: `Scraped ${Object.values(results).filter(r => r !== null).length} prices for Chennai ${CHENNAI_PINCODE}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-prices:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
