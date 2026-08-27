import { createClient } from '@supabase/supabase-js';

// Utilisation des identifiants d'origine (vwmivojqwhhhgrhgmwit) pour retrouver les comptes utilisateurs
const supabaseUrl = 'https://vwmivojqwhhhgrhgmwit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bWl2b2pxd2hoaGdyaGdtd2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTQyNzIsImV4cCI6MjEwMjYzMDI3Mn0.WIKzzJhQEYsG18IF9tVqO-3E132Xtd_nQoT51Uhg_ZU';

export const supabase = createClient(supabaseUrl, supabaseKey);
