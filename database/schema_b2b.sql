-- ============================================================
-- ZILLA PARAGUAY - ESQUEMA B2B BUSINESS INTELLIGENCE & CRM
-- Base de Datos para Agentes Inmobiliarios y Desarrolladoras
-- Compatible con Supabase PostgreSQL 14+
-- URL Proyecto: https://chzxwihqmvotxhiztehk.supabase.co
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Zonas y Métricas de Mercado Inmobiliario de Paraguay (USD/m2, Rentabilidad, Demanda)
CREATE TABLE IF NOT EXISTS b2b_market_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(100) NOT NULL DEFAULT 'Asunción',
    neighborhood VARCHAR(100) NOT NULL,
    zone_category VARCHAR(50) NOT NULL, -- 'premium_corporate', 'residential_high', 'emerging_suburban', 'vacational'
    avg_price_m2_sale_usd NUMERIC(10, 2) NOT NULL,
    avg_price_m2_rent_usd NUMERIC(10, 2) NOT NULL,
    cap_rate_traditional_pct NUMERIC(5, 2) NOT NULL,
    cap_rate_temporal_airbnb_pct NUMERIC(5, 2) NOT NULL,
    avg_occupancy_airbnb_pct NUMERIC(5, 2) DEFAULT 72.5,
    historical_annual_appreciation_pct NUMERIC(5, 2) DEFAULT 7.8,
    demand_index INT DEFAULT 88, -- 0 to 100
    quarter_updated VARCHAR(20) DEFAULT 'Q3 2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Reportes de Tendencias de Búsqueda y Filtros Frecuentes (Para Desarrolladoras)
CREATE TABLE IF NOT EXISTS b2b_search_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_title VARCHAR(200) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    filter_pattern VARCHAR(255) NOT NULL,
    monthly_search_volume INT NOT NULL,
    growth_yoy_pct NUMERIC(5, 2) NOT NULL,
    target_demographic VARCHAR(150),
    strategic_recommendation TEXT NOT NULL,
    active_developer_interest_score INT DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRM & Calificación Avanzada de Leads B2B
CREATE TYPE b2b_lead_status AS ENUM (
    'new_inquiry',
    'financially_qualified',
    'visit_scheduled',
    'offer_negotiation',
    'closed_won',
    'archived'
);

CREATE TABLE IF NOT EXISTS b2b_leads_crm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID,
    client_name VARCHAR(150) NOT NULL,
    phone_whatsapp VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    preferred_zone VARCHAR(100) NOT NULL,
    budget_usd NUMERIC(12, 2) NOT NULL,
    purchase_intent VARCHAR(50) NOT NULL, -- 'investment_yield', 'primary_residence', 'vacation_home'
    move_urgency VARCHAR(50) NOT NULL,    -- 'immediate_30d', 'quarter_90d', 'medium_term'
    afd_credit_eligible BOOLEAN DEFAULT FALSE,
    pre_qualified_bank VARCHAR(100),
    property_interest_id UUID,
    lead_score INT DEFAULT 75, -- 0 to 100
    lead_tier VARCHAR(30) DEFAULT 'Gold', -- 'Platinum', 'Gold', 'Silver'
    status b2b_lead_status DEFAULT 'new_inquiry',
    dossier_summary TEXT,
    notes TEXT,
    last_contact_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Repositorio de Documentos y Plantillas Legales (Código Civil Paraguayo)
CREATE TABLE IF NOT EXISTS b2b_legal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    document_category VARCHAR(100) NOT NULL, -- 'contratos', 'notificaciones', 'recibos', 'ordenanzas'
    paraguay_law_basis VARCHAR(200) NOT NULL, -- ej. 'Ley 1183/85 Código Civil Paraguayo'
    description TEXT NOT NULL,
    content_template TEXT NOT NULL,
    download_count INT DEFAULT 0,
    is_exclusive_pro BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Plan Regulador de Asunción & Coeficientes de Edificabilidad
