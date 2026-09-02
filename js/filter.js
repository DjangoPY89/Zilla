// Motor de Filtrado y Categorías Estilo Airbnb Homes para Zilla Flex
(function () {
    const defaultFilters = {
        keyword: "",
        department: "all",
        neighborhood: "all",
        category: "all", // 'pool', 'wfh', 'lake', 'views', 'luxury', 'pet_friendly'
        durationMonths: 3, // Duración (1 a 11 meses)
        placeType: "entire", // 'entire' | 'room'
        priceCurrency: "USD",
        minPriceUSD: null,
        maxPriceUSD: null,
        minPricePYG: null,
        maxPricePYG: null,
        minBedrooms: 0,
        minBeds: 0,
        minBathrooms: 0,
        instantBookOnly: false,
        selfCheckIn: false,
        amenities: []
    };

    let currentFilters = { ...defaultFilters };

    const FilterManager = {
        filters: currentFilters,

        setFilter: function (key, value) {
            currentFilters[key] = value;
            this.applyFilters();
        },

        setMultipleFilters: function (newValues) {
            Object.assign(currentFilters, newValues);
            this.applyFilters();
        },

        getActiveFiltersCount: function () {
            let count = 0;
            if (currentFilters.keyword) count++;
            if (currentFilters.neighborhood !== "all") count++;
            if (currentFilters.category !== "all") count++;
            if (currentFilters.durationMonths !== 3) count++;
            if (currentFilters.minPriceUSD || currentFilters.maxPriceUSD || currentFilters.minPricePYG || currentFilters.maxPricePYG) count++;
            if (currentFilters.minBedrooms > 0) count++;
            if (currentFilters.minBathrooms > 0) count++;
            if (currentFilters.instantBookOnly) count++;
            if (currentFilters.selfCheckIn) count++;
            if (currentFilters.amenities && currentFilters.amenities.length > 0) count += currentFilters.amenities.length;
            return count;
        },

        resetFilters: function () {
            currentFilters = { ...defaultFilters };
            currentFilters.amenities = [];

            // Reset UI inputs
            const searchInput = document.getElementById("search-input");
            if (searchInput) searchInput.value = "";

            const locationSelect = document.getElementById("location-select");
            if (locationSelect) locationSelect.value = "all";

            const durationSelect = document.getElementById("duration-select");
            if (durationSelect) durationSelect.value = "3";

            // Reset category chips
            document.querySelectorAll(".airbnb-category-item").forEach(el => {
                el.classList.toggle("active", el.dataset.category === "all");
            });

            // Reset modal inputs
            const minInput = document.getElementById("modal-filter-min-price");
            const maxInput = document.getElementById("modal-filter-max-price");
            if (minInput) minInput.value = "";
            if (maxInput) maxInput.value = "";

            document.querySelectorAll(".segmented-btn").forEach(b => {
                const val = b.dataset.val;
                b.classList.toggle("active", val === "0" || val === "all");
            });

            document.querySelectorAll(".airbnb-filter-checkbox").forEach(cb => cb.checked = false);

            window.dispatchEvent(new CustomEvent("filtersReset"));
            this.applyFilters();
        },

        applyFilters: function () {
            const allProperties = window.PROPERTIES_DATA || [];
            const duration = parseInt(currentFilters.durationMonths, 10) || 3;

            const filtered = allProperties.filter(prop => {
                // Filtro por palabra clave
                if (currentFilters.keyword) {
                    const kw = currentFilters.keyword.toLowerCase();
                    const matchText = (
                        (prop.title || "") + " " +
                        (prop.description || "") + " " +
                        (prop.neighborhood || "") + " " +
                        (prop.city || "") + " " +
                        (prop.department || "")
                    ).toLowerCase();
                    if (!matchText.includes(kw)) return false;
                }

                // Filtro por Categoría Airbnb (Piscina, WFH, Lago, Vistas, etc.)
                if (currentFilters.category !== "all") {
                    if (currentFilters.category === "pool" && (!prop.amenities || !prop.amenities.includes("pool"))) return false;
                    else if (currentFilters.category === "wfh" && (prop.wifiSpeedMbps || 0) < 400 && !prop.wfhSetup) return false;
                    else if (currentFilters.category === "lake" && prop.city !== "San Bernardino") return false;
                    else if (currentFilters.category === "views" && (!prop.amenities || !prop.amenities.includes("terrace"))) return false;
                    else if (currentFilters.category === "luxury" && prop.tier !== "platinum") return false;
                    else if (currentFilters.category === "pet_friendly" && (!prop.amenities || !prop.amenities.includes("pet_friendly"))) return false;
                    else if (currentFilters.category === "quincho" && (!prop.amenities || !prop.amenities.includes("quincho"))) return false;
                }

                // Filtro por Ubicación
                if (currentFilters.neighborhood !== "all") {
                    if (prop.neighborhood !== currentFilters.neighborhood && prop.city !== currentFilters.neighborhood) {
                        return false;
                    }
                }

                // Filtro por Duración de Estancia
                if (prop.minStayMonths && prop.minStayMonths > duration) return false;
                if (prop.maxStayMonths && prop.maxStayMonths < duration) return false;

                // Precio dinámico mensual
                const quote = window.PricingEngine ? window.PricingEngine.calculateQuote(prop.priceUSD, duration) : { monthlyRentUSD: prop.priceUSD, monthlyRentPYG: prop.pricePYG };
                const propPriceUSD = quote.monthlyRentUSD;
                const propPricePYG = quote.monthlyRentPYG;

                if (currentFilters.priceCurrency === "PYG") {
                    if (currentFilters.minPricePYG && propPricePYG < currentFilters.minPricePYG) return false;
                    if (currentFilters.maxPricePYG && propPricePYG > currentFilters.maxPricePYG) return false;
                } else {
                    if (currentFilters.minPriceUSD && propPriceUSD < currentFilters.minPriceUSD) return false;
                    if (currentFilters.maxPriceUSD && propPriceUSD > currentFilters.maxPriceUSD) return false;
                }

                // Filtro por Habitaciones
                if (currentFilters.minBedrooms > 0) {
                    if ((prop.bedrooms || 0) < currentFilters.minBedrooms) return false;
                }

                // Filtro por Baños
                if (currentFilters.minBathrooms > 0) {
                    if ((prop.bathrooms || 0) < currentFilters.minBathrooms) return false;
                }

                // Filtro por Camas
                if (currentFilters.minBeds > 0) {
                    if ((prop.bedsCount || 1) < currentFilters.minBeds) return false;
                }

                // Filtro por Amenities
                if (currentFilters.amenities && currentFilters.amenities.length > 0) {
                    const hasAllAmenities = currentFilters.amenities.every(amenity => {
                        return prop.amenities && prop.amenities.includes(amenity);
                    });
                    if (!hasAllAmenities) return false;
                }

                return true;
            });

            // Disparar evento
            window.dispatchEvent(new CustomEvent("propertiesFiltered", {
                detail: {
                    properties: filtered,
                    filters: currentFilters,
                    activeCount: this.getActiveFiltersCount()
                }
            }));

            return filtered;
        }
    };

    window.FilterManager = FilterManager;
})();
