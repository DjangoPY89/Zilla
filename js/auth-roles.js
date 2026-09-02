// Gestor de Roles de Usuario y Estado de Sesión (Arrendatario vs Propietario)
(function () {
    let currentRole = localStorage.getItem("zilla_user_role") || "tenant"; // 'tenant' | 'host'
    let currentUser = {
        name: currentRole === "tenant" ? "Alex Miller (Nómada Digital)" : "Ing. Roberto Alarcón (Propietario)",
        email: currentRole === "tenant" ? "alex.miller@nomadtech.co" : "roberto.alarcon@inversionespy.com",
        avatar: currentRole === "tenant" 
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        verified: true,
        country: currentRole === "tenant" ? "Estados Unidos / Remoto" : "Paraguay"
    };

    const AuthRolesManager = {
        getRole: function () {
            return currentRole;
        },

        getUser: function () {
            return currentUser;
        },

        setRole: function (role) {
            if (role !== "tenant" && role !== "host") return;
            currentRole = role;
            localStorage.setItem("zilla_user_role", role);

            currentUser = {
                name: currentRole === "tenant" ? "Alex Miller (Nómada Digital)" : "Ing. Roberto Alarcón (Propietario)",
                email: currentRole === "tenant" ? "alex.miller@nomadtech.co" : "roberto.alarcon@inversionespy.com",
                avatar: currentRole === "tenant" 
                    ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                verified: true,
                country: currentRole === "tenant" ? "Estados Unidos / Remoto" : "Paraguay"
            };

            this.updateNavbarRoleUI();
            window.dispatchEvent(new CustomEvent("roleChanged", { detail: { role: currentRole, user: currentUser } }));
        },

        toggleRole: function () {
            const next = currentRole === "tenant" ? "host" : "tenant";
            this.setRole(next);
        },

        init: function () {
            this.updateNavbarRoleUI();

            // Listeners de conmutación en la UI
            document.querySelectorAll(".role-switcher-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const targetRole = btn.dataset.role;
                    if (targetRole) this.setRole(targetRole);
                    else this.toggleRole();
                });
            });

            // Modal de perfil de usuario / host
            const profileBtn = document.getElementById("user-profile-menu-btn");
            if (profileBtn) {
                profileBtn.addEventListener("click", () => this.openProfileModal());
            }
        },

        updateNavbarRoleUI: function () {
            const isHost = currentRole === "host";
            
            // Actualizar botones de conmutación
            document.querySelectorAll(".role-switcher-btn").forEach(btn => {
                btn.classList.toggle("role-host-active", isHost);
                btn.classList.toggle("role-tenant-active", !isHost);
                const label = btn.querySelector(".role-label");
                if (label) {
                    label.textContent = isHost ? "Modo Propietario" : "Modo Arrendatario";
                }
                const icon = btn.querySelector("i");
                if (icon) {
                    icon.className = isHost ? "fas fa-key" : "fas fa-laptop-house";
                }
            });

            // Botón de acción principal en navbar
            const mainActionBtn = document.getElementById("navbar-main-action-btn");
            if (mainActionBtn) {
                if (isHost) {
                    mainActionBtn.innerHTML = `<i class="fas fa-plus-circle"></i> <span>Publicar Unidad</span>`;
                    mainActionBtn.onclick = () => {
                        if (window.PublishManager) window.PublishManager.open();
                    };
                } else {
                    mainActionBtn.innerHTML = `<i class="fas fa-calendar-check"></i> <span>Mis Reservas</span>`;
                    mainActionBtn.onclick = () => {
                        this.openTenantBookingsModal();
                    };
                }
            }

            // Indicador de badge de usuario
            const userBadge = document.getElementById("user-role-badge");
            if (userBadge) {
                userBadge.textContent = isHost ? "Propietario / Host" : "Inquilino / Nómada";
                userBadge.className = isHost ? "user-badge badge-host" : "user-badge badge-tenant";
            }
        },

        openProfileModal: function () {
            const isHost = currentRole === "host";
            const modal = document.createElement("div");
            modal.className = "modal-container active";
            modal.innerHTML = `
                <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
                <div class="modal-dialog-large" style="max-width: 480px; height: auto;">
                    <div class="modal-top-bar">
                        <span class="font-bold text-base"><i class="fas fa-user-circle text-primary"></i> Perfil de Cuenta</span>
                        <button class="modal-close-button" onclick="this.closest('.modal-container').remove()">&times;</button>
                    </div>
                    <div style="padding: 24px; text-align: center;">
                        <img src="${currentUser.avatar}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); margin-bottom: 12px;">
                        <h3 style="font-size: 1.2rem; font-weight: 700;">${currentUser.name}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 16px;">${currentUser.email} • <strong>${currentUser.country}</strong></p>
                        
                        <div style="background: var(--bg-main); border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px; text-align: left; border: 1px solid var(--border-color);">
                            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Rol Activo en Plataforma</div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-weight: 700; color: var(--text-primary);">
                                    <i class="${isHost ? 'fas fa-key text-accent' : 'fas fa-laptop-house text-primary'}"></i> ${isHost ? 'Propietario / Inversor' : 'Arrendatario / Nómada Digital'}
                                </span>
                                <button class="btn btn-secondary btn-sm" onclick="window.AuthRolesManager.toggleRole(); this.closest('.modal-container').remove();">
                                    <i class="fas fa-arrows-rotate"></i> Cambiar a ${isHost ? 'Inquilino' : 'Propietario'}
                                </button>
                            </div>
                        </div>

                        ${isHost ? `
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px;">
                                    <div style="font-size: 1.25rem; font-weight: 800; color: #15803d;">3 Unidades</div>
                                    <div style="font-size: 0.75rem; color: #166534;">Publicadas (92% Ocupación)</div>
                                </div>
                                <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 10px;">
                                    <div style="font-size: 1.25rem; font-weight: 800; color: #1d4ed8;">US$ 3.850</div>
                                    <div style="font-size: 0.75rem; color: #1e40af;">Renta Cobrada este Mes</div>
                                </div>
                            </div>
                        ` : `
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px;">
                                    <div style="font-size: 1.25rem; font-weight: 800; color: #15803d;">Verificado</div>
                                    <div style="font-size: 0.75rem; color: #166534;">Pasaporte & KYC Aprobado</div>
                                </div>
                                <div style="background: #fefce8; border: 1px solid #fef08a; padding: 12px; border-radius: 10px;">
                                    <div style="font-size: 1.25rem; font-weight: 800; color: #a16207;">1 Estancia</div>
                                    <div style="font-size: 0.75rem; color: #854d0e;">Activa en Villa Morra</div>
                                </div>
                            </div>
                        `}

                        <button class="btn btn-primary btn-block" onclick="this.closest('.modal-container').remove()">
                            Cerrar Panel
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        },

        openTenantBookingsModal: function () {
            const modal = document.createElement("div");
            modal.className = "modal-container active";
            modal.innerHTML = `
                <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
                <div class="modal-dialog-large" style="max-width: 600px; height: auto;">
                    <div class="modal-top-bar">
                        <span class="font-bold text-base"><i class="fas fa-calendar-check text-primary"></i> Mis Estancias y Reservas</span>
                        <button class="modal-close-button" onclick="this.closest('.modal-container').remove()">&times;</button>
                    </div>
                    <div style="padding: 24px;">
                        <div style="border: 1.5px solid var(--primary); border-radius: var(--radius-lg); padding: 16px; background: var(--primary-light); margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                <div>
                                    <span class="micro-badge badge-primary" style="margin-bottom: 4px; display: inline-block;">Estancia Activa</span>
                                    <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">Penthouse de Lujo con Terraza y Parrilla</h4>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary);"><i class="fas fa-map-pin text-primary"></i> Villa Morra, Asunción</p>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary);">US$ 1.150 / m</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">Contrato de 6 meses</div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 0.78rem; background: #ffffff; padding: 10px; border-radius: 8px;">
                                <div><strong>Check-in:</strong> 01 Sep 2026</div>
                                <div><strong>Check-out:</strong> 28 Feb 2027</div>
                                <div><strong>WiFi:</strong> 500 Mbps Fibra</div>
                            </div>
                            <div style="display: flex; gap: 8px; margin-top: 12px;">
                                <button class="btn btn-secondary btn-sm" onclick="alert('📄 Descargando contrato digital firmado...')"><i class="fas fa-file-contract"></i> Contrato Digital</button>
                                <button class="btn btn-primary btn-sm" onclick="if(window.AIConciergeManager) window.AIConciergeManager.open()"><i class="fas fa-robot"></i> Contactar Concierge</button>
                            </div>
                        </div>
                        <button class="btn btn-outline btn-block" onclick="this.closest('.modal-container').remove(); window.location.href='#properties-feed';">
                            Explorar Nuevas Propiedades de Media Estancia
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    };

    window.AuthRolesManager = AuthRolesManager;
})();
