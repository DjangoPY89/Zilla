// ============================================================
// Motor de Filtrado Reactivo, Búsqueda Inteligente y Ordenamiento
// ============================================================
(function () {
    const defaultFilters = {
        keyword: "",
        department: "all",
        neighborhood: "all",
        operation: "all",
        propTypes: [], // Array con selección múltiple (ej. ['apartment', 'house'])
        minPriceUSD: 0,
        maxPriceUSD: 10000000,
        minBedrooms: 0,
        minBathrooms: 0,
        acceptsCheRogaPora: false,
        amenities: [],
        sortBy: "popularity", // popularity, price_asc, price_desc, m2_desc, m2_asc, rating
        polygon: null, // Array de coordenadas [[lat, lng], ...] dibujadas en el mapa (PRIORIDAD 1)
        mapBounds: null // Área visible actual del mapa (PRIORIDAD 2 cuando Sincronizar Mapa está activo)
    };

    let currentFilters = { ...defaultFilters };

    // Algoritmo Ray-Casting para verificar si un punto [lat, lng] está dentro de un polígono
    function isPointInPolygon(lat, lng, polygonCoords) {
        if (!polygonCoords || polygonCoords.length < 3) return true;
        let inside = false;
        for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
            const xi = polygonCoords[i][0], yi = polygonCoords[i][1];
            const xj = polygonCoords[j][0], yj = polygonCoords[j][1];
            const intersect = ((yi > lng) !== (yj > lng)) &&
                (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // Verificar si un punto [lat, lng] está dentro del área visible (bounds) del mapa
    function isPointInBounds(lat, lng, bounds) {
        if (!bounds) return true;
        if (typeof bounds.contains === "function") {
            try {
                return bounds.contains(lat, lng);
            } catch (e) {
                try {
                    if (window.google && window.google.maps) {
                        return bounds.contains(new google.maps.LatLng(lat, lng));
                    }
                } catch (e2) {}
                try {
                    if (window.L && typeof L.latLng === 'function') {
                        return bounds.contains(L.latLng(lat, lng));
                    }
                } catch (e3) {}
            }
        }
        if (bounds.north !== undefined && bounds.south !== undefined && bounds.east !== undefined && bounds.west !== undefined) {
            return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
        }
        if (bounds._southWest && bounds._northEast) {
            return lat >= bounds._southWest.lat && lat <= bounds._northEast.lat &&
                   lng >= bounds._southWest.lng && lng <= bounds._northEast.lng;
        }
        return true;
    }

    // Función auxiliar para normalizar texto (elimina tildes, minúsculas y espacios extra)
    function normalizeText(str) {
        if (!str) return "";
        return str.toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    const FilterManager = {
        filters: currentFilters,

        setFilter: function (key, value) {
            currentFilters[key] = value;
            return this.applyFilters();
        },

        resetFilters: function () {
            currentFilters = { ...defaultFilters };
            
            // Reset UI inputs
            const searchInput = document.getElementById("search-input");
            if (searchInput) searchInput.value = "";

            const sortSelect = document.getElementById("sort-by-select");
            if (sortSelect) sortSelect.value = "popularity";

            // Disparar evento para actualizar UI
            window.dispatchEvent(new CustomEvent("filtersReset"));

            return this.applyFilters();
        },

        applyFilters: function () {
            const allProperties = window.PROPERTIES_DATA || [];

            // Palabras genéricas a ignorar en búsquedas de dirección o Google Places
            const stopwords = new Set([
                "paraguay", "de", "del", "la", "el", "los", "las", "en", "y", "c", 
                "av", "avenida", "calle", "distrito", "district", "capital", "departamento"
            ]);

            let filtered = allProperties.filter(prop => {
                // 1. Filtro inteligente por palabra clave (sin distinción de acentos ni mayúsculas)
                if (currentFilters.keyword && currentFilters.keyword.trim() !== "") {
                    const cleanKw = normalizeText(currentFilters.keyword);
                    
                    // Separar términos significativos (ej. "Asunción, Paraguay" -> ["asuncion"])
                    const terms = cleanKw.split(/[\s,]+/)
                        .filter(t => t.length >= 2 && !stopwords.has(t));

                    if (terms.length > 0) {
                        const nearbyNames = prop.nearbyPoints ? prop.nearbyPoints.map(p => p.name).join(" ") : "";
                        const matchText = normalizeText(
                            (prop.title || "") + " " +
                            (prop.description || "") + " " +
                            (prop.neighborhood || "") + " " +
                            (prop.city || "") + " " +
                            (prop.department || "") + " " +
                            (prop.address || "") + " " +
                            nearbyNames
                        );

                        // Comprobar si al menos uno de los términos clave coincide
                        const isMatch = terms.some(term => matchText.includes(term));
                        if (!isMatch) return false;
                    }
                }

                // 2. Filtro por Ubicación (Selector de Barrio o Ciudad)
                if (currentFilters.neighborhood !== "all") {
                    const targetLoc = normalizeText(currentFilters.neighborhood);
                    const propNeigh = normalizeText(prop.neighborhood || "");
                    const propCity = normalizeText(prop.city || "");
                    const propDept = normalizeText(prop.department || "");

                    if (!propNeigh.includes(targetLoc) && !propCity.includes(targetLoc) && !propDept.includes(targetLoc)) {
                        return false;
                    }
                }

                if (currentFilters.department !== "all") {
                    const targetDept = normalizeText(currentFilters.department);
                    const propDept = normalizeText(prop.department || "");
                    if (propDept !== targetDept) return false;
                }

                // 3. Filtro por Operación (SELECCIÓN MÚLTIPLE O SIMPLE)
                if (Array.isArray(currentFilters.operations) && currentFilters.operations.length > 0) {
                    if (!currentFilters.operations.includes("all")) {
                        if (!currentFilters.operations.includes(prop.operation)) {
                            return false;
                        }
                    }
                } else if (currentFilters.operation && currentFilters.operation !== "all") {
                    const ops = typeof currentFilters.operation === 'string' && currentFilters.operation.includes(',')
                        ? currentFilters.operation.split(',')
                        : [currentFilters.operation];
                    if (!ops.includes("all") && !ops.includes(prop.operation)) {
                        return false;
                    }
                }

                // 4. Filtro por Tipo de Propiedad (SELECCIÓN MÚLTIPLE)
                if (currentFilters.propTypes && currentFilters.propTypes.length > 0) {
                    if (!currentFilters.propTypes.includes("all")) {
                        if (!currentFilters.propTypes.includes(prop.propType)) {
                            return false;
                        }
                    }
                }

                // 5. Filtro por Rango de Precio en USD
                if (prop.priceUSD < currentFilters.minPriceUSD || prop.priceUSD > currentFilters.maxPriceUSD) {
                    return false;
                }

                // 6. Filtro por Habitaciones (Mínimo de Dormitorios)
                if (currentFilters.minBedrooms > 0 && prop.bedrooms < currentFilters.minBedrooms) {
                    return false;
                }

                // 7. Filtro por Baños (Mínimo de Baños)
                if (currentFilters.minBathrooms > 0 && prop.bathrooms < currentFilters.minBathrooms) {
                    return false;
                }

                // 8. Filtro Che Róga Porã
                if (currentFilters.acceptsCheRogaPora && !prop.acceptsCheRogaPora) {
                    return false;
                }

                // 9. Filtro por Amenities (Extras)
                if (currentFilters.amenities && currentFilters.amenities.length > 0) {
                    const hasAllAmenities = currentFilters.amenities.every(amenity => {
                        if (amenity === "che_roga") return prop.acceptsCheRogaPora;
                        return prop.amenities && prop.amenities.includes(amenity);
                    });
                    if (!hasAllAmenities) return false;
                }

                // 10. FILTRO GEOESPACIAL: POLÍGONO DIBUJADO (PRIORIDAD 1) O ÁREA VISIBLE DEL MAPA (PRIORIDAD 2)
                if (currentFilters.polygon && currentFilters.polygon.length >= 3 && prop.coordinates) {
                    // Prioridad 1: El dibujo / zona personalizada manda sobre cualquier otra área
                    const [propLat, propLng] = prop.coordinates;
                    if (!isPointInPolygon(propLat, propLng, currentFilters.polygon)) {
                        return false;
                    }
                } else if (currentFilters.mapBounds && prop.coordinates) {
                    // Prioridad 2: Si no hay dibujo y "Sincronizar Mapa" está activo, mostrar solo inmuebles en la pantalla visible
                    const [propLat, propLng] = prop.coordinates;
                    if (!isPointInBounds(propLat, propLng, currentFilters.mapBounds)) {
                        return false;
                    }
                }

                return true;
            });

            // 10. Ordenamiento de Resultados
            filtered = this.sortProperties(filtered, currentFilters.sortBy);

            // Disparar evento con los resultados filtrados
            window.dispatchEvent(new CustomEvent("propertiesFiltered", { detail: { properties: filtered } }));
            return filtered;
        },

        sortProperties: function (properties, sortBy = "popularity") {
            const list = [...properties];
            switch (sortBy) {
                case "price_asc":
                    return list.sort((a, b) => a.priceUSD - b.priceUSD);
                case "price_desc":
                    return list.sort((a, b) => b.priceUSD - a.priceUSD);
                case "m2_desc":
                    return list.sort((a, b) => (b.builtAreaM2 || b.totalAreaM2 || 0) - (a.builtAreaM2 || a.totalAreaM2 || 0));
                case "m2_asc":
                    return list.sort((a, b) => (a.builtAreaM2 || a.totalAreaM2 || 0) - (b.builtAreaM2 || b.totalAreaM2 || 0));
                case "rating":
                    return list.sort((a, b) => {
                        const scoreA = a.tier === "platinum" ? 3 : (a.tier === "gold" ? 2 : 1);
                        const scoreB = b.tier === "platinum" ? 3 : (b.tier === "gold" ? 2 : 1);
                        return scoreB - scoreA;
                    });
                case "popularity":
                default:
                    // Destacados platino primero, luego orden por ID/relevancia
                    return list.sort((a, b) => {
                        if (a.tier === "platinum" && b.tier !== "platinum") return -1;
                        if (b.tier === "platinum" && a.tier !== "platinum") return 1;
                        if (a.tier === "gold" && b.tier === "free") return -1;
                        if (b.tier === "gold" && a.tier === "free") return 1;
                        return 0;
                    });
            }
        }
    };

    window.FilterManager = FilterManager;
})();
