# Configuración de Supabase

Este documento te guía paso a paso para conectar tu aplicación con Supabase.

## 1. Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu URL del proyecto y las claves API

## 2. Configurar las variables de entorno

Copia el archivo `env.local.example` a `.env.local` y configura las siguientes variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Optional: Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
```

## 3. Crear las tablas en Supabase

Ejecuta los siguientes comandos SQL en el editor SQL de Supabase:

### Tabla de transacciones

```sql
-- Crear tabla de transacciones
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount_bs DECIMAL(15,2) NOT NULL,
  amount_usdt DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

### Tabla de períodos consolidados

```sql
-- Crear tabla de períodos consolidados
CREATE TABLE consolidated_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transactions JSONB NOT NULL,
  period JSONB NOT NULL,
  total_bs DECIMAL(15,2) NOT NULL,
  total_usdt DECIMAL(15,2) NOT NULL,
  commission DECIMAL(15,2) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_consolidated_periods_user_id ON consolidated_periods(user_id);
CREATE INDEX idx_consolidated_periods_created_at ON consolidated_periods(created_at);

-- Habilitar RLS
ALTER TABLE consolidated_periods ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Users can view their own consolidated periods" ON consolidated_periods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consolidated periods" ON consolidated_periods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consolidated periods" ON consolidated_periods
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Configurar autenticación

1. En el dashboard de Supabase, ve a **Authentication > Settings**
2. Configura los siguientes ajustes:
   - **Site URL**: `http://localhost:3000` (para desarrollo)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
3. En **Email Templates**, personaliza los emails de confirmación si lo deseas

## 5. Probar la aplicación

1. Ejecuta `npm run dev` para iniciar el servidor de desarrollo
2. Ve a `http://localhost:3000/auth/register` para crear una cuenta
3. Confirma tu email (revisa tu bandeja de entrada)
4. Inicia sesión en `http://localhost:3000/auth/login`
5. Accede al dashboard en `http://localhost:3000/dashboard`

## 6. Funcionalidades implementadas

- ✅ Autenticación con email y contraseña
- ✅ Protección de rutas con middleware
- ✅ CRUD completo de transacciones
- ✅ Persistencia de datos en Supabase
- ✅ Row Level Security (RLS) para proteger datos
- ✅ Interfaz de usuario mejorada con estado de autenticación

## 7. Estructura de archivos

```
src/
├── lib/
│   ├── supabase.ts              # Configuración de Supabase
│   ├── supabase-services.ts     # Servicios para interactuar con la BD
│   ├── types.ts                 # Tipos TypeScript
│   └── hooks/
│       └── useAuth.ts           # Hook para manejar autenticación
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx         # Página de login
│   │   └── register/
│   │       └── page.tsx         # Página de registro
│   └── dashboard/
│       └── page.tsx             # Dashboard principal (actualizado)
└── middleware.ts                # Middleware para proteger rutas
```

## 8. Próximos pasos

- [ ] Implementar recuperación de contraseña
- [ ] Agregar autenticación con Google/GitHub
- [ ] Implementar la funcionalidad de consolidación con Supabase
- [ ] Agregar validaciones adicionales
- [ ] Implementar notificaciones en tiempo real

## 9. Solución de problemas

### Error de conexión a Supabase

- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que la URL y las claves API sean correctas

### Error de políticas RLS

- Verifica que las políticas de seguridad estén correctamente configuradas
- Asegúrate de que el usuario esté autenticado

### Error de CORS

- Configura correctamente las URLs permitidas en Supabase
- Verifica que estés usando HTTPS en producción
