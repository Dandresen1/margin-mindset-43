import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const UploadZone = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleAnalyze = () => {
    if (uploadedFile) {
      console.log('Analyzing file:', uploadedFile.name);
      // TODO: Implement analysis logic
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
            <Button 
              onClick={handleAnalyze}
              className="bg-primary hover:bg-primary/90 text-primary-foreground animate-glow"
            >
              Analyze This Product
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
              </p>
            </div>
            <Button variant="outline" className="glass border-primary/30 hover:border-primary">
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