import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

// Margin calculator function (embedded since we can't import from src)
interface MarginCalculatorInput {
  price: number;
  cogs: number;
  platform: 'amazon' | 'tiktok' | 'shopify' | 'etsy';
  weight_oz: number;
  shipping_method: 'calculated' | 'flat';
  flat_shipping_cost?: number;
  packaging_cost?: number;
  return_rate?: number;
  recovery_rate?: number;
  ad_spend: {
    conversion_rate: number;
    cpc: number;
  };
  image_path?: string;
  product_url?: string;
  product_name?: string;
}

function compute(input: MarginCalculatorInput) {
  // Default values
  const packaging_cost = input.packaging_cost ?? 0.50;
  const return_rate = input.return_rate ?? 0.05;
  const recovery_rate = input.recovery_rate ?? 0;

  // Platform fees
  const platformFeeRates = {
    amazon: 0.15,
    tiktok: 0.08,
    etsy: 0.065,
    shopify: 0.0
  };
  
  const platform_fees = input.price * platformFeeRates[input.platform];

  // Payment processing: 2.9% + $0.30
  const processing_fees = input.price * 0.029 + 0.30;

  // Shipping costs based on weight tiers
  let shipping_cost: number;
  if (input.shipping_method === 'flat' && input.flat_shipping_cost) {
    shipping_cost = input.flat_shipping_cost;
  } else {
    if (input.weight_oz <= 4) {
      shipping_cost = 4.50;
    } else if (input.weight_oz <= 8) {
      shipping_cost = 5.50;
    } else if (input.weight_oz <= 16) {
      shipping_cost = 6.50;
    } else {
      shipping_cost = 9.50;
    }
  }

  // Returns allowance
  const returns_cost = return_rate * (input.cogs + shipping_cost) * (1 - recovery_rate);

  // Ad spend per order
  const ad_spend_per_order = input.ad_spend.cpc / input.ad_spend.conversion_rate;

  // Total costs
  const total_product_cost = input.cogs + packaging_cost;
  const total_costs = total_product_cost + shipping_cost + platform_fees + processing_fees + returns_cost + ad_spend_per_order;

  // Profit and margin
  const profit = input.price - total_costs;
  const margin_percent = (profit / input.price) * 100;

  // Breakeven calculations
  const breakeven_price = total_costs;
  const roas = input.price / ad_spend_per_order;
  const target_cpc = input.ad_spend.conversion_rate * profit * 0.3;

  // Generate improvement levers
  const levers = [
    {
      category: 'Sourcing',
      impact: 'High',
      suggestion: 'Negotiate with suppliers or find alternative sourcing to reduce COGS by 10-15%',
      potential_savings: total_product_cost * 0.125
    },
    {
      category: 'Marketing',
      impact: 'High', 
      suggestion: `Improve conversion rate from ${(input.ad_spend.conversion_rate * 100).toFixed(1)}% to reduce cost per acquisition`,
      potential_savings: ad_spend_per_order * 0.3
    },
    {
      category: 'Pricing',
      impact: 'Medium',
      suggestion: `Increase price by 10-15% to improve margin from ${margin_percent.toFixed(1)}% to 25%+`,
      potential_savings: input.price * 0.125
    }
  ];

  // Determine verdict
  let verdict: 'GO' | 'CAUTION' | 'NO-GO';
  let reasoning: string;
  let confidence: number;

  if (margin_percent >= 25) {
    verdict = 'GO';
    reasoning = `Strong margin of ${margin_percent.toFixed(1)}% provides good profitability and room for scaling.`;
    confidence = 85;
  } else if (margin_percent >= 15) {
    verdict = 'CAUTION';
    reasoning = `Moderate margin of ${margin_percent.toFixed(1)}%. Consider optimizing costs before scaling.`;
    confidence = 70;
  } else if (margin_percent >= 5) {
    verdict = 'CAUTION';
    reasoning = `Thin margin of ${margin_percent.toFixed(1)}%. High risk - optimize costs or increase price.`;
    confidence = 50;
  } else {
    verdict = 'NO-GO';
    reasoning = `Negative or very low margin (${margin_percent.toFixed(1)}%). Not viable without significant changes.`;
    confidence = 90;
  }

  return {
    id: `analysis-${Date.now()}`,
    product: {
      name: input.product_name || 'Product Analysis',
      image: input.image_path || '/placeholder.svg',
      description: 'Unit economics analysis',
      supplier_price: input.cogs,
      category: 'General'
    },
    margins: {
      conservative: Math.max(margin_percent - 5, 0),
      moderate: margin_percent,
      aggressive: margin_percent + 3
    },
    costs: {
      product_cost: total_product_cost,
      shipping: shipping_cost,
      platform_fees,
      ad_spend: ad_spend_per_order,
      returns: returns_cost,
      processing: processing_fees
    },
    competitors: [],
    market: {
      saturation: 60,
      trend_score: 75,
      seasonality: 'Stable'
    },
    bundles: [],
    recommendation: {
      verdict,
      reasoning,
      confidence
    },
    levers,
    breakeven_price,
    roas,
    target_cpc
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for authenticated requests
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from Authorization header (optional for anonymous analysis)
    const authHeader = req.headers.get('Authorization');
    let user = null;

    if (authHeader) {
      // Verify JWT token if provided
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && authUser) {
        user = authUser;
      }
    }

    // Parse request body
    const body = await req.json();
    console.log('Received request body:', body);

    // Get user's organization if authenticated
    let membership = null;
    if (user) {
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      if (membershipError) {
        console.error('Membership error:', membershipError);
        return new Response(
          JSON.stringify({ error: 'User organization not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      membership = membershipData;
    }

    // Validate required fields and set defaults
    const analysisInput: MarginCalculatorInput = {
      price: body.price || 29.99,
      cogs: body.cogs || 8.00,
      platform: body.platform || 'amazon',
      weight_oz: body.weight_oz || 8,
      shipping_method: body.shipping_method || 'calculated',
      flat_shipping_cost: body.flat_shipping_cost,
      packaging_cost: body.packaging_cost || 0.50,
      return_rate: body.return_rate || 0.05,
      recovery_rate: body.recovery_rate || 0,
      ad_spend: {
        conversion_rate: body.conversion_rate || 0.02,
        cpc: body.cpc || 1.50
      },
      image_path: body.image_path,
      product_url: body.product_url,
      product_name: body.product_name || 'Product Analysis'
    };

    // Calculate results using the margin calculator
    const computedResults = compute(analysisInput);
    
    // For authenticated users, save to database
    if (user && membership) {
      const { data: report, error: insertError } = await supabase
        .from('reports')
        .insert({
          org_id: membership.org_id,
          created_by: user.id,
          name: analysisInput.product_name || 'Product Analysis',
          status: 'completed',
          input: analysisInput,
          output: computedResults,
          source_url: body.source_url,
          data_source: body.data_source || (body.image_path ? 'image' : 'manual'),
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save analysis' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Analysis completed successfully for authenticated user:', report.id);

      return new Response(
        JSON.stringify({
          id: report.id,
          result: computedResults,
          saved: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      // For anonymous users, return results without saving
      console.log('Analysis completed for anonymous user');
      
      return new Response(
        JSON.stringify({
          id: `anonymous-${Date.now()}`,
          result: computedResults,
          saved: false
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});