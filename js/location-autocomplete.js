/**
 * ============================================================
 * Zilla Paraguay - Motor de Sugerencias y Autocompletado de Ubicaciones
 * ============================================================
 * Proporciona sugerencias instantáneas y reactivas de barrios, ciudades,
 * ejes corporativos y puntos estratégicos de Paraguay para el Hero y Explorar.
 */
(function () {
    // 1. Catálogo estructurado de ubicaciones de Paraguay
    const PARAGUAY_LOCATIONS = [
        // CIUDADES PRINCIPALES
        { name: "Asunción", type: "city", subtitle: "Capital de Paraguay", dept: "Capital", coordinates: [-25.2867, -57.647] },
        { name: "San Bernardino", type: "city", subtitle: "Ciudad turística / Lago Ypacaraí", dept: "Cordillera", coordinates: [-25.3115, -57.2961] },
        { name: "Luque", type: "city", subtitle: "Gran Asunción / Zona Aeropuerto", dept: "Central", coordinates: [-25.2678, -57.4857] },
        { name: "Lambaré", type: "city", subtitle: "Gran Asunción / Yacht y Golf Club", dept: "Central", coordinates: [-25.3458, -57.6067] },
        { name: "Fernando de la Mora", type: "city", subtitle: "Gran Asunción (Zona Norte y Sur)", dept: "Central", coordinates: [-25.3211, -57.5469] },
        { name: "Mariano Roque Alonso", type: "city", subtitle: "Gran Asunción / Expo y Puente Remanso", dept: "Central", coordinates: [-25.2167, -57.5333] },
        { name: "San Lorenzo", type: "city", subtitle: "Gran Asunción / Ciudad Universitaria", dept: "Central", coordinates: [-25.3406, -57.5097] },
        { name: "Villa Elisa", type: "city", subtitle: "Gran Asunción / Acceso Sur", dept: "Central", coordinates: [-25.3678, -57.5908] },
        { name: "Capiatá", type: "city", subtitle: "Gran Asunción / Ruta PY02", dept: "Central", coordinates: [-25.3556, -57.4444] },
        { name: "Areguá", type: "city", subtitle: "Capital de Central / Alfarería y Frutilla", dept: "Central", coordinates: [-25.3117, -57.3847] },
        { name: "Altos", type: "city", subtitle: "Cordillera / AquaVillage y Colinas", dept: "Cordillera", coordinates: [-25.2636, -57.2558] },
        { name: "Ypacaraí", type: "city", subtitle: "Cordillera / Ruta PY02", dept: "Central", coordinates: [-25.4022, -57.2872] },
        { name: "Encarnación", type: "city", subtitle: "Perla del Sur / Costanera y Playas", dept: "Itapúa", coordinates: [-27.3306, -55.8667] },
        { name: "Ciudad del Este", type: "city", subtitle: "Alto Paraná / Eje Comercial y Frontera", dept: "Alto Paraná", coordinates: [-25.5097, -54.6111] },
        { name: "Hernandarias", type: "city", subtitle: "Alto Paraná / Paraná Country Club", dept: "Alto Paraná", coordinates: [-25.4056, -54.6361] },
        { name: "Presidente Franco", type: "city", subtitle: "Alto Paraná / Saltos del Monday", dept: "Alto Paraná", coordinates: [-25.5647, -54.6156] },

        // BARRIOS DE ASUNCIÓN (ALTA DEMANDA)
        { name: "Villa Morra", type: "neighborhood", subtitle: "Barrio en Asunción / Eje Comercial", dept: "Asunción", coordinates: [-25.2938, -57.5794] },
        { name: "Carmelitas", type: "neighborhood", subtitle: "Barrio en Asunción / Gastronómico & Residencial", dept: "Asunción", coordinates: [-25.2814, -57.5722] },
        { name: "Mburucuyá", type: "neighborhood", subtitle: "Barrio en Asunción / Residencial Exclusivo", dept: "Asunción", coordinates: [-25.2694, -57.5678] },
        { name: "Santa Teresa", type: "neighborhood", subtitle: "Barrio / Eje Corporativo en Asunción", dept: "Asunción", coordinates: [-25.2858, -57.5583] },
        { name: "Ykua Satî", type: "neighborhood", subtitle: "Barrio en Asunción / Torres y Residencias", dept: "Asunción", coordinates: [-25.2917, -57.5611] },
        { name: "Los Laureles", type: "neighborhood", subtitle: "Barrio en Asunción / Residencial Arbolado", dept: "Asunción", coordinates: [-25.3056, -57.575] },
        { name: "Manora", type: "neighborhood", subtitle: "Barrio en Asunción / Zona Embajadas", dept: "Asunción", coordinates: [-25.2861, -57.5778] },
        { name: "Recoleta", type: "neighborhood", subtitle: "Barrio en Asunción / Mariscal López", dept: "Asunción", coordinates: [-25.3014, -57.5889] },
        { name: "Las Mercedes", type: "neighborhood", subtitle: "Barrio tradicional en Asunción", dept: "Asunción", coordinates: [-25.2806, -57.6139] },
        { name: "Herrera", type: "neighborhood", subtitle: "Barrio en Asunción / Zona Municipalidad", dept: "Asunción", coordinates: [-25.2972, -57.5528] },
        { name: "Sajonia", type: "neighborhood", subtitle: "Barrio en Asunción / Palacio de Justicia", dept: "Asunción", coordinates: [-25.2917, -57.6583] },
        { name: "Centro Histórico", type: "neighborhood", subtitle: "Asunción / Bahía y Costanera", dept: "Asunción", coordinates: [-25.2825, -57.635] },
        { name: "Trinidad", type: "neighborhood", subtitle: "Barrio en Asunción / Jardín Botánico", dept: "Asunción", coordinates: [-25.2583, -57.5722] },
        { name: "Villa Aurelia", type: "neighborhood", subtitle: "Barrio en Asunción / Residencial", dept: "Asunción", coordinates: [-25.3111, -57.5639] },
        { name: "San Cristóbal", type: "neighborhood", subtitle: "Barrio en Asunción / Denis Roa", dept: "Asunción", coordinates: [-25.2986, -57.5694] },
        { name: "Campo Grande", type: "neighborhood", subtitle: "Barrio en Asunción / Autopista", dept: "Asunción", coordinates: [-25.2667, -57.5444] },

        // EJES Y AVENIDAS ESTRATÉGICAS
        { name: "Eje Corporativo", type: "avenue", subtitle: "Av. Aviadores del Chaco / WTC y Shopping del Sol", dept: "Asunción", coordinates: [-25.2806, -57.5611] },
        { name: "Av. Molas López", type: "avenue", subtitle: "Eje Residencial de Torres Premium", dept: "Asunción", coordinates: [-25.275, -57.5694] },
        { name: "Av. Mariscal López", type: "avenue", subtitle: "Eje Comercial y Bancario", dept: "Asunción", coordinates: [-25.2944, -57.5806] },
        { name: "Av. Santa Teresa", type: "avenue", subtitle: "Corredor de Torres de Lujo", dept: "Asunción", coordinates: [-25.2858, -57.5583] },
        { name: "Costanera de Asunción", type: "avenue", subtitle: "Frente a la Bahía de Asunción", dept: "Asunción", coordinates: [-25.275, -57.6333] },
        { name: "Ciervo Cuá", type: "neighborhood", subtitle: "San Bernardino / Condominios y Lago", dept: "Cordillera", coordinates: [-25.3333, -57.2833] },
        { name: "Paraná Country Club", type: "neighborhood", subtitle: "Hernandarias / Barrio Cerrado de Lujo", dept: "Alto Paraná", coordinates: [-25.4389, -54.6222] }
    ];

    const POPULAR_ZONES = [
        "Asunción",
        "Villa Morra",
        "San Bernardino",
        "Carmelitas",
        "Luque",
        "Santa Teresa",
        "Mburucuyá",
        "Encarnación",
        "Ciudad del Este"
    ];

    // Función auxiliar para normalizar texto (sin tildes, minúsculas)
    function normalize(str) {
        if (!str) return "";
        return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    }

    // Obtener ícono según el tipo de sugerencia
    function getIconForType(type) {
        switch (type) {
            case "city":
                return `<span class="ac-icon ac-icon-city"><i class="fas fa-city"></i></span>`;
            case "neighborhood":
                return `<span class="ac-icon ac-icon-neigh"><i class="fas fa-location-dot"></i></span>`;
            case "avenue":
                return `<span class="ac-icon ac-icon-ave"><i class="fas fa-road"></i></span>`;
            case "property":
                return `<span class="ac-icon ac-icon-prop"><i class="fas fa-house"></i></span>`;
            default:
                return `<span class="ac-icon ac-icon-default"><i class="fas fa-magnifying-glass"></i></span>`;
        }
    }

    // Resaltar coincidencias en el texto
    function highlightMatch(text, query) {
        if (!query) return text;
        const normText = normalize(text);
        const normQuery = normalize(query);
        const idx = normText.indexOf(normQuery);
        if (idx === -1) return text;
        const before = text.substring(0, idx);
        const match = text.substring(idx, idx + query.length);
        const after = text.substring(idx + query.length);
        return `${before}<strong>${match}</strong>${after}`;
    }

    // Clase controladora del autocompletado
    class ZillaAutocomplete {
        constructor(inputElement, options = {}) {
            this.input = typeof inputElement === "string" ? document.getElementById(inputElement) : inputElement;
            if (!this.input) return;

            this.options = Object.assign({
                latInputId: null,
                lngInputId: null,
                isHero: false,
                onSelect: null
            }, options);

            this.latInput = this.options.latInputId ? document.getElementById(this.options.latInputId) : null;
            this.lngInput = this.options.lngInputId ? document.getElementById(this.options.lngInputId) : null;
            this.dropdown = null;
            this.selectedIndex = -1;
            this.currentResults = [];

            this.init();
        }

        init() {
            // Asegurar que el contenedor padre tenga position relative
            const parent = this.input.parentElement;
            if (parent && getComputedStyle(parent).position === "static") {
                parent.style.position = "relative";
            }

            // Crear el elemento de dropdown
            this.dropdown = document.createElement("div");
            this.dropdown.className = "zilla-autocomplete-dropdown";
            this.dropdown.setAttribute("role", "listbox");
            this.dropdown.style.display = "none";
            parent.appendChild(this.dropdown);

            // Event Listeners
            this.input.addEventListener("input", () => this.handleInput());
            this.input.addEventListener("focus", () => this.handleFocus());
            this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));

            // Cerrar al hacer clic fuera
            document.addEventListener("click", (e) => {
                if (!parent.contains(e.target)) {
                    this.hide();
                }
            });
        }

        handleFocus() {
            const val = this.input.value.trim();
            if (val.length === 0) {
                this.renderPopularSuggestions();
            } else {
                this.handleInput();
            }
        }

        handleInput() {
            const query = this.input.value.trim();
            if (query.length === 0) {
                this.renderPopularSuggestions();
                return;
            }

            const cleanQ = normalize(query);

            // 1. Filtrar lista estática de Paraguay
            const matches = PARAGUAY_LOCATIONS.filter(loc => {
                return normalize(loc.name).includes(cleanQ) ||
                       normalize(loc.subtitle).includes(cleanQ) ||
                       normalize(loc.dept).includes(cleanQ);
            });

            // 2. Extraer coincidencias de los inmuebles cargados en memoria
            const propData = window.PROPERTIES_DATA || [];
            const propMatches = [];
            propData.forEach(p => {
                if (propMatches.length >= 3) return;
                const matchInTitle = normalize(p.title).includes(cleanQ);
                const matchInNeigh = normalize(p.neighborhood).includes(cleanQ);
                const matchInCity = normalize(p.city).includes(cleanQ);

                if (matchInTitle || matchInNeigh || matchInCity) {
                    propMatches.push({
                        name: p.neighborhood ? `${p.neighborhood}, ${p.city}` : p.title,
                        type: "property",
                        subtitle: `${p.title} (${p.propType})`,
                        dept: p.department || "Paraguay",
                        coordinates: p.coordinates
                    });
                }
            });

            // Unir y eliminar duplicados por nombre
            const seen = new Set();
            const combined = [...matches, ...propMatches].filter(item => {
                const key = normalize(item.name);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }).slice(0, 7);

            this.currentResults = combined;
            this.selectedIndex = -1;
            this.renderResults(combined, query);
        }

        renderPopularSuggestions() {
            this.selectedIndex = -1;
            this.currentResults = [];

            let html = `
                <div class="ac-header">
                    <i class="fas fa-fire text-amber-500"></i>
                    <span>Zonas Más Buscadas en Paraguay</span>
                </div>
                <div class="ac-popular-chips">
            `;

            POPULAR_ZONES.forEach(zone => {
                html += `<button type="button" class="ac-chip" data-zone="${zone}">${zone}</button>`;
            });

            html += `</div>`;

            this.dropdown.innerHTML = html;
            this.dropdown.style.display = "block";

            // Click en chips
            this.dropdown.querySelectorAll(".ac-chip").forEach(chip => {
                chip.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const zone = chip.dataset.zone;
                    const matchedLoc = PARAGUAY_LOCATIONS.find(l => normalize(l.name) === normalize(zone));
                    this.selectLocation(matchedLoc || { name: zone, coordinates: null });
                });
            });
        }

        renderResults(results, query) {
            if (results.length === 0) {
                this.dropdown.innerHTML = `
                    <div class="ac-no-results">
                        <i class="fas fa-location-slash"></i>
                        <span>No encontramos coincidencias exactas para "${query}".</span>
                        <div class="ac-sub-tip">Puedes presionar Buscar para ver todos los resultados aproximados.</div>
                    </div>
                `;
                this.dropdown.style.display = "block";
                return;
            }

            let html = `
                <div class="ac-header">
                    <i class="fas fa-magnifying-glass text-primary"></i>
                    <span>Sugerencias de Ubicación (${results.length})</span>
                </div>
                <ul class="ac-list">
            `;

            results.forEach((item, idx) => {
                const icon = getIconForType(item.type);
                const titleHighlight = highlightMatch(item.name, query);
                const subHighlight = highlightMatch(item.subtitle, query);

                html += `
                    <li class="ac-item" data-idx="${idx}" role="option">
                        ${icon}
                        <div class="ac-item-content">
                            <div class="ac-item-title">${titleHighlight}</div>
                            <div class="ac-item-sub">${subHighlight}</div>
                        </div>
                        <i class="fas fa-arrow-up-left ac-item-arrow"></i>
                    </li>
                `;
            });

            html += `</ul>`;
            this.dropdown.innerHTML = html;
            this.dropdown.style.display = "block";

            // Click en items
            this.dropdown.querySelectorAll(".ac-item").forEach(itemEl => {
                itemEl.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const idx = parseInt(itemEl.dataset.idx, 10);
                    if (this.currentResults[idx]) {
                        this.selectLocation(this.currentResults[idx]);
                    }
                });
            });
        }

        selectLocation(loc) {
            this.input.value = loc.name;

            if (this.latInput && loc.coordinates) this.latInput.value = loc.coordinates[0];
            if (this.lngInput && loc.coordinates) this.lngInput.value = loc.coordinates[1];

            this.hide();

            // Callback personalizado o sincronización con FilterManager
            if (typeof this.options.onSelect === "function") {
                this.options.onSelect(loc);
            } else if (!this.options.isHero && window.FilterManager) {
                window.FilterManager.setFilter("keyword", loc.name);
                if (loc.coordinates && window.MapManager && typeof window.MapManager.panToCoordinates === "function") {
                    window.MapManager.panToCoordinates(loc.coordinates[0], loc.coordinates[1], 15);
                }
            }
        }

        handleKeyDown(e) {
            if (this.dropdown.style.display === "none") return;

            const items = this.dropdown.querySelectorAll(".ac-item");
            if (items.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.selectedIndex = (this.selectedIndex + 1) % items.length;
                this.updateActiveItem(items);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
                this.updateActiveItem(items);
            } else if (e.key === "Enter") {
                if (this.selectedIndex >= 0 && this.currentResults[this.selectedIndex]) {
                    e.preventDefault();
                    this.selectLocation(this.currentResults[this.selectedIndex]);
                }
            } else if (e.key === "Escape") {
                this.hide();
            }
        }

        updateActiveItem(items) {
            items.forEach((it, idx) => {
                it.classList.toggle("active", idx === this.selectedIndex);
                if (idx === this.selectedIndex) {
                    it.scrollIntoView({ block: "nearest" });
                }
            });
        }

        hide() {
            if (this.dropdown) {
                this.dropdown.style.display = "none";
                this.selectedIndex = -1;
            }
        }
    }

    // Exponer globalmente
    window.ZillaAutocomplete = ZillaAutocomplete;

    // Inicialización automática al cargar el DOM
    const initAutocompletes = () => {
        // 1. Hero Input en Landing / Index
        const heroInput = document.getElementById("hero-location-input");
        if (heroInput && !heroInput.dataset.autocompleteAttached) {
            heroInput.dataset.autocompleteAttached = "true";
            new ZillaAutocomplete(heroInput, {
                latInputId: "hero-lat-input",
                lngInputId: "hero-lng-input",
                isHero: true
            });
        }

        // 2. Search Input en Explorar
        const exploreInput = document.getElementById("search-input");
        if (exploreInput && !exploreInput.dataset.autocompleteAttached) {
            exploreInput.dataset.autocompleteAttached = "true";
            new ZillaAutocomplete(exploreInput, {
                isHero: false,
                onSelect: (loc) => {
                    if (window.FilterManager) {
                        window.FilterManager.setFilter("keyword", loc.name);
                    }
                    if (loc.coordinates && window.MapManager && typeof window.MapManager.panToCoordinates === "function") {
                        window.MapManager.panToCoordinates(loc.coordinates[0], loc.coordinates[1], 15);
                    }
                }
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAutocompletes);
    } else {
        initAutocompletes();
    }
})();
