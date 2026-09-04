/**
 * ============================================================
 * ZILLA PARAGUAY - CONTROLADOR DEL PUBLICADOR MULTIPASOS PRO
 * Conexión con Supabase, Geolocalización GPS y Carga de Fotos
 * ============================================================
 */

(function () {
    'use strict';

    // 1. Configuración de Supabase
    const SUPABASE_URL = 'https://chzxwihqmvotxhiztehk.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoenh3aWhxbXZvdHhoaXp0ZWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDgzNTMsImV4cCI6MjEwMzkyNDM1M30.3arrsG_Zk3JQ7ibFmAJn2_cn_-r-vaFjF200LTk4EE8';
    let supabaseClient = null;

    if (window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        } catch (e) {
            console.warn("Supabase client initialized in offline / mock mode:", e);
        }
    }


    // 2. Estado del Formulario
    let currentStep = 1;
    let selectedCoords = [-25.2950, -57.5750]; // Default Asunción / Villa Morra
    let pickerMap = null;
    let pickerMarker = null;
    let uploadedPhotos = [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80'
    ];
    let latestCreatedPropertyId = 'PY-107';

    // 3. Inicialización en DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        initDragAndDrop();
        renderUploadedPhotos();
        syncLivePreview();
        initPickerMap();
        loadPropertyForEdit();
    });

    /**
     * Cargar y Prellenar Formulario si se está en Modo Edición
     */
    function loadPropertyForEdit() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const editPropId = urlParams.get('id');
            let editData = null;

            const rawLocal = localStorage.getItem('zilla_edit_property');
            if (rawLocal) {
                editData = JSON.parse(rawLocal);
            }

            if (editData && (editData.id === editPropId || !editPropId)) {
                // Prellenar Paso 1 (Operación y Tipo)
                if (editData.operation) {
                    const opCard = document.querySelector(`.visual-select-card[data-field="operation"][data-value="${editData.operation}"]`);
                    if (opCard) selectVisualCard(opCard);
                }
                if (editData.propType) {
                    const typeCard = document.querySelector(`.visual-select-card[data-field="propType"][data-value="${editData.propType}"]`);
                    if (typeCard) selectVisualCard(typeCard);
                }
                const titleEl = document.getElementById('pub-title');
                if (titleEl && editData.title) titleEl.value = editData.title;

                // Prellenar Paso 2 (Ubicación)
                const cityEl = document.getElementById('pub-city');
                if (cityEl && editData.city) cityEl.value = editData.city;
                const neighEl = document.getElementById('pub-neighborhood');
                if (neighEl && editData.neighborhood) neighEl.value = editData.neighborhood;
                const addrEl = document.getElementById('pub-address');
                if (addrEl && editData.address) addrEl.value = editData.address;

                // Prellenar Paso 3 (Superficies & Ambientes)
                const m2El = document.getElementById('pub-total-m2');
                if (m2El && editData.totalM2) m2El.value = editData.totalM2;
                const builtM2El = document.getElementById('pub-built-m2');
                if (builtM2El && editData.builtM2) builtM2El.value = editData.builtM2;
                if (editData.bedrooms) {
                    const bedEl = document.getElementById('pub-bedrooms');
                    const bedVal = document.getElementById('pub-bedrooms-val');
                    if (bedEl) bedEl.value = editData.bedrooms;
                    if (bedVal) bedVal.textContent = editData.bedrooms;
                }
                if (editData.bathrooms) {
                    const bathEl = document.getElementById('pub-bathrooms');
                    const bathVal = document.getElementById('pub-bathrooms-val');
                    if (bathEl) bathEl.value = editData.bathrooms;
                    if (bathVal) bathVal.textContent = editData.bathrooms;
                }
                if (editData.parking) {
                    const parkEl = document.getElementById('pub-parking');
                    const parkVal = document.getElementById('pub-parking-val');
                    if (parkEl) parkEl.value = editData.parking;
                    if (parkVal) parkVal.textContent = editData.parking;
                }
                const descEl = document.getElementById('pub-description');
                if (descEl && editData.description) descEl.value = editData.description;

                // Prellenar Paso 4 (Galería de Fotos)
                if (editData.image) {
                    uploadedPhotos = [editData.image, ...uploadedPhotos.filter(img => img !== editData.image)];
                    renderUploadedPhotos();
                }

                // Prellenar Paso 5 (Precios)
                const priceUsdEl = document.getElementById('pub-price-usd');
                if (priceUsdEl && editData.priceUSD) priceUsdEl.value = editData.priceUSD;
                const expPygEl = document.getElementById('pub-expenses-pyg');
                if (expPygEl && editData.expensesPYG !== undefined) expPygEl.value = editData.expensesPYG;

                // Insertar banner visual de edición
                const formWrapper = document.querySelector('.publish-form-wrapper');
                if (formWrapper && !document.querySelector('.edit-mode-alert-banner')) {
                    const banner = document.createElement('div');
                    banner.className = 'edit-mode-alert-banner';
                    banner.style.cssText = 'background: #0f766e; color: #ffffff; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);';
                    banner.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-pen-to-square" style="font-size: 1.3rem; color: #7bc133;"></i>
                            <div>
                                <strong style="font-size: 0.92rem; display: block;">Modo Edición de Inmueble (${editData.id || 'PUB'})</strong>
                                <span style="font-size: 0.8rem; opacity: 0.9;">Editando: "${editData.title}". Los cambios actualizarán tu publicación en el panel.</span>
                            </div>
                        </div>
                        <a href="dashboard.html" style="background: rgba(255,255,255,0.2); color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; white-space: nowrap;">
                            <i class="fas fa-arrow-left"></i> Volver al Dashboard
                        </a>
                    `;
                    formWrapper.insertBefore(banner, formWrapper.firstChild);
                }

                // Modificar texto del botón de envío
                const submitBtn = document.getElementById('btn-submit-publish');
                if (submitBtn) {
                    submitBtn.innerHTML = `<i class="fas fa-floppy-disk"></i> Guardar Cambios del Inmueble`;
                }

                syncLivePreview();
            }
        } catch (e) {
            console.warn("Error loading edit property:", e);
        }
    }


    // ============================================================
    // 4. CONTROL DE PASOS DEL WIZARD (STEPPER)
    // ============================================================
    const stepNames = {
        1: 'Operación & Tipo',
        2: 'Ubicación GPS',
        3: 'Características',
        4: 'Galería de Fotos',
        5: 'Precio & Financiación',
        6: 'Contacto & Publicar'
    };

    window.goToStep = function (step) {
        if (step < 1 || step > 6) return;

        // Validación simple antes de avanzar
        if (step > currentStep) {
            if (currentStep === 1) {
                const title = document.getElementById('pub-title').value.trim();
                if (!title) {
                    alert('Por favor, ingresa un título para el inmueble antes de continuar.');
                    document.getElementById('pub-title').focus();
                    return;
                }
            } else if (currentStep === 2) {
                const neigh = document.getElementById('pub-neighborhood').value.trim();
                const address = document.getElementById('pub-address').value.trim();
                if (!neigh || !address) {
                    alert('Por favor, completa el barrio y la dirección del inmueble.');
                    return;
                }
            } else if (currentStep === 3) {
                const totalM2 = document.getElementById('pub-total-m2').value;
                const desc = document.getElementById('pub-description').value.trim();
                if (!totalM2 || !desc) {
                    alert('Por favor, ingresa la superficie en m² y una descripción del inmueble.');
                    return;
                }
            }
        }

        currentStep = step;

        // Actualizar Stepper Pills
        document.querySelectorAll('.step-pill').forEach(pill => {
            const pillStep = parseInt(pill.dataset.step, 10);
            pill.classList.toggle('active', pillStep === step);
            pill.classList.toggle('completed', pillStep < step);
        });

        // Actualizar Barra de Progreso
        const progressFill = document.getElementById('stepper-progress-fill');
        if (progressFill) {
            const pct = (step / 6) * 100;
            progressFill.style.width = `${pct}%`;
        }

        // Actualizar Topbar
        const stepNumEl = document.getElementById('topbar-step-num');
        const stepNameEl = document.getElementById('topbar-step-name');
        if (stepNumEl) stepNumEl.textContent = step;
        if (stepNameEl) stepNameEl.textContent = stepNames[step];

        // Mostrar Panel Activo
        document.querySelectorAll('.publish-step-view').forEach(view => {
            view.classList.toggle('active', view.id === `publish-step-${step}`);
        });

        // Si es paso 2, refrescar mapa
        if (step === 2) {
            setTimeout(() => {
                if (pickerMap) {
                    if (window.google && window.google.maps && pickerMap instanceof google.maps.Map) {
                        google.maps.event.trigger(pickerMap, 'resize');
                        pickerMap.setCenter({ lat: selectedCoords[0], lng: selectedCoords[1] });
                    } else if (typeof L !== 'undefined' && pickerMap.invalidateSize) {
                        pickerMap.invalidateSize();
                    }
                } else {
                    initPickerMap();
                }
            }, 250);
        }

        // Scroll al tope del formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================================
    // 5. TARJETAS VISUALES SELECTORAS
    // ============================================================
    window.selectVisualCard = function (cardEl) {
        const field = cardEl.dataset.field;
        const parent = cardEl.parentElement;
        parent.querySelectorAll(`.visual-select-card[data-field="${field}"]`).forEach(c => c.classList.remove('selected'));
        cardEl.classList.add('selected');
        syncLivePreview();
    };

    function getSelectedCardValue(field) {
        const selected = document.querySelector(`.visual-select-card.selected[data-field="${field}"]`);
        return selected ? selected.dataset.value : null;
    }

    // ============================================================
    // 6. MAPA DE GEOLOCALIZACIÓN GPS (GOOGLE MAPS + LEAFLET FALLBACK)
    // ============================================================
    function initPickerMap() {
        const mapContainer = document.getElementById('publish-picker-canvas');
        if (!mapContainer) return;

        const updateCoords = (lat, lng) => {
            selectedCoords = [lat, lng];
            const badge = document.getElementById('pub-coords-display');
            if (badge) badge.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        };

        // 1. Intentar Google Maps
        if (window.google && window.google.maps && window.google.maps.Map) {
            try {
                const centerLatLng = { lat: selectedCoords[0], lng: selectedCoords[1] };
                pickerMap = new google.maps.Map(mapContainer, {
                    center: centerLatLng,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false
                });

                pickerMarker = new google.maps.Marker({
                    position: centerLatLng,
                    map: pickerMap,
                    draggable: true,
                    title: "Ubicación del inmueble"
                });

                pickerMarker.addListener('dragend', (e) => {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    updateCoords(lat, lng);
                });

                pickerMap.addListener('click', (e) => {
                    pickerMarker.setPosition(e.latLng);
                    updateCoords(e.latLng.lat(), e.latLng.lng());
                });

                updateCoords(selectedCoords[0], selectedCoords[1]);
                return;
            } catch (e) {
                console.warn("Fallo al iniciar Google Maps Picker, usando Leaflet:", e);
            }
        }

        // 2. Fallback Leaflet
        if (typeof L !== 'undefined') {
            mapContainer.innerHTML = '';
            pickerMap = L.map('publish-picker-canvas').setView(selectedCoords, 15);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; Zilla GPS Paraguay',
                maxZoom: 19
            }).addTo(pickerMap);

            pickerMarker = L.marker(selectedCoords, { draggable: true }).addTo(pickerMap);
            pickerMarker.on('dragend', function (e) {
                const position = pickerMarker.getLatLng();
                updateCoords(position.lat, position.lng);
            });

            pickerMap.on('click', function (e) {
                pickerMarker.setLatLng(e.latlng);
                updateCoords(e.latlng.lat, e.latlng.lng);
            });

            updateCoords(selectedCoords[0], selectedCoords[1]);
        }
    }

    window.handleDepartmentChange = function () {
        const dept = document.getElementById('pub-department').value;
        const citySelect = document.getElementById('pub-city');
        if (!citySelect) return;

        if (dept === 'Capital') {
            citySelect.innerHTML = `<option value="Asunción">Asunción</option>`;
            setMapCoordinates(-25.2890, -57.5750);
        } else if (dept === 'Central') {
            citySelect.innerHTML = `
                <option value="Mariano Roque Alonso">Mariano Roque Alonso</option>
                <option value="Luque">Luque</option>
                <option value="San Lorenzo">San Lorenzo</option>
                <option value="Lambaré">Lambaré</option>
                <option value="Fernando de la Mora">Fernando de la Mora</option>
            `;
            setMapCoordinates(-25.2155, -57.5458);
        } else if (dept === 'Cordillera') {
            citySelect.innerHTML = `
                <option value="San Bernardino">San Bernardino</option>
                <option value="Altos">Altos</option>
                <option value="Caacupé">Caacupé</option>
            `;
            setMapCoordinates(-25.2950, -57.2800);
        } else if (dept === 'Alto Paraná') {
            citySelect.innerHTML = `
                <option value="Ciudad del Este">Ciudad del Este</option>
                <option value="Hernandarias">Hernandarias</option>
                <option value="Presidente Franco">Presidente Franco</option>
            `;
            setMapCoordinates(-25.4850, -54.6300);
        } else if (dept === 'Itapúa') {
            citySelect.innerHTML = `<option value="Encarnación">Encarnación</option>`;
            setMapCoordinates(-27.3320, -55.8650);
        }
    };

    window.handleCityChange = function () {
        const city = document.getElementById('pub-city').value;
        if (city === 'San Bernardino') setMapCoordinates(-25.2950, -57.2800);
        else if (city === 'Ciudad del Este') setMapCoordinates(-25.4850, -54.6300);
        else if (city === 'Encarnación') setMapCoordinates(-27.3320, -55.8650);
        else if (city === 'Mariano Roque Alonso') setMapCoordinates(-25.2155, -57.5458);
        else if (city === 'Luque') setMapCoordinates(-25.2670, -57.4890);
        else setMapCoordinates(-25.2890, -57.5750);
    };

    function setMapCoordinates(lat, lng) {
        selectedCoords = [lat, lng];
        const badge = document.getElementById('pub-coords-display');
        if (badge) badge.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        if (pickerMap) {
            if (window.google && window.google.maps && pickerMap instanceof google.maps.Map) {
                pickerMap.panTo({ lat, lng });
                if (pickerMarker) pickerMarker.setPosition({ lat, lng });
            } else if (typeof L !== 'undefined' && pickerMap.setView) {
                pickerMap.setView([lat, lng], 14);
                if (pickerMarker) pickerMarker.setLatLng([lat, lng]);
            }
        }
    }

    // ============================================================
    // 7. SUBIDA Y GESTIÓN DE FOTOS MULTIMEDIA (DRAG & DROP)
    // ============================================================
    function initDragAndDrop() {
        const dropzone = document.getElementById('publish-dropzone');
        if (!dropzone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }, false);
    }

    window.handleFileSelect = function (e) {
        const files = e.target.files;
        handleFiles(files);
    };

    function handleFiles(files) {
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert(`El archivo ${file.name} no es una imagen válida.`);
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                uploadedPhotos.push(event.target.result);
                renderUploadedPhotos();
                syncLivePreview();
            };
            reader.readAsDataURL(file);
        });
    }

    window.addPhotoFromUrl = function () {
        const urlInput = document.getElementById('pub-url-photo-input');
        if (!urlInput) return;
        const url = urlInput.value.trim();
        if (!url) return;

        uploadedPhotos.push(url);
        urlInput.value = '';
        renderUploadedPhotos();
        syncLivePreview();
    };

    window.removePhoto = function (index) {
        uploadedPhotos.splice(index, 1);
        renderUploadedPhotos();
        syncLivePreview();
    };

    window.setCoverPhoto = function (index) {
        const photo = uploadedPhotos.splice(index, 1)[0];
        uploadedPhotos.unshift(photo);
        renderUploadedPhotos();
        syncLivePreview();
    };

    function renderUploadedPhotos() {
        const grid = document.getElementById('uploaded-photos-grid');
        const count = document.getElementById('uploaded-photos-count');
        if (!grid) return;

        if (count) count.textContent = uploadedPhotos.length;

        if (uploadedPhotos.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #64748b; font-size: 0.82rem;">
                    <i class="far fa-images" style="font-size: 1.5rem; margin-bottom: 6px; display: block;"></i>
                    No hay fotos cargadas aún. Añade al menos 3 fotos para destacar tu anuncio.
                </div>
            `;
            return;
        }

        grid.innerHTML = uploadedPhotos.map((imgSrc, idx) => `
            <div class="photo-preview-card">
                <img src="${imgSrc}" alt="Foto ${idx + 1}">
                <div class="photo-card-actions">
                    ${idx !== 0 ? `<button type="button" class="btn-photo-action set-cover" onclick="setCoverPhoto(${idx})" title="Hacer foto de portada"><i class="fas fa-star"></i></button>` : ''}
                    <button type="button" class="btn-photo-action" onclick="removePhoto(${idx})" title="Eliminar foto"><i class="fas fa-trash"></i></button>
                </div>
                ${idx === 0 ? `<div class="photo-cover-badge"><i class="fas fa-star"></i> Portada</div>` : ''}
            </div>
        `).join('');
    }

    // ============================================================
    // 8. CONTADORES NUMÉRICOS & CÁLCULOS DINÁMICOS
    // ============================================================
    window.changeCounter = function (id, delta) {
        const hiddenInput = document.getElementById(id);
        const valSpan = document.getElementById(`${id}-val`);
        if (!hiddenInput || !valSpan) return;

        let current = parseInt(hiddenInput.value, 10) || 0;
        current = Math.max(0, current + delta);
        hiddenInput.value = current;
        valSpan.textContent = current;
        syncLivePreview();
    };

    window.handlePriceUsdInput = function () {
        calcM2Price();
    };

    window.calcM2Price = function () {
        const priceUSD = parseFloat(document.getElementById('pub-price-usd')?.value) || 0;
        const totalM2 = parseFloat(document.getElementById('pub-total-m2')?.value) || 1;
        const pricePYG = priceUSD * 7950;
        const m2USD = Math.round(priceUSD / (totalM2 || 1));

        const calcUsd = document.getElementById('calc-preview-usd');
        const calcPyg = document.getElementById('calc-preview-pyg');
        const calcM2 = document.getElementById('calc-preview-m2');

        if (calcUsd) calcUsd.textContent = `$${priceUSD.toLocaleString()} USD`;
        if (calcPyg) calcPyg.textContent = `≈ ₲ ${(pricePYG / 1000000).toFixed(0)}M Guaraníes`;
        if (calcM2) calcM2.textContent = `$${m2USD.toLocaleString()} / m²`;
    };

    // ============================================================
    // 9. SINCRONIZACIÓN DE LA VISTA PREVIA EN VIVO (LIVE PREVIEW)
    // ============================================================
    window.syncLivePreview = function () {
        const title = document.getElementById('pub-title')?.value || 'Penthouse de Lujo con Terraza y Parrilla Privada';
        const city = document.getElementById('pub-city')?.value || 'Asunción';
        const neighborhood = document.getElementById('pub-neighborhood')?.value || 'Villa Morra';
        const priceUSD = parseFloat(document.getElementById('pub-price-usd')?.value) || 185000;
        const totalM2 = parseFloat(document.getElementById('pub-total-m2')?.value) || 140;
        const bedrooms = document.getElementById('pub-bedrooms')?.value || 3;
        const bathrooms = document.getElementById('pub-bathrooms')?.value || 2;
        const agentName = document.getElementById('pub-agent-name')?.value || 'Juan Solalinde';
        const agentAgency = document.getElementById('pub-agent-agency')?.value || 'Zilla Realty & Partners';

        const opValue = getSelectedCardValue('operation') || 'sale';
        const opLabels = {
            sale: 'Venta',
            rent_monthly: 'Alquiler',
            rent_temporary: 'Alq. Temporal',
            off_plan: 'En Pozo'
        };

        const tierValue = getSelectedCardValue('tier') || 'platinum';
        const tierLabels = {
            platinum: 'Destacado Platino',
            gold: 'Destacado Oro',
            free: 'Estándar'
        };

        const pricePYG = priceUSD * 7950;
        const m2USD = Math.round(priceUSD / (totalM2 || 1));

        // Actualizar tarjeta preview
        const prevTitle = document.getElementById('live-prev-title');
        if (prevTitle) prevTitle.textContent = title;

        const prevLoc = document.getElementById('live-prev-location');
        if (prevLoc) prevLoc.innerHTML = `<i class="fas fa-location-dot"></i> ${neighborhood}, ${city}`;

        const prevPriceUsd = document.getElementById('live-prev-price-usd');
        if (prevPriceUsd) prevPriceUsd.textContent = `$${priceUSD.toLocaleString()} USD`;

        const prevPricePyg = document.getElementById('live-prev-price-pyg');
        if (prevPricePyg) prevPricePyg.textContent = `₲ ${(pricePYG / 1000000).toFixed(0)}M`;

        const prevPriceM2 = document.getElementById('live-prev-price-m2');
        if (prevPriceM2) prevPriceM2.textContent = `$${m2USD.toLocaleString()}/m²`;

        const prevBeds = document.getElementById('live-prev-beds');
        if (prevBeds) prevBeds.textContent = bedrooms;

        const prevBaths = document.getElementById('live-prev-baths');
        if (prevBaths) prevBaths.textContent = bathrooms;

        const prevM2 = document.getElementById('live-prev-m2');
        if (prevM2) prevM2.textContent = totalM2;

        const prevOp = document.getElementById('live-prev-op');
        if (prevOp) prevOp.textContent = opLabels[opValue] || 'Venta';

        const prevTier = document.getElementById('live-prev-tier');
        if (prevTier) prevTier.textContent = tierLabels[tierValue] || 'Platino';

        const prevImg = document.getElementById('live-prev-img');
        if (prevImg && uploadedPhotos.length > 0) {
            prevImg.src = uploadedPhotos[0];
        }

        const prevAgentName = document.getElementById('live-prev-agent-name');
        if (prevAgentName) prevAgentName.textContent = agentName;

        const prevAgentAgency = document.getElementById('live-prev-agent-agency');
        if (prevAgentAgency) prevAgentAgency.textContent = agentAgency;

        // Contador de caracteres del título
        const charCount = document.getElementById('title-char-count');
        if (charCount) charCount.textContent = `${title.length} / 120 caracteres`;
    };

    // ============================================================
    // 10. PUBLICACIÓN FINAL & PERSISTENCIA SUPABASE
    // ============================================================
    window.handleFinalPublish = async function (e) {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        const submitBtn = document.getElementById('btn-submit-publish');
        const resetBtn = () => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fas fa-cloud-arrow-up"></i> Publicar Inmueble en Zilla & Supabase`;
            }
        };

        const title = (document.getElementById('pub-title')?.value || '').trim();
        if (!title) {
            alert('Por favor, ingresa el título del inmueble en el Paso 1.');
            goToStep(1);
            resetBtn();
            return;
        }

        const neighborhood = (document.getElementById('pub-neighborhood')?.value || '').trim();
        const address = (document.getElementById('pub-address')?.value || '').trim();
        if (!neighborhood || !address) {
            alert('Por favor, completa el barrio y la dirección en el Paso 2.');
            goToStep(2);
            resetBtn();
            return;
        }

        const totalAreaM2 = parseFloat(document.getElementById('pub-total-m2')?.value) || 0;
        const description = (document.getElementById('pub-description')?.value || '').trim();
        if (totalAreaM2 <= 0 || !description) {
            alert('Por favor, especifica la superficie en m² y una descripción en el Paso 3.');
            goToStep(3);
            resetBtn();
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Sincronizando con Supabase...`;
        }

        const operation = getSelectedCardValue('operation') || 'sale';
        const propType = getSelectedCardValue('propType') || 'apartment';
        const tier = getSelectedCardValue('tier') || 'platinum';

        const department = document.getElementById('pub-department')?.value || 'Central';
        const city = document.getElementById('pub-city')?.value || 'Asunción';

        const builtAreaM2 = parseFloat(document.getElementById('pub-built-m2')?.value) || Math.round(totalAreaM2 * 0.85);
        const bedrooms = parseInt(document.getElementById('pub-bedrooms')?.value, 10) || 1;
        const bathrooms = parseInt(document.getElementById('pub-bathrooms')?.value, 10) || 1;
        const parkingSpots = parseInt(document.getElementById('pub-parking')?.value, 10) || 0;

        const priceUSD = parseFloat(document.getElementById('pub-price-usd')?.value) || 100000;
        const pricePYG = priceUSD * 7950;
        const expensesPYG = parseFloat(document.getElementById('pub-expenses-pyg')?.value) || 0;
        const propertyM2USD = Math.round(priceUSD / (totalAreaM2 || 1));

        const bankCreditEligible = document.getElementById('pub-fin-bank')?.checked ?? true;
        const acceptsCheRogaPora = document.getElementById('pub-fin-cherogapora')?.checked ?? false;

        const agentName = (document.getElementById('pub-agent-name')?.value || 'Juan Solalinde').trim();
        const agentAgency = (document.getElementById('pub-agent-agency')?.value || 'Zilla Realty & Partners').trim();
        const agentPhone = (document.getElementById('pub-agent-phone')?.value || '+595 981 123 456').trim();
        const agentEmail = (document.getElementById('pub-agent-email')?.value || 'juan.solalinde@zillaparaguay.com').trim();

        // Recoger Amenities
        const amenities = [];
        document.querySelectorAll('input[name="pub_amenities"]:checked').forEach(chk => {
            amenities.push(chk.value);
        });

        const photoList = uploadedPhotos.length > 0 ? uploadedPhotos : [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'
        ];

        const assignedCode = `PY-${100 + (window.PROPERTIES_DATA ? window.PROPERTIES_DATA.length : 12) + 1}`;
        latestCreatedPropertyId = assignedCode;

        const propertyPayload = {
            id: assignedCode,
            title: title,
            operation: operation,
            propType: propType,
            tier: tier,
            priceUSD: priceUSD,
            pricePYG: pricePYG,
            currencyPrimary: "USD",
            expensesPYG: expensesPYG,
            department: department,
            city: city,
            neighborhood: neighborhood,
            address: address,
            coordinates: selectedCoords,
            bedrooms: bedrooms,
            bathrooms: bathrooms,
            parkingSpots: parkingSpots,
            builtAreaM2: builtAreaM2,
            totalAreaM2: totalAreaM2,
            yearBuilt: 2026,
            badge: tier === 'platinum' ? 'Destacado Platino' : (tier === 'gold' ? 'Destacado Oro' : 'Disponible'),
            acceptsCheRogaPora: acceptsCheRogaPora,
            bankCreditEligible: bankCreditEligible,
            amenities: amenities,
            avgNeighborhoodM2USD: propertyM2USD + 50,
            propertyM2USD: propertyM2USD,
            advertiser: {
                name: agentName,
                agency: agentAgency,
                type: "franchise_agent",
                verified: true,
                phone: agentPhone,
                whatsapp: agentPhone.replace(/[^0-9]/g, ''),
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            },
            description: description,
            nearbyPoints: [
                { name: "Eje Corporativo", distance: "600 m", time: "5 min a pie" },
                { name: "Shopping del Sol", distance: "1.2 km", time: "3 min en auto" }
            ],
            images: photoList,
            status: 'active',
            views: 1,
            leads: 0,
            createdAt: new Date().toISOString()
        };

        // 1. Intentar inserción en Supabase DB
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('properties')
                    .insert([{
                        code_id: assignedCode,
                        title: title,
                        description: description,
                        operation: operation,
                        prop_type: propType,
                        tier: tier,
                        price_usd: priceUSD,
                        price_pyg: pricePYG,
                        expenses_pyg: expensesPYG,
                        bedrooms: bedrooms,
                        bathrooms: bathrooms,
                        parking_spots: parkingSpots,
                        built_area_m2: builtAreaM2,
                        total_area_m2: totalAreaM2,
                        address_text: address,
                        neighborhood: neighborhood,
                        city: city,
                        department: department,
                        accepts_che_roga_pora: acceptsCheRogaPora,
                        is_bank_credit_eligible: bankCreditEligible
                    }]);

                if (error) {
                    console.warn("Supabase table insert fallback:", error.message);
                }
            } catch (err) {
                console.warn("Supabase connection fallback:", err);
            }
        }

        // 2. Persistir en Storage Local y en la lista de agentes
        saveToAgentStorage(propertyPayload);

        // 3. Añadir a PROPERTIES_DATA en memoria
        if (window.PROPERTIES_DATA) {
            window.PROPERTIES_DATA.unshift(propertyPayload);
        }

        // 4. Mostrar Pantalla de Éxito
        setTimeout(() => {
            resetBtn();

            const codeBadge = document.getElementById('success-property-code');
            if (codeBadge) codeBadge.textContent = `Código Asignado: ${assignedCode}`;

            const viewBtn = document.getElementById('btn-view-published-live');
            if (viewBtn) viewBtn.href = `explorar.html?id=${assignedCode}`;

            const successModal = document.getElementById('publish-success-modal');
            if (successModal) successModal.classList.add('active');
        }, 500);
    };

    function saveToAgentStorage(newProp) {
        const STORAGE_KEY = 'zilla_agent_listings_db_v1';
        let currentListings = [];
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) currentListings = JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }

        const agentListingItem = {
            id: newProp.id,
            title: newProp.title,
            propType: newProp.propType,
            operation: newProp.operation,
            city: newProp.city,
            neighborhood: newProp.neighborhood,
            priceUSD: newProp.priceUSD,
            pricePYG: newProp.pricePYG,
            totalAreaM2: newProp.totalAreaM2,
            propertyM2USD: newProp.propertyM2USD,
            bedrooms: newProp.bedrooms,
            bathrooms: newProp.bathrooms,
            status: 'active',
            views: 1,
            leads: 0,
            image: (newProp.images && newProp.images[0]) || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
            updatedAt: new Date().toISOString().split('T')[0]
        };

        currentListings.unshift(agentListingItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentListings));

        // Persistir también en zilla_custom_properties_v1
        try {
            const customPropsSaved = localStorage.getItem('zilla_custom_properties_v1');
            let customList = customPropsSaved ? JSON.parse(customPropsSaved) : [];
            customList.unshift(newProp);
            localStorage.setItem('zilla_custom_properties_v1', JSON.stringify(customList));
        } catch (e) {
            console.error("Error al guardar custom properties:", e);
        }
    }

    window.publishAnotherProperty = function () {
        document.getElementById('publish-success-modal').classList.remove('active');
        document.getElementById('property-publish-form').reset();
        uploadedPhotos = [];
        renderUploadedPhotos();
        goToStep(1);
        syncLivePreview();
    };

    window.saveDraftAndNotify = function () {
        alert('¡Borrador guardado exitosamente en tu navegador! Podrás continuar completando tu publicación cuando desees.');
    };

})();
