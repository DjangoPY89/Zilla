// Orquestador Principal de la Aplicación (Zilla Paraguay)
(function () {
    let currentProperties = [];

    const App = {
        init: function () {
            // Inicializar módulos
            window.MapManager.init("map-container");
            window.ModalManager.init();
            window.PublishManager.init();

            // Cargar datos iniciales
            currentProperties = window.PROPERTIES_DATA || [];

            // Escuchar eventos globales
            this.bindGlobalEvents();

            // Procesar parámetros de URL (si viene desde la Landing Page)
            this.parseUrlParameters();

            // Renderizado inicial
            this.renderPropertyList(currentProperties);
            window.MapManager.renderMarkers(currentProperties);
        },

        parseUrlParameters: function () {
            try {
                const params = new URLSearchParams(window.location.search);
                const qKw = params.get("keyword");
                const qLat = params.get("lat");
                const qLng = params.get("lng");
                const qOp = params.get("operation");
                const qType = params.get("propType");
                const qCheRoga = params.get("che_roga");
                const qPublish = params.get("action");

                if (qKw) {
                    window.FilterManager.filters.keyword = qKw;
                    const searchInput = document.getElementById("search-input");
                    if (searchInput) searchInput.value = qKw;
                }

                if (qOp && qOp !== "all") {
                    window.FilterManager.filters.operation = qOp;
                    const opArray = qOp.split(',').map(s => s.trim());
                    window.FilterManager.filters.operations = opArray;
                    const opLabel = document.getElementById("label-operation");
                    const opCheckboxes = document.querySelectorAll("#operation-checkbox-list input[name='explorar_op_chk']");
                    opCheckboxes.forEach(cb => {
                        cb.checked = opArray.includes(cb.value);
                    });
                    const opMasterChk = document.getElementById("chk-explorar-op-all");
                    if (opMasterChk) {
                        opMasterChk.checked = (opArray.length === opCheckboxes.length);
                    }
                    const OP_LABELS = {
                        sale: "Comprar",
                        rent_monthly: "Alquiler Mensual",
                        rent_temporary: "Alquiler Temporal",
                        off_plan: "En Pozo"
                    };
                    if (opLabel) {
                        opLabel.textContent = opArray.length > 1 
                            ? `Operación: ${opArray.length} selec.`
                            : `Operación: ${OP_LABELS[opArray[0]] || opArray[0]}`;
                    }
                }

                if (qType && qType !== "all") {
                    const typeArray = qType.split(',').map(s => s.trim());
                    window.FilterManager.filters.propTypes = typeArray;
                    const checkboxes = document.querySelectorAll("#proptype-checkbox-list input[name='explorar_type_chk']");
                    checkboxes.forEach(cb => {
                        cb.checked = typeArray.includes(cb.value);
                    });
                    const typeMasterChk = document.getElementById("chk-explorar-type-all");
                    if (typeMasterChk) {
                        typeMasterChk.checked = (typeArray.length === checkboxes.length);
                    }
                    const TYPE_LABELS = {
                        house: "Casas",
                        apartment: "Departamentos",
                        gated_community: "Barrios Cerrados",
                        duplex: "Dúplex",
                        land: "Terrenos",
                        commercial: "Comercial"
                    };
                    const proptypeLabel = document.getElementById("label-proptype");
                    if (proptypeLabel) {
                        proptypeLabel.textContent = typeArray.length > 1 
                            ? `Tipo: ${typeArray.length} selec.` 
                            : `Tipo: ${TYPE_LABELS[typeArray[0]] || typeArray[0]}`;
                    }
                }

                const qMinPrice = params.get("minPrice");
                const qMaxPrice = params.get("maxPrice");
                const qBedrooms = params.get("bedrooms");
                const qBathrooms = params.get("bathrooms");

                if (qMinPrice) {
                    const minP = parseFloat(qMinPrice) || 0;
                    window.FilterManager.filters.minPriceUSD = minP;
                    const inputMin = document.getElementById("input-min-price");
                    if (inputMin) inputMin.value = minP;
                }
                if (qMaxPrice) {
                    const maxP = parseFloat(qMaxPrice) || 10000000;
                    window.FilterManager.filters.maxPriceUSD = maxP;
                    const inputMax = document.getElementById("input-max-price");
                    if (inputMax) inputMax.value = maxP;
                }
                if (qMinPrice || qMaxPrice) {
                    const labelPrice = document.getElementById("label-price");
                    if (labelPrice) {
                        const minVal = parseFloat(qMinPrice) || 0;
                        const maxVal = parseFloat(qMaxPrice) || 10000000;
                        if (minVal > 0 && maxVal < 10000000) {
                            labelPrice.textContent = `$${Math.round(minVal/1000)}k - $${Math.round(maxVal/1000)}k`;
                        } else if (minVal > 0) {
                            labelPrice.textContent = `> $${Math.round(minVal/1000)}k`;
                        } else if (maxVal < 10000000) {
                            labelPrice.textContent = `< $${Math.round(maxVal/1000)}k`;
                        }
                    }
                }

                if (qBedrooms) {
                    const beds = parseInt(qBedrooms, 10) || 0;
                    window.FilterManager.filters.minBedrooms = beds;
                    const bedSegs = document.querySelectorAll("#control-bedrooms .seg-item");
                    bedSegs.forEach(seg => {
                        if (parseInt(seg.getAttribute("data-val"), 10) === beds) {
                            bedSegs.forEach(s => s.classList.remove("active"));
                            seg.classList.add("active");
                        }
                    });
                    const labelRooms = document.getElementById("label-rooms");
                    if (labelRooms && beds > 0) {
                        labelRooms.textContent = `${beds}+ Dorms`;
                    }
                }
                if (qBathrooms) {
                    const baths = parseInt(qBathrooms, 10) || 0;
                    window.FilterManager.filters.minBathrooms = baths;
                    const bathSegs = document.querySelectorAll("#control-bathrooms .seg-item");
                    bathSegs.forEach(seg => {
                        if (parseInt(seg.getAttribute("data-val"), 10) === baths) {
                            bathSegs.forEach(s => s.classList.remove("active"));
                            seg.classList.add("active");
                        }
                    });
                }

                if (qCheRoga === "true" || qCheRoga === "1") {
                    window.FilterManager.filters.acceptsCheRogaPora = true;
                }

                const qId = params.get("id");
                if (qId) {
                    setTimeout(() => {
                        const found = (window.PROPERTIES_DATA || []).find(p => p.id === qId);
                        if (found && window.ModalManager && typeof window.ModalManager.openDetailModal === 'function') {
                            window.ModalManager.openDetailModal(found);
                        }
                    }, 400);
                }

                if (qKw || (qOp && qOp !== "all") || (qType && qType !== "all") || qMinPrice || qMaxPrice || qBedrooms || qBathrooms || qCheRoga || qId) {
                    currentProperties = window.FilterManager.applyFilters();
                }

                // ============================================================
                // NAVEGACIÓN DIRECTA EN EL MAPA HACIA LA UBICACIÓN BUSCADA
                // ============================================================
                const PARAGUAY_KNOWN_ZONES = {
                    "villa morra": { lat: -25.2938, lng: -57.5794, zoom: 15 },
                    "santa teresa": { lat: -25.2840, lng: -57.5620, zoom: 15 },
                    "ycua sati": { lat: -25.2910, lng: -57.5650, zoom: 15 },
                    "recoleta": { lat: -25.3020, lng: -57.5840, zoom: 15 },
                    "carmelitas": { lat: -25.2810, lng: -57.5730, zoom: 15 },
                    "los laureles": { lat: -25.3050, lng: -57.5680, zoom: 15 },
                    "manora": { lat: -25.2860, lng: -57.5750, zoom: 15 },
                    "mburucuya": { lat: -25.2750, lng: -57.5690, zoom: 15 },
                    "san bernardino": { lat: -25.3120, lng: -57.2960, zoom: 14 },
                    "san ber": { lat: -25.3120, lng: -57.2960, zoom: 14 },
                    "surubi'i": { lat: -25.1850, lng: -57.5250, zoom: 14 },
                    "surubii": { lat: -25.1850, lng: -57.5250, zoom: 14 },
                    "mariano roque alonso": { lat: -25.2167, lng: -57.5333, zoom: 14 },
                    "luque": { lat: -25.2690, lng: -57.4880, zoom: 14 },
                    "ciudad del este": { lat: -25.5097, lng: -54.6111, zoom: 14 },
                    "cde": { lat: -25.5097, lng: -54.6111, zoom: 14 },
                    "costa del lago": { lat: -25.4300, lng: -54.6300, zoom: 14 },
                    "hernandarias": { lat: -25.4050, lng: -54.6380, zoom: 14 },
                    "lambare": { lat: -25.3450, lng: -57.6050, zoom: 14 },
                    "san lorenzo": { lat: -25.3390, lng: -57.5090, zoom: 14 },
                    "asuncion": { lat: -25.2950, lng: -57.5900, zoom: 13 }
                };

                if (qLat && qLng) {
                    setTimeout(() => {
                        window.MapManager.panTo(parseFloat(qLat), parseFloat(qLng), 15);
                    }, 350);
                } else if (qKw) {
                    const normKw = qKw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                    let matchedZone = null;

                    for (const [key, val] of Object.entries(PARAGUAY_KNOWN_ZONES)) {
                        if (normKw.includes(key) || key.includes(normKw)) {
                            matchedZone = val;
                            break;
                        }
                    }

                    if (matchedZone) {
                        setTimeout(() => {
                            window.MapManager.panTo(matchedZone.lat, matchedZone.lng, matchedZone.zoom);
                        }, 350);
                    } else if (currentProperties.length > 0 && currentProperties[0].coordinates) {
                        const [cLat, cLng] = currentProperties[0].coordinates;
                        setTimeout(() => {
                            window.MapManager.panTo(cLat, cLng, 15);
                        }, 350);
                    }
                }
            } catch (err) {
                console.warn("Error leyendo URL params:", err);
            }
        },

        bindGlobalEvents: function () {
            // Evento cuando se filtran propiedades
            window.addEventListener("propertiesFiltered", (e) => {
                currentProperties = e.detail.properties;
                this.renderPropertyList(currentProperties);
                window.MapManager.renderMarkers(currentProperties);
            });

            // Sincronización del mapa con la lista de inmuebles al mover o hacer zoom
            window.addEventListener("mapBoundsChanged", (e) => {
                const autoSearchCheckbox = document.getElementById("search-on-map-move");
                if (autoSearchCheckbox && autoSearchCheckbox.checked) {
                    const bounds = e.detail && e.detail.bounds;
                    if (window.FilterManager) {
                        window.FilterManager.setFilter("mapBounds", bounds);
                    }
                }
            });

            // Conmutador del checkbox "Sincronizar Mapa"
            const autoSearchCheckbox = document.getElementById("search-on-map-move");
            if (autoSearchCheckbox) {
                autoSearchCheckbox.addEventListener("change", (e) => {
                    if (e.target.checked) {
                        if (window.MapManager && window.MapManager.getCurrentBounds) {
                            const bounds = window.MapManager.getCurrentBounds();
                            if (window.FilterManager) {
                                window.FilterManager.setFilter("mapBounds", bounds);
                            }
                        }
                    } else {
                        if (window.FilterManager) {
                            window.FilterManager.setFilter("mapBounds", null);
                        }
                    }
                });
            }

            // Evento cuando cambia la moneda
            window.addEventListener("currencyChanged", () => {
                this.renderPropertyList(currentProperties);
            });

            // Conmutador de moneda en la barra de navegación
            document.querySelectorAll(".currency-toggle-btn, .curr-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const currency = btn.dataset.currency;
                    window.CurrencyManager.setCurrency(currency);
                    document.querySelectorAll(".currency-toggle-btn, .curr-btn").forEach(b => {
                        b.classList.toggle("active", b.dataset.currency === currency);
                    });
                });
            });

            // Conmutador de Vista Móvil (Mapa Pantalla Completa / Lista)
            const mobileViewToggle = document.getElementById("mobile-view-toggle");
            if (mobileViewToggle) {
                mobileViewToggle.addEventListener("click", () => {
                    const isMapVisible = document.body.classList.toggle("mobile-map-active");
                    const icon = mobileViewToggle.querySelector("i");
                    const text = mobileViewToggle.querySelector("span");

                    if (isMapVisible) {
                        if (icon) icon.className = "fas fa-list-ul";
                        if (text) text.textContent = "Ver Lista";
                        if (window.MapManager && window.MapManager.invalidateSize) {
                            setTimeout(() => window.MapManager.invalidateSize(), 50);
                            setTimeout(() => window.MapManager.invalidateSize(), 250);
                        }
                    } else {
                        if (icon) icon.className = "fas fa-map-location-dot";
                        if (text) text.textContent = "Mapa Pantalla Completa";
                    }
                });
            }

            // Input de búsqueda rápida
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
                searchInput.addEventListener("input", (e) => {
                    window.FilterManager.setFilter("keyword", e.target.value.trim());
                });
            }

            // Selector de Ordenamiento Apple
            const sortSelect = document.getElementById("sort-by-select");
            if (sortSelect) {
                sortSelect.addEventListener("change", (e) => {
                    window.FilterManager.setFilter("sortBy", e.target.value);
                });
            }

            // Inicializar todos los menús desplegables estilo Apple Glassmorphism
            this.initAppleDropdowns();

            // Controlador para achicar o alternar tamaño del mapa
            this.initMapSizeController();

            // Controlador para alternar entre Cuadrícula y Fila Detallada
            this.initFeedLayoutController();

            // Enlaces rápidos del Footer
            this.initFooterLinks();
        },

        initFeedLayoutController: function () {
            const layoutBtns = document.querySelectorAll(".btn-feed-layout");
            const feedContainer = document.getElementById("properties-feed");
            const savedLayout = localStorage.getItem("zilla_feed_layout") || "grid";

            const applyLayout = (layout) => {
                layoutBtns.forEach(btn => {
                    btn.classList.toggle("active", btn.dataset.layout === layout);
                });

                if (feedContainer) {
                    feedContainer.classList.toggle("layout-detailed-rows", layout === "detailed");
                }
                localStorage.setItem("zilla_feed_layout", layout);
            };

            // Aplicar preferencia inicial
            applyLayout(savedLayout);

            layoutBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    applyLayout(btn.dataset.layout);
                });
            });
        },

        initMapSizeController: function () {
            const mapSizeBtns = document.querySelectorAll(".btn-map-size:not(.btn-feed-layout)");
            const splitContainer = document.querySelector(".split-screen-container");
            const mapCollapseEdgeBtn = document.getElementById("map-collapse-edge-btn");

            let currentMapSize = "split"; // "split", "wide", "compact", "hide"

            const applySize = (size) => {
                currentMapSize = size;
                mapSizeBtns.forEach(btn => {
                    btn.classList.toggle("active", btn.dataset.size === size);
                });

                if (splitContainer) {
                    splitContainer.classList.remove("map-size-compact", "map-size-hide", "map-size-wide");
                    if (size === "compact") splitContainer.classList.add("map-size-compact");
                    else if (size === "hide") splitContainer.classList.add("map-size-hide");
                    else if (size === "wide") splitContainer.classList.add("map-size-wide");
                }

                if (mapCollapseEdgeBtn) {
                    const icon = mapCollapseEdgeBtn.querySelector("i");
                    if (icon) {
                        icon.className = size === "compact" || size === "hide" ? "fas fa-chevron-left" : "fas fa-chevron-right";
                    }
                    mapCollapseEdgeBtn.title = size === "hide" ? "Restaurar Mapa" : (size === "compact" ? "Ocultar Mapa" : (size === "wide" ? "Achicar a Dividido" : "Agrandar a 3/4"));
                }

                // Ajustar renderizado de canvas en Google Maps / Leaflet
                setTimeout(() => {
                    if (window.MapManager && window.MapManager.invalidateSize) {
                        window.MapManager.invalidateSize();
                    }
                }, 380);
            };

            mapSizeBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    applySize(btn.dataset.size);
                });
            });

            if (mapCollapseEdgeBtn) {
                mapCollapseEdgeBtn.addEventListener("click", () => {
                    if (currentMapSize === "split") {
                        applySize("wide");
                    } else if (currentMapSize === "wide") {
                        applySize("compact");
                    } else if (currentMapSize === "compact") {
                        applySize("hide");
                    } else {
                        applySize("split");
                    }
                });
            }
        },

        initAppleDropdowns: function () {
            // 1. Manejo general de apertura y cierre de popovers Apple
            const dropdownContainers = document.querySelectorAll(".apple-dropdown-container");

            dropdownContainers.forEach(container => {
                const btn = container.querySelector(".apple-filter-btn");
                if (btn) {
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const isOpen = container.classList.contains("open");
                        // Cerrar todos los demás
                        dropdownContainers.forEach(c => c.classList.remove("open"));
                        if (!isOpen) {
                            container.classList.add("open");
                        }
                    });
                }
            });

            // Cerrar dropdowns al hacer clic fuera o presionar Esc
            document.addEventListener("click", (e) => {
                if (!e.target.closest(".apple-dropdown-container")) {
                    dropdownContainers.forEach(c => c.classList.remove("open"));
                }
            });

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    dropdownContainers.forEach(c => c.classList.remove("open"));
                }
            });

            // 2. Dropdown: Operación (SELECCIÓN MÚLTIPLE IGUAL A INDEX)
            const opContainer = document.getElementById("dropdown-operation-container");
            const opLabel = document.getElementById("label-operation");
            const opBadge = document.getElementById("badge-operation-count");
            const opBtn = document.getElementById("btn-dropdown-operation");
            const opCheckboxes = document.querySelectorAll("#operation-checkbox-list input[name='explorar_op_chk']");
            const opMasterChk = document.getElementById("chk-explorar-op-all");
            const opAllActionBtn = document.getElementById("btn-explorar-op-all-action");
            const applyOpBtn = document.getElementById("apply-operation-btn");

            const OP_LABELS = {
                sale: "Comprar",
                rent_monthly: "Alquiler Mensual",
                rent_temporary: "Alquiler Temporal",
                off_plan: "En Pozo"
            };

            const updateOperationUI = (triggerFilter = true) => {
                const checked = Array.from(opCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
                const total = opCheckboxes.length;

                if (opMasterChk) {
                    opMasterChk.checked = (checked.length === total);
                }

                if (checked.length === 0 || checked.length === total) {
                    if (opLabel) opLabel.textContent = "Operación: Todas";
                    if (opBadge) opBadge.style.display = "none";
                    if (opBtn) opBtn.classList.remove("active-filter");
                    window.FilterManager.filters.operation = "all";
                    window.FilterManager.filters.operations = [];
                } else if (checked.length === 1) {
                    const text = OP_LABELS[checked[0]] || checked[0];
                    if (opLabel) opLabel.textContent = `Operación: ${text}`;
                    if (opBadge) {
                        opBadge.textContent = "1";
                        opBadge.style.display = "inline-block";
                    }
                    if (opBtn) opBtn.classList.add("active-filter");
                    window.FilterManager.filters.operation = checked[0];
                    window.FilterManager.filters.operations = checked;
                } else {
                    if (opLabel) opLabel.textContent = `Operación: ${checked.length} selec.`;
                    if (opBadge) {
                        opBadge.textContent = checked.length;
                        opBadge.style.display = "inline-block";
                    }
                    if (opBtn) opBtn.classList.add("active-filter");
                    window.FilterManager.filters.operation = checked.join(",");
                    window.FilterManager.filters.operations = checked;
                }

                if (triggerFilter) {
                    currentProperties = window.FilterManager.applyFilters();
                    this.renderPropertyList(currentProperties);
                    window.MapManager.renderMarkers(currentProperties);
                }
            };

            if (opMasterChk) {
                opMasterChk.addEventListener("change", () => {
                    const isChecked = opMasterChk.checked;
                    opCheckboxes.forEach(cb => cb.checked = isChecked);
                    updateOperationUI(true);
                });
            }

            if (opAllActionBtn) {
                opAllActionBtn.addEventListener("click", () => {
                    opCheckboxes.forEach(cb => cb.checked = true);
                    if (opMasterChk) opMasterChk.checked = true;
                    updateOperationUI(true);
                });
            }

            opCheckboxes.forEach(cb => {
                cb.addEventListener("change", () => {
                    updateOperationUI(true);
                });
            });

            if (applyOpBtn) {
                applyOpBtn.addEventListener("click", () => {
                    updateOperationUI(true);
                    if (opContainer) opContainer.classList.remove("open");
                });
            }

            // 3. Dropdown: Tipo de Inmueble (SELECCIÓN MÚLTIPLE IGUAL A INDEX)
            const proptypeContainer = document.getElementById("dropdown-proptype-container");
            const proptypeLabel = document.getElementById("label-proptype");
            const proptypeBadge = document.getElementById("badge-proptype-count");
            const proptypeBtn = document.getElementById("btn-dropdown-proptype");
            const proptypeCheckboxes = document.querySelectorAll("#proptype-checkbox-list input[name='explorar_type_chk']");
            const typeMasterChk = document.getElementById("chk-explorar-type-all");
            const typeAllActionBtn = document.getElementById("btn-explorar-type-all-action");
            const applyProptypeBtn = document.getElementById("apply-proptype-btn");

            const TYPE_LABELS = {
                house: "Casas",
                apartment: "Departamentos",
                gated_community: "Barrios Cerrados",
                duplex: "Dúplex",
                land: "Terrenos",
                commercial: "Comercial"
            };

            const updateProptypeUI = (triggerFilter = true) => {
                const checked = Array.from(proptypeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
                const total = proptypeCheckboxes.length;

                if (typeMasterChk) {
                    typeMasterChk.checked = (checked.length === total);
                }

                if (checked.length === 0 || checked.length === total) {
                    if (proptypeLabel) proptypeLabel.textContent = "Tipo: Todos";
                    if (proptypeBadge) proptypeBadge.style.display = "none";
                    if (proptypeBtn) proptypeBtn.classList.remove("active-filter");
                    window.FilterManager.filters.propTypes = [];
                } else if (checked.length === 1) {
                    const text = TYPE_LABELS[checked[0]] || checked[0];
                    if (proptypeLabel) proptypeLabel.textContent = `Tipo: ${text}`;
                    if (proptypeBadge) {
                        proptypeBadge.textContent = "1";
                        proptypeBadge.style.display = "inline-block";
                    }
                    if (proptypeBtn) proptypeBtn.classList.add("active-filter");
                    window.FilterManager.filters.propTypes = checked;
                } else {
                    if (proptypeLabel) proptypeLabel.textContent = `Tipo: ${checked.length} selec.`;
                    if (proptypeBadge) {
                        proptypeBadge.textContent = checked.length;
                        proptypeBadge.style.display = "inline-block";
                    }
                    if (proptypeBtn) proptypeBtn.classList.add("active-filter");
                    window.FilterManager.filters.propTypes = checked;
                }

                if (triggerFilter) {
                    currentProperties = window.FilterManager.applyFilters();
                    this.renderPropertyList(currentProperties);
                    window.MapManager.renderMarkers(currentProperties);
                }
            };

            if (typeMasterChk) {
                typeMasterChk.addEventListener("change", () => {
                    const isChecked = typeMasterChk.checked;
                    proptypeCheckboxes.forEach(cb => cb.checked = isChecked);
                    updateProptypeUI(true);
                });
            }

            if (typeAllActionBtn) {
                typeAllActionBtn.addEventListener("click", () => {
                    proptypeCheckboxes.forEach(cb => cb.checked = true);
                    if (typeMasterChk) typeMasterChk.checked = true;
                    updateProptypeUI(true);
                });
            }

            proptypeCheckboxes.forEach(cb => {
                cb.addEventListener("change", () => {
                    updateProptypeUI(true);
                });
            });

            if (applyProptypeBtn) {
                applyProptypeBtn.addEventListener("click", () => {
                    updateProptypeUI(true);
                    if (proptypeContainer) proptypeContainer.classList.remove("open");
                });
            }

            // 4. Dropdown: Dormitorios & Baños (Prioritario Apple Segmented Control)
            const roomsContainer = document.getElementById("dropdown-rooms-container");
            const roomsLabel = document.getElementById("label-rooms");
            const roomsBtn = document.getElementById("btn-dropdown-rooms");
            let selectedBedrooms = 0;
            let selectedBathrooms = 0;

            const bedSegs = document.querySelectorAll("#control-bedrooms .seg-item");
            bedSegs.forEach(btn => {
                btn.addEventListener("click", () => {
                    bedSegs.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    selectedBedrooms = parseInt(btn.dataset.val, 10) || 0;
                });
            });

            const bathSegs = document.querySelectorAll("#control-bathrooms .seg-item");
            bathSegs.forEach(btn => {
                btn.addEventListener("click", () => {
                    bathSegs.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    selectedBathrooms = parseInt(btn.dataset.val, 10) || 0;
                });
            });

            const applyRoomsBtn = document.getElementById("apply-rooms-btn");
            const resetRoomsBtn = document.getElementById("reset-rooms-btn");

            if (applyRoomsBtn) {
                applyRoomsBtn.addEventListener("click", () => {
                    window.FilterManager.setFilter("minBedrooms", selectedBedrooms);
                    window.FilterManager.setFilter("minBathrooms", selectedBathrooms);

                    let labelText = "Dorms & Baños";
                    if (selectedBedrooms > 0 && selectedBathrooms > 0) {
                        labelText = `${selectedBedrooms}+ Hab / ${selectedBathrooms}+ Baños`;
                    } else if (selectedBedrooms > 0) {
                        labelText = `${selectedBedrooms}+ Dormitorios`;
                    } else if (selectedBathrooms > 0) {
                        labelText = `${selectedBathrooms}+ Baños`;
                    }

                    if (roomsLabel) roomsLabel.textContent = labelText;
                    if (roomsBtn) roomsBtn.classList.toggle("active-filter", selectedBedrooms > 0 || selectedBathrooms > 0);

                    if (roomsContainer) roomsContainer.classList.remove("open");
                });
            }

            if (resetRoomsBtn) {
                resetRoomsBtn.addEventListener("click", () => {
                    selectedBedrooms = 0;
                    selectedBathrooms = 0;
                    bedSegs.forEach(b => b.classList.toggle("active", b.dataset.val === "0"));
                    bathSegs.forEach(b => b.classList.toggle("active", b.dataset.val === "0"));
                    window.FilterManager.setFilter("minBedrooms", 0);
                    window.FilterManager.setFilter("minBathrooms", 0);
                    if (roomsLabel) roomsLabel.textContent = "Dorms & Baños";
                    if (roomsBtn) roomsBtn.classList.remove("active-filter");
                    if (roomsContainer) roomsContainer.classList.remove("open");
                });
            }

            // 5. Dropdown: Rango de Precios (Prioritario)
            const priceContainer = document.getElementById("dropdown-price-container");
            const priceLabel = document.getElementById("label-price");
            const priceBtn = document.getElementById("btn-dropdown-price");
            const minPriceInput = document.getElementById("input-min-price");
            const maxPriceInput = document.getElementById("input-max-price");
            const applyPriceBtn = document.getElementById("apply-price-btn");
            const resetPriceBtn = document.getElementById("reset-price-btn");

            // Presets de precio rápidos
            document.querySelectorAll(".price-chip").forEach(chip => {
                chip.addEventListener("click", () => {
                    const min = chip.dataset.min;
                    const max = chip.dataset.max;
                    if (minPriceInput) minPriceInput.value = min > 0 ? min : "";
                    if (maxPriceInput) maxPriceInput.value = max < 10000000 ? max : "";
                });
            });

            // Toggle mini de moneda para precio
            let priceFilterCurrency = "USD";
            document.querySelectorAll(".curr-mini-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    document.querySelectorAll(".curr-mini-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    priceFilterCurrency = btn.dataset.curr;
                    const sym = priceFilterCurrency === "USD" ? "US$" : "₲";
                    const minSym = document.getElementById("sym-min-price");
                    const maxSym = document.getElementById("sym-max-price");
                    if (minSym) minSym.textContent = sym;
                    if (maxSym) maxSym.textContent = sym;
                });
            });

            if (applyPriceBtn) {
                applyPriceBtn.addEventListener("click", () => {
                    let min = parseFloat(minPriceInput?.value) || 0;
                    let max = parseFloat(maxPriceInput?.value) || 10000000;

                    // Si se ingresó en guaraníes, convertir a USD para el filtro unificado
                    if (priceFilterCurrency === "PYG") {
                        if (min > 0) min = Math.round(min / 7950);
                        if (max < 10000000) max = Math.round(max / 7950);
                    }

                    window.FilterManager.setFilter("minPriceUSD", min);
                    window.FilterManager.setFilter("maxPriceUSD", max);

                    const hasCustomPrice = min > 0 || max < 10000000;
                    if (priceLabel) {
                        if (min > 0 && max < 10000000) {
                            priceLabel.textContent = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
                        } else if (min > 0) {
                            priceLabel.textContent = `> $${min.toLocaleString()}`;
                        } else if (max < 10000000) {
                            priceLabel.textContent = `< $${max.toLocaleString()}`;
                        } else {
                            priceLabel.textContent = "Rango de Precio";
                        }
                    }
                    if (priceBtn) priceBtn.classList.toggle("active-filter", hasCustomPrice);
                    if (priceContainer) priceContainer.classList.remove("open");
                });
            }

            if (resetPriceBtn) {
                resetPriceBtn.addEventListener("click", () => {
                    if (minPriceInput) minPriceInput.value = "";
                    if (maxPriceInput) maxPriceInput.value = "";
                    window.FilterManager.setFilter("minPriceUSD", 0);
                    window.FilterManager.setFilter("maxPriceUSD", 10000000);
                    if (priceLabel) priceLabel.textContent = "Rango de Precio";
                    if (priceBtn) priceBtn.classList.remove("active-filter");
                    if (priceContainer) priceContainer.classList.remove("open");
                });
            }

            // 6. Dropdown: Extras & Amenities (Glassmorphic Bonito)
            const extrasContainer = document.getElementById("dropdown-extras-container");
            const extrasLabel = document.getElementById("label-extras");
            const extrasBadge = document.getElementById("badge-extras-count");
            const extrasBtn = document.getElementById("btn-dropdown-extras");
            const extrasCheckboxes = document.querySelectorAll("#extras-apple-grid input[type='checkbox']");
            const applyExtrasBtn = document.getElementById("apply-extras-btn");
            const resetExtrasBtn = document.getElementById("reset-extras-btn");

            const updateExtrasUI = () => {
                const checked = Array.from(extrasCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
                if (checked.length === 0) {
                    if (extrasLabel) extrasLabel.textContent = "Extras & Amenities";
                    if (extrasBadge) extrasBadge.style.display = "none";
                    if (extrasBtn) extrasBtn.classList.remove("active-filter");
                    window.FilterManager.setFilter("amenities", []);
                } else {
                    if (extrasLabel) extrasLabel.textContent = `Extras: ${checked.length} activos`;
                    if (extrasBadge) {
                        extrasBadge.textContent = checked.length;
                        extrasBadge.style.display = "inline-block";
                    }
                    if (extrasBtn) extrasBtn.classList.add("active-filter");
                    window.FilterManager.setFilter("amenities", checked);
                }
            };

            if (applyExtrasBtn) {
                applyExtrasBtn.addEventListener("click", () => {
                    updateExtrasUI();
                    if (extrasContainer) extrasContainer.classList.remove("open");
                });
            }

            if (resetExtrasBtn) {
                resetExtrasBtn.addEventListener("click", () => {
                    extrasCheckboxes.forEach(cb => cb.checked = false);
                    updateExtrasUI();
                    if (extrasContainer) extrasContainer.classList.remove("open");
                });
            }

            // 7. Botón Reset Global
            const globalResetBtn = document.getElementById("btn-global-reset");
            if (globalResetBtn) {
                globalResetBtn.addEventListener("click", () => {
                    window.FilterManager.resetFilters();
                });
            }

            // Escuchar evento filtersReset
            window.addEventListener("filtersReset", () => {
                // Reset Operation
                if (opLabel) opLabel.textContent = "Operación: Todas";
                if (opBtn) opBtn.classList.remove("active-filter");
                opContainer?.querySelectorAll(".apple-option-item").forEach(i => i.classList.toggle("active", i.dataset.op === "all"));

                // Reset Prop Type
                proptypeCheckboxes.forEach(cb => cb.checked = true);
                if (proptypeLabel) proptypeLabel.textContent = "Tipo: Todo Inmueble";
                if (proptypeBadge) proptypeBadge.style.display = "none";
                if (proptypeBtn) proptypeBtn.classList.remove("active-filter");

                // Reset Rooms
                bedSegs.forEach(b => b.classList.toggle("active", b.dataset.val === "0"));
                bathSegs.forEach(b => b.classList.toggle("active", b.dataset.val === "0"));
                if (roomsLabel) roomsLabel.textContent = "Dorms & Baños";
                if (roomsBtn) roomsBtn.classList.remove("active-filter");

                // Reset Price
                if (minPriceInput) minPriceInput.value = "";
                if (maxPriceInput) maxPriceInput.value = "";
                if (priceLabel) priceLabel.textContent = "Rango de Precio";
                if (priceBtn) priceBtn.classList.remove("active-filter");

                // Reset Extras
                extrasCheckboxes.forEach(cb => cb.checked = false);
                if (extrasLabel) extrasLabel.textContent = "Extras & Amenities";
                if (extrasBadge) extrasBadge.style.display = "none";
                if (extrasBtn) extrasBtn.classList.remove("active-filter");
            });
        },

        initFooterLinks: function () {
            // Zonas populares en footer
            document.querySelectorAll(".footer-zone-link").forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const zone = link.dataset.zone;
                    if (zone) {
                        const searchInput = document.getElementById("search-input");
                        if (searchInput) searchInput.value = zone;
                        window.FilterManager.setFilter("keyword", zone);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                });
            });

            // Tipos de inmueble en footer
            document.querySelectorAll(".footer-type-link").forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const type = link.dataset.type;
                    if (type) {
                        const checkboxes = document.querySelectorAll("#proptype-checkbox-list input[type='checkbox']");
                        checkboxes.forEach(cb => cb.checked = (cb.value === type));
                        const label = document.getElementById("label-proptype");
                        if (label) label.textContent = `Tipo: 1 tipo`;
                        window.FilterManager.setFilter("propTypes", [type]);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                });
            });

            // Operaciones en footer
            document.querySelectorAll(".footer-op-link").forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const op = link.dataset.op;
                    if (op) {
                        window.FilterManager.setFilter("operation", op);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                });
            });

            // Amenities en footer (ej. Che Róga Porã)
            document.querySelectorAll(".footer-am-link").forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const am = link.dataset.am;
                    if (am === "che_roga") {
                        window.FilterManager.setFilter("acceptsCheRogaPora", true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                });
            });

            // Publicar anuncio en footer
            const footerPublishBtn = document.getElementById("footer-publish-btn");
            if (footerPublishBtn) {
                footerPublishBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    const publishModal = document.getElementById("publish-modal-container");
                    if (publishModal) publishModal.classList.add("active");
                });
            }
        },

        renderPropertyList: function (properties) {
            const feedContainer = document.getElementById("properties-feed");
            const countLabel = document.getElementById("results-count-label");

            if (countLabel) {
                countLabel.textContent = `${properties.length} inmuebles encontrados en Paraguay`;
            }

            if (!feedContainer) return;

            if (properties.length === 0) {
                feedContainer.innerHTML = `
                    <div class="empty-feed-state">
                        <div class="empty-icon"><i class="fas fa-search-location"></i></div>
                        <h3>No se encontraron inmuebles</h3>
                        <p>Intenta ajustar tus filtros de búsqueda o restablecer los valores para ver más resultados.</p>
                        <button class="btn btn-primary btn-sm" onclick="window.FilterManager.resetFilters()">
                            <i class="fas fa-rotate-left"></i> Restablecer Filtros
                        </button>
                    </div>
                `;
                return;
            }

            feedContainer.innerHTML = properties.map(prop => this.buildPropertyCardHTML(prop)).join("");

            // Vincular eventos de cada tarjeta
            properties.forEach(prop => {
                const card = document.getElementById(`card-${prop.id}`);
                if (!card) return;

                // Clic en la tarjeta abre el modal completo de la propiedad
                card.addEventListener("click", (e) => {
                    // Si el clic fue en un botón de carrusel o favorito, no abrir modal
                    if (e.target.closest('.card-carousel-btn') || e.target.closest('.card-fav-btn')) {
                        return;
                    }
                    window.ModalManager.openPropertyModal(prop);
                });

                // Hover en tarjeta resalta el pin en el mapa
                card.addEventListener("mouseenter", () => {
                    window.MapManager.highlightProperty(prop.id, false);
                });

                card.addEventListener("mouseleave", () => {
                    window.MapManager.unhighlightProperty(prop.id);
                });

                // Inicializar carrusel interno de la tarjeta
                this.initCardCarousel(card, prop);
            });
        },

        buildPropertyCardHTML: function (prop) {
            const formattedPrice = window.CurrencyManager.formatPrice(prop.priceUSD, prop.pricePYG);
            const isPlatinum = prop.tier === "platinum";
            const images = prop.images && prop.images.length > 0 ? prop.images : [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
            ];

            const area = prop.builtAreaM2 || prop.totalAreaM2 || 1;
            const pricePerM2USD = Math.round(prop.priceUSD / area);
            const pricePerM2PYG = Math.round(prop.pricePYG / area);
            const formattedPricePerM2 = window.CurrencyManager.currentCurrency === "PYG"
                ? `₲ ${(pricePerM2PYG / 1000000).toFixed(1)}M/m²`
                : `$${pricePerM2USD.toLocaleString()}/m²`;

            const cleanPhone = (prop.contactPhone || "+595981123456").replace(/[^0-9]/g, "");
            const waMessage = encodeURIComponent(`¡Hola! Me interesa la propiedad "${prop.title}" en Zilla Paraguay. ¿Podrías brindarme más información?`);
            const waLink = `https://wa.me/${cleanPhone}?text=${waMessage}`;

            return `
                <div class="property-card ${isPlatinum ? 'card-platinum' : ''}" id="card-${prop.id}">
                    <!-- Carrusel de Fotos de la Tarjeta -->
                    <div class="card-media-wrapper">
                        <div class="card-carousel-container" data-current-index="0">
                            ${images.map((img, idx) => `
                                <img src="${img}" class="card-image ${idx === 0 ? 'active' : ''}" alt="${prop.title}" loading="lazy" data-index="${idx}">
                            `).join('')}
                        </div>
                        
                        ${images.length > 1 ? `
                            <button class="card-carousel-btn prev-btn" title="Foto anterior"><i class="fas fa-chevron-left"></i></button>
                            <button class="card-carousel-btn next-btn" title="Foto siguiente"><i class="fas fa-chevron-right"></i></button>
                            <div class="carousel-dots">
                                ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}"></span>`).join('')}
                            </div>
                        ` : ''}

                        <!-- Insignia Superior -->
                        <div class="card-badge-top-left">
                            ${prop.badge ? `<span class="micro-badge ${isPlatinum ? 'badge-gold' : 'badge-primary'}">${prop.badge}</span>` : ''}
                            ${prop.acceptsCheRogaPora ? `<span class="micro-badge badge-cheroga">Che Róga Porã</span>` : ''}
                        </div>

                        <!-- Botón Favorito -->
                        <button class="card-fav-btn" title="Guardar en favoritos" onclick="this.classList.toggle('active')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>

                    <!-- Contenido de la Tarjeta -->
                    <div class="card-info-content">
                        <div>
                            <div class="card-location-row">
                                <span class="card-neighborhood"><i class="fas fa-map-marker-alt text-primary"></i> ${prop.neighborhood}, ${prop.city}</span>
                                <span class="card-op-tag tag-${prop.operation}">${window.ModalManager.getOperationLabel(prop.operation)}</span>
                            </div>

                            <h3 class="card-title">${prop.title}</h3>

                            <div class="card-specs-row">
                                ${prop.bedrooms > 0 ? `<span><i class="fas fa-bed"></i> ${prop.bedrooms} Dorms</span> • ` : ''}
                                ${prop.bathrooms > 0 ? `<span><i class="fas fa-bath"></i> ${prop.bathrooms} Baños</span> • ` : ''}
                                ${prop.builtAreaM2 > 0 ? `<span><i class="fas fa-ruler-combined"></i> ${prop.builtAreaM2} m²</span>` : `<span><i class="fas fa-vector-square"></i> ${prop.totalAreaM2} m²</span>`}
                                ${prop.garages > 0 ? ` • <span><i class="fas fa-car"></i> ${prop.garages} Coch.</span>` : ''}
                            </div>

                            <!-- Amenities & Badges Detallados para la Vista en Fila -->
                            <div class="card-detailed-amenities">
                                <span class="detailed-amenity-chip chip-m2-price"><i class="fas fa-calculator"></i> ${formattedPricePerM2}</span>
                                ${prop.capRateProyectado ? `<span class="detailed-amenity-chip chip-caprate"><i class="fas fa-chart-line"></i> Cap Rate ${prop.capRateProyectado}%</span>` : ''}
                                ${prop.acceptsAfd ? `<span class="detailed-amenity-chip"><i class="fas fa-shield-alt"></i> Crédito AFD</span>` : ''}
                                ${prop.amenities ? prop.amenities.slice(0, 3).map(a => `<span class="detailed-amenity-chip"><i class="fas fa-check text-primary"></i> ${a}</span>`).join('') : ''}
                            </div>
                        </div>

                        <div class="card-price-footer">
                            <div>
                                <div class="card-price-main">${formattedPrice}</div>
                                ${prop.expensesPYG > 0 ? `<div class="card-expenses">+ ₲ ${prop.expensesPYG.toLocaleString('es-PY')}/m exp.</div>` : ''}
                            </div>

                            <div class="card-row-actions">
                                <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-row-whatsapp" onclick="event.stopPropagation();" title="Contactar por WhatsApp">
                                    <i class="fab fa-whatsapp"></i> WhatsApp
                                </a>
                                <button type="button" class="btn-row-details" title="Ver ficha completa">
                                    <i class="fas fa-arrow-up-right-from-square"></i> Ver Ficha
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        initCardCarousel: function (cardElement, prop) {
            const container = cardElement.querySelector(".card-carousel-container");
            const images = cardElement.querySelectorAll(".card-image");
            const dots = cardElement.querySelectorAll(".carousel-dots .dot");
            const prevBtn = cardElement.querySelector(".card-carousel-btn.prev-btn");
            const nextBtn = cardElement.querySelector(".card-carousel-btn.next-btn");

            if (!container || images.length <= 1) return;

            let currentIndex = 0;

            const showImage = (index) => {
                images.forEach((img, i) => img.classList.toggle("active", i === index));
                dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
                currentIndex = index;
            };

            if (prevBtn) {
                prevBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const newIndex = (currentIndex - 1 + images.length) % images.length;
                    showImage(newIndex);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const newIndex = (currentIndex + 1) % images.length;
                    showImage(newIndex);
                });
            }
        }
    };

    // Auto-inicializar al cargar el DOM
    document.addEventListener("DOMContentLoaded", () => {
        App.init();
    });

    window.App = App;
})();
