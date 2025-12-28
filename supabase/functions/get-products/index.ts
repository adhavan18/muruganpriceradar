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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const url = new URL(req.url);
    const search = url.searchParams.get('search');
    const barcode = url.searchParams.get('barcode');
    const category = url.searchParams.get('category');

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
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Get platforms
    const { data: platforms } = await supabase
      .from('platforms')
      .select('*');

    return new Response(
      JSON.stringify({ 
        success: true, 
        products: products || [],
        platforms: platforms || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-products:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
