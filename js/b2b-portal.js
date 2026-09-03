/**
 * ============================================================
 * ZILLA PARAGUAY - CONTROLADOR DEL PORTAL DE AGENTES B2B
 * Manejo de Vistas, Simuladores, CRM, Legal y Generador Dossier
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
    initPortalTabs();
    initExcelListingsManager();
    await initB2BPriceHeatmap();
    await renderMarketInsights();
    await renderSearchTrends();
    await renderCRMLeads();
    await renderLegalRepository();
    initCapRateSimulator();
    initZoningCalculator();
    initWidgetCustomizer();
    initDossierGenerator();
});

/**
 * 1. Control de Pestañas Principales
 */
function initPortalTabs() {
    const tabs = document.querySelectorAll('.b2b-tab-btn');
    const sections = document.querySelectorAll('.b2b-module-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');

            // Scroll suave hacia la sección si está en móvil
            if (window.innerWidth < 768) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/**
 * 2. Renderizar Datos de Mercado e Inteligencia
 */
let allMarketZonesCache = [];
let activeMapInstance = null;
let activeZoneInspectorOpener = null;

/**
 * 2. Renderizar Datos de Mercado e Inteligencia con Filtros en Tiempo Real
 */
async function renderMarketInsights() {
    const container = document.getElementById('market-zones-grid');
    if (!container) return;

    allMarketZonesCache = await window.ZillaB2B.getMarketZones();
    
    let selectedCity = 'all';
    let selectedTier = 'all';
    let searchKeyword = '';

    const searchInput = document.getElementById('zones-search-input');
    const clearSearchBtn = document.getElementById('btn-clear-zone-search');
    const countBadge = document.getElementById('zones-count-badge');
    const cityPills = document.querySelectorAll('.btn-city-pill');
    const tierBtns = document.querySelectorAll('.btn-tier-filter');

    const applyFiltersAndRender = () => {
        let filtered = allMarketZonesCache.filter(zone => {
            // Filtro por Ciudad
            if (selectedCity !== 'all' && zone.city.toLowerCase() !== selectedCity.toLowerCase()) {
                return false;
            }

            // Filtro por Tier / Perfil
            if (selectedTier === 'premium' && zone.avg_price_m2_sale_usd < 1500) return false;
            if (selectedTier === 'mid' && (zone.avg_price_m2_sale_usd < 1000 || zone.avg_price_m2_sale_usd >= 1500)) return false;
            if (selectedTier === 'accessible' && zone.avg_price_m2_sale_usd >= 1000) return false;
            if (selectedTier === 'high_airbnb' && (zone.cap_rate_temporal_airbnb_pct || 0) < 12.0) return false;
            if (selectedTier === 'high_appreciation' && (zone.historical_appreciation_pct || 0) < 9.0) return false;

            // Filtro por Buscador de texto
            if (searchKeyword.trim() !== '') {
                const q = searchKeyword.toLowerCase().trim();
                const matchName = (zone.neighborhood || '').toLowerCase().includes(q);
                const matchCity = (zone.city || '').toLowerCase().includes(q);
                const matchDesc = (zone.description || '').toLowerCase().includes(q);
                if (!matchName && !matchCity && !matchDesc) return false;
            }

            return true;
        });

        // Actualizar contador
        if (countBadge) {
            countBadge.textContent = `Mostrando ${filtered.length} de ${allMarketZonesCache.length} barrios`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="no-zones-found">
                    <i class="fas fa-search-location fa-2x text-slate-400" style="margin-bottom: 8px;"></i>
                    <p style="margin: 0; font-weight: 700; color: #334155;">No se encontraron barrios con los filtros seleccionados.</p>
                    <small style="color: #64748b;">Prueba buscando otra palabra clave o restablece la ciudad.</small>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(zone => {
            const offPlan = zone.price_off_plan_usd || Math.round(zone.avg_price_m2_sale_usd * 0.8);
            const ticket = zone.avg_ticket_usd || Math.round(zone.avg_price_m2_sale_usd * 80);
            const monthlyRent = Math.round((zone.avg_price_m2_rent_usd || 10) * 80);

            return `
                <div class="market-metric-card" id="zone-card-${zone.id}">
                    <div>
                        <div class="metric-card-header">
                            <span class="zone-badge">${zone.city}</span>
                            <span class="demand-pill"><i class="fas fa-fire text-amber-500"></i> Demanda ${zone.demand_index}/100</span>
                        </div>
                        <h3 class="zone-title">${zone.neighborhood}</h3>
                        <span class="zone-city-sub"><i class="fas fa-location-dot text-primary"></i> ${zone.city}, Paraguay</span>
                        <p class="zone-desc" title="${zone.description || ''}">${zone.description || ''}</p>
                        
                        <div class="metric-stats-row">
                            <div class="stat-box">
                                <span class="stat-lbl">Precio Venta m²</span>
                                <strong class="stat-val">$${Number(zone.avg_price_m2_sale_usd).toLocaleString()}</strong>
                            </div>
                            <div class="stat-box">
                                <span class="stat-lbl">En Pozo / Preventa</span>
                                <strong class="stat-val text-emerald-600">$${Number(offPlan).toLocaleString()}</strong>
                            </div>
                        </div>

                        <div class="metric-yield-comparison">
                            <div class="yield-bar-item">
                                <div class="yield-header">
                                    <span>Alquiler Tradicional</span>
                                    <strong>${zone.cap_rate_traditional_pct}% Cap Rate</strong>
                                </div>
                                <div class="yield-progress-track">
                                    <div class="yield-progress-fill traditional" style="width: ${Math.min(zone.cap_rate_traditional_pct * 6.5, 100)}%"></div>
                                </div>
                            </div>

                            <div class="yield-bar-item">
                                <div class="yield-header">
                                    <span>Renta Temporal (Airbnb)</span>
                                    <strong class="text-emerald-600">${zone.cap_rate_temporal_airbnb_pct}% Yield</strong>
                                </div>
                                <div class="yield-progress-track">
                                    <div class="yield-progress-fill airbnb" style="width: ${Math.min(zone.cap_rate_temporal_airbnb_pct * 6.5, 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="zone-card-footer">
                        <span><i class="fas fa-arrow-trend-up text-sky-500"></i> +${zone.historical_appreciation_pct || 8.5}% YoY</span>
                        <div class="zone-footer-btns">
                            <button type="button" class="btn-zone-map-locate" onclick="window.locateZoneOnMap('${zone.id}')" title="Ver en el mapa interactivo">
                                <i class="fas fa-crosshairs"></i> Mapa
                            </button>
                            <button type="button" class="btn-zone-calc" onclick="loadZoneIntoCapRate('${ticket}', '${monthlyRent}')" title="Proyectar en Simulador">
                                <i class="fas fa-calculator"></i> Simular
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    // Eventos de Búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchKeyword = e.target.value;
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchKeyword.length > 0 ? 'block' : 'none';
            }
            applyFiltersAndRender();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchKeyword = '';
            clearSearchBtn.style.display = 'none';
            applyFiltersAndRender();
        });
    }

    // Eventos de Filtro por Ciudad
    cityPills.forEach(pill => {
        pill.addEventListener('click', () => {
            cityPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedCity = pill.dataset.city;
            applyFiltersAndRender();
        });
    });

    // Eventos de Filtro por Tier / Perfil
    tierBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tierBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTier = btn.dataset.tier;
            applyFiltersAndRender();
        });
    });

    // Render Inicial
    applyFiltersAndRender();
}

/**
 * 2.1 Mapa Interactivo de Precios por m² & Cap Rate de Paraguay (Google Maps API + Leaflet Fallback)
 */
let b2bActiveMapEngine = null; // 'google' | 'leaflet'

// Fallback global ante cualquier error de autenticación en Google Maps
window.gm_authFailure = function () {
    console.warn("Google Maps API Key requiere autorización en Google Cloud. Conmutando a motor Leaflet...");
    if (window.switchB2BMapToLeaflet) {
        window.switchB2BMapToLeaflet();
    }
};

async function initB2BPriceHeatmap() {
    const mapContainer = document.getElementById('b2b-price-heatmap-canvas');
    if (!mapContainer) return;

    const zones = await window.ZillaB2B.getMarketZones();
    let currentTileMode = 'light';
    let currentMetric = 'price_sale'; // 'price_sale', 'cap_rate_airbnb', 'cap_rate_trad', 'price_off_plan', 'appreciation'
    let activeZone = null;

    // Helper para formatear el valor del marcador según la métrica activa
    const getMetricLabel = (zone, metric) => {
        switch (metric) {
            case 'cap_rate_airbnb':
                return `${zone.cap_rate_temporal_airbnb_pct}% Yield`;
            case 'cap_rate_trad':
                return `${zone.cap_rate_traditional_pct}% Trad.`;
            case 'price_off_plan':
                return `$${zone.price_off_plan_usd ? zone.price_off_plan_usd.toLocaleString() : Math.round(zone.avg_price_m2_sale_usd * 0.8).toLocaleString()} Pozo`;
            case 'appreciation':
                return `+${zone.historical_appreciation_pct || 8.5}% YoY`;
            case 'price_sale':
            default:
                return `$${Math.round(zone.avg_price_m2_sale_usd).toLocaleString()}/m²`;
        }
    };

    const getTierClass = (zone) => {
        if (zone.category === 'premium_corporate' || zone.category === 'ultra_luxury_gated') return 'tier-premium';
        if (zone.category === 'vacational' || zone.category === 'resort_residential') return 'tier-vacational';
        if (zone.avg_price_m2_sale_usd >= 1400) return 'tier-high';
        return 'tier-accessible';
    };

    // Generador de HTML para el Marcador con Tooltip Flotante del Nombre del Lugar
    const getPillHtml = (zone, label, tier, isSelected) => `
        <div class="b2b-zone-price-pill ${tier} ${isSelected ? 'active' : ''}" id="pill-${zone.id}">
            <span class="pill-dot"></span>
            <span class="pill-text">${label}</span>
            <div class="b2b-pill-hover-tooltip">
                <span class="tooltip-zone-name"><i class="fas fa-location-dot"></i> ${zone.neighborhood}</span>
                <span class="tooltip-city">${zone.city}, Paraguay</span>
            </div>
        </div>
    `;

    // Inspector Drawer Flotante
    const inspectorDrawer = document.getElementById('b2b-zone-inspector');
    const closeInspectorBtn = document.getElementById('btn-close-inspector');
    const loadToSimBtn = document.getElementById('btn-load-zone-to-simulator');

    const openZoneInspector = (zone) => {
        activeZone = zone;
        if (!inspectorDrawer) return;

        const catEl = document.getElementById('insp-category');
        if (catEl) catEl.textContent = (zone.category || 'Residencial').replace(/_/g, ' ').toUpperCase();
        
        const nameEl = document.getElementById('insp-name');
        if (nameEl) nameEl.textContent = zone.neighborhood;
        
        const cityEl = document.getElementById('insp-city');
        if (cityEl) cityEl.innerHTML = `<i class="fas fa-map-marker-alt text-primary"></i> ${zone.city}, Paraguay`;
        
        const priceM2El = document.getElementById('insp-price-m2');
        if (priceM2El) priceM2El.innerHTML = `$${Math.round(zone.avg_price_m2_sale_usd).toLocaleString()} <small>/ m²</small>`;
        
        const pricePygM2 = Math.round(zone.avg_price_m2_sale_usd * 7750);
        const pricePygEl = document.getElementById('insp-price-pyg');
        if (pricePygEl) pricePygEl.textContent = `≈ ₲ ${(pricePygM2 / 1000000).toFixed(1)}M / m²`;
        
        const airbnbEl = document.getElementById('insp-caprate-airbnb');
        if (airbnbEl) airbnbEl.innerHTML = `${zone.cap_rate_temporal_airbnb_pct}% <small>Yield</small>`;
        
        const occEl = document.getElementById('insp-occupancy');
        if (occEl) occEl.textContent = `${zone.avg_occupancy_airbnb_pct || 75}% Ocupación`;
        
        const offPlan = zone.price_off_plan_usd || Math.round(zone.avg_price_m2_sale_usd * 0.8);
        const offplanEl = document.getElementById('insp-price-offplan');
        if (offplanEl) offplanEl.innerHTML = `$${offPlan.toLocaleString()} <small>/ m²</small>`;
        
        const appEl = document.getElementById('insp-appreciation');
        if (appEl) appEl.innerHTML = `+${zone.historical_appreciation_pct || 8.5}% <small>YoY</small>`;
        
        const ticket = zone.avg_ticket_usd || Math.round(zone.avg_price_m2_sale_usd * 85);
        const ticketEl = document.getElementById('insp-ticket');
        if (ticketEl) ticketEl.textContent = `$${ticket.toLocaleString()}`;
        
        const descEl = document.getElementById('insp-description');
        if (descEl) descEl.textContent = zone.description || 'Zona de alta valorización inmobiliaria.';

        inspectorDrawer.style.display = 'block';

        // Resaltar pill en el mapa
        document.querySelectorAll('.b2b-zone-price-pill').forEach(el => el.classList.remove('active'));
        const activePill = document.getElementById(`pill-${zone.id}`);
        if (activePill) activePill.classList.add('active');
    };

    if (closeInspectorBtn) {
        closeInspectorBtn.onclick = () => {
            if (inspectorDrawer) inspectorDrawer.style.display = 'none';
            document.querySelectorAll('.b2b-zone-price-pill').forEach(el => el.classList.remove('active'));
            activeZone = null;
        };
    }

    if (loadToSimBtn) {
        loadToSimBtn.onclick = () => {
            if (!activeZone) return;
            const avgTicket = activeZone.avg_ticket_usd || Math.round(activeZone.avg_price_m2_sale_usd * 80);
            const monthlyRent = Math.round(activeZone.avg_price_m2_rent_usd * 80);
            
            loadZoneIntoCapRate(avgTicket, monthlyRent);
            const simBox = document.getElementById('caprate-calc-box');
            if (simBox) {
                simBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };
    }

    const regionCenters = {
        asuncion: { lat: -25.2890, lng: -57.5750, zoom: 13 },
        gran_asuncion: { lat: -25.3050, lng: -57.5600, zoom: 11 },
        sanber: { lat: -25.2950, lng: -57.2800, zoom: 12 },
        cde: { lat: -25.4850, lng: -54.6300, zoom: 12 },
        encarnacion: { lat: -27.3320, lng: -55.8650, zoom: 13 },
        all: { lat: -24.2000, lng: -56.8000, zoom: 7 }
    };

    // Función para inicializar Leaflet
    const initLeafletEngine = () => {
        if (typeof L === 'undefined') return;
        b2bActiveMapEngine = 'leaflet';
        mapContainer.innerHTML = '';

        const map = L.map('b2b-price-heatmap-canvas', {
            center: [-25.2890, -57.5750],
            zoom: 13,
            zoomControl: true,
            scrollWheelZoom: false
        });

        const lightTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO | Zilla Paraguay',
            maxZoom: 19
        });

        const satelliteTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 18
        });

        if (currentTileMode === 'satellite') {
            satelliteTileLayer.addTo(map);
        } else {
            lightTileLayer.addTo(map);
        }

        const markersLayer = L.layerGroup().addTo(map);

        const renderLeafletMarkers = () => {
            markersLayer.clearLayers();
            zones.forEach(zone => {
                if (!zone.coordinates || zone.coordinates.length < 2) return;
                const label = getMetricLabel(zone, currentMetric);
                const tier = getTierClass(zone);
                const isSelected = activeZone && activeZone.id === zone.id;

                const customIcon = L.divIcon({
                    className: 'b2b-price-pill-marker',
                    html: getPillHtml(zone, label, tier, isSelected),
                    iconSize: [110, 36],
                    iconAnchor: [55, 18]
                });

                const marker = L.marker(zone.coordinates, { icon: customIcon }).addTo(markersLayer);
                marker.on('click', (e) => {
                    if (e && e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                    openZoneInspector(zone);
                });
            });
        };

        // Selector de Métricas
        const metricBtns = document.querySelectorAll('.btn-b2b-metric');
        metricBtns.forEach(btn => {
            btn.onclick = () => {
                metricBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMetric = btn.dataset.metric;
                renderLeafletMarkers();
            };
        });

        // Selector de Regiones
        const regionBtns = document.querySelectorAll('.btn-b2b-region');
        regionBtns.forEach(btn => {
            btn.onclick = () => {
                regionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const target = regionCenters[btn.dataset.region] || regionCenters.asuncion;
                map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
            };
        });

        // Selector de Estilo de Mapa (Light vs Satellite)
        const tileBtns = document.querySelectorAll('.btn-map-tile-style');
        tileBtns.forEach(btn => {
            btn.onclick = () => {
                tileBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tile = btn.dataset.tile;
                if (tile === currentTileMode) return;

                if (tile === 'satellite') {
                    map.removeLayer(lightTileLayer);
                    satelliteTileLayer.addTo(map);
                    currentTileMode = 'satellite';
                } else {
                    map.removeLayer(satelliteTileLayer);
                    lightTileLayer.addTo(map);
                    currentTileMode = 'light';
                }
            };
        });

        renderLeafletMarkers();
        activeMapInstance = map;
        activeZoneInspectorOpener = openZoneInspector;

        const insightsTabBtn = document.querySelector('[data-target="market-insights-tab"]');
        if (insightsTabBtn) {
            insightsTabBtn.addEventListener('click', () => {
                setTimeout(() => map.invalidateSize(), 250);
            });
        }

        if (zones.length > 0) {
            openZoneInspector(zones[0]);
        }
    };

    window.switchB2BMapToLeaflet = () => {
        initLeafletEngine();
    };

    // Intentar inicializar Google Maps si está disponible
    const isGoogleMapsReady = Boolean(window.google && window.google.maps && window.google.maps.Map && window.google.maps.OverlayView);

    if (isGoogleMapsReady) {
        try {
            b2bActiveMapEngine = 'google';
            const modernMapStyles = [
                { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#334155" }] },
                { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }, { "weight": 3 }] },
                { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f1f5f9" }] },
                { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e2f3e8" }] },
                { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
                { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#dbeafe" }] },
                { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f8fafc" }] }
            ];

            const gMap = new google.maps.Map(mapContainer, {
                center: { lat: -25.2890, lng: -57.5750 },
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: modernMapStyles,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false
            });

            let gOverlays = [];

            class ZonePriceOverlay extends google.maps.OverlayView {
                constructor(zone, mapInstance) {
                    super();
                    this.zone = zone;
                    this.position = new google.maps.LatLng(zone.coordinates[0], zone.coordinates[1]);
                    this.div = null;
                    this.setMap(mapInstance);
                }

                onAdd() {
                    this.div = document.createElement('div');
                    this.div.className = 'b2b-price-pill-marker';
                    this.div.style.position = 'absolute';
                    this.div.style.cursor = 'pointer';
                    this.div.style.userSelect = 'none';
                    this.div.style.zIndex = '100';

                    this.updateContent();

                    this.div.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openZoneInspector(this.zone);
                    });

                    const panes = this.getPanes();
                    if (panes && (panes.overlayMouseTarget || panes.overlayLayer)) {
                        (panes.overlayMouseTarget || panes.overlayLayer).appendChild(this.div);
                    }
                }

                draw() {
                    const overlayProjection = this.getProjection();
                    if (!overlayProjection || !this.div) return;

                    const point = overlayProjection.fromLatLngToDivPixel(this.position);
                    if (point) {
                        this.div.style.left = point.x + 'px';
                        this.div.style.top = point.y + 'px';
                        this.div.style.transform = 'translate(-50%, -50%)';
                    }
                }

                updateContent() {
                    if (!this.div) return;
                    const label = getMetricLabel(this.zone, currentMetric);
                    const tier = getTierClass(this.zone);
                    const isSelected = activeZone && activeZone.id === this.zone.id;
                    this.div.innerHTML = getPillHtml(this.zone, label, tier, isSelected);
                }

                onRemove() {
                    if (this.div && this.div.parentNode) {
                        this.div.parentNode.removeChild(this.div);
                        this.div = null;
                    }
                }
            }

            const renderGoogleMarkers = () => {
                gOverlays.forEach(o => o.setMap(null));
                gOverlays = [];

                zones.forEach(zone => {
                    if (!zone.coordinates || zone.coordinates.length < 2) return;
                    const overlay = new ZonePriceOverlay(zone, gMap);
                    gOverlays.push(overlay);
                });
            };

            renderGoogleMarkers();

            // Selector de Métricas
            const metricBtns = document.querySelectorAll('.btn-b2b-metric');
            metricBtns.forEach(btn => {
                btn.onclick = () => {
                    metricBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentMetric = btn.dataset.metric;
                    gOverlays.forEach(o => o.updateContent());
                };
            });

            // Selector de Regiones
            const regionBtns = document.querySelectorAll('.btn-b2b-region');
            regionBtns.forEach(btn => {
                btn.onclick = () => {
                    regionBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const target = regionCenters[btn.dataset.region] || regionCenters.asuncion;
                    gMap.panTo({ lat: target.lat, lng: target.lng });
                    gMap.setZoom(target.zoom);
                };
            });

            // Selector de Estilo de Mapa (Light vs Satellite)
            const tileBtns = document.querySelectorAll('.btn-map-tile-style');
            tileBtns.forEach(btn => {
                btn.onclick = () => {
                    tileBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const tile = btn.dataset.tile;
                    if (tile === 'satellite') {
                        gMap.setMapTypeId(google.maps.MapTypeId.HYBRID);
                        currentTileMode = 'satellite';
                    } else {
                        gMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                        currentTileMode = 'light';
                    }
                };
            });

            activeMapInstance = gMap;
            activeZoneInspectorOpener = openZoneInspector;

            const insightsTabBtn = document.querySelector('[data-target="market-insights-tab"]');
            if (insightsTabBtn) {
                insightsTabBtn.addEventListener('click', () => {
                    setTimeout(() => google.maps.event.trigger(gMap, 'resize'), 250);
                });
            }

            if (zones.length > 0) {
                openZoneInspector(zones[0]);
            }
            return;
        } catch (err) {
            console.warn("Fallo al iniciar Google Maps, cambiando a Leaflet:", err);
            initLeafletEngine();
            return;
        }
    }

    // Inicializar Leaflet por defecto si Google Maps aún no está listo
    initLeafletEngine();
}

/**
 * Localizar y Enfocar Zona en el Mapa desde las Fichas
 */
window.locateZoneOnMap = function (zoneId) {
    const zone = allMarketZonesCache.find(z => z.id === zoneId);
    if (!zone || !activeMapInstance) return;

    // Volar hacia la coordenada de la zona (Google Maps o Leaflet)
    if (zone.coordinates && zone.coordinates.length >= 2) {
        if (b2bActiveMapEngine === 'google' && activeMapInstance.panTo) {
            activeMapInstance.panTo({ lat: zone.coordinates[0], lng: zone.coordinates[1] });
            activeMapInstance.setZoom(14.5);
        } else if (activeMapInstance.flyTo) {
            activeMapInstance.flyTo(zone.coordinates, 14.5, { duration: 1.2 });
        }
    }

    if (activeZoneInspectorOpener) {
        activeZoneInspectorOpener(zone);
    }

    const mapBox = document.getElementById('b2b-price-map-box');
    if (mapBox) {
        mapBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

/**
 * 3. Renderizar Tendencias de Búsqueda para Desarrolladoras
 */
async function renderSearchTrends() {
    const container = document.getElementById('search-trends-grid');
    if (!container) return;

    const trends = await window.ZillaB2B.getSearchTrends();

    container.innerHTML = trends.map(t => `
        <div class="trend-insight-card">
            <div class="trend-badge-row">
                <span class="trend-type-tag"><i class="fas fa-filter"></i> ${t.type}</span>
                <span class="trend-growth"><i class="fas fa-chart-line"></i> ${t.growth_yoy} YoY</span>
            </div>
            <h4 class="trend-title">${t.title}</h4>
            <div class="trend-volume-bar">
                <span class="volume-num">${t.searches_month.toLocaleString()} búsquedas / mes</span>
                <span class="trend-score-pill">Interés Desarrollador: ${t.score}/100</span>
            </div>
            <div class="trend-demographic">
                <strong><i class="fas fa-users text-sky-400"></i> Perfil:</strong> ${t.demographic}
            </div>
            <div class="trend-recommendation">
                <strong><i class="fas fa-lightbulb text-amber-400"></i> Oportunidad En Pozo:</strong>
                <p>${t.recommendation}</p>
            </div>
        </div>
    `).join('');
}

/**
 * 4. Simulador Comparativo Cap Rate & ROI (Tradicional vs Airbnb)
 */
function initCapRateSimulator() {
    const form = document.getElementById('caprate-calc-form');
    if (!form) return;

    const runCalc = () => {
        const price = Number(document.getElementById('calc-prop-price').value) || 120000;
        const rent = Number(document.getElementById('calc-monthly-rent').value) || 850;
        const expenses = Number(document.getElementById('calc-monthly-expenses').value) || 70;
        const occupancy = Number(document.getElementById('calc-airbnb-occupancy').value) || 75;

        document.getElementById('occupancy-val-display').textContent = occupancy + '%';

        const result = window.ZillaB2B.calculateCapRateROI(price, rent, expenses, occupancy);

        // Actualizar UI Tradicional
        document.getElementById('trad-cap-rate').textContent = result.traditional.capRatePct + '%';
        document.getElementById('trad-net-annual').textContent = '$' + result.traditional.annualNet.toLocaleString() + ' / año';
        document.getElementById('trad-payback').textContent = result.traditional.paybackYears + ' años';

        // Actualizar UI Airbnb
        document.getElementById('airbnb-cap-rate').textContent = result.airbnb.capRatePct + '%';
        document.getElementById('airbnb-net-annual').textContent = '$' + result.airbnb.annualNet.toLocaleString() + ' / año';
        document.getElementById('airbnb-daily-rate').textContent = '$' + result.airbnb.dailyRate + ' / noche';
        document.getElementById('airbnb-payback').textContent = result.airbnb.paybackYears + ' años';

        // Diferencial de ganancia
        const diff = result.airbnb.annualNet - result.traditional.annualNet;
        const diffPct = Math.round((diff / result.traditional.annualNet) * 100);
        document.getElementById('yield-boost-display').textContent = `+${diffPct}% (+USD $${diff.toLocaleString()}/año en Renta Temporal)`;
    };

    form.addEventListener('input', runCalc);
    runCalc();
}

function loadZoneIntoCapRate(price, rent) {
    document.getElementById('calc-prop-price').value = Math.round(Number(price));
    document.getElementById('calc-monthly-rent').value = Math.round(Number(rent));
    
    // Cambiar a la pestaña de Insights
    document.querySelector('[data-target="market-insights-tab"]').click();
    
    // Ejecutar cálculo
    const event = new Event('input');
    document.getElementById('caprate-calc-form').dispatchEvent(event);

    document.getElementById('caprate-calc-box').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 5. CRM, Pipeline Kanban & Centro de Automatizaciones
 */
/**
 * 5. CRM, Panel Planilla Excel de Solicitudes & Pipeline
 */
let currentCrmView = 'excel'; // 'excel' | 'kanban'
let currentCrmCurrency = 'USD'; // 'USD' | 'PYG'
const PYG_RATE = 7850;
let selectedCrmIds = new Set();
let currentLeadFilter = { text: '', reqType: 'all', status: 'all', tier: 'all', afdOnly: false };

async function renderCRMLeads() {
    await renderAutomationsPanel();
    await renderAutomationLogs();
    await renderCRMTablesAndKanban();
}

/**
 * Renderizar Planilla Excel de Solicitudes y Tablero Kanban
 */
async function renderCRMTablesAndKanban() {
    const tbody = document.getElementById('crm-excel-tbody');
    const kanbanContainer = document.getElementById('crm-kanban-board');
    
    const allLeads = await window.ZillaB2B.getCRMLeads();
    
    // 1. Filtrar solicitudes
    const filteredLeads = allLeads.filter(l => {
        if (currentLeadFilter.text) {
            const query = currentLeadFilter.text.toLowerCase().trim();
            const matchName = (l.name || '').toLowerCase().includes(query);
            const matchPhone = (l.phone || '').toLowerCase().includes(query);
            const matchEmail = (l.email || '').toLowerCase().includes(query);
            const matchProp = (l.property_title || '').toLowerCase().includes(query);
            const matchCode = (l.code || '').toLowerCase().includes(query) || (l.property_code || '').toLowerCase().includes(query);
            const matchZone = (l.zone || '').toLowerCase().includes(query);
            if (!matchName && !matchPhone && !matchEmail && !matchProp && !matchCode && !matchZone) {
                return false;
            }
        }
        if (currentLeadFilter.reqType !== 'all' && l.request_type !== currentLeadFilter.reqType) {
            return false;
        }
        if (currentLeadFilter.status !== 'all' && (l.status || 'new_inquiry') !== currentLeadFilter.status) {
            return false;
        }
        if (currentLeadFilter.tier !== 'all' && (l.tier || '').toLowerCase() !== currentLeadFilter.tier.toLowerCase()) {
            return false;
        }
        if (currentLeadFilter.afdOnly && !l.afd) {
            return false;
        }
        return true;
    });

    // 2. Calcular KPIs de Solicitudes
    const infoCount = allLeads.filter(l => l.request_type === 'info_request').length;
    const contactCount = allLeads.filter(l => l.request_type === 'contact_request').length;
    const visitsCount = allLeads.filter(l => l.request_type === 'visit_request').length;
    const totalVolumeUSD = allLeads.reduce((acc, curr) => acc + Number(curr.budget_usd || 0), 0);

    const kpiInfoEl = document.getElementById('crm-kpi-info');
    const kpiContactEl = document.getElementById('crm-kpi-contact');
    const kpiVisitsEl = document.getElementById('crm-kpi-visits');
    const kpiVolumeEl = document.getElementById('crm-kpi-volume');

    if (kpiInfoEl) kpiInfoEl.textContent = infoCount;
    if (kpiContactEl) kpiContactEl.textContent = contactCount;
    if (kpiVisitsEl) kpiVisitsEl.textContent = visitsCount;
    if (kpiVolumeEl) {
        if (currentCrmCurrency === 'PYG') {
            kpiVolumeEl.textContent = '₲ ' + (totalVolumeUSD * PYG_RATE).toLocaleString('es-PY');
        } else {
            kpiVolumeEl.textContent = '$' + (totalVolumeUSD / 1000000).toFixed(2) + 'M USD';
        }
    }

    // 3. Renderizar Tabla Planilla Excel
    if (tbody) {
        if (filteredLeads.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" class="text-center" style="padding: 42px 16px; color: #94a3b8;">
                        <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 8px; display: block; color: #cbd5e1;"></i>
                        <strong>No se encontraron solicitudes con los filtros aplicados.</strong>
                        <p style="font-size: 0.78rem; margin-top: 4px;">Prueba ajustando el buscador o restableciendo los filtros.</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = filteredLeads.map(l => {
                const isSelected = selectedCrmIds.has(l.id);
                const phoneClean = (l.phone || '').replace(/[^0-9]/g, '');
                
                // Formateo de precio según moneda
                let priceFormatted = '';
                let subPriceFormatted = '';
                const budgetUSD = Number(l.budget_usd || 0);

                if (currentCrmCurrency === 'PYG') {
                    priceFormatted = '₲ ' + (budgetUSD * PYG_RATE).toLocaleString('es-PY');
                    subPriceFormatted = '$' + budgetUSD.toLocaleString('en-US') + ' USD';
                } else {
                    priceFormatted = '$' + budgetUSD.toLocaleString('en-US') + ' USD';
                    subPriceFormatted = '₲ ' + (budgetUSD * PYG_RATE).toLocaleString('es-PY');
                }

                // Badge de tipo de solicitud
                let reqPill = '';
                if (l.request_type === 'info_request') {
                    reqPill = `<span class="req-type-pill req-info" title="${l.message || 'Solicitud de Información'}"><i class="fas fa-circle-info"></i> Más Información</span>`;
                } else if (l.request_type === 'contact_request') {
                    reqPill = `<span class="req-type-pill req-contact" title="${l.message || 'Solicitud de Contacto'}"><i class="fas fa-phone-volume"></i> Solicita Contacto</span>`;
                } else if (l.request_type === 'visit_request') {
                    reqPill = `<span class="req-type-pill req-visit" title="Fecha preferida: ${l.preferred_date || 'A coordinar'}"><i class="fas fa-calendar-check"></i> Solicita Visita</span>`;
                } else {
                    reqPill = `<span class="req-type-pill req-info"><i class="fas fa-envelope"></i> Consulta Web</span>`;
                }

                // WhatsApp pre-filled text
                const waText = encodeURIComponent(`Hola ${l.name}, te contacto desde Zilla en relación a tu solicitud sobre "${l.property_title || 'el inmueble'}". ¿En qué horario te queda cómodo conversar?`);

                return `
                    <tr class="${isSelected ? 'row-selected' : ''}" id="crm-row-${l.id}">
                        <td class="col-chk text-center">
                            <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelectCRM('${l.id}', this)">
                        </td>
                        <td>
                            <span class="excel-date">${l.date || 'Hoy 14:00'}</span>
                        </td>
                        <td>
                            <span class="excel-code-badge">${l.code || 'SOL-100'}</span>
                        </td>
                        <td>
                            <div class="excel-prop-cell">
                                <div class="lead-mini-avatar">${(l.name || 'C').charAt(0).toUpperCase()}</div>
                                <div class="excel-prop-info">
                                    <a href="javascript:void(0)" onclick="openLeadDetailModal('${l.id}')" class="excel-prop-title" title="Ver ficha completa">${l.name}</a>
                                    <span class="excel-prop-sub">${l.client_type || 'Particular'} · <strong style="color: #0f766e;">${l.zone || 'Asunción'}</strong></span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="excel-contact-col">
                                <a href="https://wa.me/${phoneClean}?text=${waText}" target="_blank" class="excel-wa-link" title="Abrir WhatsApp directo">
                                    <i class="fab fa-whatsapp" style="color: #22c55e;"></i> ${l.phone}
                                </a>
                                <a href="mailto:${l.email}" class="excel-email-link" title="${l.email}">
                                    <i class="far fa-envelope"></i> ${l.email}
                                </a>
                            </div>
                        </td>
                        <td>
                            ${reqPill}
                            ${l.preferred_date && l.request_type === 'visit_request' ? `<div style="font-size: 0.68rem; color: #7e22ce; font-weight: 600; margin-top: 2px;"><i class="far fa-clock"></i> ${l.preferred_date}</div>` : ''}
                        </td>
                        <td>
                            <div class="excel-prop-cell">
                                <img src="${l.property_image || 'img/property-placeholder.jpg'}" class="excel-thumb" alt="${l.property_title || 'Propiedad'}">
                                <div class="excel-prop-info">
                                    <span class="excel-prop-title" title="${l.property_title || 'Inmueble'}">${l.property_title || 'Inmueble Consultante'}</span>
                                    <span class="excel-prop-sub"><span class="excel-badge-type">${l.property_code || 'PY-100'}</span></span>
                                </div>
                            </div>
                        </td>
                        <td class="text-right">
                            <div class="excel-price-val">${priceFormatted}</div>
                            <div class="excel-sub-price">${subPriceFormatted}</div>
                        </td>
                        <td>
                            ${l.afd 
                                ? '<span class="excel-badge-op sale" title="Califica para Préstamo Hipotecario AFD"><i class="fas fa-shield-halved"></i> Apto AFD</span>' 
                                : `<span class="excel-badge-type" title="${l.bank || 'Fondos Propios'}">${(l.bank || 'Contado').split(' ')[0]}</span>`
                            }
                        </td>
                        <td class="text-center">
                            <span class="lead-score-pill ${(l.tier || 'silver').toLowerCase()}" style="font-size: 0.72rem; padding: 3px 7px;">
                                ${l.score || 85} pts
                            </span>
                        </td>
                        <td>
                            <select class="excel-status-select status-${l.status || 'new_inquiry'}" onchange="changeLeadStatusFromTable('${l.id}', this.value)">
                                <option value="new_inquiry" ${(l.status || 'new_inquiry') === 'new_inquiry' ? 'selected' : ''}>📥 Nuevo</option>
                                <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>💬 Contactado</option>
                                <option value="visit_scheduled" ${l.status === 'visit_scheduled' ? 'selected' : ''}>📅 Visita Agendada</option>
                                <option value="offer_negotiation" ${l.status === 'offer_negotiation' ? 'selected' : ''}>🤝 En Negociación</option>
                                <option value="closed_won" ${l.status === 'closed_won' ? 'selected' : ''}>🏆 Ganado / Cerrado</option>
                                <option value="lost" ${l.status === 'lost' ? 'selected' : ''}>⛔ Descartado</option>
                            </select>
                        </td>
                        <td class="text-center">
                            <div class="excel-actions-group">
                                <a href="https://wa.me/${phoneClean}?text=${waText}" target="_blank" class="btn-excel-action" title="Chatear por WhatsApp">
                                    <i class="fab fa-whatsapp" style="color: #22c55e;"></i>
                                </a>
                                <button type="button" class="btn-excel-action" onclick="openLeadDetailModal('${l.id}')" title="Ver Ficha 360°">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button type="button" class="btn-excel-action danger" onclick="deleteCRMLead('${l.id}')" title="Eliminar Solicitud">
                                    <i class="fas fa-trash-can"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // 4. Renderizar Vista Kanban
    if (kanbanContainer) {
        const stages = [
            { key: 'new_inquiry', label: '📥 Nuevos (Sin contactar)', badgeClass: 'stage-new' },
            { key: 'contacted', label: '💬 Contactados', badgeClass: 'stage-qual' },
            { key: 'visit_scheduled', label: '📅 Visitas Agendadas', badgeClass: 'stage-visit' },
            { key: 'offer_negotiation', label: '🤝 En Negociación', badgeClass: 'stage-nego' },
            { key: 'closed_won', label: '🏆 Ganados / Cerrados', badgeClass: 'stage-won' }
        ];

        kanbanContainer.innerHTML = stages.map(st => {
            const stageLeads = filteredLeads.filter(l => (l.status || 'new_inquiry') === st.key);
            const stageSum = stageLeads.reduce((acc, curr) => acc + Number(curr.budget_usd || 0), 0);

            return `
                <div class="kanban-column" ondragover="handleDragOver(event)" ondrop="handleDrop(event, '${st.key}')">
                    <div class="kanban-col-header ${st.badgeClass}">
                        <div class="col-title-row">
                            <h4>${st.label}</h4>
                            <span class="col-count-badge">${stageLeads.length}</span>
                        </div>
                        <span class="col-volume-sub">$${stageSum.toLocaleString()} USD</span>
                    </div>

                    <div class="kanban-cards-stack">
                        ${stageLeads.length === 0 ? '<div class="kanban-empty-slot">Sin solicitudes en esta etapa</div>' : ''}
                        ${stageLeads.map(l => `
                            <div class="kanban-card" draggable="true" ondragstart="handleDragStart(event, '${l.id}')" onclick="openLeadDetailModal('${l.id}')">
                                <div class="kcard-header">
                                    <span class="kcard-name">${l.name}</span>
                                    <span class="lead-score-pill ${(l.tier || 'silver').toLowerCase()}">${l.score || 85} pts</span>
                                </div>
                                <div class="kcard-budget">$${Number(l.budget_usd).toLocaleString()} USD</div>
                                <div class="kcard-tags">
                                    <span class="ktag-zone"><i class="fas fa-location-dot"></i> ${(l.zone || '').split('&')[0]}</span>
                                    ${l.request_type === 'visit_request' ? '<span class="req-type-pill req-visit" style="font-size: 0.62rem;"><i class="fas fa-calendar-check"></i> Visita</span>' : ''}
                                    ${l.request_type === 'info_request' ? '<span class="req-type-pill req-info" style="font-size: 0.62rem;"><i class="fas fa-circle-info"></i> Info</span>' : ''}
                                </div>
                                <div class="kcard-footer">
                                    <span class="kcard-urgency"><i class="far fa-clock"></i> ${(l.urgency || '').split('(')[0]}</span>
                                    <a href="https://wa.me/${(l.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola ' + l.name + ', te contacto desde Zilla.')}" target="_blank" class="kcard-wa-btn" onclick="event.stopPropagation()">
                                        <i class="fab fa-whatsapp"></i>
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 5. Actualizar Contadores del Footer
    const countTotal = document.getElementById('crm-footer-total-count');
    const newCount = document.getElementById('crm-footer-new-count');
    const totalVolume = document.getElementById('crm-footer-total-val');
    const countPill = document.getElementById('crm-count-pill');
    const navBadge = document.getElementById('nav-leads-badge');

    const newInquiriesCount = filteredLeads.filter(l => (l.status || 'new_inquiry') === 'new_inquiry').length;
    const sumFiltered = filteredLeads.reduce((acc, curr) => acc + Number(curr.budget_usd || 0), 0);

    if (countTotal) countTotal.textContent = filteredLeads.length;
    if (newCount) newCount.textContent = newInquiriesCount;
    if (countPill) countPill.textContent = `${filteredLeads.length} solicitudes`;
    if (navBadge) navBadge.textContent = allLeads.length;
    
    if (totalVolume) {
        if (currentCrmCurrency === 'PYG') {
            totalVolume.textContent = '₲ ' + (sumFiltered * PYG_RATE).toLocaleString('es-PY');
        } else {
            totalVolume.textContent = '$' + sumFiltered.toLocaleString('en-US') + ' USD';
        }
    }

    updateCrmBulkBar();
}

/**
 * Conmutador de Moneda en CRM
 */
window.setCRMCurrency = function (curr) {
    currentCrmCurrency = curr;
    const btnUSD = document.getElementById('btn-crm-curr-usd');
    const btnPYG = document.getElementById('btn-crm-curr-pyg');

    if (curr === 'USD') {
        if (btnUSD) btnUSD.classList.add('active');
        if (btnPYG) btnPYG.classList.remove('active');
    } else {
        if (btnUSD) btnUSD.classList.remove('active');
        if (btnPYG) btnPYG.classList.add('active');
    }

    renderCRMTablesAndKanban();
};

/**
 * Alternar entre Vista Planilla Excel y Tablero Kanban
 */
window.switchCrmView = function (view) {
    currentCrmView = view;
    const tableWrap = document.getElementById('crm-excel-table-wrap');
    const kanbanWrap = document.getElementById('crm-kanban-board');
    const btnExcel = document.getElementById('btn-view-excel');
    const btnKanban = document.getElementById('btn-view-kanban');

    if (view === 'excel') {
        if (tableWrap) tableWrap.style.display = 'block';
        if (kanbanWrap) kanbanWrap.style.display = 'none';
        if (btnExcel) btnExcel.classList.add('active');
        if (btnKanban) btnKanban.classList.remove('active');
    } else {
        if (tableWrap) tableWrap.style.display = 'none';
        if (kanbanWrap) kanbanWrap.style.display = 'grid';
        if (btnExcel) btnExcel.classList.remove('active');
        if (btnKanban) btnKanban.classList.add('active');
    }
};

/**
 * Manejo de Filtros en Tiempo Real
 */
window.handleCrmFilterChange = function () {
    const textInput = document.getElementById('crm-search-input');
    const reqTypeSelect = document.getElementById('crm-reqtype-filter');
    const statusSelect = document.getElementById('crm-status-filter');
    const tierSelect = document.getElementById('crm-tier-filter');
    const afdCheck = document.getElementById('crm-afd-filter');

    currentLeadFilter = {
        text: textInput ? textInput.value : '',
        reqType: reqTypeSelect ? reqTypeSelect.value : 'all',
        status: statusSelect ? statusSelect.value : 'all',
        tier: tierSelect ? tierSelect.value : 'all',
        afdOnly: afdCheck ? afdCheck.checked : false
    };

    renderCRMTablesAndKanban();
};

/**
 * Selección individual y masiva en la Planilla
 */
window.toggleSelectCRM = function (leadId, checkbox) {
    if (checkbox.checked) {
        selectedCrmIds.add(leadId);
    } else {
        selectedCrmIds.delete(leadId);
    }
    const row = document.getElementById(`crm-row-${leadId}`);
    if (row) {
        if (checkbox.checked) row.classList.add('row-selected');
        else row.classList.remove('row-selected');
    }
    updateCrmBulkBar();
};

window.toggleSelectAllCRM = async function (masterCheckbox) {
    const leads = await window.ZillaB2B.getCRMLeads();
    if (masterCheckbox.checked) {
        leads.forEach(l => selectedCrmIds.add(l.id));
    } else {
        selectedCrmIds.clear();
    }
    renderCRMTablesAndKanban();
};

window.clearCRMSelection = function () {
    selectedCrmIds.clear();
    const master = document.getElementById('crm-chk-all');
    if (master) master.checked = false;
    renderCRMTablesAndKanban();
};

function updateCrmBulkBar() {
    const bulkBar = document.getElementById('crm-bulk-bar');
    const bulkCount = document.getElementById('crm-bulk-count');
    if (selectedCrmIds.size > 0) {
        if (bulkBar) bulkBar.style.display = 'flex';
        if (bulkCount) bulkCount.textContent = selectedCrmIds.size;
    } else {
        if (bulkBar) bulkBar.style.display = 'none';
    }
}

/**
 * Acciones Masivas
 */
window.bulkSetCrmStatus = async function (newStatus) {
    if (selectedCrmIds.size === 0) return;
    for (const id of selectedCrmIds) {
        await window.ZillaB2B.updateLeadStatus(id, newStatus);
    }
    selectedCrmIds.clear();
    await renderCRMTablesAndKanban();
    if (window.AuthManager && window.AuthManager.showAuthToast) {
        window.AuthManager.showAuthToast('Solicitudes actualizadas con éxito.', 'success');
    }
};

window.bulkDeleteCRM = async function () {
    if (selectedCrmIds.size === 0) return;
    if (!confirm(`¿Estás seguro de eliminar las ${selectedCrmIds.size} solicitudes seleccionadas?`)) return;

    const leads = await window.ZillaB2B.getCRMLeads();
    const updated = leads.filter(l => !selectedCrmIds.has(l.id));
    localStorage.setItem('zilla_b2b_crm_leads', JSON.stringify(updated));
    selectedCrmIds.clear();
    await renderCRMTablesAndKanban();
};

/**
 * Cambio de Estado desde el Selector en Línea
 */
window.changeLeadStatusFromTable = async function (leadId, newStatus) {
    await window.ZillaB2B.updateLeadStatus(leadId, newStatus);
    await renderCRMTablesAndKanban();
    if (window.AuthManager && window.AuthManager.showAuthToast) {
        window.AuthManager.showAuthToast('Estado de la solicitud actualizado.', 'success');
    }
};

/**
 * Eliminar solicitud individual
 */
window.deleteCRMLead = async function (leadId) {
    if (!confirm('¿Deseas eliminar este registro de solicitud del CRM?')) return;
    const leads = await window.ZillaB2B.getCRMLeads();
    const updated = leads.filter(l => l.id !== leadId);
    localStorage.setItem('zilla_b2b_crm_leads', JSON.stringify(updated));
    selectedCrmIds.delete(leadId);
    await renderCRMTablesAndKanban();
};

/**
 * Exportar Solicitudes a Archivo Excel / CSV
 */
window.exportCRMToCSV = async function () {
    const leads = await window.ZillaB2B.getCRMLeads();
    generateAndDownloadCSV(leads, 'Zilla_CRM_Solicitudes_Clientes.csv');
};

window.exportSelectedCRM = async function () {
    if (selectedCrmIds.size === 0) return;
    const leads = await window.ZillaB2B.getCRMLeads();
    const selected = leads.filter(l => selectedCrmIds.has(l.id));
    generateAndDownloadCSV(selected, 'Zilla_CRM_Solicitudes_Seleccionadas.csv');
};

function generateAndDownloadCSV(dataList, fileName) {
    const headers = [
        'ID Solicitud',
        'Fecha y Hora',
        'Nombre Cliente',
        'Tipo de Cliente',
        'Telefono',
        'Email',
        'Tipo de Solicitud',
        'Inmueble Consultante',
        'Codigo Inmueble',
        'Zona / Barrio',
        'Presupuesto USD',
        'Apto AFD',
        'Entidad Bancaria',
        'Score IA',
        'Estado',
        'Fecha Preferida Visita',
        'Mensaje Cliente',
        'Dossier IA',
        'Notas Internas'
    ];

    const rows = dataList.map(l => [
        l.code || l.id,
        l.date || 'N/A',
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${(l.client_type || 'Particular').replace(/"/g, '""')}"`,
        `"${l.phone || ''}"`,
        `"${l.email || ''}"`,
        `"${(l.request_type_label || l.request_type || '').replace(/"/g, '""')}"`,
        `"${(l.property_title || '').replace(/"/g, '""')}"`,
        l.property_code || '',
        `"${(l.zone || '').replace(/"/g, '""')}"`,
        l.budget_usd || 0,
        l.afd ? 'SI' : 'NO',
        `"${(l.bank || '').replace(/"/g, '""')}"`,
        l.score || 0,
        l.status || 'new_inquiry',
        `"${(l.preferred_date || '').replace(/"/g, '""')}"`,
        `"${(l.message || '').replace(/"/g, '""')}"`,
        `"${(l.dossier || '').replace(/"/g, '""')}"`,
        `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Drag and drop handlers para Kanban
 */
let draggedLeadId = null;

window.handleDragStart = function (e, leadId) {
    draggedLeadId = leadId;
    e.dataTransfer.setData('text/plain', leadId);
};

window.handleDragOver = function (e) {
    e.preventDefault();
};

window.handleDrop = async function (e, newStatus) {
    e.preventDefault();
    if (draggedLeadId) {
        await handleLeadStatusChange(draggedLeadId, newStatus);
        draggedLeadId = null;
    }
};

/**
 * Modal Ficha 360° del Lead
 */
window.openLeadDetailModal = async function (leadId) {
    const leads = await window.ZillaB2B.getCRMLeads();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const modal = document.getElementById('lead-360-modal');
    if (!modal) return;

    document.getElementById('m360-name').textContent = lead.name;
    document.getElementById('m360-tier-badge').textContent = `${lead.tier || 'Platino'} · ${lead.score || 95} pts`;
    document.getElementById('m360-tier-badge').className = `lead-score-pill ${(lead.tier || 'platinum').toLowerCase()}`;
    document.getElementById('m360-phone').textContent = lead.phone;
    document.getElementById('m360-email').textContent = lead.email;
    document.getElementById('m360-budget').textContent = `$${Number(lead.budget_usd).toLocaleString()} USD`;
    document.getElementById('m360-urgency').textContent = lead.urgency || lead.preferred_date || 'Inmediata';
    document.getElementById('m360-bank').textContent = lead.bank || 'Fondos Propios';
    
    // Tipo de Solicitud & Inmueble
    const propEl = document.getElementById('m360-property');
    if (propEl) propEl.textContent = `${lead.property_title || 'Inmueble Zilla'} (${lead.property_code || 'PY-100'})`;

    const reqTypeEl = document.getElementById('m360-request-type');
    if (reqTypeEl) {
        if (lead.request_type === 'info_request') {
            reqTypeEl.className = 'req-type-pill req-info';
            reqTypeEl.innerHTML = '<i class="fas fa-circle-info"></i> Más Información';
        } else if (lead.request_type === 'contact_request') {
            reqTypeEl.className = 'req-type-pill req-contact';
            reqTypeEl.innerHTML = '<i class="fas fa-phone-volume"></i> Solicita Contacto';
        } else if (lead.request_type === 'visit_request') {
            reqTypeEl.className = 'req-type-pill req-visit';
            reqTypeEl.innerHTML = `<i class="fas fa-calendar-check"></i> Solicita Visita (${lead.preferred_date || 'A coordinar'})`;
        }
    }

    const afdStatus = document.getElementById('m360-afd-status');
    if (afdStatus) {
        afdStatus.innerHTML = lead.afd 
            ? '<i class="fas fa-check-circle text-emerald-600"></i> Elegible Crédito AFD'
            : '<span class="text-muted">No Aplica AFD (Fondos Propios)</span>';
    }

    const msgEl = document.getElementById('m360-message');
    if (msgEl) {
        msgEl.textContent = lead.message || 'El cliente solicitó asesoramiento personalizado a través del portal Zilla.';
    }

    document.getElementById('m360-dossier-text').textContent = lead.dossier || 'Cliente calificado automáticamente por IA Zilla.';
    document.getElementById('m360-notes').value = lead.notes || '';

    // Enlace de WhatsApp directo
    const waBtn = document.getElementById('m360-wa-btn');
    if (waBtn) {
        const phoneClean = (lead.phone || '').replace(/[^0-9]/g, '');
        waBtn.href = `https://wa.me/${phoneClean}?text=${encodeURIComponent('Hola ' + lead.name + ', te contacto desde Zilla en relación a tu consulta sobre "' + (lead.property_title || 'tu búsqueda de inmuebles') + '".')}`;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeLeadDetailModal = function () {
    const modal = document.getElementById('lead-360-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
};

async function handleLeadStatusChange(leadId, newStatus) {
    await window.ZillaB2B.updateLeadStatus(leadId, newStatus);
    await renderCRMTablesAndKanban();
    if (window.AuthManager && window.AuthManager.showAuthToast) {
        window.AuthManager.showAuthToast('Estado del Lead actualizado en CRM.', 'success');
    }
}

/**
 * 6. Calculadora del Plan Regulador de Asunción (Factibilidad de Terrenos)
 */
function initZoningCalculator() {
    const form = document.getElementById('zoning-calc-form');
    if (!form) return;

    const calculateZoning = () => {
        const area = Number(document.getElementById('zone-lot-area').value) || 450;
        const zoneCode = document.getElementById('zone-select').value || 'AR2B';
        const front = Number(document.getElementById('zone-lot-front').value) || 15;

        const res = window.ZillaB2B.calculateZoningFeasibility(area, zoneCode, front);

        document.getElementById('res-zone-name').textContent = res.zone.name;
        document.getElementById('res-aim-val').textContent = res.aim_coefficient;
        document.getElementById('res-max-buildable').textContent = res.maxBuildableAreaM2.toLocaleString() + ' m²';
        document.getElementById('res-max-height').textContent = res.maxHeightMeters + ' metros (' + res.maxFloors + ' pisos)';
        document.getElementById('res-estimated-floors').textContent = res.estimatedFloors + ' pisos';
        document.getElementById('res-estimated-units').textContent = res.estimatedUnits2D + ' Departamentos (2D)';
        document.getElementById('res-front-setback').textContent = res.frontSetbackMeters + ' metros';
        document.getElementById('res-allowed-uses').textContent = res.zone.allowed;
    };

    form.addEventListener('input', calculateZoning);
    document.getElementById('zone-select').addEventListener('change', calculateZoning);
    calculateZoning();
}

/**
 * 7. Repositorio de Documentos y Modelos Legales de Paraguay
 */
async function renderLegalRepository() {
    const container = document.getElementById('legal-docs-grid');
    if (!container) return;

    const docs = await window.ZillaB2B.getLegalTemplates();

    container.innerHTML = docs.map(d => `
        <div class="legal-doc-card">
            <div class="legal-card-header">
                <span class="legal-category-badge"><i class="fas fa-file-contract"></i> ${d.category}</span>
                <span class="legal-law-basis">${d.law_basis}</span>
            </div>
            <h4 class="legal-doc-title">${d.title}</h4>
            <p class="legal-doc-desc">${d.description}</p>
            <div class="legal-card-actions">
                <button type="button" class="btn-legal-preview" onclick="openLegalPreviewModal('${d.id}')">
                    <i class="fas fa-eye"></i> Ver y Personalizar
                </button>
                <button type="button" class="btn-legal-copy" onclick="copyLegalDocument('${d.id}')">
                    <i class="far fa-copy"></i> Copiar
                </button>
            </div>
        </div>
    `).join('');
}

window.openLegalPreviewModal = async function (docId) {
    const docs = await window.ZillaB2B.getLegalTemplates();
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;

    const modal = document.getElementById('legal-preview-modal');
    const titleEl = document.getElementById('modal-legal-title');
    const contentEl = document.getElementById('modal-legal-content');

    if (titleEl) titleEl.textContent = doc.title;
    if (contentEl) contentEl.value = doc.template;

    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeLegalPreviewModal = function () {
    const modal = document.getElementById('legal-preview-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
};

window.copyLegalDocument = async function (docId) {
    const docs = await window.ZillaB2B.getLegalTemplates();
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;

    navigator.clipboard.writeText(doc.template).then(() => {
        alert('¡Plantilla legal copiada al portapapeles!');
    });
};

/**
 * 8. Generador de Widget Marca Blanca
 */
function initWidgetCustomizer() {
    const agencyInput = document.getElementById('widget-agency-name');
    const colorInput = document.getElementById('widget-color-picker');
    const codeArea = document.getElementById('widget-embed-code');
    const previewContainer = document.getElementById('widget-live-preview');

    if (!agencyInput || !codeArea) return;

    const updateWidget = () => {
        const name = agencyInput.value || 'Tu Inmobiliaria';
        const color = colorInput.value || '#0f766e';
        const code = window.ZillaB2B.generateEmbedCode(name, color, 'mortgage_calculator');
        
        codeArea.value = code;

        // Actualizar preview en vivo
        if (previewContainer) {
            previewContainer.style.borderColor = color;
            const btn = previewContainer.querySelector('.widget-sample-btn');
            if (btn) {
                btn.style.background = color;
            }
            const brand = previewContainer.querySelector('.widget-agency-display');
            if (brand) brand.textContent = name;
        }
    };

    agencyInput.addEventListener('input', updateWidget);
    colorInput.addEventListener('input', updateWidget);
    updateWidget();
}

window.copyWidgetCode = function () {
    const codeArea = document.getElementById('widget-embed-code');
    if (codeArea) {
        codeArea.select();
        navigator.clipboard.writeText(codeArea.value).then(() => {
            alert('¡Código del widget copiado! Pégalo en el HTML de tu sitio web.');
        });
    }
};

/**
 * 9. Generador de Dossier Inmobiliario en PDF
 */
function initDossierGenerator() {
    const form = document.getElementById('dossier-builder-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.print();
    });
}

/**
 * ============================================================
 * 10. GESTIÓN DE PUBLICACIONES - PLANILLA EXCEL PRO
 * ============================================================
 */
let agentListingsData = [];
let excelCurrency = 'USD'; // 'USD' | 'PYG'
let excelSortColumn = 'id';
let excelSortAsc = true;
let selectedListingIds = new Set();

const LISTINGS_STORAGE_KEY = 'zilla_agent_listings_db_v1';

function initExcelListingsManager() {
    loadAgentListings();
    renderExcelListings();
}

function loadAgentListings() {
    const saved = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (saved) {
        try {
            agentListingsData = JSON.parse(saved);
            if (Array.isArray(agentListingsData) && agentListingsData.length > 0) {
                return;
            }
        } catch (e) {
            console.error("Error al leer listings de storage:", e);
        }
    }

    // Inicializar con los datos de window.PROPERTIES_DATA enriquecidos
    const baseProps = (window.PROPERTIES_DATA && window.PROPERTIES_DATA.length > 0)
        ? window.PROPERTIES_DATA
        : [
            { id: "PY-101", title: "Penthouse de Lujo con Terraza y Parrilla Privada", propType: "apartment", operation: "sale", city: "Asunción", neighborhood: "Villa Morra", priceUSD: 345000, totalAreaM2: 280, bedrooms: 3, bathrooms: 4, images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"] },
            { id: "PY-102", title: "Moderna Residencia con Piscina y Quincho Climatizado", propType: "gated_community", operation: "sale", city: "Mariano Roque Alonso", neighborhood: "Surubi'i", priceUSD: 490000, totalAreaM2: 1200, bedrooms: 4, bathrooms: 5, images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80"] },
            { id: "PY-103", title: "Departamento Corporativo en Santa Teresa", propType: "apartment", operation: "sale", city: "Asunción", neighborhood: "Santa Teresa", priceUSD: 210000, totalAreaM2: 110, bedrooms: 2, bathrooms: 2, images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"] },
            { id: "PY-104", title: "Residencia Colonial Restaurada en Las Mercedes", propType: "house", operation: "sale", city: "Asunción", neighborhood: "Las Mercedes", priceUSD: 380000, totalAreaM2: 450, bedrooms: 4, bathrooms: 4, images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"] },
            { id: "PY-105", title: "Piso Exclusivo en Torre Sky con Vistas 360", propType: "apartment", operation: "rent_monthly", city: "Asunción", neighborhood: "Ykua Sati", priceUSD: 2400, totalAreaM2: 220, bedrooms: 3, bathrooms: 3, images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"] },
            { id: "PY-106", title: "Casa de Veraneo con Bajada al Lago Ypacaraí", propType: "house", operation: "sale", city: "San Bernardino", neighborhood: "San Bernardino Centro", priceUSD: 320000, totalAreaM2: 800, bedrooms: 4, bathrooms: 3, images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"] }
        ];

    agentListingsData = baseProps.map((prop, idx) => {
        const pUSD = prop.priceUSD || 180000;
        const totM2 = prop.totalAreaM2 || prop.builtAreaM2 || 120;
        const m2USD = Math.round(pUSD / (totM2 || 1));
        const statusList = ['featured', 'active', 'active', 'active', 'negotiating', 'paused'];
        const stat = statusList[idx % statusList.length];

        return {
            id: prop.id || `PY-${101 + idx}`,
            title: prop.title,
            propType: prop.propType || 'apartment',
            operation: prop.operation || 'sale',
            city: prop.city || 'Asunción',
            neighborhood: prop.neighborhood || 'Villa Morra',
            priceUSD: pUSD,
            pricePYG: prop.pricePYG || Math.round(pUSD * 7950),
            totalAreaM2: totM2,
            propertyM2USD: m2USD,
            bedrooms: prop.bedrooms || 3,
            bathrooms: prop.bathrooms || 2,
            status: stat,
            views: 950 + (idx * 210) + ((idx * 47) % 300),
            leads: 8 + (idx * 3) + ((idx * 7) % 6),
            image: (prop.images && prop.images[0]) || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
            updatedAt: '2026-09-02'
        };
    });

    saveAgentListings();
}

function saveAgentListings() {
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(agentListingsData));
    updateNavListingsCount();
}

function updateNavListingsCount() {
    const badge = document.getElementById('nav-listings-count');
    if (badge) badge.textContent = agentListingsData.length;
}

const typeLabels = {
    apartment: 'Departamento',
    house: 'Casa Residencial',
    gated_community: 'Barrio Cerrado',
    duplex: 'Dúplex',
    land: 'Terreno / Lote',
    commercial: 'Comercial'
};

const opLabels = {
    sale: { text: 'Venta', cls: 'sale' },
    rent_monthly: { text: 'Alq. Mensual', cls: 'rent' },
    rent_temporary: { text: 'Alq. Temporal', cls: 'rent' },
    off_plan: { text: 'En Pozo', cls: 'off_plan' }
};

function renderExcelListings() {
    const tbody = document.getElementById('excel-listings-tbody');
    if (!tbody) return;

    // Filtros
    const searchVal = (document.getElementById('excel-search-input')?.value || '').toLowerCase().trim();
    const statusVal = document.getElementById('excel-filter-status')?.value || 'all';
    const opVal = document.getElementById('excel-filter-operation')?.value || 'all';
    const typeVal = document.getElementById('excel-filter-type')?.value || 'all';

    let filtered = agentListingsData.filter(item => {
        if (statusVal !== 'all' && item.status !== statusVal) return false;
        if (opVal !== 'all' && item.operation !== opVal) return false;
        if (typeVal !== 'all' && item.propType !== typeVal) return false;

        if (searchVal) {
            const matchId = (item.id || '').toLowerCase().includes(searchVal);
            const matchTitle = (item.title || '').toLowerCase().includes(searchVal);
            const matchCity = (item.city || '').toLowerCase().includes(searchVal);
            const matchNeigh = (item.neighborhood || '').toLowerCase().includes(searchVal);
            if (!matchId && !matchTitle && !matchCity && !matchNeigh) return false;
        }
        return true;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
        let valA = a[excelSortColumn];
        let valB = b[excelSortColumn];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return excelSortAsc ? -1 : 1;
        if (valA > valB) return excelSortAsc ? 1 : -1;
        return 0;
    });

    // KPIs & Estadísticas
    const totalCount = agentListingsData.length;
    const activeCount = agentListingsData.filter(i => i.status === 'active' || i.status === 'featured').length;
    const totalValUSD = agentListingsData.reduce((acc, curr) => acc + (curr.priceUSD || 0), 0);
    const totalValPYG = totalValUSD * 7950;
    const totalLeads = agentListingsData.reduce((acc, curr) => acc + (curr.leads || 0), 0);
    const totalViews = agentListingsData.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const avgM2USD = Math.round(agentListingsData.reduce((acc, curr) => acc + (curr.propertyM2USD || 0), 0) / (totalCount || 1));

    // Actualizar elementos DOM de KPI
    const statTotal = document.getElementById('excel-stat-total');
    if (statTotal) statTotal.textContent = `${totalCount} Inmuebles`;

    const statActive = document.getElementById('excel-stat-active');
    if (statActive) statActive.innerHTML = `<i class="fas fa-circle-check"></i> ${activeCount} Activas en Zilla`;

    const statValuation = document.getElementById('excel-stat-valuation');
    if (statValuation) statValuation.textContent = `$${totalValUSD.toLocaleString()} USD`;

    const statValPyg = document.getElementById('excel-stat-val-pyg');
    if (statValPyg) statValPyg.textContent = `≈ ₲ ${(totalValPYG / 1000000).toFixed(0)}M Guaraníes`;

    const statLeads = document.getElementById('excel-stat-leads');
    if (statLeads) statLeads.textContent = `${totalLeads} Leads`;

    const statViews = document.getElementById('excel-stat-views');
    if (statViews) statViews.textContent = totalViews.toLocaleString();

    const itemsCount = document.getElementById('excel-items-count');
    if (itemsCount) itemsCount.textContent = `Mostrando ${filtered.length} de ${totalCount}`;

    const footerAvgM2 = document.getElementById('excel-footer-avg-m2');
    if (footerAvgM2) footerAvgM2.textContent = `$${avgM2USD.toLocaleString()} USD/m²`;

    const footerTotalVal = document.getElementById('excel-footer-total-val');
    if (footerTotalVal) footerTotalVal.textContent = `$${(totalValUSD / 1000000).toFixed(2)}M USD`;

    // Renderizar Filas de la Tabla
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="13" style="text-align: center; padding: 40px; color: #64748b;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 10px; display: block;"></i>
                    <strong>No se encontraron publicaciones con los filtros seleccionados.</strong>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const isSelected = selectedListingIds.has(item.id);
        const typeText = typeLabels[item.propType] || 'Inmueble';
        const opObj = opLabels[item.operation] || { text: 'Venta', cls: 'sale' };

        // Precios
        let mainPrice = '';
        let subPrice = '';
        if (excelCurrency === 'USD') {
            mainPrice = `$${item.priceUSD.toLocaleString()}`;
            subPrice = `₲ ${Math.round(item.priceUSD * 7950).toLocaleString()}`;
        } else {
            mainPrice = `₲ ${Math.round(item.priceUSD * 7950).toLocaleString()}`;
            subPrice = `$${item.priceUSD.toLocaleString()} USD`;
        }

        const m2Val = excelCurrency === 'USD'
            ? `$${Math.round(item.propertyM2USD).toLocaleString()}`
            : `₲ ${Math.round(item.propertyM2USD * 7950).toLocaleString()}`;

        return `
            <tr class="${isSelected ? 'row-selected' : ''}" id="row-${item.id}">
                <td class="col-chk text-center">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleRowSelection('${item.id}', this)">
                </td>
                <td>
                    <span class="excel-code-badge">${item.id}</span>
                </td>
                <td>
                    <div class="excel-prop-cell">
                        <img src="${item.image}" alt="${item.title}" class="excel-thumb" onerror="this.src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=150&q=80'">
                        <div class="excel-prop-info">
                            <a href="propiedad-detalle.html?id=${item.id}" target="_blank" class="excel-prop-title" title="${item.title}">${item.title}</a>
                            <span class="excel-prop-sub"><i class="fas fa-location-dot text-slate-400"></i> ${item.neighborhood}, ${item.city}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span style="font-weight: 600; color: #334155;">${item.neighborhood}</span>
                    <div style="font-size: 0.7rem; color: #64748b;">${item.city}</div>
                </td>
                <td>
                    <span class="excel-badge excel-badge-type">${typeText}</span>
                </td>
                <td>
                    <span class="excel-badge excel-badge-op ${opObj.cls}">${opObj.text}</span>
                </td>
                <td class="text-right">
                    <div class="excel-price-val">${mainPrice}</div>
                    <div class="excel-sub-price">${subPrice}</div>
                </td>
                <td class="text-right">
                    <strong style="font-family: 'Outfit'; font-weight: 700; color: #0f172a;">${item.totalAreaM2} m²</strong>
                </td>
                <td class="text-right">
                    <span style="font-weight: 700; color: #0f766e;">${m2Val}</span>
                </td>
                <td class="text-center">
                    <span style="font-size: 0.76rem; color: #334155; font-weight: 600;">
                        <i class="fas fa-bed text-slate-400"></i> ${item.bedrooms} &nbsp;·&nbsp; <i class="fas fa-bath text-slate-400"></i> ${item.bathrooms}
                    </span>
                </td>
                <td>
                    <select class="excel-status-select status-${item.status}" onchange="updateListingStatus('${item.id}', this.value)">
                        <option value="active" ${item.status === 'active' ? 'selected' : ''}>🟢 Activo</option>
                        <option value="featured" ${item.status === 'featured' ? 'selected' : ''}>⭐ Destacado</option>
                        <option value="negotiating" ${item.status === 'negotiating' ? 'selected' : ''}>🟡 En Negociación</option>
                        <option value="paused" ${item.status === 'paused' ? 'selected' : ''}>⚪ Pausado</option>
                        <option value="sold" ${item.status === 'sold' ? 'selected' : ''}>🔴 Vendido</option>
                    </select>
                </td>
                <td class="text-center">
                    <div class="excel-impact-pill">
                        <span title="Vistas recibidas"><i class="fas fa-eye text-purple-600"></i> ${item.views}</span>
                        <span title="Contactos / Leads"><i class="fas fa-comments text-amber-600"></i> ${item.leads}</span>
                    </div>
                </td>
                <td class="text-center">
                    <div class="excel-actions-group">
                        <a href="propiedad-detalle.html?id=${item.id}" target="_blank" class="btn-excel-action" title="Ver en el Portal Zilla">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button type="button" class="btn-excel-action" onclick="editListing('${item.id}')" title="Editar Inmueble">
                            <i class="fas fa-pencil"></i>
                        </button>
                        <button type="button" class="btn-excel-action" onclick="duplicateListing('${item.id}')" title="Duplicar Ficha">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button type="button" class="btn-excel-action danger" onclick="deleteListing('${item.id}')" title="Eliminar Publicación">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    updateBulkBar();
}

window.filterExcelListings = function () {
    renderExcelListings();
};

window.sortExcelTable = function (column) {
    if (excelSortColumn === column) {
        excelSortAsc = !excelSortAsc;
    } else {
        excelSortColumn = column;
        excelSortAsc = true;
    }
    renderExcelListings();
};

window.setExcelCurrency = function (curr) {
    excelCurrency = curr;
    document.getElementById('btn-excel-usd')?.classList.toggle('active', curr === 'USD');
    document.getElementById('btn-excel-pyg')?.classList.toggle('active', curr === 'PYG');
    renderExcelListings();
};

window.toggleSelectAllExcelListings = function (masterChk) {
    if (masterChk.checked) {
        agentListingsData.forEach(item => selectedListingIds.add(item.id));
    } else {
        selectedListingIds.clear();
    }
    renderExcelListings();
};

window.toggleRowSelection = function (id, chk) {
    if (chk.checked) {
        selectedListingIds.add(id);
    } else {
        selectedListingIds.delete(id);
    }
    updateBulkBar();
    const row = document.getElementById(`row-${id}`);
    if (row) row.classList.toggle('row-selected', chk.checked);
};

function updateBulkBar() {
    const bar = document.getElementById('excel-bulk-bar');
    const countEl = document.getElementById('bulk-selected-count');
    if (!bar) return;

    if (selectedListingIds.size > 0) {
        bar.style.display = 'flex';
        if (countEl) countEl.textContent = `${selectedListingIds.size} inmueble${selectedListingIds.size > 1 ? 's' : ''} seleccionado${selectedListingIds.size > 1 ? 's' : ''}`;
    } else {
        bar.style.display = 'none';
    }
}

window.bulkSetStatus = function (newStatus) {
    if (selectedListingIds.size === 0) return;
    agentListingsData.forEach(item => {
        if (selectedListingIds.has(item.id)) {
            item.status = newStatus;
        }
    });
    saveAgentListings();
    renderExcelListings();
};

window.bulkDeleteSelected = function () {
    if (selectedListingIds.size === 0) return;
    if (!confirm(`¿Estás seguro de eliminar las ${selectedListingIds.size} publicaciones seleccionadas?`)) return;

    agentListingsData = agentListingsData.filter(item => !selectedListingIds.has(item.id));
    selectedListingIds.clear();
    saveAgentListings();
    renderExcelListings();
};

window.updateListingStatus = function (id, newStatus) {
    const item = agentListingsData.find(i => i.id === id);
    if (!item) return;
    item.status = newStatus;
    saveAgentListings();
    renderExcelListings();
};

window.openNewListingModal = function () {
    document.getElementById('modal-listing-title').innerHTML = `<i class="fas fa-home text-emerald-600"></i> Publicar Nuevo Inmueble`;
    document.getElementById('listing-edit-id').value = '';
    document.getElementById('listing-modal-form').reset();
    document.getElementById('listing-modal-b2b').classList.add('active');
};

window.closeListingModal = function () {
    document.getElementById('listing-modal-b2b').classList.remove('active');
};

window.editListing = function (id) {
    const item = agentListingsData.find(i => i.id === id);
    if (!item) return;

    document.getElementById('modal-listing-title').innerHTML = `<i class="fas fa-pencil text-emerald-600"></i> Editar Inmueble ${item.id}`;
    document.getElementById('listing-edit-id').value = item.id;
    document.getElementById('listing-form-title').value = item.title;
    document.getElementById('listing-form-type').value = item.propType;
    document.getElementById('listing-form-operation').value = item.operation;
    document.getElementById('listing-form-city').value = item.city;
    document.getElementById('listing-form-neighborhood').value = item.neighborhood;
    document.getElementById('listing-form-price-usd').value = item.priceUSD;
    document.getElementById('listing-form-area').value = item.totalAreaM2;
    document.getElementById('listing-form-beds').value = item.bedrooms;
    document.getElementById('listing-form-baths').value = item.bathrooms;
    document.getElementById('listing-form-status').value = item.status;
    document.getElementById('listing-form-image').value = item.image;

    document.getElementById('listing-modal-b2b').classList.add('active');
};

window.duplicateListing = function (id) {
    const item = agentListingsData.find(i => i.id === id);
    if (!item) return;

    const newId = `PY-${100 + agentListingsData.length + 1}`;
    const clone = {
        ...item,
        id: newId,
        title: `${item.title} (Copia)`,
        views: 0,
        leads: 0,
        status: 'paused',
        updatedAt: '2026-09-03'
    };

    agentListingsData.unshift(clone);
    saveAgentListings();
    renderExcelListings();
};

window.deleteListing = function (id) {
    if (!confirm(`¿Deseas eliminar la publicación ${id}?`)) return;
    agentListingsData = agentListingsData.filter(i => i.id !== id);
    selectedListingIds.delete(id);
    saveAgentListings();
    renderExcelListings();
};

window.handleSaveListing = function (e) {
    e.preventDefault();
    const editId = document.getElementById('listing-edit-id').value;

    const title = document.getElementById('listing-form-title').value;
    const propType = document.getElementById('listing-form-type').value;
    const operation = document.getElementById('listing-form-operation').value;
    const city = document.getElementById('listing-form-city').value;
    const neighborhood = document.getElementById('listing-form-neighborhood').value;
    const priceUSD = parseFloat(document.getElementById('listing-form-price-usd').value) || 100000;
    const totalAreaM2 = parseFloat(document.getElementById('listing-form-area').value) || 100;
    const bedrooms = parseInt(document.getElementById('listing-form-beds').value, 10) || 1;
    const bathrooms = parseInt(document.getElementById('listing-form-baths').value, 10) || 1;
    const status = document.getElementById('listing-form-status').value;
    const image = document.getElementById('listing-form-image').value || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80';

    const m2USD = Math.round(priceUSD / (totalAreaM2 || 1));

    if (editId) {
        const item = agentListingsData.find(i => i.id === editId);
        if (item) {
            item.title = title;
            item.propType = propType;
            item.operation = operation;
            item.city = city;
            item.neighborhood = neighborhood;
            item.priceUSD = priceUSD;
            item.pricePYG = Math.round(priceUSD * 7950);
            item.totalAreaM2 = totalAreaM2;
            item.propertyM2USD = m2USD;
            item.bedrooms = bedrooms;
            item.bathrooms = bathrooms;
            item.status = status;
            item.image = image;
            item.updatedAt = '2026-09-03';
        }
    } else {
        const newId = `PY-${100 + agentListingsData.length + 1}`;
        const newListing = {
            id: newId,
            title,
            propType,
            operation,
            city,
            neighborhood,
            priceUSD,
            pricePYG: Math.round(priceUSD * 7950),
            totalAreaM2,
            propertyM2USD: m2USD,
            bedrooms,
            bathrooms,
            status,
            views: 1,
            leads: 0,
            image,
            updatedAt: '2026-09-03'
        };
        agentListingsData.unshift(newListing);
    }

    saveAgentListings();
    closeListingModal();
    renderExcelListings();
};

window.exportListingsToCSV = function () {
    if (agentListingsData.length === 0) {
        alert('No hay publicaciones para exportar.');
        return;
    }

    const headers = ['Código ID', 'Título', 'Tipo', 'Operación', 'Ciudad', 'Barrio', 'Precio USD', 'Precio PYG', 'Superficie m2', 'Precio m2 USD', 'Dormitorios', 'Baños', 'Estado', 'Vistas', 'Leads'];
    const rows = agentListingsData.map(item => [
        `"${item.id}"`,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${typeLabels[item.propType] || item.propType}"`,
        `"${opLabels[item.operation]?.text || item.operation}"`,
        `"${item.city}"`,
        `"${item.neighborhood}"`,
        item.priceUSD,
        Math.round(item.priceUSD * 7950),
        item.totalAreaM2,
        item.propertyM2USD,
        item.bedrooms,
        item.bathrooms,
        `"${item.status}"`,
        item.views,
        item.leads
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Zilla_Publicaciones_Agente_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Sincronización en tiempo real de leads entrantes en CRM
window.addEventListener('crmLeadCreated', () => {
    if (typeof renderCRMLeads === 'function') {
        renderCRMLeads();
    }
});

window.addEventListener('storage', (e) => {
    if (e.key === 'zilla_b2b_crm_leads' && typeof renderCRMLeads === 'function') {
        renderCRMLeads();
    }
});

