import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vsyjaxxvuvebfgrmwqkn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWpheHh2dXZlYmZncm13cWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MTg5NTYsImV4cCI6MjA2NDI5NDk1Nn0.NiAWk-fkKmOwAyALOvpOsPdnHOcXhiDNc9yJlBfQ-n0";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