CREATE TABLE IF NOT EXISTS b2b_zoning_regulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_code VARCHAR(30) UNIQUE NOT NULL, -- ej. 'AR1A', 'AR2B', 'FM1', 'EJE_CORPORATIVO'
    zone_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    aim_coefficient NUMERIC(4, 2) NOT NULL, -- Área de Imposición Máxima
    ar_coefficient NUMERIC(4, 2) NOT NULL,  -- Área Residencial
    max_height_meters NUMERIC(6, 2) NOT NULL,
    max_floors INT NOT NULL,
    front_setback_meters NUMERIC(4, 2) DEFAULT 3.0,
    side_setback_meters NUMERIC(4, 2) DEFAULT 1.5,
    rear_setback_meters NUMERIC(4, 2) DEFAULT 3.0,
    allowed_uses TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SEED DATA DE INICIALIZACIÓN CON DATOS REALES DE PARAGUAY
-- ============================================================

-- Zonas de Mercado
INSERT INTO b2b_market_zones (city, neighborhood, zone_category, avg_price_m2_sale_usd, avg_price_m2_rent_usd, cap_rate_traditional_pct, cap_rate_temporal_airbnb_pct, avg_occupancy_airbnb_pct, historical_annual_appreciation_pct, demand_index)
VALUES 
('Asunción', 'Santa Teresa & Eje Corporativo', 'premium_corporate', 2150.00, 14.50, 7.8, 12.4, 78.5, 9.2, 98),
('Asunción', 'Villa Morra', 'premium_corporate', 1850.00, 12.80, 8.1, 11.8, 74.0, 8.5, 95),
('Asunción', 'Barrio Herrera', 'residential_high', 1420.00, 10.50, 8.6, 10.9, 68.0, 7.8, 91),
('Asunción', 'Mburucuyá & Santísima Trinidad', 'residential_high', 1650.00, 11.20, 8.0, 11.2, 70.5, 8.1, 89),
('Asunción', 'Ycuá Satí', 'residential_high', 1580.00, 11.00, 8.2, 11.0, 69.0, 8.0, 88),
('San Bernardino', 'Anfiteatro & Lago Ypacaraí', 'vacational', 1350.00, 18.00, 6.5, 14.8, 85.0, 10.5, 94),
('Luque', 'Rakiura & Eje Aeropuerto', 'emerging_suburban', 1100.00, 8.20, 8.9, 10.2, 65.0, 9.0, 87),
('Mariano Roque Alonso', 'Surubi''i', 'residential_high', 1380.00, 9.50, 7.5, 9.8, 62.0, 8.2, 85)
ON CONFLICT DO NOTHING;

-- Tendencias de Búsqueda
INSERT INTO b2b_search_trends (trend_title, property_type, filter_pattern, monthly_search_volume, growth_yoy_pct, target_demographic, strategic_recommendation, active_developer_interest_score)
VALUES
('Dúplex 3 Dormitorios con Quincho y Piscina', 'duplex', 'bedrooms=3 & has_quincho=true & has_pool=true', 4820, 38.5, 'Familias jóvenes (30-45 años) con crédito AFD', 'Alta demanda insatisfecha en Herrera y Luque. Proyectar unidades de 160m² construidos sobre terrenos 6x30.', 98),
('Departamentos Studio / 1 Dormitorio para Airbnb', 'apartment', 'prop_type=apartment & bedrooms=1 & zone=Villa Morra', 6240, 52.1, 'Inversores locales y extranjeros (Argentina, Brasil, Chile)', 'Diseñar amenities optimizados para renta temporal: cerraduras smart, coworking y rooftop pool en Santa Teresa.', 96),
('Casas con Fachada Bioclimática y Generador 100%', 'house', 'has_generator=true & solar_orientation=north', 3150, 44.0, 'Compradores de alto patrimonio', 'Incorporar aislación térmica en fachadas oeste y generadores a gas para cortes de ANDE.', 92),
('Terrenos para Desarrollo En Pozo (FOT > 4)', 'land', 'prop_type=land & is_bank_eligible=true', 2890, 29.3, 'Empresas desarrolladoras y fondos de inversión', 'Adquisición de terrenos unificados en Barrio Herrera y Mburucuyá para edificios de 6 a 8 pisos.', 95)
ON CONFLICT DO NOTHING;

