import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalysisData {
  id: string;
  product: {
    name: string;
    image: string;
    description: string;
    supplier_price: number;
    category: string;
  };
  margins: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
  costs: {
    product_cost: number;
    shipping: number;
    platform_fees: number;
    ad_spend: number;
    returns: number;
    processing: number;
  };
  competitors: Array<{
    platform: string;
    price: number;
    rating: number;
    reviews: number;
  }>;
  market: {
    saturation: number;
    trend_score: number;
    seasonality: string;
  };
  bundles: Array<{
    products: string[];
    margin_increase: number;
    confidence: number;
  }>;
  recommendation: {
    verdict: 'GO' | 'CAUTION' | 'NO-GO';
    reasoning: string;
    confidence: number;
  };
  levers?: Array<{
    category: string;
    impact: string;
    suggestion: string;
    potential_savings: number;
  }>;
  breakeven_price?: number;
  roas?: number;
  target_cpc?: number;
}

export function useAnalysis(analysisId: string | undefined) {
  const { session } = useAuth();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId || !session) {
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the report from database
        const { data: report, error: fetchError } = await supabase
          .from('reports')
          .select('*')
          .eq('id', analysisId)
          .single();

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          if (fetchError.code === 'PGRST116') {
            setError('Analysis not found or you do not have permission to view it.');
          } else {
            setError('Failed to load analysis. Please try again.');
          }
          return;
        }

        if (!report) {
          setError('Analysis not found.');
          return;
        }

        // Transform the database result to match UI expectations
        const analysisResult = report.output as any;
        const inputData = report.input as any;

        // Handle image path from Supabase Storage
        let imageUrl = analysisResult.product?.image || '/placeholder.svg';
        if (inputData.image_path && inputData.image_path !== '/placeholder.svg') {
          // Get public URL for uploaded image
          const { data: urlData } = supabase.storage
            .from('product_uploads')
            .getPublicUrl(inputData.image_path);
          if (urlData) {
            imageUrl = urlData.publicUrl;
          }
        }

        const transformedData: AnalysisData = {
          id: report.id,
          product: {
            name: inputData.product_name || 'Product Analysis',
            image: imageUrl,
            description: analysisResult.product?.description || 'Unit economics analysis',
            supplier_price: inputData.cogs || 0,
            category: analysisResult.product?.category || 'General'
          },
          margins: analysisResult.margins || {
            conservative: 0,
            moderate: 0,
            aggressive: 0
          },
          costs: analysisResult.costs || {
            product_cost: 0,
            shipping: 0,
            platform_fees: 0,
            ad_spend: 0,
            returns: 0,
            processing: 0
          },
          competitors: analysisResult.competitors || [],
          market: analysisResult.market || {
            saturation: 50,
            trend_score: 50,
            seasonality: 'Stable'
          },
          bundles: analysisResult.bundles || [],
          recommendation: analysisResult.recommendation || {
            verdict: 'CAUTION',
            reasoning: 'Analysis completed',
            confidence: 50
          },
          levers: analysisResult.levers || [],
          breakeven_price: analysisResult.breakeven_price,
          roas: analysisResult.roas,
          target_cpc: analysisResult.target_cpc
        };

        setData(transformedData);
      } catch (err) {
        console.error('Analysis fetch error:', err);
        setError('An unexpected error occurred while loading the analysis.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId, session]);

  return { data, loading, error };
}