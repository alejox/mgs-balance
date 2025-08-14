#!/bin/bash

# Script de build para Vercel
echo "🚀 Iniciando build para Vercel..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar variables de entorno
echo "🔧 Verificando variables de entorno..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL no está configurada"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada"
    exit 1
fi

echo "✅ Variables de entorno configuradas correctamente"

# Construir el proyecto
echo "🔨 Construyendo el proyecto..."
npm run build

echo "✅ Build completado exitosamente"
