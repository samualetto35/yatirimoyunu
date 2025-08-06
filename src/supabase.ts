import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dkysingbylclfjlgqioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRreXNpbmdieWxjbGZqbGdxaW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTY0ODYsImV4cCI6MjA2OTk3MjQ4Nn0.x4oKztZnr99JUDI1B9HUkNBAj4ZagyGSM5MpTkvwZ5A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database tabloları için tip tanımları
export interface MarketRow {
  id: number;
  baz_cur: string;
  yatirim_grubu: string;
  yatirim_araci_kod: string;
  yatirim_araci: string;
  yilbasi_getiri: number;
  vergi_orani: number;
  fiyat_t0: number;
  fiyat_t1: number;
  yuzde_t1: number;
  fiyat_t2: number;
  yuzde_t2: number;
  fiyat_t3: number;
  yuzde_t3: number;
  fiyat_t4: number;
  yuzde_t4: number;
  fiyat_t5: number;
  yuzde_t5: number;
  fiyat_t6: number;
  yuzde_t6: number;
  fiyat_t7: number;
  yuzde_t7: number;
  fiyat_t8: number;
  yuzde_t8: number;
  fiyat_t9: number;
  yuzde_t9: number;
  created_at: string;
}

export interface UserProgress {
  id?: number;
  user_id: string;
  user_email: string;
  group_name: string | null;
  t0btl: number;
  t0stl: number | null;
  t1stl: number | null;
  t2stl: number | null;
  t3stl: number | null;
  t4stl: number | null;
  t5stl: number | null;
  t6stl: number | null;
  t7stl: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserEntries {
  id?: number;
  user_id: string;
  user_email: string;
  group_name: string | null;
  t0percent: string | null; // Format: "1;0.2 4;0.4 12;0.4"
  t1percent: string | null;
  t2percent: string | null;
  t3percent: string | null;
  t4percent: string | null;
  t5percent: string | null;
  t6percent: string | null;
  t7percent: string | null;
  t8percent: string | null;
  created_at?: string;
  updated_at?: string;
} 