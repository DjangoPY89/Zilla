/**
 * ============================================================
 * ZILLA PARAGUAY - SISTEMA DE AUTENTICACIÓN GLASSMÓRFICA
 * Módulo de Inicio de Sesión y Registro para Usuarios Finales
 * ============================================================
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'zilla_user_session';

    // Estado del usuario actual
    let currentUser = null;

    // Inicialización al cargar el DOM
    document.addEventListener('DOMContentLoaded', () => {
        loadUserSession();
        setupAuthEventListeners();
        updateNavAuthUI();
    });

    /**
     * Cargar sesión persistida desde localStorage
     */
    function loadUserSession() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                currentUser = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('No se pudo leer la sesión guardada:', e);
        }
    }

    /**
     * Guardar sesión en localStorage
     */
    function saveUserSession(user) {
        currentUser = user;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch (e) {
            console.warn('Error al guardar sesión:', e);
        }
        updateNavAuthUI();
    }

    /**
     * Cerrar sesión
     */
    function logout() {
        currentUser = null;
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Error al eliminar sesión:', e);
        }
        updateNavAuthUI();
        showAuthToast('Has cerrado sesión correctamente.', 'info');
    }

    /**
     * Configurar escuchas de eventos en el DOM
     */
    function setupAuthEventListeners() {
        // Botones para abrir modal de inicio de sesión
        document.querySelectorAll('#open-auth-modal-btn, .btn-nav-auth-glass, .trigger-auth-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentUser) {
                    toggleUserMenu(btn);
                } else {
                    openAuthModal('login');
                }
            });
        });

        // Botón de cerrar modal
        const closeBtn = document.getElementById('close-auth-modal-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeAuthModal);
        }

        // Clic en backdrop para cerrar
        const backdrop = document.getElementById('auth-modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', closeAuthModal);
        }

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const overlay = document.getElementById('auth-modal-overlay');
                if (overlay && overlay.classList.contains('active')) {
                    closeAuthModal();
                }
                closeUserMenu();
            }
        });

        // Cerrar menú de usuario al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#open-auth-modal-btn') && !e.target.closest('.btn-nav-auth-glass') && !e.target.closest('.user-dropdown-menu')) {
                closeUserMenu();
            }
        });
    }

    /**
     * Abrir modal de autenticación
     */
    function openAuthModal(tab = 'login') {
        const overlay = document.getElementById('auth-modal-overlay');
        if (!overlay) return;

        switchAuthTab(tab);
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Foco inicial
        setTimeout(() => {
            if (tab === 'login') {
                const emailInput = document.getElementById('auth-email-input');
                if (emailInput) emailInput.focus();
            } else {
                const nameInput = document.getElementById('reg-name-input');
                if (nameInput) nameInput.focus();
            }
        }, 150);
    }

    /**
     * Cerrar modal de autenticación
     */
    function closeAuthModal() {
        const overlay = document.getElementById('auth-modal-overlay');
        if (!overlay) return;

        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Alternar entre pestaña Login y Registro
     */
    function switchAuthTab(tab) {
        const loginTab = document.getElementById('tab-login-btn');
        const regTab = document.getElementById('tab-register-btn');
        const loginForm = document.getElementById('auth-login-form');
        const regForm = document.getElementById('auth-register-form');
        const modalTitle = document.getElementById('auth-modal-title');

        if (tab === 'login') {
            if (loginTab) loginTab.classList.add('active');
            if (regTab) regTab.classList.remove('active');
            if (loginForm) loginForm.classList.add('active');
            if (regForm) regForm.classList.remove('active');
            if (modalTitle) modalTitle.textContent = 'Bienvenido a Zilla';
        } else {
            if (loginTab) loginTab.classList.remove('active');
            if (regTab) regTab.classList.add('active');
            if (loginForm) loginForm.classList.remove('active');
            if (regForm) regForm.classList.add('active');
            if (modalTitle) modalTitle.textContent = 'Crea tu Cuenta';
        }
    }

    /**
     * Alternar visibilidad de contraseña
     */
    function togglePasswordVisibility(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';

        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isPass ? 'far fa-eye-slash' : 'far fa-eye';
        }
    }

    /**
     * Manejar inicio de sesión manual
     */
    function handleManualLogin(e) {
        e.preventDefault();
        const emailInput = document.getElementById('auth-email-input');
        const passwordInput = document.getElementById('auth-password-input');

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showAuthToast('Por favor completa todos los campos.', 'error');
            return;
        }

        // Extraer nombre amigable del email
        const username = email.split('@')[0];
        const displayName = username.charAt(0).toUpperCase() + username.slice(1);

        // Simular inicio de sesión exitoso
        const user = {
            id: 'usr_' + Date.now(),
            name: displayName,
            email: email,
            provider: 'password',
            avatar: null,
            role: 'seeker',
            loginDate: new Date().toISOString()
        };

        saveUserSession(user);
        closeAuthModal();
        showAuthToast(`¡Bienvenido de nuevo, ${user.name}!`, 'success');

        // Limpiar inputs
        emailInput.value = '';
        passwordInput.value = '';
    }

    /**
     * Manejar registro manual
     */
    function handleManualRegister(e) {
        e.preventDefault();
        const nameInput = document.getElementById('reg-name-input');
        const emailInput = document.getElementById('reg-email-input');
        const passwordInput = document.getElementById('reg-password-input');

        if (!nameInput || !emailInput || !passwordInput) return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!name || !email || !password) {
            showAuthToast('Por favor completa todos los campos requeridos.', 'error');
            return;
        }

        if (password.length < 6) {
            showAuthToast('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        const user = {
            id: 'usr_' + Date.now(),
            name: name,
            email: email,
            provider: 'password',
            avatar: null,
            role: 'seeker',
            loginDate: new Date().toISOString()
        };

        saveUserSession(user);
        closeAuthModal();
        showAuthToast(`¡Cuenta creada con éxito! Bienvenido a Zilla, ${user.name}.`, 'success');

        nameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
    }

    /**
     * Manejar inicio de sesión social (Google / Facebook)
     */
    function handleSocialAuth(provider) {
        const mockName = provider === 'Google' ? 'Juan Pérez' : 'María González';
        const mockEmail = provider === 'Google' ? 'juan.perez@gmail.com' : 'maria.g@facebook.com';

        const user = {
            id: 'usr_' + provider.toLowerCase() + '_' + Date.now(),
            name: mockName,
            email: mockEmail,
            provider: provider.toLowerCase(),
            avatar: null,
            role: 'seeker',
            loginDate: new Date().toISOString()
        };

        saveUserSession(user);
        closeAuthModal();
        showAuthToast(`Has iniciado sesión con ${provider} como ${user.name}.`, 'success');
    }

    /**
     * Recuperación de contraseña
     */
    function handleForgotPassword() {
        const emailInput = document.getElementById('auth-email-input');
        const email = emailInput ? emailInput.value.trim() : '';

        if (email) {
            showAuthToast(`Hemos enviado un enlace de recuperación a ${email}`, 'success');
        } else {
            showAuthToast('Ingresa tu correo en el campo superior para recuperar tu acceso.', 'info');
            if (emailInput) emailInput.focus();
        }
    }

    /**
     * Actualizar interfaz de la barra de navegación según el estado de sesión
     */
    function updateNavAuthUI() {
        const authBtns = document.querySelectorAll('#open-auth-modal-btn, .btn-nav-auth-glass');
        authBtns.forEach(btn => {
            if (currentUser) {
                const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
                btn.innerHTML = `
                    <div class="auth-user-avatar-circle" title="${currentUser.name}">
                        <span>${initial}</span>
                    </div>
                    <span class="auth-btn-text user-active-name">${currentUser.name.split(' ')[0]}</span>
                    <i class="fas fa-chevron-down auth-caret-icon"></i>
                `;
                btn.classList.add('logged-in');
            } else {
                btn.innerHTML = `
                    <div class="auth-icon-wrap">
                        <i class="far fa-user-circle"></i>
                    </div>
                    <span class="auth-btn-text">Ingresar</span>
                `;
                btn.classList.remove('logged-in');
            }
        });
    }

    /**
     * Alternar menú desplegable de usuario conectado
     */
    function toggleUserMenu(triggerBtn) {
        let menu = document.getElementById('user-dropdown-menu');
        if (menu) {
            const isVisible = menu.classList.contains('active');
            if (isVisible) {
                closeUserMenu();
            } else {
                positionUserMenu(triggerBtn, menu);
                menu.classList.add('active');
            }
        } else {
            menu = createUserDropdown();
            document.body.appendChild(menu);
            positionUserMenu(triggerBtn, menu);
            setTimeout(() => menu.classList.add('active'), 10);
        }
    }

    function positionUserMenu(btn, menu) {
        const rect = btn.getBoundingClientRect();
        menu.style.top = `${rect.bottom + 8}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;
    }

    function closeUserMenu() {
        const menu = document.getElementById('user-dropdown-menu');
        if (menu) {
            menu.classList.remove('active');
        }
    }

    /**
     * Crear el menú desplegable glassmórfico de usuario
     */
    function createUserDropdown() {
        const menu = document.createElement('div');
        menu.id = 'user-dropdown-menu';
        menu.className = 'user-dropdown-menu';
        
        const initial = currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
        const name = currentUser ? currentUser.name : 'Usuario';
        const email = currentUser ? currentUser.email : '';

        menu.innerHTML = `
            <div class="user-menu-header">
                <div class="user-menu-avatar">${initial}</div>
                <div class="user-menu-info">
                    <strong class="user-menu-name">${name}</strong>
                    <span class="user-menu-email">${email}</span>
                </div>
            </div>
            <div class="user-menu-divider"></div>
            <a href="explorar.html" class="user-menu-item">
                <i class="fas fa-heart text-rose-500"></i>
                <span>Mis Inmuebles Favoritos</span>
            </a>
            <a href="explorar.html" class="user-menu-item">
                <i class="fas fa-bell text-amber-400"></i>
                <span>Alertas de Precio</span>
            </a>
            <div class="user-menu-divider"></div>
            <button type="button" class="user-menu-item user-menu-logout" id="user-logout-btn">
                <i class="fas fa-arrow-right-from-bracket text-red-400"></i>
                <span>Cerrar Sesión</span>
            </button>
        `;

        menu.querySelector('#user-logout-btn').addEventListener('click', () => {
            closeUserMenu();
            logout();
        });

        return menu;
    }

    /**
     * Mostrar notificación Toast elegante
     */
    function showAuthToast(message, type = 'info') {
        let container = document.getElementById('auth-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'auth-toast-container';
            container.className = 'auth-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `auth-toast auth-toast-${type}`;
        
        let iconHtml = '<i class="fas fa-info-circle text-sky-400"></i>';
        if (type === 'success') iconHtml = '<i class="fas fa-check-circle text-emerald-400"></i>';
        if (type === 'error') iconHtml = '<i class="fas fa-exclamation-circle text-rose-400"></i>';

        toast.innerHTML = `
            ${iconHtml}
            <span class="toast-msg">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Exportar funciones globales para acceso inline
    window.AuthManager = {
        openAuthModal,
        closeAuthModal,
        switchAuthTab,
        togglePasswordVisibility,
        handleManualLogin,
        handleManualRegister,
        handleSocialAuth,
        handleForgotPassword,
        logout,
        getCurrentUser: () => currentUser
    };

    // Exponer shortcuts directos
    window.openAuthModal = openAuthModal;
    window.closeAuthModal = closeAuthModal;
    window.switchAuthTab = switchAuthTab;
    window.togglePasswordVisibility = togglePasswordVisibility;
    window.handleManualLogin = handleManualLogin;
    window.handleManualRegister = handleManualRegister;
    window.handleSocialAuth = handleSocialAuth;
    window.handleForgotPassword = handleForgotPassword;
})();
