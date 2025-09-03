-- Add source_url and data_source columns to reports table
ALTER TABLE public.reports 
ADD COLUMN source_url TEXT,
ADD COLUMN data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'url', 'image'));