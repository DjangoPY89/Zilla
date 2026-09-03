/**
 * ============================================================
 * ZILLA PARAGUAY - B2B INTELLIGENCE & SUPABASE API ENGINE
 * Capa de Datos para Agentes Inmobiliarios y Desarrolladoras
 * Supabase Project: https://chzxwihqmvotxhiztehk.supabase.co
 * ============================================================
 */

(function () {
    'use strict';

    const SUPABASE_CONFIG = {
        url: 'https://chzxwihqmvotxhiztehk.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder', // Placeholder o key real
        storageKey: 'zilla_b2b_crm_leads'
    };

    // Datos maestros locales de alta precisión para Paraguay (Fallback & Cache instantáneo)
    const MOCK_DATA = {
        zones: [
            /* ============================================================
               1. ASUNCIÓN (17 BARRIOS CLAVE)
               ============================================================ */
            {
                id: 'zone-asu-1',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Santa Teresa & Eje Corporativo',
                category: 'premium_corporate',
                coordinates: [-25.2865, -57.5670],
                avg_price_m2_sale_usd: 2150.00,
                price_off_plan_usd: 1720.00,
                avg_price_m2_rent_usd: 14.50,
                cap_rate_traditional_pct: 7.8,
                cap_rate_temporal_airbnb_pct: 12.4,
                avg_occupancy_airbnb_pct: 78.5,
                historical_appreciation_pct: 9.2,
                avg_ticket_usd: 210000,
                demand_index: 98,
                description: 'Penthouses, departamentos de lujo, sedes bancarias y shoppings de alta gama.'
            },
            {
                id: 'zone-asu-2',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Villa Morra',
                category: 'premium_corporate',
                coordinates: [-25.2950, -57.5790],
                avg_price_m2_sale_usd: 1850.00,
                price_off_plan_usd: 1480.00,
                avg_price_m2_rent_usd: 12.80,
                cap_rate_traditional_pct: 8.1,
                cap_rate_temporal_airbnb_pct: 11.8,
                avg_occupancy_airbnb_pct: 74.0,
                historical_appreciation_pct: 8.5,
                avg_ticket_usd: 165000,
                demand_index: 95,
                description: 'Epicentro comercial, gastronómico y edificios boutique residenciales.'
            },
            {
                id: 'zone-asu-3',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Las Lomas & Carmelitas',
                category: 'premium_corporate',
                coordinates: [-25.2790, -57.5730],
                avg_price_m2_sale_usd: 1950.00,
                price_off_plan_usd: 1560.00,
                avg_price_m2_rent_usd: 13.50,
                cap_rate_traditional_pct: 8.0,
                cap_rate_temporal_airbnb_pct: 12.0,
                avg_occupancy_airbnb_pct: 76.0,
                historical_appreciation_pct: 8.8,
                avg_ticket_usd: 185000,
                demand_index: 96,
                description: 'Cercanía a Shopping del Sol, embajadas y hoteles 5 estrellas.'
            },
            {
                id: 'zone-asu-4',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Ykuá Satî & Paseo La Galería',
                category: 'premium_corporate',
                coordinates: [-25.2840, -57.5610],
                avg_price_m2_sale_usd: 2050.00,
                price_off_plan_usd: 1640.00,
                avg_price_m2_rent_usd: 14.00,
                cap_rate_traditional_pct: 7.9,
                cap_rate_temporal_airbnb_pct: 12.2,
                avg_occupancy_airbnb_pct: 77.0,
                historical_appreciation_pct: 9.0,
                avg_ticket_usd: 195000,
                demand_index: 97,
                description: 'Torres corporativas de clase A, residencias de alta gama y gastronomía de autor.'
            },
            {
                id: 'zone-asu-5',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Barrio Herrera',
                category: 'residential_high',
                coordinates: [-25.2990, -57.5620],
                avg_price_m2_sale_usd: 1420.00,
                price_off_plan_usd: 1150.00,
                avg_price_m2_rent_usd: 10.50,
                cap_rate_traditional_pct: 8.6,
                cap_rate_temporal_airbnb_pct: 10.9,
                avg_occupancy_airbnb_pct: 68.0,
                historical_appreciation_pct: 7.8,
                avg_ticket_usd: 140000,
                demand_index: 91,
                description: 'Dúplex modernos, residencias familiares y desarrollo en pozo de media densidad.'
            },
            {
                id: 'zone-asu-6',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Mburucuyá & Santísima Trinidad',
                category: 'residential_high',
                coordinates: [-25.2670, -57.5680],
                avg_price_m2_sale_usd: 1650.00,
                price_off_plan_usd: 1320.00,
                avg_price_m2_rent_usd: 11.20,
                cap_rate_traditional_pct: 8.0,
                cap_rate_temporal_airbnb_pct: 11.2,
                avg_occupancy_airbnb_pct: 70.5,
                historical_appreciation_pct: 8.1,
                avg_ticket_usd: 155000,
                demand_index: 89,
                description: 'Cercanía a colegios privados, parques y torres residenciales exclusivas.'
            },
            {
                id: 'zone-asu-7',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Los Laureles & Mcal. López',
                category: 'residential_high',
                coordinates: [-25.3120, -57.5730],
                avg_price_m2_sale_usd: 1380.00,
                price_off_plan_usd: 1100.00,
                avg_price_m2_rent_usd: 9.80,
                cap_rate_traditional_pct: 8.4,
                cap_rate_temporal_airbnb_pct: 10.5,
                avg_occupancy_airbnb_pct: 66.0,
                historical_appreciation_pct: 7.4,
                avg_ticket_usd: 130000,
                demand_index: 88,
                description: 'Barrio consolidado de perfil residencial familiar y condominios cerrados.'
            },
            {
                id: 'zone-asu-8',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Manorá',
                category: 'premium_corporate',
                coordinates: [-25.2920, -57.5850],
                avg_price_m2_sale_usd: 1750.00,
                price_off_plan_usd: 1400.00,
                avg_price_m2_rent_usd: 12.20,
                cap_rate_traditional_pct: 8.2,
                cap_rate_temporal_airbnb_pct: 11.5,
                avg_occupancy_airbnb_pct: 72.0,
                historical_appreciation_pct: 8.3,
                avg_ticket_usd: 170000,
                demand_index: 92,
                description: 'Mansiones tradicionales, embajadas y edificios residenciales boutique de baja densidad.'
            },
            {
                id: 'zone-asu-9',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Recoleta',
                category: 'residential_high',
                coordinates: [-25.2980, -57.5950],
                avg_price_m2_sale_usd: 1580.00,
                price_off_plan_usd: 1260.00,
                avg_price_m2_rent_usd: 11.00,
                cap_rate_traditional_pct: 8.3,
                cap_rate_temporal_airbnb_pct: 11.0,
                avg_occupancy_airbnb_pct: 70.0,
                historical_appreciation_pct: 7.9,
                avg_ticket_usd: 145000,
                demand_index: 90,
                description: 'Ubicación céntrica privilegiada entre Villa Morra y el centro financiero.'
            },
            {
                id: 'zone-asu-10',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'San Cristóbal',
                category: 'residential_high',
                coordinates: [-25.3050, -57.5700],
                avg_price_m2_sale_usd: 1450.00,
                price_off_plan_usd: 1180.00,
                avg_price_m2_rent_usd: 10.20,
                cap_rate_traditional_pct: 8.5,
                cap_rate_temporal_airbnb_pct: 10.6,
                avg_occupancy_airbnb_pct: 67.0,
                historical_appreciation_pct: 7.6,
                avg_ticket_usd: 135000,
                demand_index: 87,
                description: 'Eje de rápido acceso sobre Av. Denis Roa, ideal para dúplex y petit buildings.'
            },
            {
                id: 'zone-asu-11',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Sajonia & Palacio de Justicia',
                category: 'traditional_urban',
                coordinates: [-25.2890, -57.6530],
                avg_price_m2_sale_usd: 1050.00,
                price_off_plan_usd: 850.00,
                avg_price_m2_rent_usd: 7.80,
                cap_rate_traditional_pct: 8.7,
                cap_rate_temporal_airbnb_pct: 9.8,
                avg_occupancy_airbnb_pct: 62.0,
                historical_appreciation_pct: 6.2,
                avg_ticket_usd: 89000,
                demand_index: 81,
                description: 'Fuerte demanda de alquiler para profesionales del Poder Judicial y Parque Carlos Antonio López.'
            },
            {
                id: 'zone-asu-12',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Centro Histórico & Costanera',
                category: 'historical_redevelopment',
                coordinates: [-25.2810, -57.6360],
                avg_price_m2_sale_usd: 1150.00,
                price_off_plan_usd: 920.00,
                avg_price_m2_rent_usd: 8.50,
                cap_rate_traditional_pct: 8.5,
                cap_rate_temporal_airbnb_pct: 10.8,
                avg_occupancy_airbnb_pct: 62.0,
                historical_appreciation_pct: 6.5,
                avg_ticket_usd: 95000,
                demand_index: 80,
                description: 'Plan de revitalización urbana, sedes ministeriales y vista panorámica a la bahía de Asunción.'
            },
            {
                id: 'zone-asu-13',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Villa Aurelia',
                category: 'residential_mid',
                coordinates: [-25.3160, -57.5650],
                avg_price_m2_sale_usd: 1290.00,
                price_off_plan_usd: 1020.00,
                avg_price_m2_rent_usd: 9.10,
                cap_rate_traditional_pct: 8.6,
                cap_rate_temporal_airbnb_pct: 10.2,
                avg_occupancy_airbnb_pct: 65.0,
                historical_appreciation_pct: 7.5,
                avg_ticket_usd: 120000,
                demand_index: 86,
                description: 'Ubicación estratégica cerca de Av. Eusebio Ayala y Av. Boggiani.'
            },
            {
                id: 'zone-asu-14',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Mariscal Estigarribia',
                category: 'residential_high',
                coordinates: [-25.3060, -57.5820],
                avg_price_m2_sale_usd: 1490.00,
                price_off_plan_usd: 1190.00,
                avg_price_m2_rent_usd: 10.60,
                cap_rate_traditional_pct: 8.3,
                cap_rate_temporal_airbnb_pct: 10.8,
                avg_occupancy_airbnb_pct: 69.0,
                historical_appreciation_pct: 7.7,
                avg_ticket_usd: 142000,
                demand_index: 89,
                description: 'Entorno arbolado, residencial y con excelente conectividad hacia Mcal. López.'
            },
            {
                id: 'zone-asu-15',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Bella Vista & Av. Artigas',
                category: 'emerging_urban',
                coordinates: [-25.2620, -57.5860],
                avg_price_m2_sale_usd: 1180.00,
                price_off_plan_usd: 940.00,
                avg_price_m2_rent_usd: 8.40,
                cap_rate_traditional_pct: 8.8,
                cap_rate_temporal_airbnb_pct: 10.0,
                avg_occupancy_airbnb_pct: 63.0,
                historical_appreciation_pct: 7.2,
                avg_ticket_usd: 105000,
                demand_index: 83,
                description: 'Cercanía al Jardín Botánico y Costanera Norte con gran potencial de renovación.'
            },
            {
                id: 'zone-asu-16',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Virgen del Huerto & Barrio Jara',
                category: 'residential_mid',
                coordinates: [-25.2750, -57.6050],
                avg_price_m2_sale_usd: 1320.00,
                price_off_plan_usd: 1050.00,
                avg_price_m2_rent_usd: 9.40,
                cap_rate_traditional_pct: 8.5,
                cap_rate_temporal_airbnb_pct: 10.4,
                avg_occupancy_airbnb_pct: 66.0,
                historical_appreciation_pct: 7.6,
                avg_ticket_usd: 125000,
                demand_index: 85,
                description: 'Barrio universitario y gastronómico de alta demanda en departamentos para estudiantes y médicos.'
            },
            {
                id: 'zone-asu-17',
                region: 'asuncion',
                city: 'Asunción',
                neighborhood: 'Madame Lynch & Mbocayaty',
                category: 'residential_mid',
                coordinates: [-25.2740, -57.5520],
                avg_price_m2_sale_usd: 1250.00,
                price_off_plan_usd: 990.00,
                avg_price_m2_rent_usd: 8.90,
                cap_rate_traditional_pct: 8.7,
                cap_rate_temporal_airbnb_pct: 10.1,
                avg_occupancy_airbnb_pct: 64.0,
                historical_appreciation_pct: 7.8,
                avg_ticket_usd: 118000,
                demand_index: 84,
                description: 'Zona de expansión hacia Luque, con fácil acceso al Parque Guasú Metropolitano.'
            },

            /* ============================================================
               2. LAMBARÉ (5 BARRIOS CLAVE)
               ============================================================ */
            {
                id: 'zone-lam-1',
                region: 'gran_asuncion',
                city: 'Lambaré',
                neighborhood: 'Yacht & Golf Club',
                category: 'suburban_waterfront',
                coordinates: [-25.3530, -57.6320],
                avg_price_m2_sale_usd: 1180.00,
                price_off_plan_usd: 940.00,
                avg_price_m2_rent_usd: 8.50,
                cap_rate_traditional_pct: 8.4,
                cap_rate_temporal_airbnb_pct: 11.2,
                avg_occupancy_airbnb_pct: 68.0,
                historical_appreciation_pct: 8.2,
                avg_ticket_usd: 160000,
                demand_index: 88,
                description: 'Residencias de gran porte, club de golf, marina sobre el río Paraguay y entorno verde.'
            },
            {
                id: 'zone-lam-2',
                region: 'gran_asuncion',
                city: 'Lambaré',
                neighborhood: 'Valle Apu\'a & Av. Cacique Lambaré',
                category: 'residential_mid',
                coordinates: [-25.3420, -57.6120],
                avg_price_m2_sale_usd: 920.00,
                price_off_plan_usd: 740.00,
                avg_price_m2_rent_usd: 6.80,
                cap_rate_traditional_pct: 8.9,
                cap_rate_temporal_airbnb_pct: 9.6,
                avg_occupancy_airbnb_pct: 60.0,
                historical_appreciation_pct: 7.4,
                avg_ticket_usd: 92000,
                demand_index: 83,
                description: 'Alta demanda para familias jóvenes con crédito bancario y proximidad a Asunción.'
            },
            {
                id: 'zone-lam-3',
                region: 'gran_asuncion',
                city: 'Lambaré',
                neighborhood: 'Santo Domingo',
                category: 'residential_mid',
                coordinates: [-25.3310, -57.6080],
                avg_price_m2_sale_usd: 1020.00,
                price_off_plan_usd: 810.00,
                avg_price_m2_rent_usd: 7.50,
                cap_rate_traditional_pct: 8.7,
                cap_rate_temporal_airbnb_pct: 10.0,
                avg_occupancy_airbnb_pct: 62.0,
                historical_appreciation_pct: 7.6,
                avg_ticket_usd: 110000,
                demand_index: 84,
                description: 'Límite directo con Asunción (Barrio San Vicente), muy buscado para dúplex modernos.'
            },
            {
                id: 'zone-lam-4',
                region: 'gran_asuncion',
                city: 'Lambaré',
                neighborhood: 'Centro de Lambaré & Costanera Sur',
                category: 'emerging_suburban',
                coordinates: [-25.3480, -57.6030],
                avg_price_m2_sale_usd: 980.00,
                price_off_plan_usd: 780.00,
                avg_price_m2_rent_usd: 7.20,
                cap_rate_traditional_pct: 8.8,
                cap_rate_temporal_airbnb_pct: 10.2,
                avg_occupancy_airbnb_pct: 63.0,
                historical_appreciation_pct: 8.5,
                avg_ticket_usd: 98000,
                demand_index: 86,
                description: 'Fuerte revalorización tras la inauguración de la Costanera Sur con conexión a Asunción en 10 min.'
            },
            {
                id: 'zone-lam-5',
                region: 'gran_asuncion',
                city: 'Lambaré',
                neighborhood: 'San Antonio / Cañada',
                category: 'affordable_urban',
                coordinates: [-25.3620, -57.5950],
                avg_price_m2_sale_usd: 840.00,
                price_off_plan_usd: 670.00,
                avg_price_m2_rent_usd: 6.10,
                cap_rate_traditional_pct: 9.2,
                cap_rate_temporal_airbnb_pct: 9.1,
                avg_occupancy_airbnb_pct: 58.0,
                historical_appreciation_pct: 7.0,
                avg_ticket_usd: 78000,
                demand_index: 80,
                description: 'Sector accesible con alta rotación de alquiler tradicional y apto para Che Róga Porã.'
            },

            /* ============================================================
               3. SAN LORENZO (5 BARRIOS CLAVE)
               ============================================================ */
            {
                id: 'zone-sl-1',
                region: 'gran_asuncion',
                city: 'San Lorenzo',
                neighborhood: 'Centro & Campus UNA',
                category: 'student_commercial',
                coordinates: [-25.3400, -57.5180],
                avg_price_m2_sale_usd: 890.00,
                price_off_plan_usd: 710.00,
                avg_price_m2_rent_usd: 6.90,
                cap_rate_traditional_pct: 9.4,
                cap_rate_temporal_airbnb_pct: 9.9,
                avg_occupancy_airbnb_pct: 68.0,
                historical_appreciation_pct: 7.3,
                avg_ticket_usd: 75000,
                demand_index: 88,
                description: 'Polo universitario más grande de Paraguay (UNA), altísima ocupación de monoambientes y studios.'
            },
            {
                id: 'zone-sl-2',
                region: 'gran_asuncion',
                city: 'San Lorenzo',
                neighborhood: 'Barcequillo',
                category: 'residential_mid',
                coordinates: [-25.3550, -57.5450],
                avg_price_m2_sale_usd: 850.00,
                price_off_plan_usd: 680.00,
                avg_price_m2_rent_usd: 6.20,
                cap_rate_traditional_pct: 9.1,
                cap_rate_temporal_airbnb_pct: 9.2,
                avg_occupancy_airbnb_pct: 60.0,
                historical_appreciation_pct: 7.0,
                avg_ticket_usd: 82000,
                demand_index: 82,
                description: 'Cercanía a Av. Avelino Martínez y Fernando de la Mora, ideal para dúplex de primera vivienda.'
            },
            {
                id: 'zone-sl-3',
                region: 'gran_asuncion',
                city: 'San Lorenzo',
                neighborhood: 'Reducto',
                category: 'affordable_urban',
                coordinates: [-25.3750, -57.5120],
                avg_price_m2_sale_usd: 760.00,
                price_off_plan_usd: 610.00,
                avg_price_m2_rent_usd: 5.60,
                cap_rate_traditional_pct: 9.5,
                cap_rate_temporal_airbnb_pct: 8.8,
                avg_occupancy_airbnb_pct: 56.0,
                historical_appreciation_pct: 7.2,
                avg_ticket_usd: 69000,
                demand_index: 79,
                description: 'Desarrollo de condominios cerrados de bajo costo y loteamientos con crédito AFD.'
            },
            {
                id: 'zone-sl-4',
                region: 'gran_asuncion',
                city: 'San Lorenzo',
                neighborhood: 'Laurelty San Lorenzo',
                category: 'residential_mid',
                coordinates: [-25.3250, -57.4980],
                avg_price_m2_sale_usd: 810.00,
                price_off_plan_usd: 650.00,
                avg_price_m2_rent_usd: 5.90,
                cap_rate_traditional_pct: 9.3,
                cap_rate_temporal_airbnb_pct: 9.0,
                avg_occupancy_airbnb_pct: 59.0,
                historical_appreciation_pct: 7.1,
                avg_ticket_usd: 76000,
                demand_index: 81,
                description: 'Conexión rápida entre San Lorenzo y Luque, zona de alta demanda residencial.'
            },
            {
                id: 'zone-sl-5',
                region: 'gran_asuncion',
                city: 'San Lorenzo',
                neighborhood: 'San Miguel',
                category: 'residential_mid',
                coordinates: [-25.3350, -57.5350],
                avg_price_m2_sale_usd: 830.00,
                price_off_plan_usd: 660.00,
                avg_price_m2_rent_usd: 6.00,
                cap_rate_traditional_pct: 9.2,
                cap_rate_temporal_airbnb_pct: 9.1,
                avg_occupancy_airbnb_pct: 58.0,
                historical_appreciation_pct: 7.0,
                avg_ticket_usd: 79000,
                demand_index: 80,
                description: 'Barrio consolidado cerca de Av. Mcal. López y Hospital de Clínicas.'
            },

            /* ============================================================
               4. LUQUE (5 BARRIOS CLAVE)
               ============================================================ */
            {
                id: 'zone-luq-1',
                region: 'gran_asuncion',
                city: 'Luque',
                neighborhood: 'Rakiura & Eje Aeropuerto / CIT',
                category: 'emerging_suburban',
                coordinates: [-25.2420, -57.5150],
                avg_price_m2_sale_usd: 1150.00,
                price_off_plan_usd: 920.00,
                avg_price_m2_rent_usd: 8.60,
                cap_rate_traditional_pct: 8.8,
                cap_rate_temporal_airbnb_pct: 10.5,
                avg_occupancy_airbnb_pct: 67.0,
                historical_appreciation_pct: 9.2,
                avg_ticket_usd: 125000,
                demand_index: 89,
                description: 'Barrios cerrados premium, cercanía a Conmebol, resort Rakiura y aeropuerto internacional.'
            },
            {
                id: 'zone-luq-2',
                region: 'gran_asuncion',
                city: 'Luque',
                neighborhood: 'Luque Centro',
                category: 'traditional_urban',
                coordinates: [-25.2680, -57.4880],
                avg_price_m2_sale_usd: 880.00,
                price_off_plan_usd: 710.00,
                avg_price_m2_rent_usd: 6.50,
                cap_rate_traditional_pct: 9.0,
                cap_rate_temporal_airbnb_pct: 9.4,
                avg_occupancy_airbnb_pct: 61.0,
                historical_appreciation_pct: 7.5,
                avg_ticket_usd: 85000,
                demand_index: 84,
                description: 'Centro cívico, comercial y bancario de Luque con excelente infraestructura urbana.'
            },
            {
                id: 'zone-luq-3',
                region: 'gran_asuncion',
                city: 'Luque',
                neighborhood: 'Tarumandy & Eje Luque-Sanber',
                category: 'resort_residential',
                coordinates: [-25.2420, -57.4200],
                avg_price_m2_sale_usd: 790.00,
                price_off_plan_usd: 630.00,
                avg_price_m2_rent_usd: 5.80,
                cap_rate_traditional_pct: 8.9,
                cap_rate_temporal_airbnb_pct: 10.0,
                avg_occupancy_airbnb_pct: 62.0,
                historical_appreciation_pct: 9.8,
                avg_ticket_usd: 95000,
                demand_index: 86,
                description: 'Corredor ecológico con rápida conexión a San Bernardino y auge de barrios cerrados campestres.'
            },
            {
                id: 'zone-luq-4',
                region: 'gran_asuncion',
                city: 'Luque',
                neighborhood: 'Zarate Isla',
                category: 'emerging_suburban',
                coordinates: [-25.2550, -57.5020],
                avg_price_m2_sale_usd: 890.00,
                price_off_plan_usd: 720.00,
                avg_price_m2_rent_usd: 6.60,
                cap_rate_traditional_pct: 8.9,
                cap_rate_temporal_airbnb_pct: 9.5,
                avg_occupancy_airbnb_pct: 60.0,
                historical_appreciation_pct: 8.0,
                avg_ticket_usd: 88000,
                demand_index: 83,
                description: 'Crecimiento exponencial en dúplex de estilo minimalista para ejecutivos y familias.'
            },
            {
                id: 'zone-luq-5',
                region: 'gran_asuncion',
                city: 'Luque',
                neighborhood: 'Mora Cué',
                category: 'affordable_urban',
                coordinates: [-25.2850, -57.4550],
                avg_price_m2_sale_usd: 750.00,
                price_off_plan_usd: 600.00,
                avg_price_m2_rent_usd: 5.40,
                cap_rate_traditional_pct: 9.4,
                cap_rate_temporal_airbnb_pct: 8.7,
                avg_occupancy_airbnb_pct: 55.0,
                historical_appreciation_pct: 7.2,
                avg_ticket_usd: 68000,
                demand_index: 78,
                description: 'Zona de loteamientos accesibles y casas de 2 a 3 dormitorios calificadas para subsidios MUVH.'
            },

            /* ============================================================
               5. NUEVA ASUNCIÓN / CHACO'I (3 POLOS CLAVE)
               ============================================================ */
            {
                id: 'zone-na-1',
                region: 'gran_asuncion',
                city: 'Nueva Asunción',
                neighborhood: 'Cabecera Puente Héroes del Chaco',
                category: 'frontier_development',
                coordinates: [-25.2680, -57.6250],
                avg_price_m2_sale_usd: 950.00,
                price_off_plan_usd: 750.00,
                avg_price_m2_rent_usd: 7.00,
                cap_rate_traditional_pct: 8.9,
                cap_rate_temporal_airbnb_pct: 11.0,
                avg_occupancy_airbnb_pct: 65.0,
                historical_appreciation_pct: 13.8,
                avg_ticket_usd: 115000,
                demand_index: 94,
                description: 'El nuevo polo de expansión de Asunción a solo 5 minutos de la Costanera Norte vía nuevo puente.'
            },
            {
                id: 'zone-na-2',
                region: 'gran_asuncion',
                city: 'Nueva Asunción',
                neighborhood: 'Bosque Lago & Barrios Cerrados Chaco\'i',
                category: 'resort_residential',
                coordinates: [-25.2550, -57.6480],
                avg_price_m2_sale_usd: 890.00,
                price_off_plan_usd: 690.00,
                avg_price_m2_rent_usd: 6.50,
                cap_rate_traditional_pct: 8.6,
                cap_rate_temporal_airbnb_pct: 11.5,
                avg_occupancy_airbnb_pct: 68.0,
                historical_appreciation_pct: 14.5,
                avg_ticket_usd: 140000,
                demand_index: 95,
                description: 'Megadesarrollos urbanísticos con lagunas artificiales, clubes náuticos y alta valorización de la tierra.'
            },
            {
                id: 'zone-na-3',
                region: 'gran_asuncion',
                city: 'Nueva Asunción',
                neighborhood: 'Polo Logístico & Industrial Costero',
                category: 'industrial_logistics',
                coordinates: [-25.2920, -57.6650],
                avg_price_m2_sale_usd: 680.00,
                price_off_plan_usd: 540.00,
                avg_price_m2_rent_usd: 5.80,
                cap_rate_traditional_pct: 9.8,
                cap_rate_temporal_airbnb_pct: 9.5,
                avg_occupancy_airbnb_pct: 60.0,
                historical_appreciation_pct: 12.5,
                avg_ticket_usd: 85000,
                demand_index: 89,
                description: 'Parques industriales, centros de distribución y depósitos con ventajas impositivas.'
            },

            /* ============================================================
               6. SAN BERNARDINO (4 BARRIOS CLAVE)
               ============================================================ */
            {
                id: 'zone-sb-1',
                region: 'sanber',
                city: 'San Bernardino',
                neighborhood: 'Casco Histórico & Costanera / Playa',
                category: 'vacational_luxury',
                coordinates: [-25.3110, -57.2960],
                avg_price_m2_sale_usd: 1420.00,
                price_off_plan_usd: 1120.00,
                avg_price_m2_rent_usd: 19.00,
                cap_rate_traditional_pct: 6.5,
                cap_rate_temporal_airbnb_pct: 15.2,
                avg_occupancy_airbnb_pct: 86.0,
                historical_appreciation_pct: 10.8,
                avg_ticket_usd: 195000,
                demand_index: 96,
                description: 'Epicentro del verano paraguayo, alta demanda de alquiler temporal y gastronomía boutique.'
            },
            {
                id: 'zone-sb-2',
                region: 'sanber',
                city: 'San Bernardino',
                neighborhood: 'Anfiteatro & Ciervo Cuá',
                category: 'vacational',
                coordinates: [-25.3250, -57.2880],
                avg_price_m2_sale_usd: 1350.00,
                price_off_plan_usd: 1080.00,
                avg_price_m2_rent_usd: 18.00,
                cap_rate_traditional_pct: 6.5,
                cap_rate_temporal_airbnb_pct: 14.8,
                avg_occupancy_airbnb_pct: 85.0,
                historical_appreciation_pct: 10.5,
                avg_ticket_usd: 180000,
                demand_index: 94,
                description: 'Zona de festivales, residencias veraniegas y condominios con vistas panorámicas al lago Ypacaraí.'
            },
            {
                id: 'zone-sb-3',
                region: 'sanber',
                city: 'San Bernardino',
                neighborhood: 'Cristóbal Colón & Sube y Baja',
                category: 'vacational_mid',
                coordinates: [-25.3020, -57.3050],
                avg_price_m2_sale_usd: 1180.00,
                price_off_plan_usd: 940.00,
                avg_price_m2_rent_usd: 15.50,
                cap_rate_traditional_pct: 6.6,
                cap_rate_temporal_airbnb_pct: 13.5,
                avg_occupancy_airbnb_pct: 78.0,
                historical_appreciation_pct: 9.9,
                avg_ticket_usd: 160000,
                demand_index: 90,
                description: 'Barrio residencial tranquilo y arbolado a pocas cuadras de la avenida principal.'
            },
            {
                id: 'zone-sb-4',
                region: 'sanber',
                city: 'San Bernardino',
                neighborhood: 'Cordillera Hills & Puerta del Lago (Altos)',
                category: 'resort_residential',
                coordinates: [-25.2650, -57.2580],
                avg_price_m2_sale_usd: 980.00,
                price_off_plan_usd: 780.00,
                avg_price_m2_rent_usd: 14.50,
                cap_rate_traditional_pct: 6.4,
                cap_rate_temporal_airbnb_pct: 13.9,
                avg_occupancy_airbnb_pct: 82.0,
                historical_appreciation_pct: 11.2,
                avg_ticket_usd: 150000,
                demand_index: 92,
                description: 'Condominios cerrados con lagunas Crystal Lagoons y vistas de ensueño a la serranía.'
            },

            /* ============================================================
               7. CIUDAD DEL ESTE (5 BARRIOS CLAVE)
               ============================================================ */
            {
                id: 'zone-cde-1',
                region: 'cde',
                city: 'Ciudad del Este',
                neighborhood: 'Área 1 & Microcentro Comercial',
                category: 'commercial_border',
                coordinates: [-25.5120, -54.6150],
                avg_price_m2_sale_usd: 1580.00,
                price_off_plan_usd: 1250.00,
                avg_price_m2_rent_usd: 12.00,
                cap_rate_traditional_pct: 8.8,
                cap_rate_temporal_airbnb_pct: 13.2,
                avg_occupancy_airbnb_pct: 75.0,
                historical_appreciation_pct: 9.8,
                avg_ticket_usd: 145000,
                demand_index: 91,
                description: 'Segunda economía del país, alto flujo corporativo de compras y frontera con Foz de Iguazú.'
            },
            {
                id: 'zone-cde-2',
                region: 'cde',
                city: 'Ciudad del Este',
                neighborhood: 'Boquerón & Lago de la República',
                category: 'residential_high',
                coordinates: [-25.5180, -54.6280],
                avg_price_m2_sale_usd: 1480.00,
                price_off_plan_usd: 1180.00,
                avg_price_m2_rent_usd: 11.50,
                cap_rate_traditional_pct: 8.5,
                cap_rate_temporal_airbnb_pct: 12.8,
                avg_occupancy_airbnb_pct: 73.0,
                historical_appreciation_pct: 9.2,
                avg_ticket_usd: 155000,
                demand_index: 92,
                description: 'El barrio residencial más cotizado del centro, con circuito gastronómico y parque del lago.'
            },
            {
                id: 'zone-cde-3',
                region: 'cde',
                city: 'Ciudad del Este',
                neighborhood: 'Área 2, 3 y 4 Residencial',
                category: 'residential_mid',
                coordinates: [-25.5250, -54.6380],
                avg_price_m2_sale_usd: 1250.00,
                price_off_plan_usd: 990.00,
                avg_price_m2_rent_usd: 9.40,
                cap_rate_traditional_pct: 8.7,
                cap_rate_temporal_airbnb_pct: 11.5,
                avg_occupancy_airbnb_pct: 68.0,
                historical_appreciation_pct: 8.5,
                avg_ticket_usd: 130000,
                demand_index: 87,
                description: 'Zonas habitacionales planificadas de Itaipú, muy arboladas, seguras y de alta demanda.'
            },
            {
                id: 'zone-cde-4',
                region: 'cde',
                city: 'Ciudad del Este',
                neighborhood: 'Km 4 a Km 8 (Av. San Blas)',
                category: 'commercial_corridor',
                coordinates: [-25.5080, -54.6650],
                avg_price_m2_sale_usd: 980.00,
                price_off_plan_usd: 780.00,
                avg_price_m2_rent_usd: 7.50,
                cap_rate_traditional_pct: 9.1,
                cap_rate_temporal_airbnb_pct: 10.2,
                avg_occupancy_airbnb_pct: 62.0,
                historical_appreciation_pct: 8.0,
                avg_ticket_usd: 95000,
                demand_index: 83,
                description: 'Eje de expansión sobre la Ruta PY02 con shoppings, universidades y centros médicos.'
            },
            {
                id: 'zone-cde-5',
                region: 'cde',
                city: 'Ciudad del Este',
                neighborhood: 'Paraná Country Club (Hernandarias)',
                category: 'ultra_luxury_gated',
                coordinates: [-25.4450, -54.6400],
                avg_price_m2_sale_usd: 1420.00,
                price_off_plan_usd: 1150.00,
                avg_price_m2_rent_usd: 10.50,
                cap_rate_traditional_pct: 7.5,
                cap_rate_temporal_airbnb_pct: 12.5,
                avg_occupancy_airbnb_pct: 72.0,
                historical_appreciation_pct: 8.9,
                avg_ticket_usd: 280000,
                demand_index: 93,
                description: 'El barrio cerrado más exclusivo del este, cancha de golf de 18 hoyos y marina sobre el río Paraná.'
            },

            /* ============================================================
               8. ENCARNACIÓN (5 BARRIOS CLAVE)
               ============================================================ */
            {
                id: 'zone-enc-1',
                region: 'encarnacion',
                city: 'Encarnación',
                neighborhood: 'Costanera San José & Playa',
                category: 'tourist_waterfront',
                coordinates: [-27.3320, -55.8650],
                avg_price_m2_sale_usd: 1350.00,
                price_off_plan_usd: 1080.00,
                avg_price_m2_rent_usd: 15.50,
                cap_rate_traditional_pct: 7.0,
                cap_rate_temporal_airbnb_pct: 14.8,
                avg_occupancy_airbnb_pct: 82.0,
                historical_appreciation_pct: 10.5,
                avg_ticket_usd: 145000,
                demand_index: 93,
                description: 'La Perla del Sur: playas sobre el río Paraná, carnaval y fuerte inversión en torres con vista al agua.'
            },
            {
                id: 'zone-enc-2',
                region: 'encarnacion',
                city: 'Encarnación',
                neighborhood: 'Centro & Zona Comercial',
                category: 'traditional_urban',
                coordinates: [-27.3380, -55.8600],
                avg_price_m2_sale_usd: 1150.00,
                price_off_plan_usd: 910.00,
                avg_price_m2_rent_usd: 12.00,
                cap_rate_traditional_pct: 8.0,
                cap_rate_temporal_airbnb_pct: 12.8,
                avg_occupancy_airbnb_pct: 72.0,
                historical_appreciation_pct: 8.8,
                avg_ticket_usd: 110000,
                demand_index: 87,
                description: 'Centro bancario, comercial y gastronómico con cercanía al puente internacional hacia Posadas.'
            },
            {
                id: 'zone-enc-3',
                region: 'encarnacion',
                city: 'Encarnación',
                neighborhood: 'Barrio San Roque',
                category: 'residential_high',
                coordinates: [-27.3420, -55.8520],
                avg_price_m2_sale_usd: 980.00,
                price_off_plan_usd: 780.00,
                avg_price_m2_rent_usd: 9.50,
                cap_rate_traditional_pct: 8.4,
                cap_rate_temporal_airbnb_pct: 11.5,
                avg_occupancy_airbnb_pct: 66.0,
                historical_appreciation_pct: 8.2,
                avg_ticket_usd: 95000,
                demand_index: 84,
                description: 'Tradicional barrio residencial con casas familiares de buen porte y terrenos amplios.'
            },
            {
                id: 'zone-enc-4',
                region: 'encarnacion',
                city: 'Encarnación',
                neighborhood: 'Ka\'aguy Rory & Zona Universitaria',
                category: 'student_residential',
                coordinates: [-27.3250, -55.8750],
                avg_price_m2_sale_usd: 890.00,
                price_off_plan_usd: 710.00,
                avg_price_m2_rent_usd: 8.80,
                cap_rate_traditional_pct: 9.2,
                cap_rate_temporal_airbnb_pct: 10.5,
                avg_occupancy_airbnb_pct: 65.0,
                historical_appreciation_pct: 8.0,
                avg_ticket_usd: 82000,
                demand_index: 85,
                description: 'Polo educativo con universidades y alta rotación en alquiler de departamentos para estudiantes.'
            },
            {
                id: 'zone-enc-5',
                region: 'encarnacion',
                city: 'Encarnación',
                neighborhood: 'Barrio Chaipé & Circunvalación',
                category: 'emerging_suburban',
                coordinates: [-27.3150, -55.8450],
                avg_price_m2_sale_usd: 780.00,
                price_off_plan_usd: 620.00,
                avg_price_m2_rent_usd: 7.20,
                cap_rate_traditional_pct: 9.0,
                cap_rate_temporal_airbnb_pct: 9.8,
                avg_occupancy_airbnb_pct: 60.0,
                historical_appreciation_pct: 8.5,
                avg_ticket_usd: 72000,
                demand_index: 80,
                description: 'Zona de expansión sobre la nueva ruta de circunvalación con lotes accesibles y condominios.'
            }
        ],
        trends: [
            {
                id: 'trend-1',
                title: 'Dúplex 3D en terreno 6x30 / 12x30',
                type: 'Dúplex / Casa',
                searches_month: 4820,
                growth_yoy: '+38.5%',
                demographic: 'Familias jóvenes (30-45 años) con crédito AFD / Che Róga Porã',
                recommendation: 'Alta demanda en Barrio Herrera y Luque. Diseñar tipologías con quincho techado y piscina compacta para tickets de USD 130k - 180k.',
                score: 98
            },
            {
                id: 'trend-2',
                title: 'Departamentos Studio / 1 Dormitorio para Airbnb',
                type: 'Departamentos',
                searches_month: 6240,
                growth_yoy: '+52.1%',
                demographic: 'Inversores locales y extranjeros (Argentina, Brasil, Chile, España)',
                recommendation: 'Incorporar cerraduras inteligentes, coworking en PB y rooftop pool en Villa Morra o Santa Teresa para maximizar ocupación.',
                score: 96
            },
            {
                id: 'trend-3',
                title: 'Casas con Protección Bioclimática y Generador 100%',
                type: 'Residencias Premium',
                searches_month: 3150,
                growth_yoy: '+44.0%',
                demographic: 'Compradores de alto patrimonio (> USD 350k)',
                recommendation: 'Filtro muy demandado en Asunción por cortes de ANDE y altas temperaturas. Destacar aleros solares, vidrios DVH y generador a gas.',
                score: 92
            },
            {
                id: 'trend-4',
                title: 'Terrenos para Desarrollo En Pozo (FOT > 4)',
                type: 'Terrenos / Lotes',
                searches_month: 2890,
                growth_yoy: '+29.3%',
                demographic: 'Empresas desarrolladoras y fondos de inversión inmobiliaria',
                recommendation: 'Adquisición de lotes unificados con frente > 15m sobre arterias secundarias con zonificación AR2B o FM1.',
                score: 95
            }
        ],
        leads: [
            {
                id: 'lead-101',
                code: 'SOL-101',
                date: 'Hoy 14:35',
                name: 'Ing. Marcelo Benítez',
                phone: '+595 981 445 566',
                email: 'mbenitez.invest@gmail.com',
                client_type: 'Inversor',
                request_type: 'info_request',
                request_type_label: 'Más Información',
                property_id: 'prop-101',
                property_title: 'Penthouse Dúplex con Terraza & Piscina',
                property_code: 'PY-101',
                property_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
                property_price: 280000,
                zone: 'Santa Teresa & Eje Corporativo',
                budget_usd: 280000,
                intent: 'Inversión para Renta Temporal (Airbnb)',
                urgency: 'Inmediata (< 30 días)',
                afd: true,
                bank: 'Banco Continental (Pre-Aprobado)',
                score: 96,
                tier: 'Platinum',
                status: 'new_inquiry',
                preferred_date: 'Inmediata',
                message: 'Solicitó dossier de inversión con proyección de retorno Airbnb y planos arquitectónicos.',
                dossier: 'Inversor calificado con fondos propios 55% + línea de crédito activa. Busca unidad amoblada de 2 dormitorios con yield > 11% anual.',
                notes: 'Solicitó simulación comparativa de Cap Rate en Torre Santa Teresa.'
            },
            {
                id: 'lead-102',
                code: 'SOL-102',
                date: 'Hoy 11:15',
                name: 'Dra. Valentina Duarte',
                phone: '+595 982 778 899',
                email: 'valen.duarte@hotmail.com',
                client_type: 'Particular (Familia)',
                request_type: 'visit_request',
                request_type_label: 'Solicita Visita',
                property_id: 'prop-103',
                property_title: 'Casa de Lujo con Quincho & Piscina',
                property_code: 'PY-103',
                property_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
                property_price: 220000,
                zone: 'Barrio Herrera',
                budget_usd: 220000,
                intent: 'Vivienda Propia Familiar',
                urgency: 'Próximos 30-60 días',
                afd: true,
                bank: 'Banco Itaú (Crédito AFD Solicitado)',
                score: 92,
                tier: 'Platinum',
                status: 'visit_scheduled',
                preferred_date: 'Sábado 05/09 - 10:30 hs',
                message: 'Solicitó coordinar visita presencial este sábado por la mañana para recorrer con su familia.',
                dossier: 'Médica cirujana, familia con 2 hijos pequeños. Busca dúplex con patio, quincho y 2 cocheras techadas.',
                notes: 'Visita técnica coordinada para este sábado a las 10:30 hs.'
            },
            {
                id: 'lead-103',
                code: 'SOL-103',
                date: 'Ayer 18:20',
                name: 'Esteban Rossi (Inversor)',
                phone: '+54 9 11 3344 5566',
                email: 'erossi.bue@gmail.com',
                client_type: 'Inversor Internacional',
                request_type: 'contact_request',
                request_type_label: 'Solicita Contacto',
                property_id: 'prop-102',
                property_title: 'Departamento 2D Torre Sky Santa Teresa',
                property_code: 'PY-102',
                property_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
                property_price: 185000,
                zone: 'Santa Teresa / Eje',
                budget_usd: 370000,
                intent: 'Inversión en Pozo (2 Unidades)',
                urgency: 'Inmediata (< 15 días)',
                afd: false,
                bank: 'Fondos Propios Transferencia USD SWIFT',
                score: 98,
                tier: 'Platinum',
                status: 'offer_negotiation',
                preferred_date: 'Llamada telefónica prioritaria',
                message: 'Pide que un asesor lo llame urgente para coordinar condiciones de reserva por 2 departamentos.',
                dossier: 'Empresario argentino diversificando cartera en Paraguay. Pago al contado con descuento por compra en bloque.',
                notes: 'Borrador de reserva y boleto de compraventa enviado.'
            },
            {
                id: 'lead-104',
                code: 'SOL-104',
                date: 'Ayer 15:40',
                name: 'Lic. Sofía Villalba',
                phone: '+595 971 889 900',
                email: 'sofia.villalba@pycorp.com',
                client_type: 'Inversor',
                request_type: 'visit_request',
                request_type_label: 'Solicita Visita',
                property_id: 'prop-104',
                property_title: 'Loft Corporativo Premium',
                property_code: 'PY-104',
                property_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
                property_price: 135000,
                zone: 'Villa Morra',
                budget_usd: 135000,
                intent: 'Renta Corporativa Tradicional',
                urgency: 'Próximos 30 días',
                afd: true,
                bank: 'Sudameris Bank',
                score: 88,
                tier: 'Gold',
                status: 'contacted',
                preferred_date: 'Viernes 04/09 - 16:00 hs',
                message: 'Desea conocer la unidad amoblada para alquiler a consultores de empresas multinacionales.',
                dossier: 'Ejecutiva financiera, busca activos con contrato de alquiler ya activo.',
                notes: 'Contactada por WhatsApp. Se agendó visita para el viernes.'
            },
            {
                id: 'lead-105',
                code: 'SOL-105',
                date: '01/09/2026',
                name: 'Arq. Diego Giménez',
                phone: '+595 983 221 133',
                email: 'dgimenez.arq@gmail.com',
                client_type: 'Desarrollador',
                request_type: 'info_request',
                request_type_label: 'Más Información',
                property_id: 'prop-107',
                property_title: 'Terreno Corporativo Eje Santa Teresa',
                property_code: 'PY-107',
                property_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
                property_price: 480000,
                zone: 'Santa Teresa / Eje',
                budget_usd: 480000,
                intent: 'Desarrollo de Edificio Residencial',
                urgency: 'Próximos 60 días',
                afd: false,
                bank: 'Fondos de Inversión Privados',
                score: 94,
                tier: 'Platinum',
                status: 'new_inquiry',
                preferred_date: 'N/A',
                message: 'Solicitó informe de zonificación según Plan Regulador (AIM 6.0 / AR 5.0) y título de propiedad.',
                dossier: 'Estudio de arquitectura y desarrollo con 3 proyectos terminados en Asunción.',
                notes: 'Pendiente envío de dossier técnico catastral.'
            },
            {
                id: 'lead-106',
                code: 'SOL-106',
                date: '01/09/2026',
                name: 'María Eugenia Franco',
                phone: '+595 986 554 433',
                email: 'meugenia.franco@outlook.com',
                client_type: 'Particular (Primera Vivienda)',
                request_type: 'contact_request',
                request_type_label: 'Solicita Contacto',
                property_id: 'prop-106',
                property_title: 'Dúplex Minimalista a Estrenar',
                property_code: 'PY-106',
                property_image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80',
                property_price: 115000,
                zone: 'Luque (Rakiura)',
                budget_usd: 115000,
                intent: 'Primera Vivienda Propia (AFD)',
                urgency: 'Próximos 30-60 días',
                afd: true,
                bank: 'Banco Itaú / AFD Primera Vivienda',
                score: 85,
                tier: 'Gold',
                status: 'contacted',
                preferred_date: 'Horario de tarde',
                message: 'Pide asesoramiento sobre requisitos y cuota mensual estimada del crédito hipotecario AFD al 6.9%.',
                dossier: 'Contadora, califica perfectamente para cuota corrida AFD con ingresos comprobables.',
                notes: 'Se le compartió el simulador de cuotas AFD.'
            },
            {
                id: 'lead-107',
                code: 'SOL-107',
                date: '31/08/2026',
                name: 'Dr. Rodrigo Centurión',
                phone: '+595 981 777 222',
                email: 'rcenturion.med@gmail.com',
                client_type: 'Particular (Premium)',
                request_type: 'visit_request',
                request_type_label: 'Solicita Visita',
                property_id: 'prop-105',
                property_title: 'Residencia Exclusiva con Muelle',
                property_code: 'PY-105',
                property_image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80',
                property_price: 390000,
                zone: 'San Bernardino',
                budget_usd: 390000,
                intent: 'Casa de Verano & Fin de Semana',
                urgency: 'Próximos 30 días',
                afd: false,
                bank: 'Banco Basa (Fondos Propios)',
                score: 95,
                tier: 'Platinum',
                status: 'visit_scheduled',
                preferred_date: 'Domingo 06/09 - 11:00 hs',
                message: 'Desea visitar la casa de San Bernardino con su familia este domingo.',
                dossier: 'Cliente de alto patrimonio, busca casa amoblada con bajada de lancha al lago.',
                notes: 'Acceso autorizado con la guardia del condominio.'
            },
            {
                id: 'lead-108',
                code: 'SOL-108',
                date: '30/08/2026',
                name: 'Camila Oviedo & Asoc.',
                phone: '+595 972 665 544',
                email: 'coviedo.legal@abogados.com.py',
                client_type: 'Empresa',
                request_type: 'info_request',
                request_type_label: 'Más Información',
                property_id: 'prop-108',
                property_title: 'Piso de Oficinas Sky Corporate',
                property_code: 'PY-108',
                property_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
                property_price: 310000,
                zone: 'Santa Teresa / Eje',
                budget_usd: 310000,
                intent: 'Sede Propia Estudio Jurídico',
                urgency: 'Inmediata',
                afd: false,
                bank: 'Banco Continental',
                score: 97,
                tier: 'Platinum',
                status: 'closed_won',
                preferred_date: 'N/A',
                message: 'Solicitó detalle de expensas y cocheras disponibles para compra de piso completo.',
                dossier: 'Estudio jurídico consolidado. Operación de compraventa cerrada con éxito.',
                notes: 'Venta cerrada y señada. Comisión cobrada.'
            }
        ],
        zoning: [
            {
                code: 'EJE_CORP',
                name: 'Eje Urbano Santa Teresa / Aviadores del Chaco',
                description: 'Corredor corporativo y residencial de alta densidad de Asunción.',
                aim: 6.0,
                ar: 5.0,
                max_height: 120,
                max_floors: 35,
                front_setback: 6.0,
                allowed: 'Torres residenciales, oficinas corporativas, hoteles, gastronomía y centros médicos.'
            },
            {
                code: 'FM1',
                name: 'Franja Mixta 1 (Villa Morra / Mcal. López)',
                description: 'Zona de alta intensidad comercial y residencial multifamiliar.',
                aim: 4.5,
                ar: 3.8,
                max_height: 45,
                max_floors: 15,
                front_setback: 3.0,
                allowed: 'Edificios residenciales hasta 15 pisos, locales comerciales y oficinas.'
            },
            {
                code: 'AR2B',
                name: 'Área Residencial 2B (Barrio Herrera / Ycuá Satí)',
                description: 'Densidad media-alta para edificios residenciales boutique y dúplex.',
                aim: 3.0,
                ar: 2.5,
                max_height: 24,
                max_floors: 8,
                front_setback: 3.0,
                allowed: 'Edificios de departamentos hasta 8 pisos, dúplex y residencias unifamiliares.'
            },
            {
                code: 'AR1A',
                name: 'Área Residencial 1A (Mburucuyá / Carmelitas)',
                description: 'Zona residencial exclusiva de baja a media densidad con retiros verdes.',
                aim: 1.8,
                ar: 1.5,
                max_height: 12,
                max_floors: 4,
                front_setback: 4.0,
                allowed: 'Residencias de lujo, condominios cerrados y edificios boutique de baja altura.'
            }
        ],
        legal: [
            {
                id: 'legal-1',
                title: 'Notificación Formal de Reajuste de Alquiler',
                category: 'Notificaciones Legales',
                law_basis: 'Código Civil Paraguayo Art. 812 y sgtes. / Cláusula de Ajuste IPC BCP',
                description: 'Modelo formal para comunicar el ajuste anual del canon locativo conforme a la inflación oficial del BCP.',
                template: `ASUNCIÓN, [FECHA_ACTUAL]

SEÑOR/A: [NOMBRE_DEL_LOCATARIO]
C.I. N°: [CEDULA_LOCATARIO]
DOMICILIO: [DIRECCION_DEL_INMUEBLE]

REF.: NOTIFICACIÓN DE ACTUALIZACIÓN DEL CANON LOCATIVO

De mi consideración más distinguida:

Por medio de la presente, me dirijo a Ud. en mi carácter de [PROPIETARIO / AGENTE_ADMINISTRADOR] del inmueble individualizado supra, en virtud del Contrato de Locación suscripto en fecha [FECHA_CONTRATO].

Conforme a lo estipulado en la Cláusula [NUMERO_CLAUSULA] del referido contrato y en concordancia con las disposiciones del Código Civil Paraguayo, pongo en su conocimiento que a partir del vencimiento del mes de [MES_VENCIMIENTO] de [AÑO], el canon locativo mensual se actualizará a la suma de:

GUARANÍES / DÓLARES: [NUEVO_MONTO] ([MONTO_EN_LETRAS]).

Dicho reajuste responde a la variación acumulada del Índice de Precios al Consumidor (IPC) emitido por el Banco Central del Paraguay (BCP).

Agradeciendo su constante cumplimiento, le saludo con mi más alta consideración.

_______________________________
[NOMBRE_PROPIETARIO_O_AGENTE]
C.I. / RUC: [NUMERO_DOCUMENTO]
Teléfono / WhatsApp: [TELEFONO_CONTACTO]`
            },
            {
                id: 'legal-2',
                title: 'Recibo Oficial de Seña y Reserva de Inmueble (Arras)',
                category: 'Recibos y Reservas',
                law_basis: 'Código Civil Paraguayo Art. 724 (De las Señas o Arras)',
                description: 'Instrumento legal para asegurar la reserva de compraventa o alquiler con validez legal y cláusula de penalidad por desistimiento.',
                template: `RECIBO OFICIAL DE SEÑA Y RESERVA DE INMUEBLE (ARRAS PENITENCIALES)

En la ciudad de Asunción, República del Paraguay, a los [DIA] días del mes de [MES] del año [AÑO], el/la que suscribe, [NOMBRE_DEL_AGENTE_O_PROPIETARIO], con C.I. N° [NUMERO_CEDULA], en adelante "EL RECEPTOR", declara haber recibido de [NOMBRE_DEL_INTERESADO], con C.I. N° [CEDULA_INTERESADO], en adelante "EL OFERENTE", la suma de:

MONTO: [MONEDA] [MONTO_NUMERICO] ([MONTO_LETRAS]),

en concepto de SEÑA Y RESERVA DE COMPRAVENTA del siguiente inmueble:
- UBICACIÓN: [DIRECCION_DEL_INMUEBLE], Ciudad de [CIUDAD], Barrio [BARRIO].
- FINCA / CTA. CTE. CTRAL.: [DATOS_REGISTRALES_CATASTRO].
- PRECIO TOTAL PACTADO: [PRECIO_TOTAL_USD_O_PYG].

CONDICIONES:
1. PLAZO DE RESERVA: La presente reserva tendrá una vigencia improrrogable de [CANTIDAD_DIAS] días corridos, plazo en el cual deberá suscribirse el Contrato Privado de Compraventa / Escritura Pública.
2. EFECTOS LEGALES (ART. 724 CÓDIGO CIVIL PARAGUAYO): Si el Oferente desistiere de la operación sin justa causa legal, perderá el monto entregado en concepto de seña. Si el Propietario desistiere de vender, deberá restituir la seña con otro tanto igual.

En prueba de conformidad se firman dos ejemplares de un mismo tenor y a un solo efecto.

_______________________________          _______________________________
           EL RECEPTOR                                EL OFERENTE
  C.I. / RUC: [DOCUMENTO_1]                  C.I. / RUC: [DOCUMENTO_2]`
            },
            {
                id: 'legal-3',
                title: 'Aviso Legal de No Renovación de Contrato de Alquiler',
                category: 'Notificaciones Legales',
                law_basis: 'Código Civil Paraguayo Art. 837 (Extinción de la Locación)',
                description: 'Notificación fehaciente de preaviso para la desocupación y restitución del inmueble al término del plazo contractual.',
                template: `ASUNCIÓN, [FECHA_ACTUAL]

SEÑOR/A: [NOMBRE_DEL_LOCATARIO]
C.I. N°: [CEDULA_LOCATARIO]
INMUEBLE: [DIRECCION_DEL_INMUEBLE]

REF.: AVISO FORMAL DE NO RENOVACIÓN Y PREAVISO DE RESTITUCIÓN

De mi mayor consideración:

Me dirijo a Ud. a fin de comunicarle formalmente que, habiéndose fijado el término del Contrato de Locación que nos vincula para el día [FECHA_VENCIMIENTO_CONTRATO], es voluntad de la parte locadora NO RENOVAR el citado contrato.

Por tanto, y en cumplimiento de los plazos de preaviso previstos en el Código Civil Paraguayo, le solicito que al vencimiento del plazo señalado proceda a la entrega del inmueble totalmente desocupado, en las mismas condiciones de aseo y conservación en que fuera recibido, con sus llaves respectivas y libre de toda deuda por servicios públicos (ANDE, ESSAP) y expensas comunes.

A los efectos de coordinar la inspección ocular previa de entrega, le ruego ponerse en contacto con la administración.

Sin otro particular, le saludo atentamente.

_______________________________
[NOMBRE_PROPIETARIO_O_AGENTE]
C.I. N°: [CEDULA_FIRMANTE]
WhatsApp: [TELEFONO_CONTACTO]`
            },
            {
                id: 'legal-4',
                title: 'Contrato de Autorización y Corretaje Inmobiliario Exclusivo',
                category: 'Contratos y Corretaje',
                law_basis: 'Código Civil Paraguayo Art. 936 a 945 (Del Contrato de Corretaje)',
                description: 'Contrato estándar entre la agencia/agente y el propietario que formaliza la comisión de intermediación (3% a 5%) y exclusividad.',
                template: `CONTRATO DE AUTORIZACIÓN Y CORRETAJE INMOBILIARIO EXCLUSIVO

Entre los suscritos:
Por una parte, [NOMBRE_PROPIETARIO], con C.I. N° [CEDULA_PROPIETARIO], domiciliado en [DOMICILIO_PROPIETARIO], en adelante "EL PROPIETARIO"; y por la otra parte, [NOMBRE_AGENTE_O_INMOBILIARIA], con RUC N° [RUC_AGENCIA], en adelante "EL CORREDOR".

Convienen en celebrar el presente Contrato de Corretaje Inmobiliario bajo las siguientes cláusulas:

PRIMERA (OBJETO): El Propietario confiere al Corredor la autorización EXCLUSIVA de intermediación para la [VENTA / ALQUILER] del inmueble ubicado en [DIRECCION_INMUEBLE], Finca N° [NUMERO_FINCA], Cta. Cte. Ctral. N° [NUMERO_CUENTA].

SEGUNDA (PRECIO Y CONDICIONES): El precio base de venta autorizado es de [PRECIO_VENTA_USD] ([DOLARES_LETRAS]), pagaderos conforme a las condiciones acordadas con los compradores interesados.

TERCERA (HONORARIOS DE CORRETAJE): En caso de concretarse la operación, el Propietario abonará al Corredor una comisión equivalente al [PORCENTAJE_COMISION]% ([COMISION_LETRAS] POR CIENTO) + IVA sobre el valor final de la transacción, pagadera al momento de la suscripción del Boleto de Compraventa o Escritura Pública.

CUARTA (PLAZO): La presente exclusividad tendrá un plazo de vigencia de [PLAZO_MESES] meses a partir de la firma.

En prueba de conformidad, se suscriben dos ejemplares en Asunción a los [FECHA_FIRMA].

_______________________________          _______________________________
         EL PROPIETARIO                             EL CORREDOR`
            }
        ]
    };

    /**
     * Inicializar almacenamiento local si no existe
     */
    function initLocalStorage() {
        try {
            const raw = localStorage.getItem(SUPABASE_CONFIG.storageKey);
            if (!raw) {
                localStorage.setItem(SUPABASE_CONFIG.storageKey, JSON.stringify(MOCK_DATA.leads));
            } else {
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed) || parsed.length < 5 || !parsed[0].request_type) {
                    localStorage.setItem(SUPABASE_CONFIG.storageKey, JSON.stringify(MOCK_DATA.leads));
                }
            }
        } catch(e) {
            localStorage.setItem(SUPABASE_CONFIG.storageKey, JSON.stringify(MOCK_DATA.leads));
        }
    }
    initLocalStorage();

    // ============================================================
    // API PÚBLICA B2B
    // ============================================================
    const ZillaB2B = {
        /**
         * Obtener zonas de mercado con precios m2 y Cap Rate
         */
        async getMarketZones() {
            try {
                // Si Supabase está disponible con RLS abierta, consultamos
                const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/b2b_market_zones?select=*`, {
                    headers: {
                        'apikey': SUPABASE_CONFIG.anonKey,
                        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) return data;
                }
            } catch (e) {
                // Fallback inteligente
            }
            return MOCK_DATA.zones;
        },

        /**
         * Obtener tendencias de búsqueda para desarrolladoras
         */
        async getSearchTrends() {
            return MOCK_DATA.trends;
        },

        /**
         * Obtener leads calificados del CRM
         */
        async getCRMLeads() {
            try {
                const stored = localStorage.getItem(SUPABASE_CONFIG.storageKey);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {
                console.warn('Error leyendo CRM leads:', e);
            }
            return MOCK_DATA.leads;
        },

        /**
         * Crear nuevo lead calificado
         */
        async createCRMLead(leadData) {
            const leads = await this.getCRMLeads();
            
            // Algoritmo de Calificación de Lead (Lead Scoring)
            let score = leadData.score || 60;
            if (!leadData.score) {
                if (leadData.budget_usd > 150000) score += 15;
                if ((leadData.urgency || '').includes('30') || (leadData.urgency || '').includes('Inmediata')) score += 15;
                if (leadData.afd || leadData.bank) score += 10;
            }

            let tier = leadData.tier || 'Silver';
            if (score >= 90) tier = 'Platinum';
            else if (score >= 75) tier = 'Gold';

            const newLead = {
                id: leadData.id || ('lead-' + Date.now()),
                code: leadData.code || ('SOL-' + Math.floor(100 + Math.random() * 900)),
                date: leadData.date || ('Hoy ' + new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })),
                name: leadData.name,
                phone: leadData.phone,
                email: leadData.email || 'No especificado',
                client_type: leadData.client_type || 'Particular',
                request_type: leadData.request_type || 'info_request',
                request_type_label: leadData.request_type_label || (leadData.request_type === 'visit_request' ? 'Solicita Visita' : 'Más Información'),
                property_id: leadData.property_id || 'PY-100',
                property_title: leadData.property_title || 'Inmueble Zilla',
                property_code: leadData.property_code || 'PY-100',
                property_image: leadData.property_image || 'img/property-placeholder.jpg',
                property_price: Number(leadData.property_price || leadData.budget_usd) || 120000,
                zone: leadData.zone || 'Asunción',
                budget_usd: Number(leadData.budget_usd) || 120000,
                intent: leadData.intent || 'Interés en Compra',
                urgency: leadData.urgency || 'Inmediata',
                afd: Boolean(leadData.afd),
                bank: leadData.bank || 'Fondos Propios',
                score: Math.min(score, 99),
                tier: tier,
                status: leadData.status || 'new_inquiry',
                preferred_date: leadData.preferred_date || 'A coordinar',
                message: leadData.message || 'Solicitó información desde el portal Zilla.',
                dossier: leadData.dossier || 'Lead registrado desde el portal Zilla.',
                notes: leadData.notes || 'Pendiente de primer contacto.'
            };

            leads.unshift(newLead);
            localStorage.setItem(SUPABASE_CONFIG.storageKey, JSON.stringify(leads));

            // Enviar a Supabase si está disponible
            try {
                fetch(`${SUPABASE_CONFIG.url}/rest/v1/b2b_crm_leads`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_CONFIG.key,
                        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(newLead)
                }).catch(() => {});
            } catch (e) {}

            return newLead;
        },

        /**
         * Actualizar estado del Lead en el Pipeline CRM
         */
        async updateLeadStatus(leadId, newStatus) {
            const leads = await this.getCRMLeads();
            const index = leads.findIndex(l => l.id === leadId);
            if (index !== -1) {
                leads[index].status = newStatus;
                localStorage.setItem(SUPABASE_CONFIG.storageKey, JSON.stringify(leads));
                return leads[index];
            }
            return null;
        },

        /**
         * Obtener plantillas legales para Paraguay
         */
        async getLegalTemplates() {
            return MOCK_DATA.legal;
        },

        /**
         * Obtener zonificación y normativas del Plan Regulador de Asunción
         */
        async getZoningRegulations() {
            return MOCK_DATA.zoning;
        },

        /**
         * Calculadora de Factibilidad de Terrenos según Plan Regulador
         */
        calculateZoningFeasibility(lotAreaM2, zoneCode, lotFrontMeters) {
            const zone = MOCK_DATA.zoning.find(z => z.code === zoneCode) || MOCK_DATA.zoning[0];
            const area = Number(lotAreaM2) || 360;
            const front = Number(lotFrontMeters) || 12;

            const maxBuildableAreaM2 = Math.round(area * zone.aim);
            const residentialAreaM2 = Math.round(area * zone.ar);
            const footprintM2 = Math.round(area * 0.65); // FOS aprox 65%

            const estimatedFloors = Math.min(Math.round(maxBuildableAreaM2 / footprintM2), zone.max_floors);
            const estimatedUnits2D = Math.round((maxBuildableAreaM2 * 0.78) / 75); // Unidades de 75m2 útiles

            return {
                zone: zone,
                lotAreaM2: area,
                lotFrontMeters: front,
                aim_coefficient: zone.aim,
                ar_coefficient: zone.ar,
                maxBuildableAreaM2: maxBuildableAreaM2,
                residentialAreaM2: residentialAreaM2,
                maxHeightMeters: zone.max_height,
                maxFloors: zone.max_floors,
                estimatedFloors: estimatedFloors,
                estimatedUnits2D: estimatedUnits2D,
                frontSetbackMeters: zone.front_setback
            };
        },

        /**
         * Calculadora Comparativa de Rentabilidad (Cap Rate: Tradicional vs Airbnb)
         */
        calculateCapRateROI(propertyPriceUSD, monthlyRentUSD, monthlyExpensesUSD, occupancyRateAirbnbPct) {
            const price = Number(propertyPriceUSD) || 100000;
            const rentMonthly = Number(monthlyRentUSD) || 750;
            const expenses = Number(monthlyExpensesUSD) || 60;
            const occupancy = (Number(occupancyRateAirbnbPct) || 72) / 100;

            // 1. Alquiler Tradicional a Largo Plazo
            const annualGrossTraditional = rentMonthly * 12;
            const annualNetTraditional = (rentMonthly - expenses) * 12;
            const capRateTraditional = ((annualNetTraditional / price) * 100).toFixed(2);
            const paybackYearsTraditional = (price / annualNetTraditional).toFixed(1);

            // 2. Alquiler Temporal / Airbnb (Daily Rate est. 1.8x rentabilidad bruta)
            const dailyRateEstimated = (rentMonthly / 30) * 1.75;
            const bookedDaysYear = Math.round(365 * occupancy);
            const annualGrossAirbnb = dailyRateEstimated * bookedDaysYear;
            const operationalCostsAirbnb = annualGrossAirbnb * 0.22; // 22% comisiones, limpieza, amenidades
            const annualNetAirbnb = annualGrossAirbnb - operationalCostsAirbnb - (expenses * 12);
            const capRateAirbnb = ((annualNetAirbnb / price) * 100).toFixed(2);
            const paybackYearsAirbnb = (price / annualNetAirbnb).toFixed(1);

            return {
                propertyPriceUSD: price,
                traditional: {
                    monthlyRent: rentMonthly,
                    annualGross: annualGrossTraditional,
                    annualNet: annualNetTraditional,
                    capRatePct: Number(capRateTraditional),
                    paybackYears: Number(paybackYearsTraditional)
                },
                airbnb: {
                    dailyRate: Math.round(dailyRateEstimated),
                    bookedDaysYear: bookedDaysYear,
                    annualGross: Math.round(annualGrossAirbnb),
                    annualNet: Math.round(annualNetAirbnb),
                    capRatePct: Number(capRateAirbnb),
                    paybackYears: Number(paybackYearsAirbnb),
                    occupancyPct: Math.round(occupancy * 100)
                }
            };
        },

        /**
         * Generador de Widget Marca Blanca Integrable para Inmobiliarias
         */
        generateEmbedCode(agencyName, primaryColor, widgetType) {
            const color = primaryColor || '#0f766e';
            const name = agencyName || 'Inmobiliaria Verificada';
            
            return `<!-- ZILLA PRO FINANCIAL CALCULATOR WIDGET -->
<div id="zilla-mortgage-widget" data-agency="${name}" data-color="${color}"></div>
<script src="https://chzxwihqmvotxhiztehk.supabase.co/storage/v1/object/public/widgets/zilla-calc.js" async></script>
<noscript><a href="https://zilla.com.py/agentes.html" target="_blank">Calculadora Inmobiliaria Zilla Paraguay</a></noscript>`;
        },

        /**
         * Obtener Reglas de Automatización de CRM
         */
        async getAutomations() {
            let list = [
                {
                    id: 'auto-1',
                    title: 'Auto-Scoring & Enriquecimiento con IA',
                    icon: 'fas fa-robot',
                    trigger: 'Lead ingresa por Web / WhatsApp',
                    action: 'Calcula Score (0-100), clasifica en Platinum/Gold y detecta elegibilidad AFD al instante.',
                    is_active: true,
                    executions: 142
                },
                {
                    id: 'auto-2',
                    title: 'Respuesta Inmediata con Dossier PDF & WhatsApp',
                    icon: 'fab fa-whatsapp',
                    trigger: 'Lead calificado con Score ≥ 90 (Platinum)',
                    action: 'Envía automáticamente el dossier comercial del inmueble y link a recorrido 360° en < 30 segundos.',
                    is_active: true,
                    executions: 98
                },
                {
                    id: 'auto-3',
                    title: 'Seguimiento Inteligente (Smart Follow-Up 48h)',
                    icon: 'fas fa-clock-rotate-left',
                    trigger: 'Lead en etapa "Calificado" sin contacto por 48 horas',
                    action: 'Crea tarea de alta prioridad en el CRM y notifica al agente por WhatsApp con borrador de reactivación.',
                    is_active: true,
                    executions: 64
                },
                {
                    id: 'auto-4',
                    title: 'Derivación a Oficial de Crédito AFD / Bancario',
                    icon: 'fas fa-building-columns',
                    trigger: 'Lead marca interés con crédito hipotecario',
                    action: 'Envía la ficha financiera y checklist de documentos (C.I., IPS, IVA) al oficial de cuenta bancario.',
                    is_active: true,
                    executions: 51
                }
            ];

            const stored = localStorage.getItem('zilla_b2b_automations');
            if (stored) {
                try {
                    list = JSON.parse(stored);
                } catch(e){}
            } else {
                localStorage.setItem('zilla_b2b_automations', JSON.stringify(list));
            }
            return list;
        },

        /**
         * Alternar estado de una automatización
         */
        async toggleAutomation(id) {
            const list = await this.getAutomations();
            const auto = list.find(a => a.id === id);
            if (auto) {
                auto.is_active = !auto.is_active;
                localStorage.setItem('zilla_b2b_automations', JSON.stringify(list));
                return auto;
            }
            return null;
        },

        /**
         * Obtener Registro de Logs de Automatizaciones
         */
        async getAutomationLogs() {
            let logs = [
                {
                    id: 'log-1',
                    time: 'Hace 5 min',
                    event: '🤖 Auto-Scoring IA ejecutado',
                    lead: 'Dr. Carlos Villalba (Presupuesto $180k)',
                    action: 'Calificado como Platinum 94/100 · Asignado a Barrio Herrera · Elegible AFD',
                    status: 'success'
                },
                {
                    id: 'log-2',
                    time: 'Hace 22 min',
                    event: '💬 WhatsApp Dossier disparado',
                    lead: 'Ing. Marcelo Benítez (Santa Teresa)',
                    action: 'Enviado Dossier_Torre_Santa_Teresa.pdf + Simulación Cap Rate',
                    status: 'success'
                },
                {
                    id: 'log-3',
                    time: 'Hace 1 hora',
                    event: '⏰ Alerta de Seguimiento 48h',
                    lead: 'Esteban Rossi (Villa Morra)',
                    action: 'Notificación enviada al agente: "Lead en negociación de 2 unidades en pozo"',
                    status: 'success'
                },
                {
                    id: 'log-4',
                    time: 'Ayer 18:40',
                    event: '🏦 Derivación Crédito AFD',
                    lead: 'Dra. Valentina Duarte',
                    action: 'Documentación remitida a oficial Banco Itaú (Che Róga Porã)',
                    status: 'success'
                }
            ];

            const stored = localStorage.getItem('zilla_b2b_automation_logs');
            if (stored) {
                try {
                    logs = JSON.parse(stored);
                } catch(e){}
            } else {
                localStorage.setItem('zilla_b2b_automation_logs', JSON.stringify(logs));
            }
            return logs;
        },

        /**
         * Simular un Lead Entrante con Inteligencia Artificial
         */
        async simulateIncomingLeadAI() {
            const names = ['Lic. Fernando Ortiz', 'Arq. Gabriela Medina', 'Rodrigo S. (Inversor Chile)', 'Dr. Hugo Cabral'];
            const zones = ['Santa Teresa & Eje Corporativo', 'Villa Morra', 'Barrio Herrera', 'Mburucuyá'];
            const budgets = [140000, 195000, 280000, 320000];
            const intents = ['Inversión Renta Airbnb', 'Vivienda Propia Familiar', 'En Pozo Dúplex 3D'];

            const randomIdx = Math.floor(Math.random() * names.length);
            const simLead = {
                name: names[randomIdx],
                phone: '+595 981 ' + Math.floor(100000 + Math.random() * 900000),
                email: 'contacto.' + names[randomIdx].toLowerCase().replace(/[^a-z]/g, '') + '@gmail.com',
                zone: zones[randomIdx],
                budget_usd: budgets[randomIdx],
                intent: intents[randomIdx % intents.length],
                urgency: 'Inmediata (< 30 días)',
                afd: true,
                bank: 'Banco Continental / Itaú'
            };

            const created = await this.createCRMLead(simLead);

            // Agregar log en tiempo real
            const logs = await this.getAutomationLogs();
            logs.unshift({
                id: 'log-' + Date.now(),
                time: 'Justo ahora',
                event: '⚡ Lead IA Auto-Capturado & Calificado',
                lead: `${created.name} ($${created.budget_usd.toLocaleString()} USD)`,
                action: `Calificado ${created.tier} ${created.score}/100 · Disparado Dossier WhatsApp a ${created.phone}`,
                status: 'success'
            });
            localStorage.setItem('zilla_b2b_automation_logs', JSON.stringify(logs.slice(0, 15)));

            return created;
        }
    };

    window.ZillaB2B = ZillaB2B;
})();

