// Módulo de Ficha de Propiedad, Galería Mosaico y Sticky Booking Card con Calculadora Dinámica
(function () {
    let currentModalProperty = null;
    let currentModalMonths = 3;

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
                    if (window.CheckoutManager) window.CheckoutManager.close();
                }
            });

            // Re-renderizar si cambia la moneda activa
            window.addEventListener("currencyChanged", () => {
                if (currentModalProperty) {
                    this.updateModalCalculations();
                }
            });
        },

        openPropertyModal: function (prop) {
            currentModalProperty = prop;
            currentModalMonths = parseInt(localStorage.getItem("zilla_search_duration"), 10) || 3;

            const modalContainer = document.getElementById("property-modal-container");
            const modalBody = document.getElementById("property-modal-content");

            if (!modalContainer || !modalBody) return;

            // Renderizar contenido del modal
            modalBody.innerHTML = this.buildModalHTML(prop);

            // Inicializar eventos del slider de meses y checkout
            this.bindModalEvents(prop);

            // Mostrar modal con animación fluida
            modalContainer.classList.add("active");
            document.body.style.overflow = "hidden";
        },

        closePropertyModal: function () {
            const modalContainer = document.getElementById("property-modal-container");
            if (modalContainer) {
                modalContainer.classList.remove("active");
                document.body.style.overflow = "";
            }
            currentModalProperty = null;
        },

        buildModalHTML: function (prop) {
            const quote = window.PricingEngine.calculateQuote(prop.priceUSD, currentModalMonths, {
                expensesUSD: Math.round((prop.expensesPYG || 0) / 7950),
                utilitiesUSD: prop.utilitiesMonthlyUSD || 65,
                cleaningFeeUSD: prop.cleaningFeeUSD || 45
            });

            const formattedPrice = window.CurrencyManager.formatPrice(quote.monthlyRentUSD, quote.monthlyRentPYG);
            const isPYG = window.CurrencyManager.getCurrency() === "PYG";

            // Mensaje de WhatsApp dinámico
            const whatsappMsg = encodeURIComponent(
                `¡Hola ${prop.advertiser.name}! 👋 Vi tu departamento de media estancia en Zilla Flex:\n\n` +
                `🏡 *${prop.title}*\n` +
                `📍 *Ubicación:* ${prop.address}, ${prop.neighborhood}, ${prop.city}\n` +
                `⏱️ *Estancia:* ${currentModalMonths} meses (${quote.discountPercent}% OFF)\n` +
                `💰 *Tarifa:* US$ ${quote.monthlyRentUSD}/mes\n` +
                `🆔 *Código:* ${prop.id}\n\n` +
                `¿Está disponible para ingresar en las próximas semanas? Gracias.`
            );
            const whatsappUrl = `https://wa.me/${prop.advertiser.whatsapp}?text=${whatsappMsg}`;

            // Galería de fotos
            const images = prop.images && prop.images.length > 0 ? prop.images : [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
            ];

            return `
                <!-- Cabecera del Detalle -->
                <div class="modal-header-section">
                    <div class="modal-tags">
                        <span class="tag-pill tag-primary"><i class="fas fa-bolt"></i> Media Estancia (1-11m)</span>
                        <span class="tag-pill tag-wifi"><i class="fas fa-wifi"></i> WiFi ${prop.wifiSpeedMbps || 300} Mbps Verificado</span>
                        <span class="tag-pill tag-type">${this.getPropTypeLabel(prop.propType)}</span>
                        ${prop.badge ? `<span class="tag-pill tag-badge">${prop.badge}</span>` : ''}
                    </div>
                    <h2 class="modal-property-title">${prop.title}</h2>
                    <p class="modal-property-address">
                        <i class="fas fa-map-marker-alt text-primary"></i> ${prop.address}, ${prop.neighborhood}, ${prop.city} (${prop.department})
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

                <!-- Layout Split: Detalles (60%) + Sticky Booking Card (40%) -->
                <div class="modal-split-layout">
                    <!-- Columna Izquierda: Detalles del Inmueble -->
                    <div class="modal-details-column">
                        <!-- Key Stats Bar -->
                        <div class="property-key-stats">
                            <div class="stat-box">
                                <i class="fas fa-wifi text-primary"></i>
                                <span class="stat-value">${prop.wifiSpeedMbps || 300} Mbps</span>
                                <span class="stat-label">Fibra Óptica</span>
                            </div>
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
                                <i class="fas fa-ruler-combined"></i>
                                <span class="stat-value">${prop.builtAreaM2} m²</span>
                                <span class="stat-label">Superficie</span>
                            </div>
                        </div>

                        <!-- Espacio de Trabajo Teletrabajo / WFH -->
                        ${prop.wfhSetup ? `
                        <div class="wfh-highlight-card">
                            <div class="wfh-icon"><i class="fas fa-laptop-house"></i></div>
                            <div>
                                <h4 class="font-bold text-sm text-primary">Espacio de Trabajo Dedicado (Work from Home)</h4>
                                <p class="text-xs text-secondary mt-1">${prop.wfhSetup}</p>
                            </div>
                        </div>
                        ` : ''}

                        <!-- Descripción -->
                        <div class="modal-section">
                            <h3 class="section-title"><i class="fas fa-align-left text-primary"></i> Acerca de este Inmueble</h3>
                            <p class="property-full-description">${prop.description}</p>
                        </div>

                        <!-- Amenities y Comodidades -->
                        <div class="modal-section">
                            <h3 class="section-title"><i class="fas fa-sparkles text-primary"></i> Comodidades y Equipamiento</h3>
                            <div class="amenities-grid-detailed">
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('quincho') ? 'included' : 'not-included'}">
                                    <i class="fas fa-fire-burner"></i>
                                    <span>Quincho con Parrilla</span>
                                </div>
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('pool') ? 'included' : 'not-included'}">
                                    <i class="fas fa-water-ladder"></i>
                                    <span>Piscina Privada / Rooftop</span>
                                </div>
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('gym') ? 'included' : 'not-included'}">
                                    <i class="fas fa-dumbbell"></i>
                                    <span>Gimnasio Equipado</span>
                                </div>
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('furnished') ? 'included' : 'not-included'}">
                                    <i class="fas fa-couch"></i>
                                    <span>100% Amoblado de Diseño</span>
                                </div>
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('laundry') ? 'included' : 'not-included'}">
                                    <i class="fas fa-jug-detergent"></i>
                                    <span>Lavandería / Laundry</span>
                                </div>
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('garage') ? 'included' : 'not-included'}">
                                    <i class="fas fa-warehouse"></i>
                                    <span>Cochera Techada</span>
                                </div>
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('security') ? 'included' : 'not-included'}">
                                    <i class="fas fa-shield-halved"></i>
                                    <span>Seguridad 24 Horas</span>
                                </div>
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('pet_friendly') ? 'included' : 'not-included'}">
                                    <i class="fas fa-paw"></i>
                                    <span>Acepta Mascotas (Pet Friendly)</span>
                                </div>
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('air_conditioning') ? 'included' : 'not-included'}">
                                    <i class="fas fa-snowflake"></i>
                                    <span>Aire Acondicionado Split</span>
                                </div>
                                <div class="amenity-detail-item ${prop.amenities && prop.amenities.includes('generator') ? 'included' : 'not-included'}">
                                    <i class="fas fa-bolt"></i>
                                    <span>Generador Eléctrico Propio</span>
                                </div>
                            </div>
                        </div>

                        <!-- Puntos de Interés del Entorno -->
                        <div class="modal-section">
                            <h3 class="section-title"><i class="fas fa-compass text-primary"></i> Entorno y Puntos Cercanos</h3>
                            <div class="nearby-points-grid">
                                ${(prop.nearbyPoints || []).map(pt => `
                                    <div class="nearby-point-item">
                                        <div class="point-icon"><i class="fas fa-location-dot"></i></div>
                                        <div class="point-info">
                                            <span class="point-name">${pt.name}</span>
                                            <span class="point-dist"><i class="fas fa-walking"></i> ${pt.distance} • ${pt.time}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Columna Derecha: Sticky Booking Card con Calculadora Dinámica -->
                    <div class="modal-sticky-sidebar">
                        <div class="sidebar-booking-card">
                            <div class="sidebar-price-header">
                                <div>
                                    <span class="text-xs text-muted block">Tarifa Mensual</span>
                                    <div class="modal-price-main font-bold" id="modal-dynamic-monthly-price">
                                        ${formattedPrice} <span class="text-sm font-normal text-muted">/ mes</span>
                                    </div>
                                </div>
                                <div id="modal-discount-pill-target">
                                    ${quote.discountPercent > 0 ? `<span class="micro-badge badge-cheroga">${quote.discountPercent}% OFF</span>` : ''}
                                </div>
                            </div>

                            <!-- Selector Dinámico de Duración -->
                            <div class="stay-duration-selector-box mt-3 mb-3">
                                <label class="font-bold text-xs flex justify-between">
                                    <span>Duración de la Estancia:</span>
                                    <span class="text-primary font-bold" id="modal-months-label">${currentModalMonths} Meses</span>
                                </label>
                                <input type="range" id="modal-stay-slider" min="1" max="11" value="${currentModalMonths}" class="custom-range-slider mt-2">
                                <div class="range-labels-row text-xs text-muted mt-1">
                                    <span>1m (Base)</span>
                                    <span>6m (-15%)</span>
                                    <span>11m (-22%)</span>
                                </div>
                            </div>

                            <!-- Desglose de Costos Transparente -->
                            <div class="transparent-cost-breakdown" id="modal-cost-breakdown-target">
                                ${this.buildBreakdownSnippet(quote, isPYG)}
                            </div>

                            <!-- Botones de Acción -->
                            <div class="booking-cta-stack mt-4">
                                <button type="button" class="btn btn-primary btn-block" id="modal-book-now-btn">
                                    <i class="fas fa-bolt"></i> Reservar Estancia (${currentModalMonths} meses)
                                </button>
                                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-block mt-2">
                                    <i class="fab fa-whatsapp text-whatsapp"></i> Consultar por WhatsApp
                                </a>
                            </div>

                            <!-- Perfil del Host Verificado -->
                            <div class="advertiser-profile-card mt-4">
                                <img src="${prop.advertiser.avatar}" alt="${prop.advertiser.name}" class="advertiser-avatar">
                                <div class="advertiser-meta">
                                    <div class="advertiser-name">
                                        ${prop.advertiser.name}
                                        <i class="fas fa-check-circle verified-badge" title="Host Verificado Zilla"></i>
                                    </div>
                                    <div class="advertiser-agency">${prop.advertiser.agency} • Responde en ${prop.advertiser.responseTime || '15 min'}</div>
                                </div>
                            </div>

                            <div class="secure-guarantee-note mt-3">
                                <i class="fas fa-shield-check text-primary"></i> <strong>Sin Comisiones:</strong> Contrato 100% digital, sin garantes locales.
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        buildBreakdownSnippet: function (quote, isPYG) {
            return `
                <div class="cost-row">
                    <span>Alquiler mensual:</span>
                    <span><strong>US$ ${quote.monthlyRentUSD}</strong></span>
                </div>
                ${quote.discountPercent > 0 ? `
                    <div class="cost-row text-success font-semibold text-xs">
                        <span>Ahorro total (${quote.discountPercent}% OFF):</span>
                        <span>- US$ ${quote.totalSavingsUSD}</span>
                    </div>
                ` : ''}
                <div class="cost-row text-xs text-muted">
                    <span>Expensas & Mantenimiento:</span>
                    <span>Incluido</span>
                </div>
                <div class="cost-row text-xs text-muted">
                    <span>WiFi 500Mbps + Luz est.:</span>
                    <span>US$ ${quote.utilitiesMonthlyUSD} / m</span>
                </div>
                <div class="cost-row text-xs text-muted">
                    <span>Limpieza Salida (única):</span>
                    <span>US$ ${quote.exitCleaningFeeUSD}</span>
                </div>
                <div class="cost-row text-xs text-muted">
                    <span>Depósito Reembolsable:</span>
                    <span>US$ ${quote.securityDepositUSD}</span>
                </div>
                <div class="cost-row-total pt-2 mt-2 border-t font-bold flex justify-between">
                    <span>Total Primer Mes + Depósito:</span>
                    <span class="text-primary">US$ ${quote.totalFirstPaymentUSD.toLocaleString('es-PY')}</span>
                </div>
            `;
        },

        bindModalEvents: function (prop) {
            const slider = document.getElementById("modal-stay-slider");
            const monthsLabel = document.getElementById("modal-months-label");
            const priceDisplay = document.getElementById("modal-dynamic-monthly-price");
            const discountTarget = document.getElementById("modal-discount-pill-target");
            const breakdownTarget = document.getElementById("modal-cost-breakdown-target");
            const bookBtn = document.getElementById("modal-book-now-btn");

            const updateCalculations = (months) => {
                currentModalMonths = months;
                const quote = window.PricingEngine.calculateQuote(prop.priceUSD, months, {
                    expensesUSD: Math.round((prop.expensesPYG || 0) / 7950),
                    utilitiesUSD: prop.utilitiesMonthlyUSD || 65,
                    cleaningFeeUSD: prop.cleaningFeeUSD || 45
                });

                if (monthsLabel) monthsLabel.textContent = `${months} Meses`;
                if (priceDisplay) {
                    const formatted = window.CurrencyManager.formatPrice(quote.monthlyRentUSD, quote.monthlyRentPYG);
                    priceDisplay.innerHTML = `${formatted} <span class="text-sm font-normal text-muted">/ mes</span>`;
                }
                if (discountTarget) {
                    discountTarget.innerHTML = quote.discountPercent > 0 
                        ? `<span class="micro-badge badge-cheroga">${quote.discountPercent}% OFF</span>` 
                        : '';
                }
                if (breakdownTarget) {
                    breakdownTarget.innerHTML = this.buildBreakdownSnippet(quote, window.CurrencyManager.getCurrency() === "PYG");
                }
                if (bookBtn) {
                    bookBtn.innerHTML = `<i class="fas fa-bolt"></i> Reservar Estancia (${months} meses)`;
                }
            };

            if (slider) {
                slider.addEventListener("input", (e) => {
                    updateCalculations(parseInt(e.target.value, 10));
                });
            }

            if (bookBtn) {
                bookBtn.addEventListener("click", () => {
                    this.closePropertyModal();
                    if (window.CheckoutManager) {
                        window.CheckoutManager.startCheckout(prop, currentModalMonths);
                    }
                });
            }
        },

        updateModalCalculations: function () {
            if (!currentModalProperty) return;
            const slider = document.getElementById("modal-stay-slider");
            const months = slider ? parseInt(slider.value, 10) : currentModalMonths;
            const quote = window.PricingEngine.calculateQuote(currentModalProperty.priceUSD, months);
            const priceDisplay = document.getElementById("modal-dynamic-monthly-price");
            if (priceDisplay) {
                const formatted = window.CurrencyManager.formatPrice(quote.monthlyRentUSD, quote.monthlyRentPYG);
                priceDisplay.innerHTML = `${formatted} <span class="text-sm font-normal text-muted">/ mes</span>`;
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

        getOperationLabel: function (op) {
            return "Media Estancia";
        },

        getPropTypeLabel: function (type) {
            switch (type) {
                case "house": return "Casa / Villa";
                case "apartment": return "Departamento / Studio";
                case "duplex": return "Dúplex";
                case "gated_community": return "Barrio Cerrado";
                default: return "Inmueble Flex";
            }
        },

        getAdvertiserTypeLabel: function (type) {
            return "Host Verificado";
        }
    };

    window.ModalManager = ModalManager;
})();
