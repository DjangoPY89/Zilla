// Módulo de Publicación de Anuncios en 3 Pasos con Geolocalización
(function () {
    let publishMap = null;
    let publishMarker = null;
    let selectedCoords = [-25.2950, -57.5750]; // Default Asunción
    let currentStep = 1;

    const PublishManager = {
        init: function () {
            const openBtn = document.getElementById("open-publish-modal-btn");
            const closeBtn = document.getElementById("close-publish-modal-btn");
            const backdrop = document.getElementById("publish-modal-backdrop");

            if (openBtn) openBtn.addEventListener("click", () => this.open());
            if (closeBtn) closeBtn.addEventListener("click", () => this.close());
            if (backdrop) backdrop.addEventListener("click", () => this.close());

            // Navegación entre pasos
            const nextBtn1 = document.getElementById("publish-next-1");
            const prevBtn2 = document.getElementById("publish-prev-2");
            const nextBtn2 = document.getElementById("publish-next-2");
            const prevBtn3 = document.getElementById("publish-prev-3");
            const submitBtn = document.getElementById("publish-submit-form");

            if (nextBtn1) nextBtn1.addEventListener("click", () => this.goToStep(2));
            if (prevBtn2) prevBtn2.addEventListener("click", () => this.goToStep(1));
            if (nextBtn2) nextBtn2.addEventListener("click", () => this.goToStep(3));
            if (prevBtn3) prevBtn3.addEventListener("click", () => this.goToStep(2));

            if (submitBtn) {
                submitBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.submitProperty();
                });
            }
        },

        open: function () {
            const modal = document.getElementById("publish-modal-container");
            if (modal) {
                modal.classList.add("active");
                document.body.style.overflow = "hidden";
                this.goToStep(1);
            }
        },

        close: function () {
            const modal = document.getElementById("publish-modal-container");
            if (modal) {
                modal.classList.remove("active");
                document.body.style.overflow = "";
            }
        },

        goToStep: function (step) {
            currentStep = step;
            // Actualizar indicadores de pasos
            document.querySelectorAll(".step-indicator").forEach(el => {
                const stepNum = parseInt(el.dataset.step, 10);
                el.classList.toggle("active", stepNum === step);
                el.classList.toggle("completed", stepNum < step);
            });

            // Mostrar sección correspondiente
            document.querySelectorAll(".publish-step-panel").forEach(panel => {
                panel.classList.toggle("active", panel.id === `publish-step-${step}`);
            });

            // Si es paso 2, inicializar o redimensionar el mapa de geolocalización
            if (step === 2) {
                setTimeout(() => this.initPublishMap(), 250);
            }
        },

        initPublishMap: function () {
            const mapContainer = document.getElementById("publish-picker-map");
            if (!mapContainer) return;

            if (!publishMap) {
                publishMap = L.map("publish-picker-map", {
                    center: selectedCoords,
                    zoom: 14,
                    zoomControl: true
                });

                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    maxZoom: 19
                }).addTo(publishMap);

                // Marcador arrastrable para ubicar el inmueble exactamente
                const pinIcon = L.divIcon({
                    className: 'custom-publish-pin',
                    html: `<div class="publish-pin-icon"><i class="fas fa-map-marker-alt"></i></div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                });

                publishMarker = L.marker(selectedCoords, { draggable: true, icon: pinIcon }).addTo(publishMap);

                publishMarker.on('dragend', function (e) {
                    const pos = e.target.getLatLng();
                    selectedCoords = [pos.lat, pos.lng];
                    document.getElementById("publish-lat").value = pos.lat.toFixed(6);
                    document.getElementById("publish-lng").value = pos.lng.toFixed(6);
                });

                publishMap.on('click', function (e) {
                    publishMarker.setLatLng(e.latlng);
                    selectedCoords = [e.latlng.lat, e.latlng.lng];
                    document.getElementById("publish-lat").value = e.latlng.lat.toFixed(6);
                    document.getElementById("publish-lng").value = e.latlng.lng.toFixed(6);
                });
            } else {
                publishMap.invalidateSize();
            }
        },

        submitProperty: function () {
            const title = document.getElementById("pub-title")?.value || "Inmueble Destacado";
            const operation = document.getElementById("pub-operation")?.value || "sale";
            const propType = document.getElementById("pub-prop-type")?.value || "apartment";
            const priceUSD = parseFloat(document.getElementById("pub-price-usd")?.value) || 120000;
            const pricePYG = priceUSD * window.CurrencyManager.rate;
            const department = document.getElementById("pub-department")?.value || "Capital";
            const city = document.getElementById("pub-city")?.value || "Asunción";
            const neighborhood = document.getElementById("pub-neighborhood")?.value || "Villa Morra";
            const address = document.getElementById("pub-address")?.value || "Av. Mariscal López";
            const bedrooms = parseInt(document.getElementById("pub-bedrooms")?.value, 10) || 2;
            const bathrooms = parseInt(document.getElementById("pub-bathrooms")?.value, 10) || 2;
            const parkingSpots = parseInt(document.getElementById("pub-garage")?.value, 10) || 1;
            const builtAreaM2 = parseFloat(document.getElementById("pub-area")?.value) || 100;
            const description = document.getElementById("pub-description")?.value || "Excelente propiedad con acabados de primera.";
            const acceptsCheRoga = document.getElementById("pub-che-roga")?.checked || false;
            const advertiserName = document.getElementById("pub-adv-name")?.value || "Dueño Directo";
            const advertiserPhone = document.getElementById("pub-adv-phone")?.value || "+595981000000";

            // Amenities seleccionados
            const amenities = [];
            if (document.getElementById("pub-am-quincho")?.checked) amenities.push("quincho");
            if (document.getElementById("pub-am-pool")?.checked) amenities.push("pool");
            if (document.getElementById("pub-am-garage")?.checked) amenities.push("garage");
            if (document.getElementById("pub-am-sec")?.checked) amenities.push("security");
            if (document.getElementById("pub-am-pet")?.checked) amenities.push("pet_friendly");

            const newProp = {
                id: `PY-${Math.floor(100 + Math.random() * 900)}`,
                title: title,
                operation: operation,
                propType: propType,
                tier: "gold",
                priceUSD: priceUSD,
                pricePYG: pricePYG,
                currencyPrimary: "USD",
                expensesPYG: 500000,
                department: department,
                city: city,
                neighborhood: neighborhood,
                address: address,
                coordinates: selectedCoords,
                bedrooms: bedrooms,
                bathrooms: bathrooms,
                parkingSpots: parkingSpots,
                builtAreaM2: builtAreaM2,
                totalAreaM2: builtAreaM2 * 1.2,
                yearBuilt: 2024,
                badge: "¡Recién Publicado!",
                acceptsCheRogaPora: acceptsCheRoga,
                bankCreditEligible: true,
                amenities: amenities,
                avgNeighborhoodM2USD: 1350,
                propertyM2USD: builtAreaM2 > 0 ? Math.round(priceUSD / builtAreaM2) : 1200,
                advertiser: {
                    name: advertiserName,
                    agency: "Anunciante Particular",
                    type: "owner_direct",
                    verified: true,
                    phone: advertiserPhone,
                    whatsapp: advertiserPhone.replace(/[^0-9]/g, ''),
                    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                },
                description: description,
                nearbyPoints: [
                    { name: "Avenida Principal", distance: "200 m", time: "2 min a pie" },
                    { name: "Supermercado Cercano", distance: "500 m", time: "5 min a pie" }
                ],
                images: [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
                ]
            };

            // Insertar al inicio de la lista
            window.PROPERTIES_DATA.unshift(newProp);

            // Re-ejecutar filtros y refrescar mapa
            window.FilterManager.applyFilters();

            // Cerrar modal y notificar al usuario
            this.close();

            // Animación de feedback y scroll a la nueva tarjeta
            setTimeout(() => {
                window.MapManager.panTo(selectedCoords[0], selectedCoords[1], 16);
                window.MapManager.highlightProperty(newProp.id, true);
            }, 500);

            alert("🎉 ¡Anuncio publicado con éxito en Zilla Paraguay!\nTu propiedad ya es visible en el feed y en el mapa interactivo con su pin de precio.");
        }
    };

    window.PublishManager = PublishManager;
})();
