// Módulo de Mapa Interactivo Leaflet con Pines de Precio Estilo Airbnb & Glassmorphism
(function () {
    let map = null;
    let markersLayer = null;
    let markersMap = {};
    let activeHighlightMarker = null;

    const MapManager = {
        init: function (containerId = "leaflet-map") {
            const container = document.getElementById(containerId);
            if (!container || map !== null) return;

            // Coordenadas iniciales: Eje Corporativo Asunción
            const initialLat = -25.2861;
            const initialLng = -57.5623;
            const initialZoom = 13;

            map = L.map(containerId, {
                center: [initialLat, initialLng],
                zoom: initialZoom,
                zoomControl: false,
                scrollWheelZoom: true,
                fadeAnimation: true
            });

            // Control de Zoom personalizado en esquina inferior derecha
            L.control.zoom({ position: "bottomright" }).addTo(map);

            // Capa de Mapa CartoDB Voyager (Limpia y moderna estilo Airbnb)
            L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
                attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: "abcd",
                maxZoom: 19
            }).addTo(map);

            markersLayer = L.layerGroup().addTo(map);

            // Botón de re-centrado
            const recenterBtn = document.getElementById("map-recenter-btn");
            if (recenterBtn) {
                recenterBtn.addEventListener("click", () => {
                    this.fitToMarkers();
                });
            }

            // Invalida tamaño en resize
            window.addEventListener("resize", () => {
                if (map) map.invalidateSize();
            });
        },

        renderMarkers: function (properties) {
            if (!map || !markersLayer) return;

            markersLayer.clearLayers();
            markersMap = {};

            if (!properties || properties.length === 0) return;

            const duration = (window.FilterManager && window.FilterManager.filters.durationMonths) || 3;

            properties.forEach(prop => {
                if (!prop.coordinates || prop.coordinates.length !== 2) return;

                const quote = window.PricingEngine ? window.PricingEngine.calculateQuote(prop.priceUSD, duration) : { monthlyRentUSD: prop.priceUSD, monthlyRentPYG: prop.pricePYG };
                const compactPrice = window.CurrencyManager ? window.CurrencyManager.formatCompactPrice(quote.monthlyRentUSD, quote.monthlyRentPYG) : `$${quote.monthlyRentUSD}`;

                // Pin de Precio Píldora Estilo Airbnb con efecto Glassmorphism
                const customIcon = L.divIcon({
                    className: "airbnb-glass-marker-wrapper",
                    html: `
                        <div class="airbnb-price-pill" id="marker-pill-${prop.id}">
                            <span class="pill-price">${compactPrice}</span>
                        </div>
                    `,
                    iconSize: [80, 32],
                    iconAnchor: [40, 16]
                });

                const marker = L.marker(prop.coordinates, {
                    icon: customIcon,
                    title: prop.title,
                    riseOnHover: true
                });

                // Micro Popup flotante estilo Airbnb al hacer clic
                const popupContent = `
                    <div class="airbnb-map-mini-card" onclick="window.ModalManager.openPropertyModal(window.PROPERTIES_DATA.find(p => p.id === '${prop.id}'))">
                        <img src="${prop.images[0]}" alt="${prop.title}" class="mini-card-img">
                        <div class="mini-card-body">
                            <div class="mini-card-rating"><i class="fas fa-star text-accent"></i> ${prop.rating || '4.95'} (${prop.reviewCount || 24})</div>
                            <h4 class="mini-card-title">${prop.title}</h4>
                            <p class="mini-card-hood"><i class="fas fa-map-pin text-primary"></i> ${prop.neighborhood}</p>
                            <div class="mini-card-price">${compactPrice} <span class="text-xs text-muted">/ mes</span></div>
                        </div>
                    </div>
                `;

                marker.bindPopup(popupContent, {
                    offset: [0, -14],
                    closeButton: false,
                    className: "airbnb-glass-popup"
                });

                marker.on("click", () => {
                    this.highlightProperty(prop.id, false);
                });

                markersLayer.addLayer(marker);
                markersMap[prop.id] = marker;
            });

            // Si el checkbox de sincronizar mapa está activo, ajustar vista
            const syncCheckbox = document.getElementById("sync-map-checkbox");
            if (syncCheckbox && syncCheckbox.checked) {
                this.fitToMarkers();
            }
        },

        highlightProperty: function (propId, openPopup = false) {
            if (activeHighlightMarker) {
                const prevPill = document.getElementById(`marker-pill-${activeHighlightMarker}`);
                if (prevPill) prevPill.classList.remove("active");
            }

            const marker = markersMap[propId];
            if (marker) {
                const pill = document.getElementById(`marker-pill-${propId}`);
                if (pill) pill.classList.add("active");
                activeHighlightMarker = propId;

                if (openPopup) {
                    marker.openPopup();
                }
            }
        },

        unhighlightProperty: function (propId) {
            const pill = document.getElementById(`marker-pill-${propId}`);
            if (pill) pill.classList.remove("active");
            if (activeHighlightMarker === propId) {
                activeHighlightMarker = null;
            }
        },

        panTo: function (lat, lng, zoom = 15) {
            if (map) {
                map.flyTo([lat, lng], zoom, { duration: 1.2, easeLinearity: 0.25 });
            }
        },

        fitToMarkers: function () {
            if (!map || Object.keys(markersMap).length === 0) return;
            const group = L.featureGroup(Object.values(markersMap));
            map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 15, animate: true, duration: 1 });
        },

        invalidateSize: function () {
            if (map) {
                setTimeout(() => map.invalidateSize(), 200);
            }
        }
    };

    window.MapManager = MapManager;
})();
