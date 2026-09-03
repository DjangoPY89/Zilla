-- ============================================================
-- ESQUEMA DE BASE DE DATOS PARA PORTAL INMOBILIARIO PARAGUAY
-- Compatible con PostgreSQL 14+ y PostGIS (ej. Supabase / AWS RDS)
-- ============================================================

-- 1. Habilitar extensión geoespacial PostGIS y UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumeraciones personalizadas para Paraguay
CREATE TYPE property_operation_type AS ENUM (
    'sale',              -- Venta
    'rent_monthly',      -- Alquiler Anual/Mensual
    'rent_temporary',    -- Alquiler Temporal (ej. San Bernardino temporada)
    'off_plan'           -- En Pozo / Desarrollo
);

CREATE TYPE property_type AS ENUM (
    'house',             -- Casa
    'apartment',         -- Departamento
    'gated_community',   -- Casa en Barrio Cerrado / Condominio
    'duplex',            -- Dúplex
    'land',              -- Terreno / Lote
    'commercial',        -- Local Comercial / Oficina
    'warehouse'          -- Tinglado / Depósito
);

CREATE TYPE listing_tier AS ENUM (
    'free',              -- Gratuito básico
    'gold',              -- Destacado Oro
    'platinum'           -- Destacado Platino (Top feed y pin resaltado)
);

CREATE TYPE advertiser_type AS ENUM (
    'owner_direct',      -- Dueño Directo
    'verified_agency',   -- Inmobiliaria Verificada
    'franchise_agent'    -- Agente Franquicia (RE/MAX, Century 21, etc.)
);

-- 3. Tabla de Ciudades y Barrios de Paraguay
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department VARCHAR(100) NOT NULL, -- ej. Central, Cordillera, Alto Paraná, Capital
    city VARCHAR(100) NOT NULL,       -- ej. Asunción, San Bernardino, Luque, CDE
    neighborhood VARCHAR(100) NOT NULL, -- ej. Villa Morra, Ycuá Satí, Santa Teresa, Manorá, Surubi'i
    avg_price_per_m2_usd NUMERIC(10, 2) DEFAULT 1200.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Anunciantes / Usuarios
CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    advertiser_type advertiser_type DEFAULT 'owner_direct',
    whatsapp_number VARCHAR(30) NOT NULL,
    phone_number VARCHAR(30),
    email VARCHAR(150) UNIQUE NOT NULL,
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla Principal de Propiedades
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_id VARCHAR(20) UNIQUE NOT NULL, -- ej. PY-10492
    title VARCHAR(250) NOT NULL,
    description TEXT NOT NULL,
    
    -- Tipo y Operación
    operation property_operation_type NOT NULL,
    prop_type property_type NOT NULL,
    tier listing_tier DEFAULT 'free',
    
    -- Precios (Dual Currency)
    price_usd NUMERIC(12, 2) NOT NULL,
    price_pyg NUMERIC(15, 2) NOT NULL,
    currency_primary VARCHAR(3) DEFAULT 'USD',
    expenses_pyg NUMERIC(12, 2) DEFAULT 0, -- Expensas en Guaraníes
    
    -- Características Físicas
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    parking_spots INT DEFAULT 0,
    built_area_m2 NUMERIC(10, 2) NOT NULL,
    total_area_m2 NUMERIC(10, 2),
    year_built INT,
    
    -- Ubicación y Geometría PostGIS (SRID 4326: WGS 84 GPS Coordinates)
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    address_text VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    
    -- Flags Locales
    accepts_che_roga_pora BOOLEAN DEFAULT FALSE,
    is_bank_credit_eligible BOOLEAN DEFAULT TRUE,
    has_quincho BOOLEAN DEFAULT FALSE,
    has_pool BOOLEAN DEFAULT FALSE,
    has_covered_garage BOOLEAN DEFAULT FALSE,
    has_security_24h BOOLEAN DEFAULT FALSE,
    is_pet_friendly BOOLEAN DEFAULT FALSE,
    
    -- Galería multimedia (URLs)
    cover_image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::JSONB,
    virtual_tour_360_url TEXT,
    video_url TEXT,
    
    -- Anunciante y Métricas
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
    views_count INT DEFAULT 0,
    whatsapp_clicks INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Índices de Alto Rendimiento (Geoespaciales y Filtros)
CREATE INDEX IF NOT EXISTS idx_properties_geom ON properties USING GIST (location_geom);
CREATE INDEX IF NOT EXISTS idx_properties_operation_type ON properties (operation, prop_type);
CREATE INDEX IF NOT EXISTS idx_properties_price_usd ON properties (price_usd);
CREATE INDEX IF NOT EXISTS idx_properties_city_neighborhood ON properties (city, neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_tier ON properties (tier);

-- 7. Función de Búsqueda Geoespacial por Radio (Radio en Metros)
CREATE OR REPLACE FUNCTION get_properties_within_radius(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION
)
RETURNS SETOF properties AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM properties
    WHERE ST_DWithin(
        location_geom::geography,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
        radius_meters
    )
    AND is_active = TRUE
    ORDER BY 
        tier DESC,
        ST_Distance(
            location_geom::geography,
            ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
        ) ASC;
END;
$$ LANGUAGE plpgsql;

-- 8. Tabla de Leads y Consultas de WhatsApp
CREATE TABLE IF NOT EXISTS property_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    inquirer_name VARCHAR(150),
    inquirer_phone VARCHAR(50),
    lead_channel VARCHAR(30) DEFAULT 'whatsapp', -- 'whatsapp', 'call', 'schedule_visit'
    message_sent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
