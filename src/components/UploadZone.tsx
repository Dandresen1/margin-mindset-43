import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductFormHelper } from "@/components/ProductFormHelper";
import { detectCategoryFromText } from "@/lib/productDefaults";

interface PrefilledData {
  product_name?: string;
  price?: string;
  cogs?: string;
  platform?: 'amazon' | 'tiktok' | 'shopify' | 'etsy';
  weight_oz?: string | number;
  conversion_rate?: string | number;
  cpc?: string | number;
  source_url?: string;
  data_source?: 'manual' | 'url' | 'image';
}

interface UploadZoneProps {
  prefilledData?: PrefilledData;
  mode?: 'default' | 'url-analysis';
}

export const UploadZone = ({ prefilledData, mode = 'default' }: UploadZoneProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePath, setImagePath] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    product_name: prefilledData?.product_name || '',
    price: (prefilledData?.price ? String(prefilledData.price) : '') || '',
    cogs: (prefilledData?.cogs ? String(prefilledData.cogs) : '') || '',
    platform: prefilledData?.platform || 'amazon' as 'amazon' | 'tiktok' | 'shopify' | 'etsy',
    weight_oz: (prefilledData?.weight_oz ? String(prefilledData.weight_oz) : '') || '',
    conversion_rate: (prefilledData?.conversion_rate ? String(prefilledData.conversion_rate) : '') || '2',
    cpc: (prefilledData?.cpc ? String(prefilledData.cpc) : '') || '1.50'
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const uploadToSupabase = async (file: File) => {
    if (!user) {
      // For anonymous users, create local preview without uploading
      const localUrl = URL.createObjectURL(file);
      setImagePath(`local:${file.name}`);
      toast({
        title: "Image ready for analysis",
        description: "Sign in to save uploaded images permanently.",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate file path: product_uploads/{user_id}/{timestamp}_{filename}
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file with progress tracking
      const { data, error } = await supabase.storage
        .from('product_uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setImagePath(data.path);
      setUploadProgress(100);
      
      toast({
        title: "Upload successful",
        description: "Your product image has been uploaded.",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file.",
        variant: "destructive",
      });
      setUploadedFile(null);
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Upload to Supabase Storage
      await uploadToSupabase(file);
    }
  }, [user, toast]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleAnalyze = async () => {

    if (!formData.product_name || !formData.price || !formData.cogs) {
      toast({
        title: "Missing information",
        description: "Please fill in product name, price, and cost of goods.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);

    try {
      const requestData = {
        product_name: formData.product_name,
        price: parseFloat(formData.price),
        cogs: parseFloat(formData.cogs),
        platform: formData.platform,
        weight_oz: parseFloat(formData.weight_oz) || 8,
        conversion_rate: parseFloat(formData.conversion_rate) / 100,
        cpc: parseFloat(formData.cpc),
        image_path: imagePath,
        source_url: prefilledData?.source_url,
        data_source: prefilledData?.data_source || (imagePath ? 'image' : 'manual')
      };

      // Get session for authenticated users
      const { data: session } = await supabase.auth.getSession();
      const headers = session.session ? {
        Authorization: `Bearer ${session.session.access_token}`
      } : {};

      const response = await supabase.functions.invoke('analyze-product', {
        body: requestData,
        headers
      });

      if (response.error) {
        throw response.error;
      }

      const { id, result, saved } = response.data;
      
      if (saved) {
        toast({
          title: "Analysis complete!",
          description: "Your product analysis has been saved.",
        });
        // Navigate to analysis page for saved analysis
        navigate(`/analysis/${id}`);
      } else {
        // For anonymous users, store result in sessionStorage and navigate
        sessionStorage.setItem('anonymous-analysis', JSON.stringify(result));
        toast({
          title: "Analysis complete!",
          description: "Sign in to save your analysis permanently.",
        });
        navigate(`/analysis/${id}`);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze product.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {mode === 'url-analysis' ? (
        // URL Analysis Mode - Show form directly
        <div className="glass-card rounded-3xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                placeholder="e.g. Wireless Earbuds"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value: any) => setFormData({...formData, platform: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">Amazon (15% fees)</SelectItem>
                  <SelectItem value="tiktok">TikTok Shop (8% fees)</SelectItem>
                  <SelectItem value="etsy">Etsy (6.5% fees)</SelectItem>
                  <SelectItem value="shopify">Shopify (0% fees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="price">Selling Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="29.99"
                className="mt-1"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="cogs">Cost of Goods ($)</Label>
              <Input
                id="cogs"
                type="number"
                step="0.01"
                value={formData.cogs}
                onChange={(e) => setFormData({...formData, cogs: e.target.value})}
                placeholder="8.00"
                className="mt-1"
              />
              <ProductFormHelper
                productName={formData.product_name}
                sellingPrice={parseFloat(formData.price) || undefined}
                category={detectCategoryFromText(formData.product_name)}
                cogs={parseFloat(formData.cogs) || undefined}
                onCOGSChange={(value) => setFormData({...formData, cogs: value})}
              />
            </div>
            
            <div>
              <Label htmlFor="weight_oz">Weight (oz)</Label>
              <Input
                id="weight_oz"
                type="number"
                step="0.1"
                value={formData.weight_oz}
                onChange={(e) => setFormData({...formData, weight_oz: e.target.value})}
                placeholder="8"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="conversion_rate">Conversion Rate (%)</Label>
              <Input
                id="conversion_rate"
                type="number"
                step="0.1"
                value={formData.conversion_rate}
                onChange={(e) => setFormData({...formData, conversion_rate: e.target.value})}
                placeholder="2"
                className="mt-1"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="cpc">Cost Per Click ($)</Label>
              <Input
                id="cpc"
                type="number"
                step="0.01"
                value={formData.cpc}
                onChange={(e) => setFormData({...formData, cpc: e.target.value})}
                placeholder="1.50"
                className="mt-1"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground animate-glow disabled:opacity-50"
            size="lg"
          >
            {analyzing ? 'Analyzing...' : 'Analyze Product from URL'}
          </Button>
        </div>
      ) : (
        // Default Mode - Image Upload + Form
        <div
          {...getRootProps()}
          className={`
            relative glass-card rounded-3xl p-8 border-2 border-dashed transition-all duration-300 cursor-pointer
            ${isDragActive 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-primary/30 hover:border-primary/50 hover:bg-primary/5'
            }
          `}
        >
          <input {...getInputProps()} />
          
          {previewUrl ? (
            <div className="space-y-6">
              <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium">{uploadedFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {uploadedFile && (uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
              
              {/* Analysis Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                    placeholder="e.g. Wireless Earbuds"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={formData.platform} onValueChange={(value: any) => setFormData({...formData, platform: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">Amazon (15% fees)</SelectItem>
                      <SelectItem value="tiktok">TikTok Shop (8% fees)</SelectItem>
                      <SelectItem value="etsy">Etsy (6.5% fees)</SelectItem>
                      <SelectItem value="shopify">Shopify (0% fees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="price">Selling Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="29.99"
                    className="mt-1"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="cogs">Cost of Goods ($)</Label>
                  <Input
                    id="cogs"
                    type="number"
                    step="0.01"
                    value={formData.cogs}
                    onChange={(e) => setFormData({...formData, cogs: e.target.value})}
                    placeholder="8.00"
                    className="mt-1"
                  />
                  <ProductFormHelper
                    productName={formData.product_name}
                    sellingPrice={parseFloat(formData.price) || undefined}
                    category={detectCategoryFromText(formData.product_name)}
                    cogs={parseFloat(formData.cogs) || undefined}
                    onCOGSChange={(value) => setFormData({...formData, cogs: value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight_oz">Weight (oz)</Label>
                  <Input
                    id="weight_oz"
                    type="number"
                    step="0.1"
                    value={formData.weight_oz}
                    onChange={(e) => setFormData({...formData, weight_oz: e.target.value})}
                    placeholder="8"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="conversion_rate">Conversion Rate (%)</Label>
                  <Input
                    id="conversion_rate"
                    type="number"
                    step="0.1"
                    value={formData.conversion_rate}
                    onChange={(e) => setFormData({...formData, conversion_rate: e.target.value})}
                    placeholder="2"
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="cpc">Cost Per Click ($)</Label>
                  <Input
                    id="cpc"
                    type="number"
                    step="0.01"
                    value={formData.cpc}
                    onChange={(e) => setFormData({...formData, cpc: e.target.value})}
                    placeholder="1.50"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleAnalyze}
                disabled={uploading || analyzing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground animate-glow disabled:opacity-50"
                size="lg"
              >
                {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Analyze This Product'}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 glass rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {isDragActive ? 'Drop your product image here!' : 'Drag & drop your product image'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  PNG, JPG, WEBP up to 10MB
                  {!user && <span className="block text-muted-foreground">Sign in to save images permanently</span>}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="glass border-primary/30 hover:border-primary"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="mt-4 p-3 glass-card rounded-xl border border-destructive/30">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">
              {fileRejections[0].errors[0].message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};