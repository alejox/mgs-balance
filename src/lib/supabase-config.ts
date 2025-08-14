// Configuración de Supabase para diferentes entornos
export const supabaseConfig = {
  development: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  production: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
};

// Obtener la configuración según el entorno
export const getSupabaseConfig = () => {
  const environment = process.env.NODE_ENV || "development";
  return supabaseConfig[environment as keyof typeof supabaseConfig];
};
