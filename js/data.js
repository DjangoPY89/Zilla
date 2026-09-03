// Base de datos de propiedades con coordenadas precisas y características específicas para Paraguay
window.PROPERTIES_DATA = [
    {
        id: "PY-101",
        title: "Penthouse de Lujo con Terraza y Parrilla Privada",
        operation: "sale", // sale, rent_monthly, rent_temporary, off_plan
        propType: "apartment", // house, apartment, gated_community, duplex, land, commercial
        tier: "platinum", // platinum, gold, free
        priceUSD: 345000,
        pricePYG: 2742750000,
        currencyPrimary: "USD",
        expensesPYG: 1800000,
        department: "Capital",
        city: "Asunción",
        neighborhood: "Villa Morra",
        address: "Av. Mariscal López c/ Senador Long",
        coordinates: [-25.2938, -57.5794],
        bedrooms: 3,
        bathrooms: 4,
        parkingSpots: 2,
        builtAreaM2: 240,
        totalAreaM2: 280,
        yearBuilt: 2023,
        badge: "Destacado Platino",
        acceptsCheRogaPora: false,
        bankCreditEligible: true,
        amenities: ["quincho", "pool", "garage", "security", "pet_friendly"],
        avgNeighborhoodM2USD: 1450,
        propertyM2USD: 1437,
        advertiser: {
            name: "Carlos Benítez",
            agency: "RE/MAX Central Paraguay",
            type: "franchise_agent",
            verified: true,
            phone: "+595981123456",
            whatsapp: "595981123456",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"
        },
        description: "Exclusivo penthouse con vistas panorámicas 360° al eje corporativo de Asunción. Cuenta con amplia terraza con quincho gourmet integrado, piscina privada, finas terminaciones en lapacho y porcelanato italiano, cocina equipada de alta gama y domótica integral.",
        nearbyPoints: [
            { name: "Shopping Mariscal", distance: "350 m", time: "4 min a pie" },
            { name: "Paseo La Galería", distance: "1.2 km", time: "3 min en auto" },
            { name: "Superseis Los Laureles", distance: "800 m", time: "2 min en auto" },
            { name: "American School of Asuncion (ASA)", distance: "1.8 km", time: "5 min en auto" }
        ],
        images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        id: "PY-102",
        title: "Moderna Residencia con Piscina y Quincho Climatizado",
        operation: "sale",
        propType: "gated_community",
        tier: "platinum",
        priceUSD: 490000,
        pricePYG: 3895500000,
        currencyPrimary: "USD",
        expensesPYG: 1200000,
        department: "Central",
        city: "Mariano Roque Alonso",
        neighborhood: "Surubi'i",
        address: "Condominio Club de Campo Surubi'i - Zona Polo",
        coordinates: [-25.2155, -57.5458],
        bedrooms: 4,
        bathrooms: 5,
        parkingSpots: 4,
        builtAreaM2: 420,
        totalAreaM2: 1200,
        yearBuilt: 2022,
        badge: "Barrio Cerrado VIP",
        acceptsCheRogaPora: false,
        bankCreditEligible: true,
        amenities: ["quincho", "pool", "garage", "security", "pet_friendly"],
        avgNeighborhoodM2USD: 1200,
        propertyM2USD: 1166,
        advertiser: {
            name: "María José Duarte",
            agency: "Century 21 Platinum",
            type: "franchise_agent",
            verified: true,
            phone: "+595982654321",
            whatsapp: "595982654321",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
        },
        description: "Imponente residencia en el exclusivo Club de Campo Surubi'i. Amplio jardín parquizado con piscina sinfín, quincho gourmet con tatakua tradicional y parrilla de acero inoxidable, 4 suites con vestidor, gimnasio y seguridad privada 24/7 con patrullaje.",
        nearbyPoints: [
            { name: "Club Náutico Surubi'i", distance: "400 m", time: "5 min a pie" },
            { name: "Cancha de Polo y Golf", distance: "600 m", time: "2 min en carrito" },
            { name: "Aeropuerto Internacional Silvio Pettirossi", distance: "9 km", time: "12 min en auto" },
            { name: "Shopping Mariano", distance: "6 km", time: "8 min en auto" }
        ],
        images: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        id: "PY-103",
        title: "Departamento Amoblado en Torre de Alta Gama",
        operation: "rent_monthly",
        propType: "apartment",
        tier: "gold",
        priceUSD: 1250,
        pricePYG: 9937500,
        currencyPrimary: "USD",
        expensesPYG: 950000,
        department: "Capital",
        city: "Asunción",
        neighborhood: "Santa Teresa",
        address: "Av. Santa Teresa c/ Herminio Maldonado",
        coordinates: [-25.2861, -57.5623],
        bedrooms: 2,
        bathrooms: 2,
        parkingSpots: 1,
        builtAreaM2: 95,
        totalAreaM2: 110,
        yearBuilt: 2021,
        badge: "Listo para Habitar",
        acceptsCheRogaPora: false,
        bankCreditEligible: false,
        amenities: ["quincho", "pool", "garage", "security"],
        avgNeighborhoodM2USD: 1600,
        propertyM2USD: 13.15, // Renta
        advertiser: {
            name: "Fernando Giménez",
            agency: "Inmobiliaria Asunción Real Estate",
            type: "verified_agency",
            verified: true,
            phone: "+595971987654",
            whatsapp: "595971987654",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
        },
        description: "Exclusiva unidad de 2 dormitorios totalmente amoblada y decorada por diseñador. Balcón con parrilla propia y vista abierta al Paseo La Galería y World Trade Center. Edificio con amenities de primer nivel: piscina en rooftop, gimnasio de última generación, coworking y laundry.",
        nearbyPoints: [
            { name: "Paseo La Galería", distance: "200 m", time: "2 min a pie" },
            { name: "World Trade Center Asunción", distance: "450 m", time: "5 min a pie" },
            { name: "Shopping del Sol", distance: "600 m", time: "7 min a pie" },
            { name: "Parque de la Salud", distance: "1.5 km", time: "4 min en auto" }
        ],
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        id: "PY-104",
        title: "Casa de Verano con Vista al Lago Ypacaraí",
        operation: "rent_temporary",
        propType: "house",
        tier: "platinum",
        priceUSD: 280, // Por noche o fin de semana
        pricePYG: 2226000,
        currencyPrimary: "USD",
        expensesPYG: 0,
        department: "Cordillera",
        city: "San Bernardino",
        neighborhood: "Ciervo Cuá / San Ber Centro",
        address: "Av. Luis F. Vache c/ Mbocayaty",
        coordinates: [-25.3097, -57.2965],
        bedrooms: 4,
        bathrooms: 4,
        parkingSpots: 3,
        builtAreaM2: 310,
        totalAreaM2: 900,
        yearBuilt: 2020,
        badge: "Temporada San Ber",
        acceptsCheRogaPora: false,
        bankCreditEligible: false,
        amenities: ["quincho", "pool", "garage", "security", "pet_friendly"],
        avgNeighborhoodM2USD: 950,
        propertyM2USD: 900,
        advertiser: {
            name: "Rodrigo Alcaraz",
            agency: "Dueño Directo",
            type: "owner_direct",
            verified: true,
            phone: "+595991443322",
            whatsapp: "595991443322",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
        },
        description: "Increíble casa de descanso a solo 300 metros de la costanera y playa de San Bernardino. Piscina iluminada, amplio quincho con parrilla de carbón y tatakua, cancha de volley sobre césped, totalmente climatizada y con grupo electrógeno propio.",
        nearbyPoints: [
            { name: "Playa San Bernardino", distance: "300 m", time: "4 min a pie" },
            { name: "El Germano Rotisería", distance: "800 m", time: "2 min en auto" },
            { name: "Club Náutico San Bernardino", distance: "1.2 km", time: "3 min en auto" },
            { name: "Anfiteatro José Asunción Flores", distance: "2.5 km", time: "6 min en auto" }
        ],
        images: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        id: "PY-105",
        title: "Dúplex a Estrenar - Acepta Che Róga Porã",
        operation: "sale",
        propType: "duplex",
        tier: "gold",
        priceUSD: 52000,
        pricePYG: 413400000,
        currencyPrimary: "PYG",
        expensesPYG: 0,
        department: "Central",
        city: "Luque",
        neighborhood: "Zárate Isla",
        address: "Calle Las Residentas c/ Guaraníes",
        coordinates: [-25.2635, -57.4872],
        bedrooms: 3,
        bathrooms: 2,
        parkingSpots: 2,
        builtAreaM2: 110,
        totalAreaM2: 180,
        yearBuilt: 2024,
        badge: "Acepta Che Róga Porã",
        acceptsCheRogaPora: true,
        bankCreditEligible: true,
        amenities: ["quincho", "garage", "pet_friendly"],
        avgNeighborhoodM2USD: 550,
        propertyM2USD: 472,
        advertiser: {
            name: "Desarrollos Hábitat PY",
            agency: "Constructora e Inmobiliaria Hábitat",
            type: "verified_agency",
            verified: true,
            phone: "+595983778899",
            whatsapp: "595983778899",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        },
        description: "Excelente oportunidad para tu primera vivienda propia. Dúplex moderno de 3 habitaciones (1 en suite), patio trasero con galería y parrilla, estacionamiento para 2 vehículos. Califica al programa de financiamiento gubernamental Che Róga Porã al 6.5% de interés anual.",
        nearbyPoints: [
            { name: "Supermercado Los Jardines Luque", distance: "1.1 km", time: "3 min en auto" },
            { name: "Ruta Luque - San Bernardino", distance: "600 m", time: "1 min en auto" },
            { name: "Hospital General de Luque", distance: "2.8 km", time: "6 min en auto" },
            { name: "Parque Ñu Guasu", distance: "4.5 km", time: "8 min en auto" }
        ],
        images: [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        id: "PY-106",
        title: "Edificio Vanguardia - Proyecto en Pozo con Renta Asegurada",
        operation: "off_plan",
        propType: "apartment",
        tier: "platinum",
        priceUSD: 68500,
        pricePYG: 544575000,
        currencyPrimary: "USD",
        expensesPYG: 350000,
        department: "Capital",
        city: "Asunción",
        neighborhood: "Ycuá Satí",
        address: "Av. Denis Roa c/ Lillo",
        coordinates: [-25.2982, -57.5647],
        bedrooms: 1,
        bathrooms: 1,
        parkingSpots: 1,
        builtAreaM2: 48,
        totalAreaM2: 56,
        yearBuilt: 2025,
        badge: "En Pozo / Entrega 2025",
        acceptsCheRogaPora: false,
        bankCreditEligible: true,
        amenities: ["quincho", "pool", "garage", "security", "pet_friendly"],
        avgNeighborhoodM2USD: 1550,
        propertyM2USD: 1427,
        advertiser: {
            name: "Grupo Petra Desarrollos",
            agency: "Petra Urbana",
            type: "verified_agency",
            verified: true,
            phone: "+595984112233",
            whatsapp: "595984112233",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
        },
        description: "Inversión inteligente en el corazón corporativo y gastronómico de Asunción. Departamentos de 1 dormitorio ideales para renta en Airbnb o alquiler corporativo con rentabilidad estimada anual del 9.5% en USD. Financiación propia durante obra sin intereses.",
        nearbyPoints: [
            { name: "Eje Gastronómico Lillo / Denis Roa", distance: "50 m", time: "1 min a pie" },
            { name: "Paseo La Galería", distance: "1.0 km", time: "3 min en auto" },
            { name: "Sheraton Asunción Hotel", distance: "1.4 km", time: "4 min en auto" },
            { name: "Banco Central del Paraguay (BCP)", distance: "1.9 km", time: "5 min en auto" }
        ],
        images: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        id: "PY-107",
        title: "Hermosa Residencia Clásica en Barrio Recoleta",
        operation: "sale",
        propType: "house",
        tier: "gold",
        priceUSD: 295000,
        pricePYG: 2345250000,
        currencyPrimary: "USD",
        expensesPYG: 0,
        department: "Capital",
        city: "Asunción",
        neighborhood: "Recoleta",
        address: "Dr. Morra c/ Andrade",
        coordinates: [-25.3015, -57.5752],
        bedrooms: 3,
        bathrooms: 3,
        parkingSpots: 2,
        builtAreaM2: 260,
        totalAreaM2: 450,
        yearBuilt: 2018,
        badge: "Dueño Directo",
        acceptsCheRogaPora: false,
        bankCreditEligible: true,
        amenities: ["quincho", "pool", "garage", "pet_friendly"],
        avgNeighborhoodM2USD: 1300,
        propertyM2USD: 1134,
        advertiser: {
            name: "Gustavo Caballero",
            agency: "Dueño Directo",
            type: "owner_direct",
            verified: true,
            phone: "+595981556677",
            whatsapp: "595981556677",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
        },
        description: "Casa residencial con excelente ubicación a pasos de Avda. San Martín y Avda. Boggiani. Planta baja con living comedor social, cocina amoblada, patio con piscina y quincho techado. Planta alta con 3 dormitorios (1 en suite).",
        nearbyPoints: [
            { name: "Colegio San José / Goethe", distance: "1.2 km", time: "4 min en auto" },
            { name: "Supermercado Stock Denis Roa", distance: "400 m", time: "5 min a pie" },
            { name: "Plaza Infante Rivarola", distance: "850 m", time: "10 min a pie" }
        ],
        images: [
            "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        id: "PY-108",
        title: "Lote Premium en Condominio Cerrado Costa del Lago",
        operation: "sale",
        propType: "land",
        tier: "gold",
        priceUSD: 78000,
        pricePYG: 620100000,
        currencyPrimary: "USD",
        expensesPYG: 450000,
        department: "Alto Paraná",
        city: "Hernandarias / CDE",
        neighborhood: "Costa del Lago",
        address: "Supercarretera Itaipú Km 14",
        coordinates: [-25.4124, -54.6432],
        bedrooms: 0,
        bathrooms: 0,
        parkingSpots: 0,
        builtAreaM2: 0,
        totalAreaM2: 1050,
        yearBuilt: 2024,
        badge: "Terreno Frente a Laguna",
        acceptsCheRogaPora: false,
        bankCreditEligible: true,
        amenities: ["pool", "security", "pet_friendly"],
        avgNeighborhoodM2USD: 85,
        propertyM2USD: 74.28,
        advertiser: {
            name: "Larissa Bogado",
            agency: "Raíces Real Estate CDE",
            type: "verified_agency",
            verified: true,
            phone: "+595985334455",
            whatsapp: "595985334455",
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"
        },
        description: "Lote de 1.050 m² en Costa del Lago, el condominio náutico más prestigioso del Alto Paraná con laguna cristalina Crystal Lagoons, club house, canchas de tenis y paddle, y acceso directo al lago Itaipú.",
        nearbyPoints: [
            { name: "Laguna Crystal Lagoons", distance: "150 m", time: "2 min a pie" },
            { name: "Centro de Hernandarias", distance: "8 km", time: "10 min en auto" },
            { name: "Ciudad del Este Centro", distance: "16 km", time: "20 min en auto" }
        ],
        images: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80"
        ]
    }
];

// Sincronización automática de propiedades creadas dinámicamente
(function () {
    try {
        const saved = localStorage.getItem('zilla_custom_properties_v1');
        if (saved) {
            const customProps = JSON.parse(saved);
            if (Array.isArray(customProps)) {
                customProps.forEach(p => {
                    if (!window.PROPERTIES_DATA.some(existing => existing.id === p.id)) {
                        window.PROPERTIES_DATA.unshift(p);
                    }
                });
            }
        }
    } catch (e) {
        console.warn("Could not load custom properties from storage:", e);
    }
})();

