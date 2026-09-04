/**
 * ============================================================
 * ZILLA PARAGUAY - CLIENT DASHBOARD (Constructor X Architecture)
 * Lógica reactiva y renderizado de cuadrícula de 3 columnas
 * ============================================================
 */

(function () {
    'use strict';

    const MAX_FREE_PROPERTIES = 5;

    // Estado del cliente
    let clientState = {
        user: {
            name: "Usuario",
            email: "",
            phone: "+595 981 000 000",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
            role: "Cliente Particular"
        },
        currentTab: "propiedades",
        currency: "USD",
        searchFilter: "",
        statusFilter: "all",
        viewMode: "grid", // grid o list
        properties: [
            {
                id: "PUB-001",
                title: "Departamento en Villa Morra",
                companyCategory: "Venta Residencial",
                operation: "sale",
                operationLabel: "Venta",
                propType: "apartment",
                propTypeLabel: "Departamento",
                priceUSD: 145000,
                pricePYG: 1087500000,
                neighborhood: "Villa Morra",
                city: "Asunción",
                address: "Av. Mariscal López c/ Senador Long, Edificio Torre del Sol",
                totalM2: 125,
                builtM2: 110,
                bedrooms: 3,
                bathrooms: 2,
                parking: 2,
                expensesPYG: 850000,
                description: "Exclusivo departamento en piso alto con finos acabados en pleno Villa Morra. Cuenta con amplio living comedor, balcón con parrilla privada, cocina equipada y cochera para 2 vehículos.",
                status: "active",
                views: 342,
                inquiries: 18,
                daysActive: 14,
                logoColor: "logo-bg-teal",
                icon: "fas fa-building",
                image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "PUB-002",
                title: "Dúplex a Estrenar en Luque",
                companyCategory: "Alquiler Anual",
                operation: "rent_monthly",
                operationLabel: "Alquiler",
                propType: "duplex",
                propTypeLabel: "Dúplex",
                priceUSD: 850,
                pricePYG: 6375000,
                neighborhood: "Cuarto Barrio",
                city: "Luque",
                address: "Calle Las Residentas casi Corrales",
                totalM2: 180,
                builtM2: 150,
                bedrooms: 3,
                bathrooms: 3,
                parking: 2,
                expensesPYG: 0,
                description: "Hermoso dúplex moderno a estrenar en zona residencial tranquila de Luque, con patio empastado, quincho y finas terminaciones.",
                status: "active",
                views: 189,
                inquiries: 9,
                daysActive: 7,
                logoColor: "logo-bg-lime",
                icon: "fas fa-house-user",
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "PUB-003",
                title: "Residencia en Surubi'i con Piscina",
                companyCategory: "Venta Exclusiva",
                operation: "sale",
                operationLabel: "Venta",
                propType: "gated_community",
                propTypeLabel: "Barrio Cerrado",
                priceUSD: 490000,
                pricePYG: 3675000000,
                neighborhood: "Surubi'i",
                city: "Mariano R. Alonso",
                address: "Club Centenario Surubi'i, Manzana 14",
                totalM2: 850,
                builtM2: 420,
                bedrooms: 4,
                bathrooms: 5,
                parking: 4,
                expensesPYG: 1800000,
                description: "Majestuosa residencia con amplio parque, piscina sinfín, quincho climatizado y seguridad 24 horas en el country más exclusivo de Paraguay.",
                status: "paused",
                views: 520,
                inquiries: 24,
                daysActive: 30,
                logoColor: "logo-bg-rose",
                icon: "fas fa-tree-city",
                image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "PUB-004",
                title: "Penthouse Santa Teresa",
                companyCategory: "Venta Premium",
                operation: "sale",
                operationLabel: "Venta",
                propType: "apartment",
                propTypeLabel: "Penthouse",
                priceUSD: 345000,
                pricePYG: 2587500000,
                neighborhood: "Santa Teresa",
                city: "Asunción",
                address: "Av. Santa Teresa y Denis Roa",
                totalM2: 240,
                builtM2: 220,
                bedrooms: 3,
                bathrooms: 4,
                parking: 3,
                expensesPYG: 1500000,
                description: "Penthouse de ensueño con terraza panorámica, jacuzzi privado y vistas espectaculares del eje corporativo de Asunción.",
                status: "active",
                views: 410,
                inquiries: 15,
                daysActive: 21,
                logoColor: "logo-bg-blue",
                icon: "fas fa-city",
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "PUB-005",
                title: "Casa de Veraneo en San Ber",
                companyCategory: "Alquiler Temporal",
                operation: "rent_temporary",
                operationLabel: "Alquiler Temp.",
                propType: "house",
                propTypeLabel: "Casa de Verano",
                priceUSD: 2500,
                pricePYG: 18750000,
                neighborhood: "Centro",
                city: "San Bernardino",
                address: "Calle peatonal c/ Lago Ypacaraí",
                totalM2: 600,
                builtM2: 280,
                bedrooms: 4,
                bathrooms: 3,
                parking: 3,
                expensesPYG: 0,
                description: "Casa veraniega con piscina, quincho techado y a pasos del lago en San Bernardino. Totalmente equipada y amoblada.",
                status: "review",
                views: 95,
                inquiries: 4,
                daysActive: 2,
                logoColor: "logo-bg-amber",
                icon: "fas fa-umbrella-beach",
                image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
            }
        ],
        receivedInquiries: [
            {
                id: "INQ-01",
                sender: "María José Fernández",
                property: "Depto en Villa Morra",
                phone: "+595 982 334 455",
                email: "mj.fernandez@gmail.com",
                date: "Hoy, 10:45 AM",
                message: "¡Hola Juan! Estoy interesada en visitar la propiedad este fin de semana. ¿Tiene crédito bancario o Che Róga Porã?",
                status: "pending"
            },
            {
                id: "INQ-02",
                sender: "Carlos Benítez",
                property: "Dúplex en Luque",
                phone: "+595 971 889 900",
                email: "carlos.b@outlook.com",
                date: "Ayer, 16:20 PM",
                message: "¿Aceptan mascotas pequeñas en el alquiler? ¿Cuáles son los requisitos de ingreso?",
                status: "contacted"
            }
        ],
        favorites: [
            {
                id: "FAV-01",
                title: "Piso Exclusivo en Torre Sky 360",
                operationLabel: "Alquiler",
                priceUSD: 2400,
                neighborhood: "Ykua Sati",
                city: "Asunción",
                bedrooms: 3,
                bathrooms: 3,
                area: 220,
                image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
            },
            {
                id: "FAV-02",
                title: "Residencia Colonial Restaurada",
                operationLabel: "Venta",
                priceUSD: 380000,
                neighborhood: "Las Mercedes",
                city: "Asunción",
                bedrooms: 4,
                bathrooms: 4,
                area: 450,
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
            }
        ],
        payments: [
            {
                id: "PAY-9041",
                concept: "Destacado Oro en Mapa (Villa Morra)",
                date: "25 Ago 2026",
                amountUSD: 25,
                amountPYG: 187500,
                status: "Completado",
                hasInvoice: true,
                invoiceNum: "FAC-001-002-00492",
                ruc: "80029341-2"
            },
            {
                id: "PAY-7930",
                concept: "Destacado Portada Principal (Santa Teresa)",
                date: "15 Jul 2026",
                amountUSD: 35,
                amountPYG: 262500,
                status: "Completado",
                hasInvoice: true,
                invoiceNum: "FAC-001-002-00388",
                ruc: "80029341-2"
            },
            {
                id: "PAY-8820",
                concept: "Publicación Estándar Particular (Gratis)",
                date: "20 Ago 2026",
                amountUSD: 0,
                amountPYG: 0,
                status: "Activo",
                hasInvoice: false,
                invoiceNum: null
            }
        ]
    };


    // Inicialización al cargar la página
    document.addEventListener("DOMContentLoaded", () => {
        loadSessionData();
        setupSidebarNavigation();
        setupSearchAndFilters();
        setupViewModeToggle();
        setupSidebarCollapse();
        setupCurrency();
        setupProfileModal();
        renderAll();

        // Escuchar eventos de actualización de sesión en tiempo real
        window.addEventListener('zilla_user_session_updated', (e) => {
            if (e.detail && e.detail.user) {
                applyUserData(e.detail.user);
            }
        });
    });

    /**
     * Aplicar datos de usuario al estado y renderizar
     */
    function applyUserData(user) {
        if (!user) return;
        if (user.name) clientState.user.name = user.name;
        if (user.email) clientState.user.email = user.email;
        if (user.avatar) clientState.user.avatar = user.avatar;
        renderUserInfo();
    }

    /**
     * Sincronizar datos con localStorage y Supabase Auth Session
     */
    async function loadSessionData() {
        try {
            // 1. Cargar desde LocalStorage inmediato
            const savedUser = localStorage.getItem('zilla_user_session');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                applyUserData(parsed);
            }

            // 2. Comprobar sesión activa en Supabase Cloud (Google OAuth / Email)
            if (window.ZillaSupabase && window.ZillaSupabase.client) {
                const { data } = await window.ZillaSupabase.client.auth.getSession();
                if (data && data.session && data.session.user) {
                    const u = data.session.user;
                    const fullName = u.user_metadata?.full_name || u.user_metadata?.name || (u.email ? u.email.split('@')[0] : 'Usuario');
                    const avatar = u.user_metadata?.avatar_url || u.user_metadata?.picture || clientState.user.avatar;

                    const formattedUser = {
                        name: fullName.charAt(0).toUpperCase() + fullName.slice(1),
                        email: u.email,
                        avatar: avatar
                    };
                    applyUserData(formattedUser);
                }
            }
        } catch (e) {
            console.warn("Storage sync error:", e);
        }
    }

    /**
     * Navegación en el Sidebar
     */
    function setupSidebarNavigation() {
        document.querySelectorAll(".sidebar-nav-item[data-tab]").forEach(btn => {
            btn.addEventListener("click", () => {
                const tab = btn.getAttribute("data-tab");
                switchTab(tab);
            });
        });
    }

    function switchTab(tabId) {
        clientState.currentTab = tabId;

        // Actualizar active en sidebar
        document.querySelectorAll(".sidebar-nav-item").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
        });

        // Actualizar breadcrumbs
        const bcTitle = document.getElementById("breadcrumb-current-title");
        if (bcTitle) {
            const TAB_TITLES = {
                resumen: "Resumen",
                propiedades: "Mis Propiedades",
                consultas: "Consultas Recibidas",
                finanzas: "Mis Finanzas",
                favoritos: "Favoritos",
                historial: "Historial de Búsqueda",
                consultas_enviadas: "Consultas Enviadas"
            };
            bcTitle.textContent = TAB_TITLES[tabId] || "Dashboard";
        }

        renderMainContent();
    }

    /**
     * Colapsar / Expandir Sidebar
     */
    function setupSidebarCollapse() {
        const toggleBtn = document.getElementById("btn-sidebar-collapse-toggle");
        const sidebar = document.getElementById("dash-sidebar");

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener("click", () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.toggle("mobile-open");
                } else {
                    sidebar.classList.toggle("collapsed");
                }
            });
        }
    }

    /**
     * Búsqueda y Filtros de la Barra de Herramientas
     */
    function setupSearchAndFilters() {
        const searchInput = document.getElementById("toolbar-search-input");
        const globalSearchInput = document.getElementById("topbar-global-search-input");

        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                clientState.searchFilter = e.target.value.toLowerCase().trim();
                renderPropertiesGrid();
            });
        }

        if (globalSearchInput) {
            globalSearchInput.addEventListener("input", (e) => {
                clientState.searchFilter = e.target.value.toLowerCase().trim();
                renderPropertiesGrid();
            });
        }

        // Pestañas de estado (Todas, Activas, Pausadas, En Revisión)
        document.querySelectorAll(".toolbar-tab-btn[data-status]").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".toolbar-tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                clientState.statusFilter = btn.getAttribute("data-status");
                renderPropertiesGrid();
            });
        });

        // Atajo de teclado ⌘K / Ctrl+K
        document.addEventListener("keydown", (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                const target = searchInput || globalSearchInput;
                if (target) target.focus();
            }
        });
    }

    /**
     * Selector de Modo Cuadrícula / Lista
     */
    function setupViewModeToggle() {
        const gridBtn = document.getElementById("btn-view-grid");
        const listBtn = document.getElementById("btn-view-list");

        if (gridBtn && listBtn) {
            gridBtn.addEventListener("click", () => {
                clientState.viewMode = "grid";
                gridBtn.classList.add("active");
                listBtn.classList.remove("active");
                renderPropertiesGrid();
            });

            listBtn.addEventListener("click", () => {
                clientState.viewMode = "list";
                listBtn.classList.add("active");
                gridBtn.classList.remove("active");
                renderPropertiesGrid();
            });
        }
    }

    /**
     * Conmutador de Moneda
     */
    function setupCurrency() {
        clientState.currency = window.CurrencyManager ? window.CurrencyManager.getCurrency() : "USD";

        window.addEventListener('currencyChanged', (e) => {
            clientState.currency = e.detail.currency;
            renderPropertiesGrid();
        });
    }

    function formatPrice(usdAmount, pygAmount) {
        if (window.CurrencyManager) {
            return window.CurrencyManager.formatPrice(usdAmount);
        }
        if (clientState.currency === "PYG" && pygAmount) {
            return `₲ ${pygAmount.toLocaleString("es-PY")}`;
        }
        return `US$ ${usdAmount.toLocaleString("en-US")}`;
    }

    /**
     * Renderizado General
     */
    function renderAll() {
        renderUserInfo();
        renderMainContent();
    }

    function renderUserInfo() {
        const name = clientState.user.name;
        const email = clientState.user.email;
        const avatar = clientState.user.avatar;

        const userNameEl = document.getElementById("sidebar-user-name");
        if (userNameEl) userNameEl.textContent = name;

        const userEmailEl = document.getElementById("sidebar-user-email");
        if (userEmailEl) userEmailEl.textContent = email;

        const userAvatarEl = document.getElementById("sidebar-user-avatar");
        if (userAvatarEl) userAvatarEl.src = avatar;

        const topbarAvatarEl = document.getElementById("topbar-user-avatar");
        if (topbarAvatarEl) topbarAvatarEl.src = avatar;
    }

    function renderMainContent() {
        if (clientState.currentTab === "propiedades" || clientState.currentTab === "resumen") {
            renderPropertiesGrid();
        } else if (clientState.currentTab === "consultas") {
            renderInquiriesView();
        } else if (clientState.currentTab === "favoritos") {
            renderFavoritesView();
        } else if (clientState.currentTab === "finanzas") {
            renderPaymentsView();
        } else if (clientState.currentTab === "consultas_enviadas") {
            renderSentInquiriesView();
        }
    }

    /**
     * Renderizado de la Cuadrícula de 3 Columnas (Constructor X Style con Imágenes)
     */
    function renderPropertiesGrid() {
        const container = document.getElementById("dash-cards-grid-container");
        if (!container) return;

        // Conmutar clase de modo lista
        container.classList.toggle("list-view-active", clientState.viewMode === "list");

        let filtered = clientState.properties.filter(p => {
            // Filtro de texto
            if (clientState.searchFilter) {
                const term = clientState.searchFilter;
                const matchTitle = p.title.toLowerCase().includes(term);
                const matchLoc = (p.neighborhood + " " + p.city).toLowerCase().includes(term);
                const matchCat = p.companyCategory.toLowerCase().includes(term);
                if (!matchTitle && !matchLoc && !matchCat) return false;
            }

            // Filtro de estado
            if (clientState.statusFilter !== "all" && p.status !== clientState.statusFilter) {
                return false;
            }

            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
                    <i class="fas fa-building" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 12px;"></i>
                    <h3 style="margin: 0 0 6px 0; font-family: 'Outfit', sans-serif;">No se encontraron inmuebles</h3>
                    <p style="color: var(--dash-text-muted); font-size: 0.9rem; margin: 0 0 16px 0;">Ajusta tus términos de búsqueda o publica un nuevo inmueble.</p>
                    <button class="btn-primary-action" onclick="openPublishModal()"><i class="fas fa-plus"></i> Publicar Propiedad (Gratis)</button>
                </div>
            `;
            return;
        }

        // Renderizado fiel al Card de Constructor X con Imagen de Portada
        container.innerHTML = filtered.map(p => `
            <div class="company-card-style" id="card-${p.id}">
                <!-- Banner de Imagen de la Propiedad -->
                <div class="card-image-banner" onclick="editProperty('${p.id}')" title="Haz clic para editar ${p.title}">
                    <img src="${p.image}" alt="${p.title}" class="card-banner-img" loading="lazy">
                    <div class="card-image-overlay-gradient"></div>
                    
                    <!-- Badge Operación Top-Left -->
                    <div class="card-badge-top-left">
                        <span class="card-op-pill">
                            <i class="fas fa-${p.operation === 'sale' ? 'hand-holding-dollar' : 'key'}" style="color: var(--zilla-lime); font-size: 0.7rem;"></i>
                            ${p.operationLabel}
                        </span>
                    </div>

                    <!-- Badge Estado Top-Right -->
                    <div class="card-badge-top-right">
                        <span class="card-status-pill pill-${p.status}">
                            ${p.status === 'active' ? 'Activa' : (p.status === 'paused' ? 'En Pausa' : 'En Revisión')}
                        </span>
                    </div>

                    <!-- Hover Quick Edit Badge -->
                    <div class="card-hover-edit-badge">
                        <i class="fas fa-pen-to-square"></i> Editar Inmueble
                    </div>
                </div>

                <div class="card-list-body">
                    <!-- Fila de Cabecera: Isotipo + Título + Menú 3 puntos -->
                    <div class="card-header-row">
                        <div class="card-brand-col">
                            <div class="card-logo-badge ${p.logoColor}">
                                <i class="${p.icon}"></i>
                            </div>
                            <div class="card-title-group">
                                <h4 class="card-item-title" title="${p.title}" onclick="editProperty('${p.id}')" style="cursor: pointer;">${p.title}</h4>
                                <p class="card-item-subtitle">
                                    <i class="fas fa-location-dot" style="color: var(--zilla-primary); font-size: 0.72rem; margin-right: 3px;"></i>
                                    ${p.neighborhood}, ${p.city}
                                </p>
                            </div>
                        </div>
                        <button type="button" class="card-options-btn" onclick="toggleCardOptions('${p.id}')" aria-label="Opciones">
                            <i class="fas fa-ellipsis-vertical"></i>
                        </button>
                    </div>

                    <!-- Línea Divisoria -->
                    <div class="card-divider-line"></div>

                    <!-- Cuadrícula 2x2 de Métricas -->
                    <div class="card-metrics-grid-2x2">
                        <div class="card-metric-cell">
                            <i class="far fa-eye metric-cell-icon"></i>
                            <span class="metric-cell-label">Vistas</span>
                            <span class="metric-cell-value">${p.views}</span>
                        </div>

                        <div class="card-metric-cell">
                            <i class="far fa-comments metric-cell-icon"></i>
                            <span class="metric-cell-label">Consultas</span>
                            <span class="metric-cell-value">${p.inquiries}</span>
                        </div>

                        <div class="card-metric-cell">
                            <i class="far fa-calendar-check metric-cell-icon"></i>
                            <span class="metric-cell-label">Días Activo</span>
                            <span class="metric-cell-value">${p.daysActive}d</span>
                        </div>

                        <div class="card-metric-cell">
                            <i class="fas fa-tag metric-cell-icon" style="color: var(--zilla-lime);"></i>
                            <span class="metric-cell-label">Precio</span>
                            <span class="metric-cell-value" style="color: var(--zilla-primary);">${formatPrice(p.priceUSD, p.pricePYG)}</span>
                        </div>
                    </div>

                    <!-- Pie de Tarjeta: Botón Pausar/Activar y Botón Ingresar / Editar -->
                    <div class="card-footer-row">
                        <span class="card-status-pill pill-${p.status}">
                            ${p.status === 'active' ? '● Publicada' : (p.status === 'paused' ? '⏸ Pausada' : '⏱ En Revisión')}
                        </span>
                        <div class="card-action-links">
                            <button type="button" class="btn-card-action" onclick="toggleStatus('${p.id}')">
                                <i class="fas fa-${p.status === 'active' ? 'pause' : 'play'}"></i> ${p.status === 'active' ? 'Pausar' : 'Activar'}
                            </button>
                            <button type="button" class="btn-card-action btn-card-edit" onclick="editProperty('${p.id}')" title="Ingresar y editar propiedad">
                                <i class="fas fa-pen-to-square"></i> Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Vistas Auxiliares (Consultas, Favoritos, Finanzas)
     */
    function renderInquiriesView() {
        const container = document.getElementById("dash-cards-grid-container");
        if (!container) return;

        container.innerHTML = clientState.receivedInquiries.map(inq => `
            <div class="company-card-style" style="grid-column: span 3;">
                <div class="card-header-row">
                    <div class="card-brand-col">
                        <div class="card-logo-badge logo-bg-blue">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="card-title-group">
                            <h4 class="card-item-title">${inq.sender}</h4>
                            <p class="card-item-subtitle">${inq.property} &bull; ${inq.date}</p>
                        </div>
                    </div>
                    <a href="https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn-topbar-upgrade" style="background: #22c55e;">
                        <i class="fab fa-whatsapp" style="color:#fff;"></i> WhatsApp
                    </a>
                </div>
                <div style="background: #f8fafc; padding: 14px; border-radius: 10px; font-size: 0.9rem; color: #334155; line-height: 1.45;">
                    "${inq.message}"
                </div>
            </div>
        `).join('');
    }

    function renderFavoritesView() {
        const container = document.getElementById("dash-cards-grid-container");
        if (!container) return;

        container.innerHTML = clientState.favorites.map(f => `
            <div class="company-card-style">
                <div class="card-image-banner" style="height: 140px;">
                    <img src="${f.image}" alt="${f.title}" class="card-banner-img">
                    <div class="card-image-overlay-gradient"></div>
                    <div class="card-badge-top-left"><span class="card-op-pill">${f.operationLabel}</span></div>
                </div>
                <div class="card-header-row" style="margin-top: 10px;">
                    <div class="card-brand-col">
                        <div class="card-logo-badge logo-bg-rose">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="card-title-group">
                            <h4 class="card-item-title">${f.title}</h4>
                            <p class="card-item-subtitle">${f.neighborhood}, ${f.city}</p>
                        </div>
                    </div>
                </div>
                <div class="card-metrics-grid-2x2">
                    <div class="card-metric-cell"><span class="metric-cell-label">Dormitorios</span><span class="metric-cell-value">${f.bedrooms}</span></div>
                    <div class="card-metric-cell"><span class="metric-cell-label">Baños</span><span class="metric-cell-value">${f.bathrooms}</span></div>
                    <div class="card-metric-cell"><span class="metric-cell-label">Superficie</span><span class="metric-cell-value">${f.area} m²</span></div>
                    <div class="card-metric-cell"><span class="metric-cell-label">Precio</span><span class="metric-cell-value" style="color:var(--zilla-primary);">${formatPrice(f.priceUSD)}</span></div>
                </div>
                <div class="card-footer-row">
                    <span class="card-status-pill pill-active">Guardado</span>
                    <a href="explorar.html?keyword=${encodeURIComponent(f.neighborhood)}" class="btn-card-action">Ver en Mapa</a>
                </div>
            </div>
        `).join('');
    }

    function renderPaymentsView() {
        const container = document.getElementById("dash-cards-grid-container");
        if (!container) return;

        const totalSpentUSD = clientState.payments.reduce((acc, curr) => acc + curr.amountUSD, 0);
        const totalSpentPYG = clientState.payments.reduce((acc, curr) => acc + (curr.amountPYG || 0), 0);
        const invoicesCount = clientState.payments.filter(p => p.hasInvoice).length;

        container.innerHTML = `
            <div class="dash-full-card">
                <!-- Cabecera de la sección de Finanzas -->
                <div class="dash-card-title-row">
                    <div class="dash-card-header-info">
                        <h3 class="dash-card-main-title">
                            <i class="fas fa-file-invoice-dollar"></i> Historial de Facturación y Finanzas
                        </h3>
                        <p class="dash-card-subtitle">
                            Consulta tus comprobantes legales electrónicos, facturas oficiales y estado de tu plan particular en Zilla Paraguay.
                        </p>
                    </div>
                    <button class="btn-card-action" onclick="window.print()">
                        <i class="fas fa-print"></i> Imprimir Estado
                    </button>
                </div>

                <!-- Mini Resumen Estadístico -->
                <div class="finance-stats-grid">
                    <div class="finance-stat-card">
                        <span class="stat-card-label">Plan de Usuario</span>
                        <span class="stat-card-value" style="color: var(--zilla-primary);">Particular (Gratis)</span>
                        <span class="stat-card-desc">${clientState.properties.length} de ${MAX_FREE_PROPERTIES} inmuebles en uso</span>
                    </div>

                    <div class="finance-stat-card">
                        <span class="stat-card-label">Inversión en Destacados</span>
                        <span class="stat-card-value">${formatPrice(totalSpentUSD, totalSpentPYG)}</span>
                        <span class="stat-card-desc">${invoicesCount} promociones destacadas en mapa</span>
                    </div>

                    <div class="finance-stat-card">
                        <span class="stat-card-label">Facturas Emitidas</span>
                        <span class="stat-card-value">${invoicesCount}</span>
                        <span class="stat-card-desc">Comprobantes electrónicos disponibles</span>
                    </div>
                </div>

                <!-- Tabla de Historial con Columna Facturas -->
                <div class="dash-table-container">
                    <table class="dash-payments-table">
                        <thead>
                            <tr>
                                <th>ID Transacción</th>
                                <th>Concepto</th>
                                <th>Fecha de Emisión</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th>Factura Electrónica</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clientState.payments.map(pay => `
                                <tr>
                                    <td style="font-weight: 700; color: #0f172a;">${pay.id}</td>
                                    <td>
                                        <div style="font-weight: 600;">${pay.concept}</div>
                                        <small style="color: var(--dash-text-muted); font-size: 0.75rem;">RUC Emisor: 80029341-2 (Zilla PropTech S.A.)</small>
                                    </td>
                                    <td style="color: var(--dash-text-muted); font-size: 0.84rem;">${pay.date}</td>
                                    <td style="font-weight: 800; font-family: 'Outfit', sans-serif; color: #0f172a;">
                                        ${pay.amountUSD === 0 ? '<span style="color: var(--zilla-lime); font-weight: 700;">Gratis</span>' : formatPrice(pay.amountUSD, pay.amountPYG)}
                                    </td>
                                    <td>
                                        <span class="card-status-pill pill-${pay.status === 'Completado' || pay.status === 'Activo' ? 'active' : 'paused'}">
                                            ${pay.status}
                                        </span>
                                    </td>
                                    <td>
                                        ${pay.hasInvoice ? `
                                            <a href="javascript:void(0)" onclick="downloadInvoice('${pay.id}', '${pay.invoiceNum}')" class="btn-invoice-pdf" title="Descargar Factura Legal en PDF">
                                                <i class="fas fa-file-pdf"></i> ${pay.invoiceNum}
                                            </a>
                                        ` : `
                                            <span class="invoice-free-label">
                                                <i class="fas fa-circle-check" style="color: var(--zilla-lime);"></i> Plan Gratuito
                                            </span>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Descargar Factura Electrónica
     */
    window.downloadInvoice = function (payId, invoiceNum) {
        alert(`📄 Descargando Factura Electrónica ${invoiceNum || payId}\n\nEmisor: Zilla PropTech S.A. (RUC 80029341-2)\nEstado: Aprobada por SET / DNIT Paraguay (Kuatia'e)\n\nEl documento PDF se generará con firma digital.`);
    };


    /**
     * Acciones sobre Propiedades: Pausar, Activar, Editar / Ingresar
     */
    window.toggleStatus = function (propId) {
        const prop = clientState.properties.find(p => p.id === propId);
        if (prop) {
            prop.status = prop.status === 'active' ? 'paused' : 'active';
            renderPropertiesGrid();
        }
    };

    /**
     * Ingresar y Editar la Propiedad
     */
    window.editProperty = function (propId) {
        const prop = clientState.properties.find(p => p.id === propId);
        if (prop) {
            // Guardar datos completos para prellenar el editor publicar.html
            localStorage.setItem('zilla_edit_property', JSON.stringify(prop));
            // Redirigir al publicador en modo edición
            window.location.href = `publicar.html?id=${encodeURIComponent(propId)}&edit=true`;
        }
    };

    /**
     * Opciones del Menú 3 Puntos
     */
    window.toggleCardOptions = function (propId) {
        const prop = clientState.properties.find(p => p.id === propId);
        if (!prop) return;

        const action = confirm(`Opciones para "${prop.title}":\n\n- Aceptar: Editar / Ingresar a la propiedad\n- Cancelar: Volver`);
        if (action) {
            editProperty(propId);
        }
    };

    window.openPublishModal = function () {
        if (clientState.properties.length >= MAX_FREE_PROPERTIES) {
            alert(`Has alcanzado el límite de ${MAX_FREE_PROPERTIES} publicaciones gratuitas para cuentas particulares.`);
            return;
        }
        localStorage.removeItem('zilla_edit_property');
        window.location.href = "publicar.html";
    };

    /**
     * Modal Perfil
     */
    function setupProfileModal() {
        const modal = document.getElementById("profile-edit-modal");
        const openBtn = document.getElementById("sidebar-user-card-btn");
        const topbarAvatarBtn = document.getElementById("topbar-avatar-btn");
        const closeBtn = document.getElementById("btn-close-profile-modal");
        const saveBtn = document.getElementById("btn-save-profile-modal");

        function open() {
            document.getElementById("modal-profile-name").value = clientState.user.name;
            document.getElementById("modal-profile-email").value = clientState.user.email;
            if (modal) modal.style.display = "flex";
        }

        function close() {
            if (modal) modal.style.display = "none";
        }

        if (openBtn) openBtn.addEventListener("click", open);
        if (topbarAvatarBtn) topbarAvatarBtn.addEventListener("click", open);
        if (closeBtn) closeBtn.addEventListener("click", close);

        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
                const name = document.getElementById("modal-profile-name").value.trim();
                const email = document.getElementById("modal-profile-email").value.trim();
                if (name) clientState.user.name = name;
                if (email) clientState.user.email = email;
                renderUserInfo();
                close();
            });
        }
    }

    // Exponer globalmente
    window.switchTab = switchTab;
    window.editProperty = editProperty;

})();

