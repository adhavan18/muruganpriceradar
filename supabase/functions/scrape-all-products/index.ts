import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily price scrape for all products...');

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, brand, size');

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No products to scrape' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${products.length} products to scrape`);

    let successCount = 0;
    let errorCount = 0;

    // Scrape each product
    for (const product of products) {
      try {
        const productSearchName = `${product.brand} ${product.name} ${product.size}`;
        
        console.log(`Scraping: ${productSearchName}`);
        
        // Call the scrape-prices function
        const response = await fetch(`${supabaseUrl}/functions/v1/scrape-prices`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            productName: productSearchName,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Failed to scrape ${product.name}:`, result.error);
        }
        
        // Delay between products to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        errorCount++;
        console.error(`Error scraping ${product.name}:`, error);
      }
    }

    const summary = {
      success: true,
      totalProducts: products.length,
      successCount,
      errorCount,
      scrapedAt: new Date().toISOString(),
    };

    console.log('Daily scrape completed:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-all-products:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
