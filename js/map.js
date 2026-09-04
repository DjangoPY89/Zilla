// ============================================================
// Módulo de Mapa Interactivo Universal (Google Maps + Leaflet Fallback)
// ============================================================
(function () {
    let map = null;
    let isGoogleMap = false;
    let gOverlays = [];
    let overlaysMap = new Map();
    let leafletMarkersLayer = null;
    let leafletMarkersMap = new Map();
    let activePropertyId = null;
    let currentContainerId = "map-container";
    let lastRenderedProperties = [];

    // Capturar error de autenticación de Google Maps para cambiar inmediatamente a Leaflet
    window.gm_authFailure = function () {
        console.warn("Google Maps API Key requiere configuración en Google Cloud. Cambiando a mapa interactivo Leaflet...");
        MapManager.switchToLeaflet();
    };

    const modernMapStyles = [
        { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#334155" }] },
        { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }, { "weight": 3 }] },
        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f1f5f9" }] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e2f3e8" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#dbeafe" }] },
        { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f8fafc" }] }
    ];

    function createPricePillOverlayClass() {
        if (!window.google || !window.google.maps || !window.google.maps.OverlayView) return null;

        try {
            class PricePillOverlay extends google.maps.OverlayView {
                constructor(property, gMap, onSelect, onHover, onOut) {
                    super();
                    this.prop = property;
                    this.position = new google.maps.LatLng(property.coordinates[0], property.coordinates[1]);
                    this.onSelect = onSelect;
                    this.onHover = onHover;
                    this.onOut = onOut;
                    this.div = null;
                    this.setMap(gMap);
                }

                onAdd() {
                    this.div = document.createElement('div');
                    this.div.className = 'custom-map-pill-wrapper';
                    this.div.style.position = 'absolute';
                    this.div.style.cursor = 'pointer';
                    this.div.style.userSelect = 'none';
                    this.div.style.zIndex = '100';

                    const isPlatinum = this.prop.tier === 'platinum';
                    const formattedPrice = window.CurrencyManager
                        ? window.CurrencyManager.formatCompactPrice(this.prop.priceUSD, this.prop.pricePYG)
                        : `$${this.prop.priceUSD}`;

                    this.div.innerHTML = `
                        <div class="map-price-pill ${isPlatinum ? 'tier-platinum' : ''}" id="marker-${this.prop.id}">
                            <span class="pill-price">${formattedPrice}</span>
                        </div>
                    `;

                    this.div.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (this.onSelect) this.onSelect(this.prop);
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

                onRemove() {
                    if (this.div && this.div.parentNode) {
                        this.div.parentNode.removeChild(this.div);
                        this.div = null;
                    }
                }

                updatePrice() {
                    if (this.div && window.CurrencyManager) {
                        const priceEl = this.div.querySelector('.pill-price');
                        if (priceEl) {
                            priceEl.textContent = window.CurrencyManager.formatCompactPrice(this.prop.priceUSD, this.prop.pricePYG);
                        }
                    }
                }
            }

            return PricePillOverlay;
        } catch (e) {
            console.warn("No se pudo crear clase PricePillOverlay:", e);
            return null;
        }
    }

    let PricePillOverlayClass = null;

    const MapManager = {
        init: function (containerId = "map-container") {
            currentContainerId = containerId;
            const container = document.getElementById(containerId);
            if (!container) return;

            const defaultCenter = { lat: -25.2950, lng: -57.5900 }; // Centro de Asunción, Paraguay
            const defaultZoom = 12.5; // Zoom óptimo para visualizar toda Asunción

            // Intentar Google Maps si está presente y no tiene error
            if (window.google && window.google.maps && typeof google.maps.Map === "function") {
                try {
                    PricePillOverlayClass = createPricePillOverlayClass();
                    map = new google.maps.Map(container, {
                        center: defaultCenter,
                        zoom: defaultZoom,
                        styles: modernMapStyles,
                        mapTypeControl: true,
                        mapTypeControlOptions: {
                            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                            position: google.maps.ControlPosition.TOP_RIGHT
                        },
                        fullscreenControl: true,
                        zoomControl: true,
                        streetViewControl: false
                    });

                    isGoogleMap = true;

                    map.addListener('idle', () => {
                        if (document.getElementById("map-container")?.classList.contains("drawing-active")) return;
                        const autoSearchCheckbox = document.getElementById("search-on-map-move");
                        if (autoSearchCheckbox && autoSearchCheckbox.checked) {
                            const boundsObj = this.getCurrentBounds();
                            if (boundsObj) {
                                window.dispatchEvent(new CustomEvent("mapBoundsChanged", {
                                    detail: { bounds: boundsObj }
                                }));
                            }
                        }
                    });

                    this.setupGooglePlacesAutocompletes();
                    this.initDrawingTools(containerId);

                } catch (err) {
                    console.warn("Fallback a Leaflet debido a error en Google Maps:", err);
                    this.initLeafletFallback(containerId, defaultCenter, defaultZoom);
                }
            } else {
                this.initLeafletFallback(containerId, defaultCenter, defaultZoom);
            }

            window.addEventListener("currencyChanged", () => {
                this.updateMarkerLabels();
            });
        },

        switchToLeaflet: function () {
            isGoogleMap = false;
            map = null;
            gOverlays = [];
            overlaysMap.clear();
            const container = document.getElementById(currentContainerId);
            if (container) {
                container.innerHTML = "";
            }
            this.initLeafletFallback(currentContainerId, { lat: -25.2950, lng: -57.5900 }, 12.5);
            if (lastRenderedProperties.length > 0) {
                this.renderMarkers(lastRenderedProperties);
            }
        },

        getCurrentBounds: function () {
            if (isGoogleMap && map && typeof map.getBounds === "function") {
                const b = map.getBounds();
                if (b) {
                    return {
                        contains: (lat, lng) => b.contains(new google.maps.LatLng(lat, lng)),
                        north: b.getNorthEast().lat(),
                        south: b.getSouthWest().lat(),
                        east: b.getNorthEast().lng(),
                        west: b.getSouthWest().lng()
                    };
                }
            } else if (!isGoogleMap && map && typeof map.getBounds === "function") {
                const b = map.getBounds();
                if (b) {
                    return {
                        contains: (lat, lng) => b.contains(window.L ? L.latLng(lat, lng) : [lat, lng]),
                        north: b.getNorth(),
                        south: b.getSouth(),
                        east: b.getEast(),
                        west: b.getWest()
                    };
                }
            }
            return null;
        },

        initLeafletFallback: function (containerId, center = { lat: -25.2950, lng: -57.5900 }, zoom = 12.5) {
            if (!window.L) return;
            const container = document.getElementById(containerId);
            if (!container) return;

            if (container._leaflet_id) {
                container._leaflet_id = null;
            }

            isGoogleMap = false;

            map = L.map(containerId, {
                center: [center.lat, center.lng],
                zoom: zoom,
                zoomControl: false,
                attributionControl: false
            });

            L.control.zoom({ position: 'topright' }).addTo(map);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                subdomains: 'abcd'
            }).addTo(map);

            leafletMarkersLayer = L.layerGroup().addTo(map);

            map.on('moveend', () => {
                if (document.getElementById("map-container")?.classList.contains("drawing-active")) return;
                const autoSearchCheckbox = document.getElementById("search-on-map-move");
                if (autoSearchCheckbox && autoSearchCheckbox.checked) {
                    const boundsObj = this.getCurrentBounds();
                    if (boundsObj) {
                        window.dispatchEvent(new CustomEvent("mapBoundsChanged", {
                            detail: { bounds: boundsObj }
                        }));
                    }
                }
            });

            this.initDrawingTools(containerId);

            setTimeout(() => {
                if (map && map.invalidateSize) map.invalidateSize();
            }, 300);
        },

        // ============================================================
        // ============================================================
        // SISTEMA DE DIBUJO DE ÁREA INTERACTIVO (Lasso / Freehand Draw)
        // Soporte para Modo Normal y Modo Pantalla Completa
        // ============================================================
        initDrawingTools: function (containerId = "map-container") {
            const startBtn = document.getElementById("btn-start-draw");
            const startFullscreenBtn = document.getElementById("btn-start-draw-fullscreen");
            const cancelBtn = document.getElementById("btn-cancel-draw");
            const clearBtn = document.getElementById("btn-clear-draw");
            const activeBanner = document.getElementById("map-draw-active-banner");
            const appliedBanner = document.getElementById("map-draw-applied-banner");
            const toggleDrawFullscreenBtn = document.getElementById("btn-toggle-draw-fullscreen");
            const appliedToggleFullscreenBtn = document.getElementById("btn-applied-toggle-fullscreen");
            const splitContainer = document.querySelector(".split-screen-container");
            const mapContainer = document.getElementById(containerId);

            if (!startBtn || !mapContainer) return;

            let isDrawingActive = false;
            let isUserPointerDown = false;
            let isFullscreenDrawing = false;
            let currentPoints = [];
            let activeGooglePolygon = null;
            let activeLeafletPolygon = null;

            const toggleFullscreenDraw = (forceState) => {
                if (!splitContainer) return;
                const newState = typeof forceState === "boolean" ? forceState : !splitContainer.classList.contains("map-fullscreen-draw");
                isFullscreenDrawing = newState;

                if (newState) {
                    splitContainer.classList.add("map-fullscreen-draw");
                    if (toggleDrawFullscreenBtn) {
                        toggleDrawFullscreenBtn.innerHTML = `<i class="fas fa-compress"></i> Salir de Pantalla Completa`;
                    }
                    if (appliedToggleFullscreenBtn) {
                        appliedToggleFullscreenBtn.innerHTML = `<i class="fas fa-compress"></i> Salir de Pantalla Completa`;
                    }
                } else {
                    splitContainer.classList.remove("map-fullscreen-draw");
                    if (toggleDrawFullscreenBtn) {
                        toggleDrawFullscreenBtn.innerHTML = `<i class="fas fa-expand"></i> Pantalla Completa`;
                    }
                    if (appliedToggleFullscreenBtn) {
                        appliedToggleFullscreenBtn.innerHTML = `<i class="fas fa-expand"></i> Pantalla Completa`;
                    }
                }

                setTimeout(() => {
                    if (window.MapManager && window.MapManager.invalidateSize) {
                        window.MapManager.invalidateSize();
                    }
                }, 150);
            };

            // Crear el contenedor de captura SVG/Canvas sobre el mapa
            let drawingOverlay = document.getElementById("map-drawing-surface-overlay");
            if (!drawingOverlay) {
                drawingOverlay = document.createElement("div");
                drawingOverlay.id = "map-drawing-surface-overlay";
                drawingOverlay.style.position = "absolute";
                drawingOverlay.style.inset = "0";
                drawingOverlay.style.zIndex = "400";
                drawingOverlay.style.cursor = "crosshair";
                drawingOverlay.style.display = "none";
                drawingOverlay.style.userSelect = "none";
                drawingOverlay.style.webkitUserSelect = "none";
                drawingOverlay.style.touchAction = "none";

                drawingOverlay.innerHTML = `
                    <svg id="live-draw-svg" style="width:100%; height:100%; position:absolute; inset:0; pointer-events:none;">
                        <polyline id="live-draw-polyline" points="" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6,4" />
                    </svg>
                `;

                mapContainer.style.position = "relative";
                mapContainer.appendChild(drawingOverlay);
            }

            const livePolylineEl = document.getElementById("live-draw-polyline");

            const startDrawing = (fullscreen = false) => {
                isDrawingActive = true;
                currentPoints = [];
                if (livePolylineEl) livePolylineEl.setAttribute("points", "");
                drawingOverlay.style.display = "block";
                mapContainer.classList.add("drawing-active");

                if (fullscreen) {
                    toggleFullscreenDraw(true);
                }

                startBtn.style.display = "none";
                if (startFullscreenBtn) startFullscreenBtn.style.display = "none";
                if (appliedBanner) appliedBanner.style.display = "none";
                if (activeBanner) activeBanner.style.display = "inline-flex";

                // Deshabilitar arrastre temporal del mapa
                if (isGoogleMap && map) {
                    map.setOptions({ draggable: false, scrollwheel: false, disableDoubleClickZoom: true });
                } else if (!isGoogleMap && map && map.dragging) {
                    map.dragging.disable();
                    if (map.scrollWheelZoom) map.scrollWheelZoom.disable();
                }
            };

            const stopDrawingMode = () => {
                isDrawingActive = false;
                isUserPointerDown = false;
                drawingOverlay.style.display = "none";
                mapContainer.classList.remove("drawing-active");
                if (livePolylineEl) livePolylineEl.setAttribute("points", "");

                if (activeBanner) activeBanner.style.display = "none";

                // Reactivar interacción del mapa
                if (isGoogleMap && map) {
                    map.setOptions({ draggable: true, scrollwheel: true, disableDoubleClickZoom: false });
                } else if (!isGoogleMap && map && map.dragging) {
                    map.dragging.enable();
                    if (map.scrollWheelZoom) map.scrollWheelZoom.enable();
                }
            };

            const cancelDrawing = () => {
                stopDrawingMode();
                if (isFullscreenDrawing) {
                    toggleFullscreenDraw(false);
                }
                if (activeGooglePolygon || activeLeafletPolygon) {
                    if (appliedBanner) appliedBanner.style.display = "inline-flex";
                } else {
                    if (startBtn) startBtn.style.display = "inline-flex";
                    if (startFullscreenBtn) startFullscreenBtn.style.display = "inline-flex";
                }
            };

            const clearDrawing = () => {
                stopDrawingMode();
                if (isFullscreenDrawing) {
                    toggleFullscreenDraw(false);
                }
                if (activeGooglePolygon) {
                    activeGooglePolygon.setMap(null);
                    activeGooglePolygon = null;
                }
                if (activeLeafletPolygon && map) {
                    map.removeLayer(activeLeafletPolygon);
                    activeLeafletPolygon = null;
                }
                if (appliedBanner) appliedBanner.style.display = "none";
                if (startBtn) startBtn.style.display = "inline-flex";
                if (startFullscreenBtn) startFullscreenBtn.style.display = "inline-flex";

                if (window.FilterManager) {
                    window.FilterManager.setFilter("polygon", null);
                }
            };

            startBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                startDrawing(false);
            };

            if (startFullscreenBtn) {
                startFullscreenBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startDrawing(true);
                };
            }

            if (toggleDrawFullscreenBtn) {
                toggleDrawFullscreenBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFullscreenDraw();
                };
            }

            if (appliedToggleFullscreenBtn) {
                appliedToggleFullscreenBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFullscreenDraw();
                };
            }

            if (cancelBtn) {
                cancelBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    cancelDrawing();
                };
            }

            if (clearBtn) {
                clearBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearDrawing();
                };
            }

            // Eventos de captura de puntero sobre la capa de dibujo
            drawingOverlay.onpointerdown = (e) => {
                if (!isDrawingActive) return;
                isUserPointerDown = true;
                currentPoints = [];
                const rect = mapContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                currentPoints.push({ x, y });
                if (livePolylineEl) livePolylineEl.setAttribute("points", `${x},${y}`);
            };

            drawingOverlay.onpointermove = (e) => {
                if (!isDrawingActive || !isUserPointerDown) return;
                const rect = mapContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const last = currentPoints[currentPoints.length - 1];
                if (!last || Math.hypot(last.x - x, last.y - y) > 5) {
                    currentPoints.push({ x, y });
                    const ptsStr = currentPoints.map(p => `${p.x},${p.y}`).join(" ");
                    if (livePolylineEl) livePolylineEl.setAttribute("points", ptsStr);
                }
            };

            const finishDraw = (e) => {
                if (!isDrawingActive || !isUserPointerDown) return;
                isUserPointerDown = false;

                if (currentPoints.length >= 4) {
                    // Convertir puntos de pantalla a lat, lng
                    const rect = mapContainer.getBoundingClientRect();
                    let polygonCoords = [];

                    if (isGoogleMap && map) {
                        const bounds = map.getBounds();
                        if (bounds) {
                            const ne = bounds.getNorthEast();
                            const sw = bounds.getSouthWest();
                            const latSpan = ne.lat() - sw.lat();
                            const lngSpan = ne.lng() - sw.lng();

                            polygonCoords = currentPoints.map(p => {
                                const lat = ne.lat() - (p.y / rect.height) * latSpan;
                                const lng = sw.lng() + (p.x / rect.width) * lngSpan;
                                return [lat, lng];
                            });
                        }
                    } else if (!isGoogleMap && map) {
                        polygonCoords = currentPoints.map(p => {
                            const latlng = map.containerPointToLatLng(L.point(p.x, p.y));
                            return [latlng.lat, latlng.lng];
                        });
                    }

                    if (polygonCoords.length >= 3) {
                        // Limpiar polígonos anteriores si existían
                        if (activeGooglePolygon) {
                            activeGooglePolygon.setMap(null);
                            activeGooglePolygon = null;
                        }
                        if (activeLeafletPolygon && map) {
                            map.removeLayer(activeLeafletPolygon);
                            activeLeafletPolygon = null;
                        }

                        // Dibujar polígono en el mapa
                        if (isGoogleMap && map) {
                            activeGooglePolygon = new google.maps.Polygon({
                                paths: polygonCoords.map(c => ({ lat: c[0], lng: c[1] })),
                                strokeColor: "#2563eb",
                                strokeOpacity: 0.95,
                                strokeWeight: 3,
                                fillColor: "#3b82f6",
                                fillOpacity: 0.22,
                                map: map
                            });
                        } else if (!isGoogleMap && map) {
                            activeLeafletPolygon = L.polygon(polygonCoords, {
                                color: "#2563eb",
                                weight: 3,
                                fillColor: "#3b82f6",
                                fillOpacity: 0.22
                            }).addTo(map);
                        }

                        stopDrawingMode();

                        // Aplicar filtro al FilterManager
                        if (window.FilterManager) {
                            const filtered = window.FilterManager.setFilter("polygon", polygonCoords);
                            const countText = document.getElementById("drawn-count-text");
                            if (countText) {
                                countText.textContent = `${filtered ? filtered.length : 0} inmuebles en la zona`;
                            }
                        }

                        if (appliedBanner) appliedBanner.style.display = "inline-flex";
                        if (startBtn) startBtn.style.display = "none";
                        if (startFullscreenBtn) startFullscreenBtn.style.display = "none";
                    } else {
                        cancelDrawing();
                    }
                } else {
                    cancelDrawing();
                }
            };

            drawingOverlay.onpointerup = finishDraw;
            drawingOverlay.onpointercancel = finishDraw;

            window.addEventListener("filtersReset", () => {
                clearDrawing();
            });
        },

        setupGooglePlacesAutocompletes: function () {
            if (!window.google || !window.google.maps || !window.google.maps.places) return;

            this.initPlacesAutocomplete("search-input", (place) => {
                const searchInput = document.getElementById("search-input");
                const searchTerm = place.name || place.formatted_address || "";
                if (searchInput) searchInput.value = searchTerm;
                if (window.FilterManager) {
                    window.FilterManager.setFilter("keyword", searchTerm);
                }
            });

            this.initPlacesAutocomplete("pub-address", (place) => {
                if (place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const latInput = document.getElementById("publish-lat");
                    const lngInput = document.getElementById("publish-lng");
                    if (latInput) latInput.value = lat;
                    if (lngInput) lngInput.value = lng;
                }
            });
        },

        initPlacesAutocomplete: function (inputId, callback) {
            const input = document.getElementById(inputId);
            if (!input || !window.google || !window.google.maps || !window.google.maps.places) return;

            try {
                const autocomplete = new google.maps.places.Autocomplete(input, {
                    componentRestrictions: { country: "py" },
                    fields: ["geometry", "name", "formatted_address"]
                });

                autocomplete.addListener("place_changed", () => {
                    const place = autocomplete.getPlace();
                    if (!place.geometry || !place.geometry.location) return;

                    if (map && isGoogleMap) {
                        map.panTo(place.geometry.location);
                        map.setZoom(15);
                    } else if (map && !isGoogleMap) {
                        map.flyTo([place.geometry.location.lat(), place.geometry.location.lng()], 15);
                    }

                    if (callback) callback(place);
                });
            } catch (err) {
                console.warn("Places autocomplete error on", inputId, err);
            }
        },

        renderMarkers: function (properties) {
            lastRenderedProperties = properties;
            if (!map) return;

            if (isGoogleMap) {
                this.renderGoogleMarkers(properties);
            } else {
                this.renderLeafletMarkers(properties);
            }
        },

        renderGoogleMarkers: function (properties) {
            // Limpiar overlays anteriores
            gOverlays.forEach(overlay => overlay.setMap(null));
            gOverlays = [];
            overlaysMap.clear();

            if (!properties || properties.length === 0) return;

            const OverlayClass = PricePillOverlayClass || createPricePillOverlayClass();
            if (!OverlayClass) return;

            const bounds = new google.maps.LatLngBounds();

            properties.forEach(prop => {
                if (!prop.coordinates || prop.coordinates.length < 2) return;

                const latLng = new google.maps.LatLng(prop.coordinates[0], prop.coordinates[1]);
                bounds.extend(latLng);

                const overlay = new OverlayClass(
                    prop,
                    map,
                    // onSelect (al hacer clic, desplegar versión miniatura de la propiedad)
                    (selectedProp) => {
                        this.openMiniCardPopup(selectedProp);
                    }
                );

                gOverlays.push(overlay);
                overlaysMap.set(prop.id, overlay);
            });

            // Ajustar encuadre solo si el usuario hizo una búsqueda explícita de palabra clave o zona
            const hasExplicitSearch = window.FilterManager && window.FilterManager.filters.keyword;
            if (hasExplicitSearch && properties.length > 1 && !document.getElementById("map-container")?.classList.contains("drawing-active")) {
                map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
            }
        },

        renderLeafletMarkers: function (properties) {
            if (!leafletMarkersLayer) return;
            leafletMarkersLayer.clearLayers();
            leafletMarkersMap.clear();

            if (!properties || properties.length === 0) return;

            const bounds = [];

            properties.forEach(prop => {
                if (!prop.coordinates || prop.coordinates.length < 2) return;

                const [lat, lng] = prop.coordinates;
                bounds.push([lat, lng]);

                const isPlatinum = prop.tier === 'platinum';
                const formattedPrice = window.CurrencyManager
                    ? window.CurrencyManager.formatCompactPrice(prop.priceUSD, prop.pricePYG)
                    : `$${prop.priceUSD}`;

                const customIcon = L.divIcon({
                    className: 'custom-map-pill-wrapper',
                    html: `
                        <div class="map-price-pill ${isPlatinum ? 'tier-platinum' : ''}" id="marker-${prop.id}">
                            <span class="pill-price">${formattedPrice}</span>
                        </div>
                    `,
                    iconSize: [80, 32],
                    iconAnchor: [40, 16]
                });

                const marker = L.marker([lat, lng], { icon: customIcon }).addTo(leafletMarkersLayer);
                marker.propertyData = prop;

                // Al hacer clic, desplegar tarjeta miniatura sin saltar la lista
                marker.on('click', (e) => {
                    if (e && e.originalEvent) e.originalEvent.stopPropagation();
                    this.openMiniCardPopup(prop);
                });

                leafletMarkersMap.set(prop.id, marker);
            });

            const hasExplicitSearch = window.FilterManager && window.FilterManager.filters.keyword;
            if (hasExplicitSearch && bounds.length > 1 && !document.getElementById("map-container")?.classList.contains("drawing-active")) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        },

        // ============================================================
        // TARJETA MINIATURA AL HACER CLIC EN UN MARCADOR
        // ============================================================
        openMiniCardPopup: function (prop) {
            if (!prop || !prop.coordinates) return;

            // Resaltar píldora activa en el mapa
            document.querySelectorAll(".map-price-pill").forEach(el => el.classList.remove("active"));
            const markerEl = document.getElementById(`marker-${prop.id}`);
            if (markerEl) markerEl.classList.add("active");

            const cardHtml = this.buildMiniCardHtml(prop);

            if (isGoogleMap && map) {
                if (window._activeGoogleInfoWindow) {
                    window._activeGoogleInfoWindow.close();
                }
                window._activeGoogleInfoWindow = new google.maps.InfoWindow({
                    content: cardHtml,
                    position: new google.maps.LatLng(prop.coordinates[0], prop.coordinates[1]),
                    pixelOffset: new google.maps.Size(0, -14),
                    disableAutoPan: false
                });
                window._activeGoogleInfoWindow.open(map);
            } else if (!isGoogleMap && map) {
                if (window._activeLeafletPopup) {
                    map.closePopup(window._activeLeafletPopup);
                }
                window._activeLeafletPopup = L.popup({
                    offset: [0, -12],
                    className: 'apple-map-mini-popup-container',
                    closeButton: false,
                    maxWidth: 320,
                    minWidth: 290,
                    autoPan: true
                })
                .setLatLng([prop.coordinates[0], prop.coordinates[1]])
                .setContent(cardHtml)
                .openOn(map);
            }
        },

        buildMiniCardHtml: function (prop) {
            const formattedPrice = window.CurrencyManager
                ? window.CurrencyManager.formatPrice(prop.priceUSD, prop.pricePYG)
                : `$${prop.priceUSD.toLocaleString()}`;
            const isPlatinum = prop.tier === 'platinum';
            const isCheRoga = prop.acceptsCheRogaPora;
            const img = (prop.images && prop.images.length > 0)
                ? prop.images[0]
                : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';

            let opBadgeText = "Venta";
            if (prop.operation === "rent_monthly") opBadgeText = "Alquiler";
            else if (prop.operation === "rent_temporary") opBadgeText = "Temporal";
            else if (prop.operation === "off_plan") opBadgeText = "En Pozo";

            const rawPhone = (prop.advertiser && prop.advertiser.phone) || prop.contactPhone || "+595981123456";
            const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
            const telUrl = `tel:${cleanPhone}`;

            const whatsappMsg = encodeURIComponent(
                `Hola! Me interesa este inmueble publicado en Zilla: "${prop.title}" en ${prop.neighborhood}, ${prop.city} (${formattedPrice}). ¿Sigue disponible?`
            );
            const waPhone = (prop.advertiser && prop.advertiser.whatsapp) || prop.contactWhatsapp || cleanPhone;
            const cleanWaPhone = waPhone.replace(/[^0-9]/g, "");
            const whatsappUrl = `https://wa.me/${cleanWaPhone}?text=${whatsappMsg}`;

            return `
                <div class="apple-mini-property-card" id="mini-popup-${prop.id}">
                    <div class="mini-card-media">
                        <img src="${img}" alt="${prop.title}" class="mini-card-thumb" />
                        <div class="mini-card-badges">
                            <span class="mini-tag mini-tag-op">${opBadgeText}</span>
                            ${isPlatinum ? '<span class="mini-tag mini-tag-plat"><i class="fas fa-gem"></i> Platino</span>' : ''}
                            ${isCheRoga ? '<span class="mini-tag mini-tag-cr"><i class="fas fa-certificate"></i> Che Róga</span>' : ''}
                        </div>
                        <button type="button" class="mini-card-close" onclick="window.MapManager.closeMiniCardPopup(event)" title="Cerrar">&times;</button>
                    </div>
                    <div class="mini-card-info">
                        <div class="mini-card-price-row">
                            <span class="mini-price-val">${formattedPrice}</span>
                            ${prop.expensesPYG ? `<span class="mini-exp-val">+Exp ₲ ${prop.expensesPYG.toLocaleString()}</span>` : ''}
                        </div>
                        <h4 class="mini-card-title">${prop.title}</h4>
                        <p class="mini-card-loc"><i class="fas fa-location-dot text-primary"></i> ${prop.neighborhood}, ${prop.city}</p>
                        
                        <div class="mini-card-specs-bar">
                            <span><i class="fas fa-bed text-primary"></i> ${prop.bedrooms} dorms</span>
                            <span><i class="fas fa-bath text-primary"></i> ${prop.bathrooms} baños</span>
                            <span><i class="fas fa-ruler-combined text-primary"></i> ${prop.areaM2} m²</span>
                            ${prop.parkingSpaces ? `<span><i class="fas fa-car text-primary"></i> ${prop.parkingSpaces} coch.</span>` : ''}
                        </div>

                        <div class="mini-card-footer-btns">
                            <button type="button" class="btn btn-primary btn-mini-details" onclick="window.MapManager.viewFullProperty('${prop.id}')">
                                <span>Ver Ficha</span>
                                <i class="fas fa-arrow-up-right-from-square"></i>
                            </button>
                            <a href="${whatsappUrl}" target="_blank" class="btn btn-whatsapp btn-mini-wa" title="Contactar por WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                            <a href="${telUrl}" class="btn btn-mini-call" title="Llamar al anunciante">
                                <i class="fas fa-phone"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        },

        closeMiniCardPopup: function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (window._activeLeafletPopup && map) {
                map.closePopup(window._activeLeafletPopup);
                window._activeLeafletPopup = null;
            }
            if (window._activeGoogleInfoWindow) {
                window._activeGoogleInfoWindow.close();
                window._activeGoogleInfoWindow = null;
            }
            document.querySelectorAll(".map-price-pill").forEach(el => el.classList.remove("active"));
        },

        viewFullProperty: function (propId) {
            this.closeMiniCardPopup();
            const prop = (window.PROPERTIES_DATA || []).find(p => p.id === propId);
            if (prop && window.ModalManager) {
                window.ModalManager.openPropertyModal(prop);
            }
        },

        updateMarkerLabels: function () {
            if (isGoogleMap) {
                overlaysMap.forEach((overlay) => {
                    overlay.updatePrice();
                });
            } else {
                leafletMarkersMap.forEach((marker, propId) => {
                    const prop = marker.propertyData;
                    if (!prop) return;
                    const formattedPrice = window.CurrencyManager.formatCompactPrice(prop.priceUSD, prop.pricePYG);
                    const el = document.querySelector(`#marker-${propId} .pill-price`);
                    if (el) {
                        el.textContent = formattedPrice;
                    }
                });
            }
        },

        highlightProperty: function (propId, scrollToCard = false) {
            activePropertyId = propId;

            document.querySelectorAll(".map-price-pill").forEach(el => el.classList.remove("active"));
            const markerEl = document.getElementById(`marker-${propId}`);
            if (markerEl) {
                markerEl.classList.add("active");
                const parentWrapper = markerEl.closest('.custom-map-pill-wrapper') || markerEl.closest('.leaflet-marker-icon');
                if (parentWrapper) parentWrapper.style.zIndex = '9999';
            }

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
                const parentWrapper = markerEl.closest('.custom-map-pill-wrapper') || markerEl.closest('.leaflet-marker-icon');
                if (parentWrapper) parentWrapper.style.zIndex = '100';
            }

            const cardEl = document.getElementById(`card-${propId}`);
            if (cardEl) {
                cardEl.classList.remove("active-card");
            }
        },

        panTo: function (lat, lng, zoom = 15) {
            if (!map) return;
            if (isGoogleMap) {
                map.panTo(new google.maps.LatLng(lat, lng));
                map.setZoom(zoom);
            } else {
                map.flyTo([lat, lng], zoom, { duration: 1.2 });
            }
        },

        invalidateSize: function () {
            if (!map) return;
            if (isGoogleMap) {
                google.maps.event.trigger(map, "resize");
            } else if (map.invalidateSize) {
                setTimeout(() => map.invalidateSize(), 200);
            }
        },

        getMapInstance: function () {
            return map;
        }
    };

    window.MapManager = MapManager;
})();
