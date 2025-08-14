# Configuración de API de Binance

## 🔑 Paso 1: Obtener API Key de Binance

1. Ve a [Binance.com](https://www.binance.com) e inicia sesión
2. Ve a tu perfil → **API Management**
3. Haz clic en **"Create API"**
4. **IMPORTANTE**: Solo habilita permisos de **READ** (no trading)
5. Guarda tu **API Key** y **Secret Key**

## 🔧 Paso 2: Configurar Variables de Entorno

1. En la raíz de tu proyecto, crea un archivo llamado `.env.local`
2. Agrega las siguientes líneas:

```env
NEXT_PUBLIC_BINANCE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_BINANCE_SECRET_KEY=tu_secret_key_aqui
```

3. Reemplaza `tu_api_key_aqui` y `tu_secret_key_aqui` con tus credenciales reales

## 🚀 Paso 3: Usar en la Aplicación

1. En el dashboard, verás un checkbox "Usar API Key"
2. Marca el checkbox para habilitar el uso de tu API key
3. Haz clic en "Actualizar Precio" para obtener datos con tu API key

## ⚠️ Notas Importantes

- **Seguridad**: Las variables con `NEXT_PUBLIC_` son visibles en el cliente
- **Límites**: La API pública tiene límites de rate más bajos
- **Fallback**: Si la API key falla, usa el valor por defecto de 180.00 Bs

## 🔒 Versión Más Segura (Opcional)

Para mayor seguridad, puedes crear un API route en el backend:

1. Crea `src/app/api/binance/route.ts`
2. Mueve la lógica de autenticación al backend
3. Usa variables sin `NEXT_PUBLIC_`

## 📝 Ejemplo de .env.local

```env
# Binance API Credentials
NEXT_PUBLIC_BINANCE_API_KEY=abc123def456ghi789
NEXT_PUBLIC_BINANCE_SECRET_KEY=xyz789uvw123rst456

# Otras variables de entorno
NEXT_PUBLIC_APP_NAME=Balance MGS
```

## 🆘 Solución de Problemas

- **Error "API keys no configuradas"**: Verifica que el archivo `.env.local` existe y tiene las credenciales correctas
- **Error de rate limit**: La API pública tiene límites, considera usar API key
- **Error de autenticación**: Verifica que tu API key tiene permisos de lectura
