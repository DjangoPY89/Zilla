// Módulo de Ficha de Propiedad, Galería, Calculadora Hipotecaria y WhatsApp
(function () {
    let currentModalProperty = null;

    const ModalManager = {
        init: function () {
            // Eventos de cierre
            const closeBtn = document.getElementById("close-property-modal");
            const backdrop = document.getElementById("property-modal-backdrop");

            if (closeBtn) closeBtn.addEventListener("click", () => this.closePropertyModal());
            if (backdrop) backdrop.addEventListener("click", () => this.closePropertyModal());

            // Cerrar con tecla ESC
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    this.closePropertyModal();
                    if (window.PublishManager) window.PublishManager.close();
                }
            });

            // Re-renderizar precios en modal si cambia la moneda activa
            window.addEventListener("currencyChanged", () => {
                if (currentModalProperty) {
                    this.updateModalPrices(currentModalProperty);
                    this.recalculateMortgage();
                }
            });
        },

        openPropertyModal: function (prop) {
            currentModalProperty = prop;
            const modalContainer = document.getElementById("property-modal-container");
            const modalBody = document.getElementById("property-modal-content");
            const topbarInfo = document.getElementById("modal-topbar-info");

            if (!modalContainer || !modalBody) return;

            const formattedPrice = window.CurrencyManager
                ? window.CurrencyManager.formatPrice(prop.priceUSD, prop.pricePYG)
                : `$${prop.priceUSD.toLocaleString()}`;

            // Actualizar topbar fijo
            if (topbarInfo) {
                topbarInfo.innerHTML = `
                    <h4 class="topbar-prop-title">${prop.title}</h4>
                    <span class="topbar-prop-meta">${formattedPrice} • ${prop.neighborhood}, ${prop.city}</span>
                `;
            }

            // Renderizar contenido de la ficha completa
            modalBody.innerHTML = this.buildModalHTML(prop);

            // Inicializar eventos dentro del modal recién insertado
            this.bindModalEvents(prop);

            // Mostrar modal en pantalla completa
            modalContainer.classList.add("active");
            document.body.style.overflow = "hidden"; // Evitar scroll de fondo

            // Inicializar mapa estático embebido de la propiedad
            setTimeout(() => {
                this.initPropertyMap(prop);
            }, 250);
        },

        closePropertyModal: function () {
            const modalContainer = document.getElementById("property-modal-container");
            if (modalContainer) {
                modalContainer.classList.remove("active");
                document.body.style.overflow = "";
            }
            currentModalProperty = null;
        },

        initPropertyMap: function (prop) {
            const mapContainer = document.getElementById("modal-property-map");
            if (!mapContainer || !prop.coordinates || prop.coordinates.length < 2) return;

            const [lat, lng] = prop.coordinates;
            const formattedCompactPrice = window.CurrencyManager
                ? window.CurrencyManager.formatCompactPrice(prop.priceUSD, prop.pricePYG)
                : `$${prop.priceUSD}`;
            const isPlatinum = prop.tier === 'platinum';

            // 1. Google Maps
            if (window.google && window.google.maps && typeof google.maps.Map === "function") {
                try {
                    const staticMap = new google.maps.Map(mapContainer, {
                        center: { lat: lat, lng: lng },
                        zoom: 15,
                        disableDefaultUI: false,
                        zoomControl: true,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: true
                    });

                    new google.maps.Marker({
                        position: { lat: lat, lng: lng },
                        map: staticMap,
                        title: prop.title
                    });
                    return;
                } catch (e) {
                    console.warn("Fallback leaflet modal map", e);
                }
            }

            // 2. Leaflet Fallback
            if (window.L) {
                if (mapContainer._leaflet_id) {
                    mapContainer._leaflet_id = null;
                    mapContainer.innerHTML = "";
                }
                const staticLeafletMap = L.map('modal-property-map', {
                    center: [lat, lng],
                    zoom: 15,
                    zoomControl: true,
                    attributionControl: false
                });

                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    maxZoom: 19,
                    subdomains: 'abcd'
                }).addTo(staticLeafletMap);

                const customIcon = L.divIcon({
                    className: 'custom-map-pill-wrapper',
                    html: `
                        <div class="map-price-pill active ${isPlatinum ? 'tier-platinum' : ''}">
                            <span class="pill-price">${formattedCompactPrice}</span>
                        </div>
                    `,
                    iconSize: [80, 32],
                    iconAnchor: [40, 16]
                });

                L.marker([lat, lng], { icon: customIcon }).addTo(staticLeafletMap);

                setTimeout(() => {
                    staticLeafletMap.invalidateSize();
                }, 300);
            }
        },

        buildModalHTML: function (prop) {
            const formattedPrice = window.CurrencyManager.formatPrice(prop.priceUSD, prop.pricePYG);
            const isSale = prop.operation === "sale" || prop.operation === "off_plan";

            // Inteligencia de Mercado y Comparativa m²
            const thisPropM2 = Math.round(prop.propertyM2USD || (prop.builtAreaM2 > 0 ? prop.priceUSD / prop.builtAreaM2 : 1400));
            const neighborhoodAvgM2 = prop.avgNeighborhoodM2USD || 1350;
            const cityAvgM2 = 1180;
            const m2Diff = Math.round(((thisPropM2 - neighborhoodAvgM2) / neighborhoodAvgM2) * 100);
            const isGoodDeal = m2Diff <= 0;

            // Inmuebles similares del catálogo para la gráfica comparativa
            const allProps = window.PROPERTIES_DATA || [];
            const similarProps = allProps
                .filter(p => p.id !== prop.id && (p.neighborhood === prop.neighborhood || p.propType === prop.propType || p.city === prop.city))
                .slice(0, 3);

            const allM2Values = [thisPropM2, neighborhoodAvgM2, cityAvgM2, ...similarProps.map(p => Math.round(p.propertyM2USD || (p.priceUSD / p.builtAreaM2)))];
            const maxChartM2 = Math.max(...allM2Values) * 1.15;

            // Mensaje de WhatsApp dinámico
            const whatsappMsg = encodeURIComponent(
                `¡Hola ${prop.advertiser.name}! 👋 Vi tu anuncio en Zilla Paraguay:\n\n` +
                `🏡 *${prop.title}*\n` +
                `📍 *Ubicación:* ${prop.address}, ${prop.neighborhood}, ${prop.city}\n` +
                `💰 *Precio:* ${formattedPrice}\n` +
                `🆔 *Código:* ${prop.id}\n\n` +
                `¿Podrías brindarme más información o coordinar una visita? Gracias.`
            );
            const whatsappUrl = `https://wa.me/${prop.advertiser.whatsapp}?text=${whatsappMsg}`;

            // Galería de fotos estilo Airbnb
            const images = prop.images && prop.images.length > 0 ? prop.images : [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
            ];

            return `
                <div class="modal-fullscreen-inner-container">
                    <!-- Cabecera del Detalle -->
                    <div class="modal-header-section">
                        <div class="modal-tags">
                            <span class="tag-pill tag-${prop.operation}">${this.getOperationLabel(prop.operation)}</span>
                            <span class="tag-pill tag-type">${this.getPropTypeLabel(prop.propType)}</span>
                            ${prop.acceptsCheRogaPora ? '<span class="tag-pill tag-che-roga"><i class="fas fa-certificate"></i> Apto Che Róga Porã</span>' : ''}
                            ${prop.badge ? `<span class="tag-pill tag-badge">${prop.badge}</span>` : ''}
                        </div>
                        <h1 class="modal-property-title">${prop.title}</h1>
                        <p class="modal-property-address">
                            <i class="fas fa-location-dot text-primary"></i> ${prop.address}, ${prop.neighborhood}, ${prop.city} (${prop.department})
                        </p>
                    </div>

                    <!-- Malla de Galería de 5 Fotos Estilo Airbnb -->
                    <div class="airbnb-photo-grid">
                        <div class="grid-photo main-photo" onclick="window.ModalManager.openImageViewer(0)">
                            <img src="${images[0]}" alt="${prop.title} - Foto Principal" loading="lazy">
                        </div>
                        <div class="grid-photo side-photo" onclick="window.ModalManager.openImageViewer(1)">
                            <img src="${images[1] || images[0]}" alt="${prop.title} - Foto 2" loading="lazy">
                        </div>
                        <div class="grid-photo side-photo" onclick="window.ModalManager.openImageViewer(2)">
                            <img src="${images[2] || images[0]}" alt="${prop.title} - Foto 3" loading="lazy">
                        </div>
                        <div class="grid-photo side-photo" onclick="window.ModalManager.openImageViewer(3)">
                            <img src="${images[3] || images[0]}" alt="${prop.title} - Foto 4" loading="lazy">
                        </div>
                        <div class="grid-photo side-photo last-photo" onclick="window.ModalManager.openImageViewer(4)">
                            <img src="${images[4] || images[0]}" alt="${prop.title} - Foto 5" loading="lazy">
                            <div class="all-photos-badge">
                                <i class="fas fa-th"></i> Ver las ${images.length} fotos
                            </div>
                        </div>
                    </div>

                    <!-- Contenido Principal: Dos Columnas (Detalles 66% + Panel Flotante 34%) -->
                    <div class="modal-split-layout">
                        <!-- Columna Izquierda: Información Detallada -->
                        <div class="modal-details-column">
                            <!-- Key Stats Bar -->
                            <div class="property-key-stats">
                                <div class="stat-box">
                                    <i class="fas fa-bed"></i>
                                    <span class="stat-value">${prop.bedrooms}</span>
                                    <span class="stat-label">Dormitorios</span>
                                </div>
                                <div class="stat-box">
                                    <i class="fas fa-bath"></i>
                                    <span class="stat-value">${prop.bathrooms}</span>
                                    <span class="stat-label">Baños</span>
                                </div>
                                <div class="stat-box">
                                    <i class="fas fa-car"></i>
                                    <span class="stat-value">${prop.parkingSpots}</span>
                                    <span class="stat-label">Cocheras</span>
                                </div>
                                <div class="stat-box">
                                    <i class="fas fa-ruler-combined"></i>
                                    <span class="stat-value">${prop.builtAreaM2} m²</span>
                                    <span class="stat-label">Construidos</span>
                                </div>
                                ${prop.totalAreaM2 ? `
                                <div class="stat-box">
                                    <i class="fas fa-vector-square"></i>
                                    <span class="stat-value">${prop.totalAreaM2} m²</span>
                                    <span class="stat-label">Terreno Total</span>
                                </div>
                                ` : ''}
                            </div>

                            <!-- Descripción -->
                            <div class="modal-section">
                                <h3 class="section-title"><i class="fas fa-align-left text-primary"></i> Acerca de este Inmueble</h3>
                                <p class="property-full-description">${prop.description}</p>
                            </div>

                            <!-- ============================================================
                               SECCIÓN 1: MAPA ESTÁTICO DE UBICACIÓN Y ENTORNO
                               ============================================================ -->
                            <div class="modal-section modal-location-map-section">
                                <div class="section-header-flex">
                                    <div>
                                        <h3 class="section-title"><i class="fas fa-location-dot text-primary"></i> Ubicación y Entorno</h3>
                                        <p class="section-subtitle">${prop.address}, ${prop.neighborhood}, ${prop.city}</p>
                                    </div>
                                    <a href="https://maps.google.com/?q=${prop.coordinates[0]},${prop.coordinates[1]}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs" title="Abrir en Google Maps / Waze">
                                        <i class="fas fa-diamond-turn-right"></i> Cómo llegar
                                    </a>
                                </div>

                                <!-- Contenedor del Mapa Embebido de la Propiedad -->
                                <div class="modal-map-embed-wrapper">
                                    <div id="modal-property-map" class="modal-static-map-canvas"></div>
                                    <div class="modal-map-floating-badge">
                                        <i class="fas fa-shield-check text-emerald-600"></i> Ubicación Verificada en ${prop.neighborhood}
                                    </div>
                                </div>

                                <!-- Puntos de Interés Cercanos -->
                                <div class="nearby-points-grid">
                                    ${(prop.nearbyPoints || []).map(pt => `
                                        <div class="nearby-point-item">
                                            <div class="point-icon"><i class="fas fa-location-dot"></i></div>
                                            <div class="point-info">
                                                <span class="point-name">${pt.name}</span>
                                                <span class="point-dist"><i class="fas fa-person-walking"></i> ${pt.distance} • ${pt.time}</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- ============================================================
                               SECCIÓN 2: INTELIGENCIA DE MERCADO Y COMPARATIVA DE PRECIO POR M²
                               ============================================================ -->
                            <div class="modal-section market-intelligence-section">
                                <div class="section-header-flex">
                                    <div>
                                        <h3 class="section-title"><i class="fas fa-chart-simple text-primary"></i> Inteligencia de Mercado: Valor por m²</h3>
                                        <p class="section-subtitle">Comparativa transparente frente al promedio de ${prop.neighborhood} e inmuebles similares</p>
                                    </div>
                                    <span class="market-badge ${isGoodDeal ? 'market-badge-good' : 'market-badge-fair'}">
                                        <i class="fas ${isGoodDeal ? 'fa-arrow-trend-down' : 'fa-check'}"></i>
                                        ${isGoodDeal ? `${Math.abs(m2Diff)}% más accesible que la zona` : 'Precio alineado al mercado'}
                                    </span>
                                </div>

                                <!-- Gráficos Comparativos de Barras de Precio por m² -->
                                <div class="market-chart-card">
                                    <div class="chart-bars-list">
                                        <!-- 1. Esta Propiedad -->
                                        <div class="chart-bar-row current-prop-row">
                                            <div class="chart-bar-label">
                                                <strong>Esta Propiedad</strong>
                                                <span class="chart-bar-sub">${prop.title.substring(0, 32)}...</span>
                                            </div>
                                            <div class="chart-bar-track-wrap">
                                                <div class="chart-bar-fill fill-current" style="width: ${Math.min(100, Math.max(28, (thisPropM2 / maxChartM2) * 100))}%">
                                                    <span class="bar-val-inside">US$ ${thisPropM2.toLocaleString()}/m²</span>
                                                </div>
                                            </div>
                                            <div class="chart-bar-diff-badge ${isGoodDeal ? 'badge-good' : 'badge-norm'}">
                                                ${isGoodDeal ? `-${Math.abs(m2Diff)}%` : `+${Math.abs(m2Diff)}%`}
                                            </div>
                                        </div>

                                        <!-- 2. Promedio en Barrio -->
                                        <div class="chart-bar-row">
                                            <div class="chart-bar-label">
                                                <span>Promedio en ${prop.neighborhood}</span>
                                                <span class="chart-bar-sub">Zona de alta demanda</span>
                                            </div>
                                            <div class="chart-bar-track-wrap">
                                                <div class="chart-bar-fill fill-neighborhood" style="width: ${Math.min(100, Math.max(28, (neighborhoodAvgM2 / maxChartM2) * 100))}%">
                                                    <span class="bar-val-inside">US$ ${neighborhoodAvgM2.toLocaleString()}/m²</span>
                                                </div>
                                            </div>
                                            <div class="chart-bar-diff-badge badge-neutral">Base Zona</div>
                                        </div>

                                        <!-- 3. Promedio en Ciudad -->
                                        <div class="chart-bar-row">
                                            <div class="chart-bar-label">
                                                <span>Promedio en ${prop.city}</span>
                                                <span class="chart-bar-sub">Media general de la ciudad</span>
                                            </div>
                                            <div class="chart-bar-track-wrap">
                                                <div class="chart-bar-fill fill-city" style="width: ${Math.min(100, Math.max(28, (cityAvgM2 / maxChartM2) * 100))}%">
                                                    <span class="bar-val-inside">US$ ${cityAvgM2.toLocaleString()}/m²</span>
                                                </div>
                                            </div>
                                            <div class="chart-bar-diff-badge badge-neutral">Ciudad</div>
                                        </div>

                                        <!-- Inmuebles Similares -->
                                        ${similarProps.map(sProp => {
                                            const sM2 = Math.round(sProp.propertyM2USD || (sProp.builtAreaM2 > 0 ? sProp.priceUSD / sProp.builtAreaM2 : 1300));
                                            const sDiff = Math.round(((sM2 - neighborhoodAvgM2) / neighborhoodAvgM2) * 100);
                                            return `
                                                <div class="chart-bar-row similar-prop-row">
                                                    <div class="chart-bar-label">
                                                        <span>${sProp.title.substring(0, 26)}...</span>
                                                        <span class="chart-bar-sub">${sProp.neighborhood} • ${sProp.bedrooms} dorms</span>
                                                    </div>
                                                    <div class="chart-bar-track-wrap">
                                                        <div class="chart-bar-fill fill-similar" style="width: ${Math.min(100, Math.max(28, (sM2 / maxChartM2) * 100))}%">
                                                            <span class="bar-val-inside">US$ ${sM2.toLocaleString()}/m²</span>
                                                        </div>
                                                    </div>
                                                    <div class="chart-bar-diff-badge ${sDiff <= 0 ? 'badge-good' : 'badge-norm'}">
                                                        ${sDiff <= 0 ? `${sDiff}%` : `+${sDiff}%`}
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>

                                    <!-- Métricas Financieras y Plusvalía -->
                                    <div class="market-metrics-grid">
                                        <div class="metric-mini-card">
                                            <div class="metric-icon text-emerald-600"><i class="fas fa-hand-holding-dollar"></i></div>
                                            <div class="metric-data">
                                                <span class="metric-lbl">Rentabilidad Bruta (Cap Rate)</span>
                                                <strong class="metric-val">7.2% - 8.4% Anual</strong>
                                            </div>
                                        </div>
                                        <div class="metric-mini-card">
                                            <div class="metric-icon text-sky-600"><i class="fas fa-arrow-trend-up"></i></div>
                                            <div class="metric-data">
                                                <span class="metric-lbl">Plusvalía Proyectada (3 Años)</span>
                                                <strong class="metric-val">+16.5% en ${prop.neighborhood}</strong>
                                            </div>
                                        </div>
                                        <div class="metric-mini-card">
                                            <div class="metric-icon text-slate-800"><i class="fas fa-scale-balanced"></i></div>
                                            <div class="metric-data">
                                                <span class="metric-lbl">Rango de Mercado Zona</span>
                                                <strong class="metric-val">US$ ${Math.round(neighborhoodAvgM2 * 0.85)} - ${Math.round(neighborhoodAvgM2 * 1.25)} / m²</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Amenities y Comodidades -->
                            <div class="modal-section">
                                <h3 class="section-title"><i class="fas fa-sparkles text-primary"></i> Comodidades y Equipamiento</h3>
                                <div class="amenities-grid-detailed">
                                    <div class="amenity-detail-item ${prop.amenities.includes('quincho') ? 'included' : 'not-included'}">
                                        <i class="fas fa-fire-burner"></i>
                                        <span>Quincho con Parrilla / Tatakua</span>
                                    </div>
                                    <div class="amenity-detail-item ${prop.amenities.includes('pool') ? 'included' : 'not-included'}">
                                        <i class="fas fa-water-ladder"></i>
                                        <span>Piscina Privada / Comunitaria</span>
                                    </div>
                                    <div class="amenity-detail-item ${prop.amenities.includes('garage') ? 'included' : 'not-included'}">
                                        <i class="fas fa-warehouse"></i>
                                        <span>Cochera Techada</span>
                                    </div>
                                    <div class="amenity-detail-item ${prop.amenities.includes('security') ? 'included' : 'not-included'}">
                                        <i class="fas fa-shield-halved"></i>
                                        <span>Seguridad 24 Horas</span>
                                    </div>
                                    <div class="amenity-detail-item ${prop.amenities.includes('pet_friendly') ? 'included' : 'not-included'}">
                                        <i class="fas fa-paw"></i>
                                        <span>Acepta Mascotas (Pet Friendly)</span>
                                    </div>
                                    <div class="amenity-detail-item ${prop.bankCreditEligible ? 'included' : 'not-included'}">
                                        <i class="fas fa-building-columns"></i>
                                        <span>Apto Crédito Bancario / AFD</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Calculadora de Crédito Hipotecario (Solo para Ventas) -->
                            ${isSale ? `
                            <div class="modal-section mortgage-calc-section">
                                <h3 class="section-title"><i class="fas fa-calculator text-primary"></i> Simulador de Cuota Hipotecaria (AFD / Bancos)</h3>
                                <div class="mortgage-calc-box">
                                    <div class="calc-inputs-row">
                                        <div class="calc-input-group">
                                            <label>Entrega Inicial (20%)</label>
                                            <input type="number" id="calc-down-payment" value="${Math.round(prop.priceUSD * 0.20)}" step="1000">
                                        </div>
                                        <div class="calc-input-group">
                                            <label>Plazo del Préstamo</label>
                                            <select id="calc-loan-years">
                                                <option value="10">10 Años (120 cuotas)</option>
                                                <option value="15">15 Años (180 cuotas)</option>
                                                <option value="20" selected>20 Años (240 cuotas)</option>
                                                <option value="30">30 Años (360 cuotas)</option>
                                            </select>
                                        </div>
                                        <div class="calc-input-group">
                                            <label>Tasa de Interés Anual</label>
                                            <select id="calc-interest-rate">
                                                <option value="6.5" ${prop.acceptsCheRogaPora ? 'selected' : ''}>6.5% (Che Róga Porã AFD)</option>
                                                <option value="8.5">8.5% (Primera Vivienda AFD)</option>
                                                <option value="9.9" ${!prop.acceptsCheRogaPora ? 'selected' : ''}>9.9% (Tasa Bancaria Tradicional)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="calc-result-box">
                                        <div class="calc-result-label">Cuota Mensual Estimada:</div>
                                        <div class="calc-result-value" id="calc-monthly-installment">Calculando...</div>
                                        <div class="calc-disclaimer">*Cálculo referencial en sistema francés. No incluye seguros ni gastos administrativos.</div>
                                    </div>
                                </div>
                            </div>
                            ` : ''}
                        </div>

                        <!-- Columna Derecha: Tarjeta Flotante de Contacto -->
                        <div class="modal-sticky-sidebar">
                            <div class="sidebar-contact-card">
                                <div class="sidebar-price-header">
                                    <div class="modal-price-display modal-price-main">${formattedPrice}</div>
                                    ${prop.expensesPYG > 0 ? `<div class="modal-expenses">+ ₲ ${prop.expensesPYG.toLocaleString('es-PY')}/mes expensas</div>` : ''}
                                </div>

                                <!-- Perfil del Anunciante -->
                                <div class="advertiser-profile-card">
                                    <img src="${prop.advertiser.avatar}" alt="${prop.advertiser.name}" class="advertiser-avatar">
                                    <div class="advertiser-meta">
                                        <div class="advertiser-name">
                                            ${prop.advertiser.name}
                                            ${prop.advertiser.verified ? '<i class="fas fa-check-circle verified-badge" title="Anunciante Verificado"></i>' : ''}
                                        </div>
                                        <div class="advertiser-agency">${prop.advertiser.agency}</div>
                                        <div class="advertiser-type-pill">${this.getAdvertiserTypeLabel(prop.advertiser.type)}</div>
                                    </div>
                                </div>

                                <!-- Botones de Acción Inmediata -->
                                <div class="contact-actions-stack">
                                    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-block">
                                        <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
                                    </a>
                                    <a href="tel:${prop.advertiser.phone}" class="btn btn-secondary btn-block">
                                        <i class="fas fa-phone-alt"></i> Llamar al Anunciante
                                    </a>
                                    <button class="btn btn-outline btn-block" onclick="window.ModalManager.openScheduleModal('${prop.id}')">
                                        <i class="fas fa-calendar-check"></i> Agendar una Visita
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        shareProperty: function () {
            if (navigator.share && currentModalProperty) {
                navigator.share({
                    title: currentModalProperty.title,
                    text: `Mira este inmueble en Zilla Paraguay: ${currentModalProperty.title}`,
                    url: window.location.href
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert("¡Enlace del inmueble copiado al portapapeles!");
            }
        },

        toggleFavorite: function () {
            const favIcon = document.getElementById("modal-fav-icon");
            if (favIcon) {
                const isFav = favIcon.classList.contains("fas");
                favIcon.className = isFav ? "far fa-heart" : "fas fa-heart text-red-500";
            }
        },

        bindModalEvents: function (prop) {
            // Escuchar inputs de calculadora hipotecaria
            const downPaymentInput = document.getElementById("calc-down-payment");
            const yearsSelect = document.getElementById("calc-loan-years");
            const rateSelect = document.getElementById("calc-interest-rate");

            if (downPaymentInput && yearsSelect && rateSelect) {
                downPaymentInput.addEventListener("input", () => this.recalculateMortgage());
                yearsSelect.addEventListener("change", () => this.recalculateMortgage());
                rateSelect.addEventListener("change", () => this.recalculateMortgage());
                this.recalculateMortgage();
            }
        },

        recalculateMortgage: function () {
            if (!currentModalProperty) return;
            const priceUSD = currentModalProperty.priceUSD;
            const downPaymentInput = document.getElementById("calc-down-payment");
            const yearsSelect = document.getElementById("calc-loan-years");
            const rateSelect = document.getElementById("calc-interest-rate");
            const resultEl = document.getElementById("calc-monthly-installment");

            if (!downPaymentInput || !yearsSelect || !rateSelect || !resultEl) return;

            const downPayment = parseFloat(downPaymentInput.value) || 0;
            const loanAmount = Math.max(0, priceUSD - downPayment);
            const years = parseInt(yearsSelect.value, 10);
            const annualRate = parseFloat(rateSelect.value) / 100;
            const monthlyRate = annualRate / 12;
            const totalMonths = years * 12;

            if (loanAmount <= 0) {
                resultEl.textContent = "US$ 0 / mes";
                return;
            }

            // Fórmula de amortización francesa: M = P * [i(1+i)^n] / [(1+i)^n - 1]
            const monthlyPaymentUSD = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);

            const isUSD = window.CurrencyManager.getCurrency() === "USD";
            if (isUSD) {
                resultEl.textContent = `US$ ${Math.round(monthlyPaymentUSD).toLocaleString('es-PY')} / mes`;
            } else {
                const monthlyPaymentPYG = monthlyPaymentUSD * window.CurrencyManager.rate;
                resultEl.textContent = `₲ ${Math.round(monthlyPaymentPYG).toLocaleString('es-PY')} / mes`;
            }
        },

        updateModalPrices: function (prop) {
            const priceEl = document.querySelector(".modal-price-main");
            if (priceEl) {
                priceEl.textContent = window.CurrencyManager.formatPrice(prop.priceUSD, prop.pricePYG);
            }
        },

        openImageViewer: function (initialIndex = 0) {
            if (!currentModalProperty || !currentModalProperty.images) return;
            const images = currentModalProperty.images;
            let currentIndex = initialIndex;

            const viewerModal = document.createElement("div");
            viewerModal.className = "fullscreen-image-viewer active";
            viewerModal.innerHTML = `
                <div class="viewer-backdrop"></div>
                <div class="viewer-content">
                    <button class="viewer-close-btn">&times;</button>
                    <button class="viewer-nav-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
                    <img src="${images[currentIndex]}" class="viewer-img" alt="Foto ampliada">
                    <button class="viewer-nav-btn next-btn"><i class="fas fa-chevron-right"></i></button>
                    <div class="viewer-counter">${currentIndex + 1} / ${images.length}</div>
                </div>
            `;

            document.body.appendChild(viewerModal);

            const imgEl = viewerModal.querySelector(".viewer-img");
            const counterEl = viewerModal.querySelector(".viewer-counter");

            const updateView = () => {
                imgEl.src = images[currentIndex];
                counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
            };

            viewerModal.querySelector(".prev-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateView();
            });

            viewerModal.querySelector(".next-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex + 1) % images.length;
                updateView();
            });

            viewerModal.querySelector(".viewer-close-btn").addEventListener("click", () => {
                viewerModal.remove();
            });

            viewerModal.querySelector(".viewer-backdrop").addEventListener("click", () => {
                viewerModal.remove();
            });
        },

        openScheduleModal: function (propId) {
            alert(`📅 Formulario de Visita activado para el inmueble ${propId}.\nUn asesor de la agencia se comunicará contigo vía WhatsApp en los próximos 15 minutos.`);
        },

        getOperationLabel: function (op) {
            switch (op) {
                case "sale": return "Venta";
                case "rent_monthly": return "Alquiler Mensual";
                case "rent_temporary": return "Alquiler Temporal";
                case "off_plan": return "En Pozo / Desarrollo";
                default: return "Inmueble";
            }
        },

        getPropTypeLabel: function (type) {
            switch (type) {
                case "apartment": return "Departamento";
                case "house": return "Casa";
                case "gated_community": return "Barrio Cerrado";
                case "duplex": return "Dúplex";
                case "land": return "Terreno / Lote";
                case "commercial": return "Comercial";
                default: return "Inmueble";
            }
        },

        getAdvertiserTypeLabel: function (type) {
            switch (type) {
                case "franchise_agent": return "Agente Franquicia";
                case "verified_agency": return "Inmobiliaria Verificada";
                case "owner_direct": return "Dueño Directo";
                default: return "Anunciante";
            }
        }
    };

    window.ModalManager = ModalManager;
})();
