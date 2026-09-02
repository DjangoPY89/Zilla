// Motor de Filtrado Reactivo y Búsqueda para Zilla Flex Media Estancia
(function () {
    const defaultFilters = {
        keyword: "",
        department: "all",
        neighborhood: "all",
        durationMonths: 3, // Duración predeterminada (1 a 11 meses)
        startMonth: "sep",
        priceCurrency: "USD", // 'USD' o 'PYG'
        minPriceUSD: null,
        maxPriceUSD: null,
        minPricePYG: null,
        maxPricePYG: null,
        minBedrooms: 0,
        amenities: ["wifi"] // WiFi verificado por defecto
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
            if (currentFilters.durationMonths !== 3) count++;
            if (currentFilters.minPriceUSD || currentFilters.maxPriceUSD || currentFilters.minPricePYG || currentFilters.maxPricePYG) count++;
            if (currentFilters.minBedrooms > 0) count++;
            if (currentFilters.amenities && currentFilters.amenities.length > 1) count += (currentFilters.amenities.length - 1);
            return count;
        },

        resetFilters: function () {
            currentFilters = { ...defaultFilters };
            currentFilters.amenities = ["wifi"];

            // Reset UI inputs
            const searchInput = document.getElementById("search-input");
            if (searchInput) searchInput.value = "";

            const locationSelect = document.getElementById("location-select");
            if (locationSelect) locationSelect.value = "all";

            const durationSelect = document.getElementById("duration-select");
            if (durationSelect) durationSelect.value = "3";

            const minPriceInput = document.getElementById("filter-min-price");
            if (minPriceInput) minPriceInput.value = "";

            const maxPriceInput = document.getElementById("filter-max-price");
            if (maxPriceInput) maxPriceInput.value = "";

            // Reset room buttons
            document.querySelectorAll(".segmented-btn[data-rooms]").forEach(b => {
                b.classList.toggle("active", b.dataset.rooms === "0");
            });

            // Reset amenities chips
            document.querySelectorAll(".amenity-filter-chip").forEach(el => {
                el.classList.toggle("active", el.dataset.amenity === "wifi");
            });

            // Trigger UI update events
            window.dispatchEvent(new CustomEvent("filtersReset"));
            this.applyFilters();
        },

        applyFilters: function () {
            const allProperties = window.PROPERTIES_DATA || [];
            const rate = (window.CurrencyManager && window.CurrencyManager.rate) || 7950;
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

                // Filtro por Ubicación (Barrio o Ciudad)
                if (currentFilters.neighborhood !== "all") {
                    if (prop.neighborhood !== currentFilters.neighborhood && prop.city !== currentFilters.neighborhood) {
                        return false;
                    }
                }

                // Filtro por Duración de Estancia (1 a 11 meses)
                if (prop.minStayMonths && prop.minStayMonths > duration) return false;
                if (prop.maxStayMonths && prop.maxStayMonths < duration) return false;

                // Precio dinámico mensual con descuento aplicado
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

                // Filtro por Habitaciones (Mínimo)
                if (currentFilters.minBedrooms > 0) {
                    if ((prop.bedrooms || 0) < currentFilters.minBedrooms) return false;
                }

                // Filtro por Extras / Amenities
                if (currentFilters.amenities && currentFilters.amenities.length > 0) {
                    const hasAllAmenities = currentFilters.amenities.every(amenity => {
                        if (amenity === "wifi") return (prop.wifiSpeedMbps || 0) >= 300;
                        return prop.amenities && prop.amenities.includes(amenity);
                    });
                    if (!hasAllAmenities) return false;
                }

                return true;
            });

            // Disparar evento con los resultados filtrados y filtros activos
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
