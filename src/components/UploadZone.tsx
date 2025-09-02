import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const UploadZone = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePath, setImagePath] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadToSupabase = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files.",
        variant: "destructive",
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

  const handleAnalyze = () => {
    if (uploadedFile && imagePath) {
      console.log('Analyzing file:', uploadedFile.name, 'Path:', imagePath);
      // TODO: Implement analysis logic with imagePath
      // Pass imagePath to the analysis service
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
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
          <div className="space-y-4">
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
            
            <Button 
              onClick={handleAnalyze}
              disabled={uploading || !imagePath}
              className="bg-primary hover:bg-primary/90 text-primary-foreground animate-glow disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Analyze This Product'}
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
                {!user && <span className="block text-primary">Sign in required for upload</span>}
              </p>
            </div>
            <Button 
              variant="outline" 
              className="glass border-primary/30 hover:border-primary"
              disabled={!user}
            >
              <Image className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
      </div>

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