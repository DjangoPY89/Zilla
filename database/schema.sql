-- ============================================================
-- ESQUEMA DE BASE DE DATOS POSTGRESQL PARA ZILLA FLEX
-- Plataforma de Alquileres de Media Estancia (1-11 meses)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums del Sistema
CREATE TYPE user_role_type AS ENUM (
    'tenant',            -- Arrendatario / Nómada Digital / Ejecutivo
    'host',              -- Propietario / Anfitrión de Unidad
    'admin'              -- Administrador de Plataforma Zilla
);

CREATE TYPE kyc_status_type AS ENUM (
    'pending',           -- En revisión
    'verified',          -- Documento validado (Aprobado)
    'rejected'           -- Rechazado
);

CREATE TYPE property_type AS ENUM (
    'apartment',         -- Departamento / Studio
    'house',             -- Casa / Residencia
    'duplex',            -- Dúplex
    'penthouse',         -- Penthouse
    'gated_community'    -- Barrio Cerrado
);

CREATE TYPE booking_status_type AS ENUM (
    'inquiry',           -- Consulta inicial
    'pending_kyc',       -- Esperando validación de identidad
    'contract_signed',   -- Contrato digital firmado
    'confirmed',         -- Reserva pagada y activa
    'completed',         -- Estancia finalizada
    'cancelled'          -- Cancelada
);

-- 2. Tabla de Usuarios (Inquilinos y Propietarios)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(150) NOT NULL,
    phone_whatsapp VARCHAR(50) NOT NULL,
    country_of_origin VARCHAR(100) DEFAULT 'Paraguay',
    role user_role_type DEFAULT 'tenant',
    kyc_status kyc_status_type DEFAULT 'pending',
    passport_doc_url TEXT,
    linkedin_url TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Propiedades de Media Estancia
CREATE TABLE properties (
    id VARCHAR(50) PRIMARY KEY, -- Ej. ZIL-301
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    prop_type property_type NOT NULL,
    base_price_monthly_usd NUMERIC(10, 2) NOT NULL, -- Tarifa para 1 mes
    expenses_monthly_pyg NUMERIC(12, 2) DEFAULT 0,
    min_stay_months INT DEFAULT 1,
    max_stay_months INT DEFAULT 11,
    wifi_speed_mbps INT DEFAULT 300,
    wfh_setup_description TEXT,
    department VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    parking_spots INT DEFAULT 1,
    built_area_m2 NUMERIC(8, 2) NOT NULL,
    description TEXT NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Reservas y Contratos Digitales
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id VARCHAR(50) REFERENCES properties(id) ON DELETE RESTRICT,
    tenant_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    stay_months INT NOT NULL CHECK (stay_months >= 1 AND stay_months <= 11),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    discount_percent INT DEFAULT 0,
    monthly_rent_usd NUMERIC(10, 2) NOT NULL,
    total_rent_usd NUMERIC(10, 2) NOT NULL,
    security_deposit_usd NUMERIC(10, 2) NOT NULL,
    cleaning_fee_usd NUMERIC(8, 2) DEFAULT 45.00,
    includes_recurring_cleaning BOOLEAN DEFAULT FALSE,
    includes_airport_transfer BOOLEAN DEFAULT FALSE,
    total_initial_payment_usd NUMERIC(10, 2) NOT NULL,
    status booking_status_type DEFAULT 'confirmed',
    digital_contract_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Índices de Búsqueda Rápida
CREATE INDEX idx_properties_coords ON properties(latitude, longitude);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_price ON properties(base_price_monthly_usd);
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
