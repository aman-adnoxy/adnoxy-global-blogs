import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const supabaseUrl: string = "https://bcgdakzytmeiheoinwhs.supabase.co";
const supabaseKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZ2Rha3p5dG1laWhlb2lud2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTIxMjYsImV4cCI6MjA2NDI2ODEyNn0.d6icINgXF8sNCDinGtr069iYggMpGm4nb0S2A-GdQ9U";

export const isSupabaseConfigured = supabaseUrl !== '' && supabaseKey !== '';

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

export const BUCKETS = {
  POSTS: 'blog-markdown',
  IMAGES: 'blog-images'
};