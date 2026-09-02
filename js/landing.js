// ============================================================
// LÓGICA DE LA PÁGINA DE PRESENTACIÓN / LANDING (index.html)
// ============================================================
(function () {
    document.addEventListener("DOMContentLoaded", () => {
        initLandingAutocomplete();
        renderLandingFeaturedProperties();
    });

    // 1. Autocompletado Predictivo en la Landing
    function initLandingAutocomplete() {
        const input = document.getElementById("landing-location-input");
        const popover = document.getElementById("landing-location-popover");
        const listContainer = document.getElementById("landing-autocomplete-list");

        if (!input || !popover || !listContainer) return;

        const database = window.LOCATIONS_DATABASE || [];

        const renderSuggestions = (query = "") => {
            const normQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            
            let results = [];
            if (!normQuery) {
                results = database.slice(0, 7);
            } else {
                results = database.filter(item => {
                    const name = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const neigh = (item.neighborhood || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const city = (item.city || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const desc = (item.desc || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    return name.includes(normQuery) || neigh.includes(normQuery) || city.includes(normQuery) || desc.includes(normQuery);
                });
            }

            if (results.length === 0) {
                listContainer.innerHTML = `
                    <div style="padding: 16px; text-align: center; color: var(--text-secondary); font-size: 0.88rem;">
                        <i class="fas fa-search-location text-coral" style="font-size: 1.5rem; margin-bottom: 6px; display: block;"></i>
                        No encontramos una zona exacta. Presiona Buscar para explorar "${query}".
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = results.map(item => `
                <div class="autocomplete-item" data-name="${item.name}">
                    <div class="autocomplete-icon-box">
                        <i class="fas ${item.icon}"></i>
                    </div>
                    <div class="autocomplete-text">
                        <div class="autocomplete-name">${item.name}</div>
                        <div class="autocomplete-desc">${item.desc} • ${item.city}</div>
                    </div>
                </div>
            `).join('');

            listContainer.querySelectorAll(".autocomplete-item").forEach(itemEl => {
                itemEl.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const name = itemEl.dataset.name;
                    input.value = name;
                    popover.classList.remove("active");
                    // Redirigir a explorar.html con el parámetro de búsqueda
                    window.location.href = `explorar.html?keyword=${encodeURIComponent(name)}`;
                });
            });
        };

        input.addEventListener("focus", () => {
            popover.classList.add("active");
            renderSuggestions(input.value);
        });

        input.addEventListener("input", (e) => {
            popover.classList.add("active");
            renderSuggestions(e.target.value);
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest('#landing-seg-location')) {
                popover.classList.remove("active");
            }
        });
    }

    // 2. Renderizar Inmuebles Destacados en la Landing
    function renderLandingFeaturedProperties() {
        const container = document.getElementById("landing-featured-grid");
        if (!container) return;

        const properties = (window.PROPERTIES_DATA || []).slice(0, 4);

        container.innerHTML = properties.map(prop => {
            const formattedPrice = window.CurrencyManager ? window.CurrencyManager.formatPrice(prop.priceUSD, prop.pricePYG) : `US$ ${prop.priceUSD.toLocaleString()}`;
            const images = prop.images && prop.images.length > 0 ? prop.images : [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
            ];
            const isPlatinum = prop.tier === "platinum";

            return `
                <div class="property-card ${isPlatinum ? 'card-platinum' : ''}" onclick="window.location.href='explorar.html?keyword=${encodeURIComponent(prop.neighborhood)}'">
                    <div class="card-media-wrapper">
                        <div class="card-carousel-container">
                            <img src="${images[0]}" class="card-image active" alt="${prop.title}" loading="lazy">
                        </div>
                        <div class="card-badge-top-left">
                            ${prop.badge ? `<span class="micro-badge ${isPlatinum ? 'badge-gold' : 'badge-primary'}">${prop.badge}</span>` : ''}
                            ${prop.acceptsCheRogaPora ? `<span class="micro-badge badge-cheroga">Che Róga Porã</span>` : ''}
                        </div>
                    </div>

                    <div class="card-info-content">
                        <div class="card-location-row">
                            <span class="card-neighborhood"><i class="fas fa-location-dot text-coral"></i> ${prop.neighborhood}, ${prop.city}</span>
                            <span class="card-op-tag">${window.ModalManager ? window.ModalManager.getOperationLabel(prop.operation) : prop.operation}</span>
                        </div>

                        <h3 class="card-title">${prop.title}</h3>

                        <div class="card-specs-row">
                            ${prop.bedrooms > 0 ? `<span><i class="fas fa-bed"></i> ${prop.bedrooms} Dorms</span> • ` : ''}
                            ${prop.bathrooms > 0 ? `<span><i class="fas fa-bath"></i> ${prop.bathrooms} Baños</span> • ` : ''}
                            <span><i class="fas fa-ruler-combined"></i> ${prop.builtAreaM2 || prop.totalAreaM2} m²</span>
                        </div>

                        <div class="card-price-footer">
                            <div class="card-price-main">${formattedPrice}</div>
                            ${prop.expensesPYG > 0 ? `<div class="card-expenses">+ ₲ ${(prop.expensesPYG/1000).toLocaleString('es-PY')}k exp.</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
})();
