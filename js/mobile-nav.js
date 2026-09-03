/**
 * ============================================================
 * ZILLA PARAGUAY - MOBILE NAVIGATION CONTROLLER
 * Ultra-Modern Slide-Out Drawer & iOS Floating Tab Bar Dock
 * ============================================================
 */

(function () {
    'use strict';

    function initMobileNav() {
        // 1. Detectar página activa
        const path = window.location.pathname;
        const isIndex = path.endsWith('index.html') || path === '/' || path.endsWith('/Zilla/') || path === '';
        const isExplorar = path.includes('explorar.html');
        const isAgentes = path.includes('agentes.html');

        // 2. Construir e Inyectar Drawer y Overlay si no existen
        if (!document.getElementById('zilla-mobile-drawer')) {
            const drawerHTML = `
                <!-- Overlay de Fondo -->
                <div class="zilla-mobile-overlay" id="zilla-mobile-overlay"></div>

                <!-- Slide-out Drawer -->
                <div class="zilla-mobile-drawer" id="zilla-mobile-drawer">
                    <!-- Header -->
                    <div class="drawer-header">
                        <a href="index.html" class="drawer-brand" title="Zilla PropTech Paraguay">
                            <img src="assets/logo-dark.svg" alt="Zilla" class="zilla-logo-img" style="height: 32px;">
                        </a>
                        <div class="drawer-header-actions">
                            <button type="button" class="drawer-close-btn" id="btn-close-mobile-drawer" aria-label="Cerrar Menú">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="drawer-body">
                        <!-- Tarjeta de Usuario / Auth -->
                        <div class="drawer-user-pill-card">
                            <div class="drawer-user-info">
                                <div class="drawer-user-avatar">
                                    <i class="far fa-user"></i>
                                </div>
                                <div class="drawer-user-texts">
                                    <strong id="drawer-user-name">Bienvenido a Zilla</strong>
                                    <span id="drawer-user-status">Inmobiliaria & Proptech</span>
                                </div>
                            </div>
                            <button type="button" class="btn-drawer-auth" id="btn-drawer-open-auth">
                                <span>Ingresar</span>
                            </button>
                        </div>

                        <!-- Conmutador de Moneda USD / PYG -->
                        <div class="drawer-currency-row">
                            <span class="drawer-currency-lbl">
                                <i class="fas fa-coins text-emerald-600"></i>
                                <span>Moneda de Visualización:</span>
                            </span>
                            <div class="drawer-currency-switcher">
                                <button type="button" class="btn-drawer-curr" data-curr="USD">USD ($)</button>
                                <button type="button" class="btn-drawer-curr" data-curr="PYG">PYG (₲)</button>
                            </div>
                        </div>

                        <!-- Grupo 1: Navegación Principal -->
                        <div>
                            <div class="drawer-nav-group-title">EXPLORAR & COMPRAR</div>
                            <div class="drawer-nav-list">
                                <a href="index.html" class="drawer-nav-link ${isIndex ? 'active' : ''}">
                                    <div class="drawer-nav-icon icon-emerald"><i class="fas fa-house"></i></div>
                                    <div class="drawer-nav-text-wrap">
                                        <div class="nav-label">Inicio <span class="drawer-badge-pill">Home</span></div>
                                        <span class="nav-sub">Portal principal, destacados y buscador</span>
                                    </div>
                                    <i class="fas fa-chevron-right drawer-nav-chevron"></i>
                                </a>

                                <a href="explorar.html" class="drawer-nav-link ${isExplorar ? 'active' : ''}">
                                    <div class="drawer-nav-icon icon-sky"><i class="fas fa-map-location-dot"></i></div>
                                    <div class="drawer-nav-text-wrap">
                                        <div class="nav-label">Mapa & Inmuebles <span class="drawer-badge-pill hot">Live</span></div>
                                        <span class="nav-sub">Casas, departamentos y terrenos con filtros</span>
                                    </div>
                                    <i class="fas fa-chevron-right drawer-nav-chevron"></i>
                                </a>

                                <a href="agentes.html" class="drawer-nav-link ${isAgentes ? 'active' : ''}">
                                    <div class="drawer-nav-icon icon-purple"><i class="fas fa-chart-pie"></i></div>
                                    <div class="drawer-nav-text-wrap">
                                        <div class="nav-label">Portal Agentes B2B <span class="drawer-badge-pill">PRO</span></div>
                                        <span class="nav-sub">Precios m², Cap Rate, CRM y Plan Regulador</span>
                                    </div>
                                    <i class="fas fa-chevron-right drawer-nav-chevron"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Grupo 2: Categorías Populares -->
                        <div>
                            <div class="drawer-nav-group-title">FILTROS RÁPIDOS</div>
                            <div class="drawer-nav-list">
                                <a href="explorar.html?type=apartment" class="drawer-nav-link">
                                    <div class="drawer-nav-icon"><i class="fas fa-building text-sky-500"></i></div>
                                    <div class="drawer-nav-text-wrap">
                                        <div class="nav-label">Departamentos</div>
                                        <span class="nav-sub">Asunción, Villa Morra & Santa Teresa</span>
                                    </div>
                                    <i class="fas fa-chevron-right drawer-nav-chevron"></i>
                                </a>

                                <a href="explorar.html?type=house" class="drawer-nav-link">
                                    <div class="drawer-nav-icon"><i class="fas fa-home text-emerald-500"></i></div>
                                    <div class="drawer-nav-text-wrap">
                                        <div class="nav-label">Casas & Dúplex</div>
                                        <span class="nav-sub">Barrio Herrera, Luque & Lambaré</span>
                                    </div>
                                    <i class="fas fa-chevron-right drawer-nav-chevron"></i>
                                </a>

                                <a href="explorar.html?type=vacational" class="drawer-nav-link">
                                    <div class="drawer-nav-icon"><i class="fas fa-umbrella-beach text-amber-500"></i></div>
                                    <div class="drawer-nav-text-wrap">
                                        <div class="nav-label">San Bernardino & Verano</div>
                                        <span class="nav-sub">Condominios, casas con piscina y lago</span>
                                    </div>
                                    <i class="fas fa-chevron-right drawer-nav-chevron"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Footer / CTAs -->
                    <div class="drawer-footer">
                        <button type="button" class="btn-drawer-publish" id="btn-drawer-publish-action">
                            <i class="fas fa-plus-circle"></i>
                            <span>Publicar Inmueble</span>
                        </button>
                        <a href="https://wa.me/595981123456?text=Hola%20Zilla%20Paraguay,%20quisiera%20recibir%20asesoramiento%20inmobiliario" target="_blank" rel="noopener" class="btn-drawer-whatsapp">
                            <i class="fab fa-whatsapp"></i>
                            <span>WhatsApp de Soporte</span>
                        </a>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', drawerHTML);
        }

        // 3. Crear o conectar botón hamburger en el navbar superior si existe
        const existingNavActions = document.querySelector('.site-navbar .nav-actions-section') || 
                                   document.querySelector('.evergreen-nav-actions') ||
                                   document.querySelector('.b2b-topbar-actions') ||
                                   document.querySelector('.b2b-topbar .topbar-left');

        if (existingNavActions && !document.getElementById('topbar-mobile-hamburger-btn')) {
            const hamburgerBtn = document.createElement('button');
            hamburgerBtn.type = 'button';
            hamburgerBtn.className = 'btn-zilla-mobile-hamburger';
            hamburgerBtn.id = 'topbar-mobile-hamburger-btn';
            hamburgerBtn.setAttribute('aria-label', 'Abrir Menú Móvil');
            hamburgerBtn.innerHTML = `
                <div class="hamburger-bars">
                    <span class="bar"></span>
                    <span class="bar short"></span>
                    <span class="bar"></span>
                </div>
            `;
            existingNavActions.appendChild(hamburgerBtn);
        }

        // 4. Controladores de Apertura / Cierre
        const drawer = document.getElementById('zilla-mobile-drawer');
        const overlay = document.getElementById('zilla-mobile-overlay');
        const closeBtn = document.getElementById('btn-close-mobile-drawer');
        const hamburgerBtn = document.getElementById('topbar-mobile-hamburger-btn');
        const drawerPublishBtn = document.getElementById('btn-drawer-publish-action');
        const drawerAuthBtn = document.getElementById('btn-drawer-open-auth');

        function openDrawer() {
            if (!drawer || !overlay) return;
            drawer.classList.add('active');
            overlay.classList.add('active');
            if (hamburgerBtn) hamburgerBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
            syncCurrencyState();
        }

        function closeDrawer() {
            if (!drawer || !overlay) return;
            drawer.classList.remove('active');
            overlay.classList.remove('active');
            if (hamburgerBtn) hamburgerBtn.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => {
            if (drawer && drawer.classList.contains('active')) closeDrawer();
            else openDrawer();
        });

        if (dockMenuBtn) dockMenuBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (overlay) overlay.addEventListener('click', closeDrawer);

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer && drawer.classList.contains('active')) {
                closeDrawer();
            }
        });

        // 5. Conectar Publicar Inmueble
        const handlePublish = () => {
            closeDrawer();
            window.location.href = 'publicar.html';
        };

        if (dockPublishBtn) dockPublishBtn.addEventListener('click', handlePublish);
        if (drawerPublishBtn) drawerPublishBtn.addEventListener('click', handlePublish);

        // 6. Conectar Auth Modal
        if (drawerAuthBtn) {
            drawerAuthBtn.addEventListener('click', () => {
                closeDrawer();
                const mainAuthBtn = document.getElementById('open-auth-modal-btn') || 
                                    document.getElementById('b2b-auth-btn');
                if (mainAuthBtn) {
                    mainAuthBtn.click();
                } else if (window.AuthModal && window.AuthModal.openModal) {
                    window.AuthModal.openModal();
                }
            });
        }

        // 7. Sincronización de Moneda en el Drawer
        function syncCurrencyState() {
            const currentCurrency = window.CurrencyManager ? window.CurrencyManager.getCurrency() : 'USD';
            const currBtns = document.querySelectorAll('.btn-drawer-curr');
            currBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.curr === currentCurrency);
            });
        }

        const drawerCurrBtns = document.querySelectorAll('.btn-drawer-curr');
        drawerCurrBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const newCurr = btn.dataset.curr;
                if (window.CurrencyManager && window.CurrencyManager.setCurrency) {
                    window.CurrencyManager.setCurrency(newCurr);
                } else {
                    localStorage.setItem('zilla_currency', newCurr);
                    const desktopBtn = document.querySelector(`.currency-toggle-btn[data-currency="${newCurr}"]`);
                    if (desktopBtn) desktopBtn.click();
                }
                syncCurrencyState();
            });
        });

        syncCurrencyState();
    }

    // Inicializar al cargar el DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }
})();
