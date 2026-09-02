// Módulo de Mapa Interactivo (Leaflet + Custom Price Pills Markers)
(function () {
    let map = null;
    let markersLayer = null;
    let markersMap = new Map(); // propertyId -> Leaflet Marker
    let activePropertyId = null;

    const MapManager = {
        init: function (containerId = "map-container") {
            const container = document.getElementById(containerId);
            if (!container) return;

            // Coordenadas iniciales: Centro de Asunción, Paraguay
            const defaultCenter = [-25.2950, -57.5750];
            const defaultZoom = 13;

            map = L.map(containerId, {
                center: defaultCenter,
                zoom: defaultZoom,
                zoomControl: false,
                attributionControl: false
            });

            // Control de Zoom personalizado en esquina superior derecha
            L.control.zoom({ position: 'topright' }).addTo(map);

            // Capa de Mapa estilo CartoDB Positron / Voyager moderno y limpio
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                subdomains: 'abcd'
            }).addTo(map);

            markersLayer = L.layerGroup().addTo(map);

            // Evento cuando el usuario mueve el mapa
            map.on('moveend', function () {
                const autoSearchCheckbox = document.getElementById("search-on-map-move");
                if (autoSearchCheckbox && autoSearchCheckbox.checked) {
                    window.dispatchEvent(new CustomEvent("mapBoundsChanged", {
                        detail: { bounds: map.getBounds() }
                    }));
                }
            });

            // Listener de cambio de moneda para actualizar las etiquetas de los pines
            window.addEventListener("currencyChanged", () => {
                this.updateMarkerLabels();
            });

            // Forzar resize para que cargue correctamente las dimensiones del contenedor
            setTimeout(() => {
                map.invalidateSize();
            }, 300);
        },

        renderMarkers: function (properties) {
            if (!map || !markersLayer) return;

            markersLayer.clearLayers();
            markersMap.clear();

            const bounds = L.latLngBounds();

            properties.forEach(prop => {
                if (!prop.coordinates || prop.coordinates.length !== 2) return;

                const lat = prop.coordinates[0];
                const lng = prop.coordinates[1];
                bounds.extend([lat, lng]);

                const formattedPrice = window.CurrencyManager.formatCompactPrice(prop.priceUSD, prop.pricePYG);
                const isPlatinum = prop.tier === "platinum";

                // Icono HTML personalizado con forma de píldora de precio (Estilo Airbnb)
                const customIcon = L.divIcon({
                    className: 'custom-map-pill-wrapper',
                    html: `
                        <div class="map-price-pill ${isPlatinum ? 'tier-platinum' : ''} ${activePropertyId === prop.id ? 'active' : ''}" id="marker-${prop.id}">
                            <span class="pill-price">${formattedPrice}</span>
                        </div>
                    `,
                    iconSize: [60, 30],
                    iconAnchor: [30, 15]
                });

                const marker = L.marker([lat, lng], { icon: customIcon });

                // Eventos del marcador
                marker.on('click', () => {
                    this.highlightProperty(prop.id, true);
                    if (window.ModalManager) {
                        window.ModalManager.openPropertyModal(prop);
                    }
                });

                marker.on('mouseover', () => {
                    this.highlightProperty(prop.id, false);
                });

                marker.on('mouseout', () => {
                    if (activePropertyId !== prop.id) {
                        this.unhighlightProperty(prop.id);
                    }
                });

                marker.propertyData = prop;
                markersLayer.addLayer(marker);
                markersMap.set(prop.id, marker);
            });

            // Ajustar vista a las propiedades si hay resultados
            if (properties.length > 0 && bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        },

        updateMarkerLabels: function () {
            markersMap.forEach((marker, propId) => {
                const prop = marker.propertyData;
                if (!prop) return;
                const formattedPrice = window.CurrencyManager.formatCompactPrice(prop.priceUSD, prop.pricePYG);
                const el = document.querySelector(`#marker-${propId} .pill-price`);
                if (el) {
                    el.textContent = formattedPrice;
                }
            });
        },

        highlightProperty: function (propId, scrollToCard = false) {
            activePropertyId = propId;

            // Resaltar pin en mapa
            document.querySelectorAll(".map-price-pill").forEach(el => el.classList.remove("active"));
            const markerEl = document.getElementById(`marker-${propId}`);
            if (markerEl) {
                markerEl.classList.add("active");
                // Elevar z-index del marcador
                const parentIcon = markerEl.closest('.leaflet-marker-icon');
                if (parentIcon) parentIcon.style.zIndex = '9999';
            }

            // Resaltar tarjeta en el listado
            document.querySelectorAll(".property-card").forEach(el => el.classList.remove("active-card"));
            const cardEl = document.getElementById(`card-${propId}`);
            if (cardEl) {
                cardEl.classList.add("active-card");
                if (scrollToCard) {
                    cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }
        },

        unhighlightProperty: function (propId) {
            const markerEl = document.getElementById(`marker-${propId}`);
            if (markerEl) {
                markerEl.classList.remove("active");
                const parentIcon = markerEl.closest('.leaflet-marker-icon');
                if (parentIcon) parentIcon.style.zIndex = '';
            }

            const cardEl = document.getElementById(`card-${propId}`);
            if (cardEl) {
                cardEl.classList.remove("active-card");
            }
        },

        panTo: function (lat, lng, zoom = 15) {
            if (!map) return;
            map.flyTo([lat, lng], zoom, { duration: 1.2 });
        },

        invalidateSize: function () {
            if (map) {
                setTimeout(() => map.invalidateSize(), 200);
            }
        },

        getMapInstance: function () {
            return map;
        }
    };

    window.MapManager = MapManager;
})();
