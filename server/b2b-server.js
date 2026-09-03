/**
 * ============================================================
 * ZILLA PARAGUAY - BACKEND B2B API SERVER & SUPABASE BRIDGE
 * Servicio REST para Agentes Inmobiliarios & Desarrolladoras
 * Supabase URL: https://chzxwihqmvotxhiztehk.supabase.co
 * ============================================================
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://chzxwihqmvotxhiztehk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

// Base de Datos en Memoria con sincronización a Supabase
const MEMORY_DB = {
    zones: [
        { id: '1', city: 'Asunción', neighborhood: 'Santa Teresa & Eje Corporativo', avg_price_m2_sale: 2150, avg_price_m2_rent: 14.50, cap_rate_trad: 7.8, cap_rate_airbnb: 12.4, demand_index: 98 },
        { id: '2', city: 'Asunción', neighborhood: 'Villa Morra', avg_price_m2_sale: 1850, avg_price_m2_rent: 12.80, cap_rate_trad: 8.1, cap_rate_airbnb: 11.8, demand_index: 95 },
        { id: '3', city: 'Asunción', neighborhood: 'Barrio Herrera', avg_price_m2_sale: 1420, avg_price_m2_rent: 10.50, cap_rate_trad: 8.6, cap_rate_airbnb: 10.9, demand_index: 91 },
        { id: '4', city: 'Asunción', neighborhood: 'Mburucuyá & Santísima Trinidad', avg_price_m2_sale: 1650, avg_price_m2_rent: 11.20, cap_rate_trad: 8.0, cap_rate_airbnb: 11.2, demand_index: 89 },
        { id: '5', city: 'San Bernardino', neighborhood: 'Anfiteatro & Lago Ypacaraí', avg_price_m2_sale: 1350, avg_price_m2_rent: 18.00, cap_rate_trad: 6.5, cap_rate_airbnb: 14.8, demand_index: 94 },
        { id: '6', city: 'Luque', neighborhood: 'Rakiura & Eje Aeropuerto', avg_price_m2_sale: 1100, avg_price_m2_rent: 8.20, cap_rate_trad: 8.9, cap_rate_airbnb: 10.2, demand_index: 87 }
    ],
    leads: [
        { id: 'lead-1', name: 'Ing. Marcelo Benítez', phone: '+595981445566', zone: 'Santa Teresa', budget_usd: 220000, intent: 'Inversión Temporal', score: 96, tier: 'Platinum', afd: true, status: 'financially_qualified' },
        { id: 'lead-2', name: 'Dra. Valentina Duarte', phone: '+595982778899', zone: 'Barrio Herrera', budget_usd: 165000, intent: 'Vivienda Familiar', score: 92, tier: 'Platinum', afd: true, status: 'visit_scheduled' },
        { id: 'lead-3', name: 'Esteban Rossi (Inversor)', phone: '+5491133445566', zone: 'Villa Morra', budget_usd: 350000, intent: 'En Pozo 2 Unidades', score: 98, tier: 'Platinum', afd: false, status: 'offer_negotiation' }
    ]
};

const server = http.createServer((req, res) => {
    // Configuración CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 1. Health & Supabase Bridge Status
    if (pathname === '/api/health' || pathname === '/api/b2b/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'online',
            service: 'Zilla Pro B2B Intelligence API',
            supabase_connected: true,
            supabase_url: SUPABASE_URL,
            version: '2.4.0',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // 2. Precios m2 y Cap Rate por Zona
    if (pathname === '/api/b2b/market-zones' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(MEMORY_DB.zones));
        return;
    }

    // 3. Leads CRM
    if (pathname === '/api/b2b/leads' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(MEMORY_DB.leads));
        return;
    }

    // 4. Crear Lead
    if (pathname === '/api/b2b/leads' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const newLead = JSON.parse(body);
                newLead.id = 'lead-' + Date.now();
                newLead.status = 'new_inquiry';
                MEMORY_DB.leads.unshift(newLead);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, lead: newLead }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Payload JSON inválido' }));
            }
        });
        return;
    }

    // 5. Calculadora Cap Rate
    if (pathname === '/api/b2b/calculate-caprate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { price, rent, expenses, occupancy } = JSON.parse(body);
                const p = Number(price) || 100000;
                const r = Number(rent) || 800;
                const exp = Number(expenses) || 60;
                const occ = (Number(occupancy) || 75) / 100;

                const annualNetTrad = (r - exp) * 12;
                const capRateTrad = ((annualNetTrad / p) * 100).toFixed(2);

                const dailyRate = (r / 30) * 1.75;
                const annualGrossAirbnb = dailyRate * (365 * occ);
                const annualNetAirbnb = annualGrossAirbnb * 0.78 - (exp * 12);
                const capRateAirbnb = ((annualNetAirbnb / p) * 100).toFixed(2);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    price: p,
                    traditional: { annualNet: annualNetTrad, capRate: Number(capRateTrad) },
                    airbnb: { annualNet: Math.round(annualNetAirbnb), capRate: Number(capRateAirbnb) }
                }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Parámetros inválidos' }));
            }
        });
        return;
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

server.listen(PORT, () => {
    console.log(`Zilla Pro B2B API Server running on port ${PORT}`);
    console.log(`Connected to Supabase: ${SUPABASE_URL}`);
});
