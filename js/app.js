// Orquestador Principal de Zilla Flex Estilo Airbnb Homes & Glassmorphism
(function () {
    let currentProperties = [];
    let showTotalPriceWithTax = false;

    const App = {
        init: function () {
            // 1. Tema Glass (Claro / Oscuro)
            this.initTheme();

            // 2. Inicializar Módulos
            if (window.CurrencyManager) window.CurrencyManager.init();
            if (window.MapManager) window.MapManager.init("leaflet-map");
            if (window.ModalManager) window.ModalManager.init();
            if (window.AuthRolesManager) window.AuthRolesManager.init();
            if (window.AIConciergeManager) window.AIConciergeManager.init();
            if (window.PublishManager) window.PublishManager.init();
            if (window.CheckoutManager) window.CheckoutManager.init();

            // 3. Parámetros de URL iniciales
            this.loadInitialURLParams();

            // 4. Vincular Eventos Airbnb y Regla Medidora
            this.bindAirbnbEvents();
            this.bindDurationRuler();

            // 5. Aplicar y Renderizar
            if (window.FilterManager) {
                currentProperties = window.FilterManager.applyFilters();
            }

            // 6. Asegurar ajuste inicial del mapa para mostrar las 22 propiedades
            setTimeout(() => {
                if (window.MapManager) {
                    window.MapManager.invalidateSize();
                    window.MapManager.fitToMarkers();
                }
            }, 300);
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

            if (locParam && locParam !== "all" && window.FilterManager) {
                window.FilterManager.filters.neighborhood = locParam;
                const whereVal = document.getElementById("capsule-where-val");
                if (whereVal) whereVal.textContent = locParam;
            }

            if (durationParam && window.FilterManager) {
                const d = parseInt(durationParam, 10);
                window.FilterManager.filters.durationMonths = d;
                this.updateRulerUI(d);
            }
        },

        bindDurationRuler: function () {
            const rulerSlider = document.getElementById("duration-ruler-slider");
            const notches = document.querySelectorAll(".ruler-notch");

            if (rulerSlider) {
                rulerSlider.addEventListener("input", (e) => {
                    const months = parseInt(e.target.value, 10);
                    this.updateRulerUI(months);
                    if (window.FilterManager) {
                        window.FilterManager.setFilter("durationMonths", months);
                    }
                });
            }

            notches.forEach(notch => {
                notch.addEventListener("click", () => {
                    const m = parseInt(notch.dataset.month, 10);
                    if (rulerSlider) rulerSlider.value = m;
                    this.updateRulerUI(m);
                    if (window.FilterManager) {
                        window.FilterManager.setFilter("durationMonths", m);
                    }
                });
            });
        },

        updateRulerUI: function (months) {
            const monthsText = document.getElementById("ruler-months-text");
            const discountTag = document.getElementById("ruler-discount-tag");
            const capsuleWhen = document.getElementById("capsule-when-val");
            const notches = document.querySelectorAll(".ruler-notch");

            const discountRate = window.PricingEngine ? window.PricingEngine.getDiscountRate(months) : 0;
            const discountPercent = Math.round(discountRate * 100);

            if (monthsText) {
                monthsText.textContent = `${months} Mes${months > 1 ? 'es' : ''}`;
            }

            if (discountTag) {
                if (discountPercent > 0) {
                    discountTag.textContent = `${discountPercent}% Descuento Aplicado`;
                    discountTag.style.display = "inline-block";
                } else {
                    discountTag.textContent = "Tarifa Base";
                    discountTag.style.background = "#64748b";
                }
            }

            if (capsuleWhen) {
                capsuleWhen.textContent = `${months} meses ${discountPercent > 0 ? `(-${discountPercent}%)` : ''}`;
            }

            notches.forEach(n => {
                const val = parseInt(n.dataset.month, 10);
                n.classList.toggle("active", val === months);
            });
        },

        bindAirbnbEvents: function () {
            // Evento cuando se filtran propiedades
            window.addEventListener("propertiesFiltered", (e) => {
                currentProperties = e.detail.properties;
                this.renderPropertyList(currentProperties);
                if (window.MapManager) window.MapManager.renderMarkers(currentProperties);
                this.updateFilterUIStates(e.detail.filters, e.detail.activeCount);
            });

            // Evento cuando cambia la moneda
            window.addEventListener("currencyChanged", () => {
                this.renderPropertyList(currentProperties);
                if (window.MapManager) window.MapManager.renderMarkers(currentProperties);
            });

            // Moneda dual en navbar
            document.querySelectorAll(".currency-toggle-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const currency = btn.dataset.currency;
                    if (window.CurrencyManager) window.CurrencyManager.setCurrency(currency);
                });
            });

            // Conmutador de rol (Arrendatario / Propietario)
            const roleBtn = document.getElementById("user-role-toggle-btn");
            if (roleBtn) {
                roleBtn.addEventListener("click", () => {
                    if (window.AuthRolesManager) window.AuthRolesManager.toggleRole();
                });
            }

            // Barra de Categorías Airbnb
            const track = document.getElementById("airbnb-categories-track");
            const leftArrow = document.getElementById("cat-scroll-left");
            const rightArrow = document.getElementById("cat-scroll-right");

            if (track) {
                if (leftArrow) {
                    leftArrow.addEventListener("click", () => {
                        track.scrollBy({ left: -220, behavior: "smooth" });
                    });
                }
                if (rightArrow) {
                    rightArrow.addEventListener("click", () => {
                        track.scrollBy({ left: 220, behavior: "smooth" });
                    });
                }

                track.querySelectorAll(".airbnb-category-item").forEach(item => {
                    item.addEventListener("click", () => {
                        track.querySelectorAll(".airbnb-category-item").forEach(el => el.classList.remove("active"));
                        item.classList.add("active");
                        const cat = item.dataset.category;
                        if (window.FilterManager) window.FilterManager.setFilter("category", cat);
                    });
                });
            }

            // Modal de Filtros Airbnb
            const openModalBtn = document.getElementById("open-airbnb-filters-modal-btn");
            const searchCapsuleBtn = document.getElementById("airbnb-search-capsule-btn");
            const closeModalBtn = document.getElementById("close-airbnb-filters-btn");
            const backdrop = document.getElementById("close-airbnb-filters-backdrop");
            const modal = document.getElementById("airbnb-filters-modal");
            const applyModalBtn = document.getElementById("modal-apply-filters-btn");
            const clearModalBtn = document.getElementById("modal-clear-all-filters-btn");

            const openFilterModal = () => {
                if (modal) modal.classList.add("active");
            };

            const closeFilterModal = () => {
                if (modal) modal.classList.remove("active");
            };

            if (openModalBtn) openModalBtn.addEventListener("click", openFilterModal);
            if (searchCapsuleBtn) searchCapsuleBtn.addEventListener("click", openFilterModal);
            if (closeModalBtn) closeModalBtn.addEventListener("click", closeFilterModal);
            if (backdrop) backdrop.addEventListener("click", closeFilterModal);

            // Filtros en Modal
            if (modal) {
                modal.querySelectorAll("#modal-rooms-segmented .segmented-btn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        modal.querySelectorAll("#modal-rooms-segmented .segmented-btn").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                    });
                });

                modal.querySelectorAll("#modal-baths-segmented .segmented-btn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        modal.querySelectorAll("#modal-baths-segmented .segmented-btn").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                    });
                });

                if (applyModalBtn) {
                    applyModalBtn.addEventListener("click", () => {
                        const minP = parseFloat(document.getElementById("modal-filter-min-price")?.value) || null;
                        const maxP = parseFloat(document.getElementById("modal-filter-max-price")?.value) || null;

                        const activeRoomsBtn = modal.querySelector("#modal-rooms-segmented .segmented-btn.active");
                        const rooms = activeRoomsBtn ? parseInt(activeRoomsBtn.dataset.val, 10) : 0;

                        const activeBathsBtn = modal.querySelector("#modal-baths-segmented .segmented-btn.active");
                        const baths = activeBathsBtn ? parseInt(activeBathsBtn.dataset.val, 10) : 0;

                        const amenities = Array.from(modal.querySelectorAll(".airbnb-filter-checkbox:checked")).map(cb => cb.value);

                        if (window.FilterManager) {
                            window.FilterManager.setMultipleFilters({
                                minPriceUSD: minP,
                                maxPriceUSD: maxP,
                                minBedrooms: rooms,
                                minBathrooms: baths,
                                amenities: amenities
                            });
                        }

                        closeFilterModal();
                    });
                }

                if (clearModalBtn) {
                    clearModalBtn.addEventListener("click", () => {
                        if (window.FilterManager) window.FilterManager.resetFilters();
                        closeFilterModal();
                    });
                }
            }

            // Toggle "Mostrar total antes de impuestos"
            const taxToggle = document.getElementById("toggle-total-price-switch");
            if (taxToggle) {
                taxToggle.addEventListener("change", (e) => {
                    showTotalPriceWithTax = e.target.checked;
                    this.renderPropertyList(currentProperties);
                });
            }

            // Botón Flotante Airbnb "Mostrar Mapa / Mostrar Lista"
            const floatingMapBtn = document.getElementById("mobile-view-toggle");
            if (floatingMapBtn) {
                floatingMapBtn.addEventListener("click", () => {
                    const isMapVisible = document.body.classList.toggle("mobile-map-active");
                    const icon = floatingMapBtn.querySelector("i");
                    const text = floatingMapBtn.querySelector("span");

                    if (isMapVisible) {
                        icon.className = "fas fa-list";
                        text.textContent = "Mostrar lista";
                        if (window.MapManager) window.MapManager.invalidateSize();
                    } else {
                        icon.className = "fas fa-map";
                        text.textContent = "Mostrar mapa";
                    }
                });
            }
        },

        updateFilterUIStates: function (filters, activeCount) {
            const badge = document.getElementById("active-filters-count-badge");
            if (badge) {
                badge.textContent = activeCount;
                badge.style.display = activeCount > 0 ? "inline-block" : "none";
            }
        },

        renderPropertyList: function (properties) {
            const feedContainer = document.getElementById("properties-feed");
            const countLabel = document.getElementById("results-count-label");
            const duration = (window.FilterManager && window.FilterManager.filters.durationMonths) || 3;

            if (countLabel) {
                countLabel.innerHTML = `Más de <strong>${properties.length} alojamientos</strong> disponibles • Estancias calibradas a ${duration} meses`;
            }

            if (!feedContainer) return;

            if (properties.length === 0) {
                feedContainer.innerHTML = `
                    <div class="empty-feed-state" style="grid-column: 1 / -1;">
                        <div class="empty-icon"><i class="fas fa-calendar-xmark"></i></div>
                        <h3>No se encontraron alojamientos</h3>
                        <p>Intenta ajustar tus fechas o filtros para ver más opciones en Paraguay.</p>
                        <button class="btn btn-primary btn-sm" onclick="window.FilterManager.resetFilters()">
                            <i class="fas fa-rotate-left"></i> Restablecer filtros
                        </button>
                    </div>
                `;
                return;
            }

            feedContainer.innerHTML = properties.map(prop => this.buildAirbnbCardHTML(prop, duration)).join("");

            // Vincular eventos de tarjetas
            properties.forEach(prop => {
                const card = document.getElementById(`airbnb-card-${prop.id}`);
                if (!card) return;

                card.addEventListener("click", (e) => {
                    if (e.target.closest('.card-nav-btn') || e.target.closest('.airbnb-wishlist-heart-btn')) {
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

        buildAirbnbCardHTML: function (prop, duration = 3) {
            const quote = window.PricingEngine ? window.PricingEngine.calculateQuote(prop.priceUSD, duration) : { monthlyRentUSD: prop.priceUSD, monthlyRentPYG: prop.pricePYG, discountPercent: 0 };
            const formattedPrice = window.CurrencyManager.formatPrice(quote.monthlyRentUSD, quote.monthlyRentPYG);
            const formattedOriginal = window.CurrencyManager.formatPrice(quote.baseMonthlyUSD, quote.baseMonthlyPYG);

            const images = prop.images && prop.images.length > 0 ? prop.images : [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
            ];

            return `
                <div class="airbnb-home-card" id="airbnb-card-${prop.id}">
                    <!-- Carrusel de Fotos con Wishlist Heart -->
                    <div class="airbnb-card-media">
                        <div class="card-carousel-container" data-current-index="0">
                            ${images.map((img, idx) => `
                                <img src="${img}" class="airbnb-card-img ${idx === 0 ? 'active' : ''}" alt="${prop.title}" loading="lazy" data-index="${idx}">
                            `).join('')}
                        </div>

                        ${images.length > 1 ? `
                            <button class="card-nav-btn prev-btn" title="Foto anterior"><i class="fas fa-chevron-left"></i></button>
                            <button class="card-nav-btn next-btn" title="Foto siguiente"><i class="fas fa-chevron-right"></i></button>
                            <div class="airbnb-card-dots">
                                ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}"></span>`).join('')}
                            </div>
                        ` : ''}

                        <!-- Wishlist Heart SVG Button -->
                        <button class="airbnb-wishlist-heart-btn" title="Guardar en favoritos" onclick="event.stopPropagation(); this.classList.toggle('active')">
                            <svg viewBox="0 0 32 32"><path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05A6.98 6.98 0 0 0 9 4a6.98 6.98 0 0 0-7 7c0 7 7 12.27 14 17z"></path></svg>
                        </button>

                        <!-- Badge "Recomendación del viajero" -->
                        ${prop.guestFavorite ? `
                            <div class="airbnb-guest-favorite-badge">
                                <i class="fas fa-award text-primary"></i> Recomendación del viajero
                            </div>
                        ` : ''}
                    </div>

                    <!-- Metadatos de la Tarjeta Estilo Airbnb -->
                    <div class="airbnb-card-body">
                        <div class="airbnb-title-rating-row">
                            <span class="airbnb-card-location">${prop.neighborhood}, ${prop.city}</span>
                            <span class="airbnb-card-rating">
                                <i class="fas fa-star"></i> ${prop.rating || '4.95'}
                            </span>
                        </div>

                        <div class="airbnb-card-distance">${prop.distanceHighlight || 'Zona Prime de Asunción'}</div>
                        <div class="airbnb-card-dates">Estancia flexible de ${duration} meses</div>

                        <div class="airbnb-card-price-row">
                            ${quote.discountPercent > 0 ? `<span class="price-strikethrough">${formattedOriginal}</span>` : ''}
                            <span class="airbnb-price-val">${formattedPrice}</span>
                            <span class="text-xs text-muted">/ mes</span>
                        </div>
                    </div>
                </div>
            `;
        },

        initCardCarousel: function (cardElement, prop) {
            const images = cardElement.querySelectorAll(".airbnb-card-img");
            const dots = cardElement.querySelectorAll(".airbnb-card-dots .dot");
            const prevBtn = cardElement.querySelector(".card-nav-btn.prev-btn");
            const nextBtn = cardElement.querySelector(".card-nav-btn.next-btn");

            if (images.length <= 1) return;

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