-- Leads CRM Iniciales
INSERT INTO b2b_leads_crm (client_name, phone_whatsapp, email, preferred_zone, budget_usd, purchase_intent, move_urgency, afd_credit_eligible, pre_qualified_bank, lead_score, lead_tier, status, dossier_summary, notes)
VALUES
('Ing. Marcelo Benítez', '+595981445566', 'mbenitez.invest@gmail.com', 'Santa Teresa & Eje Corporativo', 220000.00, 'investment_yield', 'immediate_30d', true, 'Banco Continental (Aprobado)', 96, 'Platinum', 'financially_qualified', 'Inversor con capital propio USD 120k + crédito pre-aprobado. Busca departamento 2D con renta temporal activa.', 'Muy interesado en Torre Santa Teresa piso alto. Solicita dossier de rentabilidad.'),
('Dra. Valentina Duarte', '+595982778899', 'valen.duarte@hotmail.com', 'Barrio Herrera', 165000.00, 'primary_residence', 'quarter_90d', true, 'Banco Itaú (Che Róga Porã / AFD)', 92, 'Platinum', 'visit_scheduled', 'Familia de 3 integrantes. Busca dúplex con patio propio, quincho y cochera techada.', 'Visita agendada para este sábado 10:30 AM.'),
('Esteban Rossi (Inversor Argentino)', '+5491133445566', 'erossi.bue@gmail.com', 'Villa Morra', 350000.00, 'investment_yield', 'immediate_30d', false, 'Fondos Propios Transferencia USD', 95, 'Platinum', 'offer_negotiation', 'Comprador en efectivo. Busca adquirir 2 unidades en pozo para alquiler temporal amoblado.', 'En negociación de precio de lista por paquete de 2 unidades.')
ON CONFLICT DO NOTHING;

-- 6. Reglas de Automatización de CRM Inmobiliario
CREATE TABLE IF NOT EXISTS b2b_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL, -- 'on_lead_created', 'on_lead_qualified', 'on_inactivity_48h', 'on_visit_scheduled'
    action_type VARCHAR(100) NOT NULL,   -- 'send_whatsapp_dossier', 'assign_agent', 'schedule_followup', 'notify_bank_broker'
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INT DEFAULT 0,
    config JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Historial y Logs de Automatizaciones Ejecutadas
CREATE TABLE IF NOT EXISTS b2b_automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID REFERENCES b2b_automations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES b2b_leads_crm(id) ON DELETE CASCADE,
    action_executed VARCHAR(150) NOT NULL,
    status_result VARCHAR(50) DEFAULT 'success', -- 'success', 'failed', 'pending'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reglas de Automatización Iniciales
INSERT INTO b2b_automations (title, trigger_event, action_type, is_active, execution_count, config)
VALUES
('Auto-Scoring & Enriquecimiento con IA', 'on_lead_created', 'auto_qualification_score', true, 142, '{"min_score_platinum": 90, "check_afd": true}'),
('Envío Inmediato de Dossier PDF por WhatsApp', 'on_lead_qualified', 'send_whatsapp_dossier', true, 98, '{"delay_seconds": 30, "template": "dossier_welcome"}'),
('Alerta de Seguimiento Inteligente (48h sin contacto)', 'on_inactivity_48h', 'schedule_followup', true, 64, '{"notify_channel": "agent_push_whatsapp"}'),
('Derivación a Oficial de Crédito Bancario / AFD', 'on_lead_created', 'notify_bank_broker', true, 51, '{"banks": ["Itaú", "Continental", "GNB"]}')
ON CONFLICT DO NOTHING;

