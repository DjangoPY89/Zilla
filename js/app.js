// Orquestador Principal de Zilla Flex Media Estancia
(function () {
    let currentProperties = [];

    const App = {
        init: function () {
            // 1. Inicializar tema (Claro / Oscuro)
            this.initTheme();

            // 2. Inicializar módulos
            if (window.CurrencyManager) window.CurrencyManager.init();
            if (window.MapManager) window.MapManager.init("leaflet-map");
            if (window.ModalManager) window.ModalManager.init();
            if (window.AuthRolesManager) window.AuthRolesManager.init();
            if (window.AIConciergeManager) window.AIConciergeManager.init();
            if (window.PublishManager) window.PublishManager.init();
            if (window.CheckoutManager) window.CheckoutManager.init();

            // 3. Cargar parámetros iniciales (de landing.html o URL)
            this.loadInitialURLParams();

            // 4. Vincular listeners globales
            this.bindGlobalEvents();

            // 5. Cargar propiedades y renderizar
            if (window.FilterManager) {
                currentProperties = window.FilterManager.applyFilters();
            }
        },

        initTheme: function () {
            const savedTheme = localStorage.getItem("zilla_theme") || "light";
            document.documentElement.setAttribute("data-theme", savedTheme);

            const themeToggleBtn = document.getElementById("app-theme-toggle");
            if (themeToggleBtn) {
                themeToggleBtn.querySelector("i").className = savedTheme === "dark" ? "fas fa-sun text-accent" : "fas fa-moon";
                themeToggleBtn.addEventListener("click", () => {
                    const current = document.documentElement.getAttribute("data-theme");
                    const next = current === "dark" ? "light" : "dark";
                    document.documentElement.setAttribute("data-theme", next);
                    localStorage.setItem("zilla_theme", next);
                    themeToggleBtn.querySelector("i").className = next === "dark" ? "fas fa-sun text-accent" : "fas fa-moon";
                });
            }
        },

        loadInitialURLParams: function () {
            const urlParams = new URLSearchParams(window.location.search);
            const locParam = urlParams.get("loc") || localStorage.getItem("zilla_search_location");
            const durationParam = urlParams.get("duration") || localStorage.getItem("zilla_search_duration");

            if (locParam && locParam !== "all") {
                const locSelect = document.getElementById("location-select");
                if (locSelect) locSelect.value = locParam;
                if (window.FilterManager) window.FilterManager.filters.neighborhood = locParam;
            }

            if (durationParam) {
                const durationSelect = document.getElementById("duration-select");
                if (durationSelect) durationSelect.value = durationParam;
                if (window.FilterManager) window.FilterManager.filters.durationMonths = parseInt(durationParam, 10);
            }
        },

        bindGlobalEvents: function () {
            // Evento cuando se filtran propiedades
            window.addEventListener("propertiesFiltered", (e) => {
                currentProperties = e.detail.properties;
                this.renderPropertyList(currentProperties);
                if (window.MapManager) window.MapManager.renderMarkers(currentProperties);
                this.updateFilterUIStates(e.detail.filters, e.detail.activeCount);
            });

            // Evento cuando cambia la moneda global
            window.addEventListener("currencyChanged", (e) => {
                this.renderPropertyList(currentProperties);
                this.syncPriceCurrency(e.detail.currency);
            });

            // Conmutador de moneda en la barra de navegación
            document.querySelectorAll(".currency-toggle-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const currency = btn.dataset.currency;
                    if (window.CurrencyManager) window.CurrencyManager.setCurrency(currency);
                });
            });

            // Conmutador de Rol (Arrendatario vs Propietario)
            const roleBtn = document.getElementById("user-role-toggle-btn");
            if (roleBtn) {
                roleBtn.addEventListener("click", () => {
                    if (window.AuthRolesManager) window.AuthRolesManager.toggleRole();
                });
            }

            // Conmutador de Vista Móvil (Mapa / Lista)
            const mobileViewToggle = document.getElementById("mobile-view-toggle");
            if (mobileViewToggle) {
                mobileViewToggle.addEventListener("click", () => {
                    const isMapVisible = document.body.classList.toggle("mobile-map-active");
                    const icon = mobileViewToggle.querySelector("i");
                    const text = mobileViewToggle.querySelector("span");

                    if (isMapVisible) {
                        icon.className = "fas fa-list";
                        text.textContent = "Ver Lista";
                        if (window.MapManager) window.MapManager.invalidateSize();
                    } else {
                        icon.className = "fas fa-map-marked-alt";
                        text.textContent = "Ver Mapa";
                    }
                });
            }

            // Input de búsqueda rápida
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
                searchInput.addEventListener("input", (e) => {
                    if (window.FilterManager) window.FilterManager.setFilter("keyword", e.target.value.trim());
                });
            }

            // Selector de Ubicación
            const locationSelect = document.getElementById("location-select");
            if (locationSelect) {
                locationSelect.addEventListener("change", (e) => {
                    if (window.FilterManager) window.FilterManager.setFilter("neighborhood", e.target.value);
                });
            }

            // Selector de Duración de Estancia (1 a 11 meses)
            const durationSelect = document.getElementById("duration-select");
            if (durationSelect) {
                durationSelect.addEventListener("change", (e) => {
                    const months = parseInt(e.target.value, 10);
                    localStorage.setItem("zilla_search_duration", months);
                    if (window.FilterManager) window.FilterManager.setFilter("durationMonths", months);
                });
            }

            // Inicializar Popovers de Precio y Dormitorios
            this.initPopovers();
            this.initPriceFilter();
            this.initRoomsFilter();
            this.initQuickChips();

            // Botón de Restablecer Todos los Filtros
            const resetAllBtn = document.getElementById("reset-all-filters-btn");
            if (resetAllBtn) {
                resetAllBtn.addEventListener("click", () => {
                    if (window.FilterManager) window.FilterManager.resetFilters();
                });
            }
        },

        initPopovers: function () {
            const popovers = [
                { btn: document.getElementById("price-dropdown-btn"), popover: document.getElementById("price-dropdown-popover") },
                { btn: document.getElementById("rooms-dropdown-btn"), popover: document.getElementById("rooms-dropdown-popover") }
            ];

            const closeAllPopovers = () => {
                popovers.forEach(p => {
                    if (p.btn) p.btn.classList.remove("open");
                    if (p.popover) p.popover.classList.remove("active");
                });
            };

            popovers.forEach(p => {
                if (p.btn && p.popover) {
                    p.btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const isOpen = p.popover.classList.contains("active");
                        closeAllPopovers();
                        if (!isOpen) {
                            p.popover.classList.add("active");
                            p.btn.classList.add("open");
                        }
                    });

                    p.popover.addEventListener("click", (e) => {
                        e.stopPropagation();
                    });
                }
            });

            document.addEventListener("click", () => {
                closeAllPopovers();
            });
        },

        initPriceFilter: function () {
            let activeCurrency = window.CurrencyManager ? window.CurrencyManager.getCurrency() : "USD";
            const minInput = document.getElementById("filter-min-price");
            const maxInput = document.getElementById("filter-max-price");
            const minSymbol = document.getElementById("min-price-symbol");
            const maxSymbol = document.getElementById("max-price-symbol");
            const presetsContainer = document.getElementById("price-presets-container");
            const applyBtn = document.getElementById("apply-price-btn");
            const clearBtn = document.getElementById("clear-price-btn");
            const currBtns = document.querySelectorAll(".popover-curr-btn");

            const renderPresets = (curr) => {
                if (!presetsContainer) return;
                let presets = [];
                if (curr === "USD") {
                    presets = [
                        { label: "< US$ 1.000", min: 0, max: 1000 },
                        { label: "US$ 1.000 - 1.500", min: 1000, max: 1500 },
                        { label: "US$ 1.500 - 2.500", min: 1500, max: 2500 },
                        { label: "> US$ 2.500", min: 2500, max: null }
                    ];
                } else {
                    presets = [
                        { label: "< ₲ 8M", min: 0, max: 8000000 },
                        { label: "₲ 8M - 12M", min: 8000000, max: 12000000 },
                        { label: "₲ 12M - 20M", min: 12000000, max: 20000000 },
                        { label: "> ₲ 20M", min: 20000000, max: null }
                    ];
                }

                presetsContainer.innerHTML = presets.map(p => `
                    <button type="button" class="price-preset-chip" data-min="${p.min}" data-max="${p.max || ''}">
                        ${p.label}
                    </button>
                `).join('');

                presetsContainer.querySelectorAll(".price-preset-chip").forEach(chip => {
                    chip.addEventListener("click", () => {
                        const min = chip.dataset.min ? parseFloat(chip.dataset.min) : null;
                        const max = chip.dataset.max ? parseFloat(chip.dataset.max) : null;
                        if (minInput) minInput.value = min !== null && min > 0 ? min : "";
                        if (maxInput) maxInput.value = max !== null && max > 0 ? max : "";
                    });
                });
            };

            const setCurrency = (curr) => {
                activeCurrency = curr;
                currBtns.forEach(b => b.classList.toggle("active", b.dataset.curr === curr));
                if (minSymbol) minSymbol.textContent = curr === "USD" ? "US$" : "₲";
                if (maxSymbol) maxSymbol.textContent = curr === "USD" ? "US$" : "₲";
                if (minInput) minInput.placeholder = curr === "USD" ? "Ej. 800" : "Ej. 6000000";
                if (maxInput) maxInput.placeholder = curr === "USD" ? "Ej. 2000" : "Ej. 16000000";
                renderPresets(curr);
            };

            currBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    setCurrency(btn.dataset.curr);
                });
            });

            this.syncPriceCurrency = (curr) => {
                setCurrency(curr);
            };

            setCurrency(activeCurrency);

            if (applyBtn) {
                applyBtn.addEventListener("click", () => {
                    const minVal = parseFloat(minInput.value) || null;
                    const maxVal = parseFloat(maxInput.value) || null;

                    if (activeCurrency === "PYG") {
                        window.FilterManager.setMultipleFilters({
                            priceCurrency: "PYG",
                            minPricePYG: minVal,
                            maxPricePYG: maxVal,
                            minPriceUSD: null,
                            maxPriceUSD: null
                        });
                    } else {
                        window.FilterManager.setMultipleFilters({
                            priceCurrency: "USD",
                            minPriceUSD: minVal,
                            maxPriceUSD: maxVal,
                            minPricePYG: null,
                            maxPricePYG: null
                        });
                    }

                    document.getElementById("price-dropdown-popover")?.classList.remove("active");
                    document.getElementById("price-dropdown-btn")?.classList.remove("open");
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (minInput) minInput.value = "";
                    if (maxInput) maxInput.value = "";
                    window.FilterManager.setMultipleFilters({
                        minPriceUSD: null,
                        maxPriceUSD: null,
                        minPricePYG: null,
                        maxPricePYG: null
                    });
                    document.getElementById("price-dropdown-popover")?.classList.remove("active");
                    document.getElementById("price-dropdown-btn")?.classList.remove("open");
                });
            }
        },

        initRoomsFilter: function () {
            let selectedRooms = 0;
            const roomBtns = document.querySelectorAll("#bedrooms-segmented .segmented-btn");
            const applyBtn = document.getElementById("apply-rooms-btn");
            const clearBtn = document.getElementById("clear-rooms-btn");

            roomBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    roomBtns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    selectedRooms = parseInt(btn.dataset.rooms, 10);
                });
            });

            if (applyBtn) {
                applyBtn.addEventListener("click", () => {
                    window.FilterManager.setFilter("minBedrooms", selectedRooms);
                    document.getElementById("rooms-dropdown-popover")?.classList.remove("active");
                    document.getElementById("rooms-dropdown-btn")?.classList.remove("open");
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    selectedRooms = 0;
                    roomBtns.forEach(b => b.classList.toggle("active", b.dataset.rooms === "0"));
                    window.FilterManager.setFilter("minBedrooms", 0);
                    document.getElementById("rooms-dropdown-popover")?.classList.remove("active");
                    document.getElementById("rooms-dropdown-btn")?.classList.remove("open");
                });
            }
        },

        initQuickChips: function () {
            document.querySelectorAll(".amenity-filter-chip").forEach(chip => {
                chip.addEventListener("click", () => {
                    chip.classList.toggle("active");
                    const activeAmenities = Array.from(document.querySelectorAll(".amenity-filter-chip.active"))
                        .map(el => el.dataset.amenity);
                    if (window.FilterManager) window.FilterManager.setFilter("amenities", activeAmenities);
                });
            });
        },

        updateFilterUIStates: function (filters, activeCount) {
            // Actualizar etiqueta del botón de Presupuesto
            const priceBtn = document.getElementById("price-dropdown-btn");
            const priceLabel = document.getElementById("price-dropdown-label");
            if (priceBtn && priceLabel) {
                const hasUSD = (filters.minPriceUSD || filters.maxPriceUSD);
                const hasPYG = (filters.minPricePYG || filters.maxPricePYG);
                if (hasUSD) {
                    const min = filters.minPriceUSD ? `$${filters.minPriceUSD}` : '0';
                    const max = filters.maxPriceUSD ? `$${filters.maxPriceUSD}` : '∞';
                    priceLabel.textContent = `${min} - ${max}`;
                    priceBtn.classList.add("active");
                } else if (hasPYG) {
                    const min = filters.minPricePYG ? `₲${Math.round(filters.minPricePYG / 1000000)}M` : '0';
                    const max = filters.maxPricePYG ? `₲${Math.round(filters.maxPricePYG / 1000000)}M` : '∞';
                    priceLabel.textContent = `${min} - ${max}`;
                    priceBtn.classList.add("active");
                } else {
                    priceLabel.textContent = "Presupuesto";
                    priceBtn.classList.remove("active");
                }
            }

            // Mostrar/ocultar botón de limpiar filtros
            const resetBtn = document.getElementById("reset-all-filters-btn");
            if (resetBtn) {
                resetBtn.style.display = activeCount > 0 ? "inline-flex" : "none";
            }
        },

        renderPropertyList: function (properties) {
            const feedContainer = document.getElementById("properties-feed");
            const countLabel = document.getElementById("results-count-label");
            const duration = (window.FilterManager && window.FilterManager.filters.durationMonths) || 3;

            if (countLabel) {
                countLabel.innerHTML = `<strong>${properties.length} estancias</strong> listas para alquiler de ${duration} meses`;
            }

            if (!feedContainer) return;

            if (properties.length === 0) {
                feedContainer.innerHTML = `
                    <div class="empty-feed-state">
                        <div class="empty-icon"><i class="fas fa-calendar-xmark"></i></div>
                        <h3>No hay estancias con esos filtros</h3>
                        <p>Intenta ajustar el presupuesto o la duración en meses para ver más departamentos disponibles.</p>
                        <button class="btn btn-primary btn-sm" onclick="window.FilterManager.resetFilters()">
                            <i class="fas fa-rotate-left"></i> Restablecer Filtros
                        </button>
                    </div>
                `;
                return;
            }

            feedContainer.innerHTML = properties.map(prop => this.buildPropertyCardHTML(prop, duration)).join("");

            // Vincular eventos de cada tarjeta
            properties.forEach(prop => {
                const card = document.getElementById(`card-${prop.id}`);
                if (!card) return;

                card.addEventListener("click", (e) => {
                    if (e.target.closest('.card-carousel-btn') || e.target.closest('.card-fav-btn')) {
                        return;
                    }
                    window.ModalManager.openPropertyModal(prop);
                });

                card.addEventListener("mouseenter", () => {
                    if (window.MapManager) window.MapManager.highlightProperty(prop.id, false);
                });

                card.addEventListener("mouseleave", () => {
                    if (window.MapManager) window.MapManager.unhighlightProperty(prop.id);
                });

                this.initCardCarousel(card, prop);
            });
        },

        buildPropertyCardHTML: function (prop, duration = 3) {
            const quote = window.PricingEngine ? window.PricingEngine.calculateQuote(prop.priceUSD, duration) : { monthlyRentUSD: prop.priceUSD, monthlyRentPYG: prop.pricePYG, discountPercent: 0 };
            const formattedPrice = window.CurrencyManager.formatPrice(quote.monthlyRentUSD, quote.monthlyRentPYG);
            const images = prop.images && prop.images.length > 0 ? prop.images : [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
            ];

            return `
                <div class="property-card" id="card-${prop.id}">
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

                        <!-- Badges Superiores -->
                        <div class="card-badge-top-left">
                            <span class="micro-badge badge-primary"><i class="fas fa-wifi"></i> ${prop.wifiSpeedMbps || 300} Mbps</span>
                            ${quote.discountPercent > 0 ? `<span class="micro-badge badge-cheroga">${quote.discountPercent}% OFF (${duration}m)</span>` : ''}
                        </div>

                        <!-- Botón Favorito -->
                        <button class="card-fav-btn" title="Guardar estancia" onclick="this.classList.toggle('active')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>

                    <div class="card-info-content">
                        <div class="card-location-row">
                            <span class="card-neighborhood"><i class="fas fa-map-marker-alt text-primary"></i> ${prop.neighborhood}, ${prop.city}</span>
                            <span class="card-op-tag tag-rent_monthly">Media Estancia</span>
                        </div>

                        <h3 class="card-title">${prop.title}</h3>

                        <div class="card-specs-row">
                            <span><i class="fas fa-bed"></i> ${prop.bedrooms} Dorms</span> • 
                            <span><i class="fas fa-bath"></i> ${prop.bathrooms} Baños</span> • 
                            <span><i class="fas fa-ruler-combined"></i> ${prop.builtAreaM2} m²</span>
                        </div>

                        <div class="card-price-footer">
                            <div>
                                <div class="card-price-main">${formattedPrice} <span class="text-xs font-normal text-muted">/ mes</span></div>
                                <div class="card-expenses text-xs text-muted">WiFi + Expensas incluidas</div>
                            </div>
                            <button class="btn btn-primary btn-sm card-book-action-btn" onclick="event.stopPropagation(); window.ModalManager.openPropertyModal(window.PROPERTIES_DATA.find(p => p.id === '${prop.id}'))">
                                Reservar
                            </button>
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

    document.addEventListener("DOMContentLoaded", () => {
        App.init();
    });

    window.App = App;
})();
