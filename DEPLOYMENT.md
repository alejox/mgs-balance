# Guía de Despliegue en Vercel

Este documento te guía paso a paso para desplegar tu aplicación en Vercel.

## 1. Preparación del Proyecto

### 1.1 Verificar archivos de configuración

- ✅ `vercel.json` - Configuración de Vercel
- ✅ `next.config.ts` - Configuración de Next.js
- ✅ `.gitignore` - Archivos ignorados por Git

### 1.2 Verificar dependencias

```bash
npm install
npm run build
```

## 2. Configurar Supabase para Producción

### 2.1 Configurar URLs de redirección

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication > Settings**
4. Configura las siguientes URLs:

```
Site URL: https://tu-dominio.vercel.app
Redirect URLs:
- https://tu-dominio.vercel.app/auth/callback
- https://tu-dominio.vercel.app/dashboard
- http://localhost:3000/auth/callback (desarrollo)
- http://localhost:3000/dashboard (desarrollo)
```

### 2.2 Verificar políticas RLS

Asegúrate de que las políticas de seguridad estén configuradas correctamente:

```sql
-- Verificar que las políticas existen
SELECT * FROM pg_policies WHERE tablename = 'transactions';
SELECT * FROM pg_policies WHERE tablename = 'consolidated_periods';
```

## 3. Desplegar en Vercel

### 3.1 Opción A: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

### 3.2 Opción B: Usando GitHub

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio de GitHub
4. Configura las variables de entorno

## 4. Configurar Variables de Entorno en Vercel

### 4.1 Variables requeridas

En el dashboard de Vercel, ve a **Settings > Environment Variables** y configura:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role
```

### 4.2 Variables opcionales

```
NEXT_PUBLIC_BINANCE_API_KEY=tu-api-key
NEXT_PUBLIC_BINANCE_SECRET_KEY=tu-secret-key
```

## 5. Verificar el Despliegue

### 5.1 Verificar funcionalidades

- [ ] Página principal carga correctamente
- [ ] Registro de usuarios funciona
- [ ] Login funciona
- [ ] Dashboard es accesible
- [ ] Transacciones se guardan en Supabase
- [ ] API de Binance funciona

### 5.2 Verificar logs

En Vercel Dashboard > Functions, verifica que no hay errores en:

- `/api/binance`
- Middleware

## 6. Configuración de Dominio Personalizado (Opcional)

### 6.1 Agregar dominio

1. Ve a **Settings > Domains**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### 6.2 Actualizar Supabase

Actualiza las URLs de redirección en Supabase con tu dominio personalizado.

## 7. Monitoreo y Mantenimiento

### 7.1 Analytics

- Configura Google Analytics si es necesario
- Monitorea el rendimiento en Vercel Analytics

### 7.2 Logs

- Revisa los logs de Vercel regularmente
- Configura alertas para errores

### 7.3 Base de datos

- Monitorea el uso de Supabase
- Configura backups si es necesario

## 8. Solución de Problemas Comunes

### Error: "Auth session missing"

- Verifica que las variables de entorno estén configuradas
- Asegúrate de que las URLs de redirección sean correctas

### Error: "CORS policy"

- Verifica la configuración de Supabase
- Asegúrate de que las URLs estén en la lista blanca

### Error: "Build failed"

- Verifica que todas las dependencias estén instaladas
- Revisa los logs de build en Vercel

## 9. Comandos Útiles

```bash
# Verificar build local
npm run build

# Ejecutar tests (si los tienes)
npm test

# Verificar tipos TypeScript
npx tsc --noEmit

# Lint del código
npm run lint
```

## 10. Contacto y Soporte

Si tienes problemas con el despliegue:

1. Revisa los logs de Vercel
2. Verifica la configuración de Supabase
3. Consulta la documentación de Next.js y Vercel
