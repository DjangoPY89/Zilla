-- ============================================================
-- ZILLA PARAGUAY - ESQUEMA DE BASE DE DATOS PARA CLIENTES (SUPABASE)
-- Tabla de Perfiles de Clientes, Sincronización Auth, Favoritos y Consultas
-- Compatible con Supabase PostgreSQL 14+ y Supabase Auth (GoTrue)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA PRINCIPAL DE PERFILES DE CLIENTES / USUARIOS PARTICULARES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_whatsapp VARCHAR(50),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    role VARCHAR(50) DEFAULT 'client',           -- 'client', 'owner', 'tenant', 'buyer'
    auth_provider VARCHAR(50) DEFAULT 'email',   -- 'email', 'google', 'facebook'
    preferred_currency VARCHAR(10) DEFAULT 'USD',-- 'USD', 'PYG'
    preferred_city VARCHAR(100) DEFAULT 'Asunción',
    quota_max_properties INT DEFAULT 5,          -- Límite gratuito de 5 publicaciones
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Los administradores y sistema pueden insertar perfiles" 
ON public.profiles FOR INSERT 
WITH CHECK (true);


-- 2. TRIGGER AUTOMÁTICO: SINCRONIZACIÓN DE AUTH.USERS CON PUBLIC.PROFILES
-- Cada vez que un usuario se registra vía Email, Google o Facebook, se crea automáticamente en public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        auth_provider,
        phone_whatsapp,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80'
        ),
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. TABLA DE FAVORITOS DE CLIENTES
CREATE TABLE IF NOT EXISTS public.client_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id VARCHAR(100) NOT NULL,
    property_title VARCHAR(255),
    property_price_usd NUMERIC(12, 2),
    property_location VARCHAR(200),
    property_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

ALTER TABLE public.client_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propios favoritos" 
ON public.client_favorites FOR ALL 
USING (auth.uid() = user_id);


-- 4. TABLA DE CONSULTAS RECIBIDAS Y ENVIADAS POR CLIENTES
CREATE TABLE IF NOT EXISTS public.client_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_name VARCHAR(150) NOT NULL,
    sender_phone VARCHAR(50) NOT NULL,
    sender_email VARCHAR(200) NOT NULL,
    recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id VARCHAR(100) NOT NULL,
    property_title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'contacted', 'closed'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.client_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver consultas enviadas y recibidas" 
ON public.client_inquiries FOR ALL 
USING (auth.uid() = sender_id OR auth.uid() = recipient_user_id);


-- 5. TABLA DE HISTORIAL DE BÚSQUEDAS RECIENTES
CREATE TABLE IF NOT EXISTS public.client_search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    search_query VARCHAR(255),
    operation VARCHAR(50),
    property_type VARCHAR(50),
    zone_neighborhood VARCHAR(100),
    min_price_usd NUMERIC(12, 2),
    max_price_usd NUMERIC(12, 2),
    results_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.client_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su historial de búsqueda" 
ON public.client_search_history FOR ALL 
USING (auth.uid() = user_id);
