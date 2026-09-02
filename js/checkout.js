// Flujo de Reserva en 3 Pasos (Checkout Wizard & KYC para Media Estancia)
(function () {
    let currentCheckoutProperty = null;
    let currentStayMonths = 3;
    let selectedAddons = {
        recurringCleaning: true, // Upsell: $35/m
        airportTransfer: false   // Upsell: $30
    };

    const CheckoutManager = {
        init: function () {
            // Eventos globales
        },

        startCheckout: function (property, months = 3) {
            currentCheckoutProperty = property;
            currentStayMonths = months;

            const modalContainer = document.createElement("div");
            modalContainer.className = "modal-container active checkout-modal-root";
            modalContainer.id = "checkout-wizard-modal";
            modalContainer.innerHTML = this.buildWizardHTML();

            document.body.appendChild(modalContainer);
            document.body.style.overflow = "hidden";

            this.bindWizardEvents(modalContainer);
            this.updateStepView(1);
        },

        close: function () {
            const modal = document.getElementById("checkout-wizard-modal");
            if (modal) modal.remove();
            document.body.style.overflow = "";
        },

        buildWizardHTML: function () {
            const prop = currentCheckoutProperty;
            const quote = window.PricingEngine.calculateQuote(prop.priceUSD, currentStayMonths, {
                expensesUSD: Math.round((prop.expensesPYG || 0) / 7950),
                utilitiesUSD: 65,
                cleaningFeeUSD: 45,
                recurringCleaning: selectedAddons.recurringCleaning,
                airportTransfer: selectedAddons.airportTransfer
            });

            return `
                <div class="modal-backdrop" onclick="window.CheckoutManager.close()"></div>
                <div class="modal-dialog-large checkout-wizard-dialog" style="max-width: 860px; height: 90vh;">
                    <div class="modal-top-bar">
                        <div class="checkout-brand-title">
                            <i class="fas fa-shield-check text-primary"></i>
                            <span>Reserva Segura de Media Estancia • Zilla Flex</span>
                        </div>
                        <button class="modal-close-button" onclick="window.CheckoutManager.close()">&times;</button>
                    </div>

                    <!-- Steps Bar -->
                    <div class="checkout-stepper-header">
                        <div class="checkout-step-tab active" data-step="1">
                            <span class="step-num">1</span>
                            <span class="step-txt">Estancia & Upsells</span>
                        </div>
                        <div class="checkout-step-tab" data-step="2">
                            <span class="step-num">2</span>
                            <span class="step-txt">Verificación KYC</span>
                        </div>
                        <div class="checkout-step-tab" data-step="3">
                            <span class="step-num">3</span>
                            <span class="step-txt">Contrato & Pago</span>
                        </div>
                    </div>

                    <div class="modal-scrollable-content checkout-wizard-body" style="padding: 24px;">
                        <!-- PASO 1: Revisión de Fechas y Upsells -->
                        <div class="checkout-step-content active" id="checkout-step-1">
                            <div class="checkout-grid-layout">
                                <div class="checkout-main-form">
                                    <h3 class="font-bold text-lg mb-2">1. Personaliza tu Estancia</h3>
                                    <p class="text-sm text-muted mb-4">Ajusta la duración para obtener la mejor tarifa mensual garantizada.</p>

                                    <div class="form-group mb-4">
                                        <label class="font-bold text-sm">Duración del Alquiler (Meses)</label>
                                        <div class="duration-slider-wrapper">
                                            <input type="range" id="checkout-months-slider" min="1" max="11" value="${currentStayMonths}" class="custom-range-slider">
                                            <div class="range-labels-row">
                                                <span>1 mes</span>
                                                <span class="font-bold text-primary" id="checkout-duration-display">${currentStayMonths} meses (${quote.discountPercent}% OFF)</span>
                                                <span>11 meses</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-grid-2 mb-4">
                                        <div class="form-group">
                                            <label class="font-bold text-sm">Mes de Entrada (Check-in)</label>
                                            <select class="filter-select w-full" id="checkout-start-month">
                                                <option value="sep2026">Septiembre 2026 (Inmediato)</option>
                                                <option value="oct2026">Octubre 2026</option>
                                                <option value="nov2026">Noviembre 2026</option>
                                                <option value="dec2026">Diciembre 2026</option>
                                                <option value="jan2027">Enero 2027</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label class="font-bold text-sm">Propósito del Viaje</label>
                                            <select class="filter-select w-full" id="checkout-purpose">
                                                <option value="nomad">Nómada Digital / Trabajo Remoto</option>
                                                <option value="corporate">Ejecutivo Corporativo / Empresa</option>
                                                <option value="relocation">Relocalización / Residencia</option>
                                                <option value="personal">Personal / Descanso</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Upsells de Vanguardia -->
                                    <div class="upsells-box">
                                        <h4 class="font-bold text-sm text-primary mb-2"><i class="fas fa-sparkles"></i> Servicios Opcionales para tu Comodidad</h4>
                                        
                                        <label class="upsell-card-label ${selectedAddons.recurringCleaning ? 'selected' : ''}">
                                            <input type="checkbox" id="upsell-cleaning" ${selectedAddons.recurringCleaning ? 'checked' : ''}>
                                            <div class="upsell-icon"><i class="fas fa-broom"></i></div>
                                            <div class="upsell-info">
                                                <strong>Limpieza Residencial Quincenal</strong>
                                                <span>Cambio de sábanas, toallas y desinfección profunda por personal certificado Zilla.</span>
                                            </div>
                                            <div class="upsell-price">+ US$ 35 / mes</div>
                                        </label>

                                        <label class="upsell-card-label ${selectedAddons.airportTransfer ? 'selected' : ''}">
                                            <input type="checkbox" id="upsell-transfer" ${selectedAddons.airportTransfer ? 'checked' : ''}>
                                            <div class="upsell-icon"><i class="fas fa-plane-arrival"></i></div>
                                            <div class="upsell-info">
                                                <strong>Transfer Ejecutivo Aeropuerto Silvio Pettirossi</strong>
                                                <span>Chofer privado con cartel a tu llegada y traslado directo con llaves del departamento.</span>
                                            </div>
                                            <div class="upsell-price">+ US$ 30 único</div>
                                        </label>
                                    </div>
                                </div>

                                <!-- Resumen Lateral Dinámico -->
                                <div class="checkout-summary-card" id="checkout-summary-target">
                                    ${this.buildSummarySnippet(prop, quote)}
                                </div>
                            </div>
                        </div>

                        <!-- PASO 2: Verificación de Identidad (KYC) -->
                        <div class="checkout-step-content" id="checkout-step-2" style="display: none;">
                            <div class="checkout-grid-layout">
                                <div class="checkout-main-form">
                                    <h3 class="font-bold text-lg mb-2">2. Verificación de Identidad (Sin Garantes)</h3>
                                    <p class="text-sm text-muted mb-4">Para emitir tu contrato digital 100% legal bajo las leyes de Paraguay sin requerir codeudores locales.</p>

                                    <div class="form-grid-2 mb-3">
                                        <div class="form-group">
                                            <label class="font-bold text-sm">Nombre Completo (según Pasaporte/CI)</label>
                                            <input type="text" id="kyc-fullname" class="filter-select w-full" value="Alex Miller" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="font-bold text-sm">Nacionalidad / País de Origen</label>
                                            <input type="text" id="kyc-country" class="filter-select w-full" value="Estados Unidos" required>
                                        </div>
                                    </div>

                                    <div class="form-grid-2 mb-3">
                                        <div class="form-group">
                                            <label class="font-bold text-sm">Número de Pasaporte o Documento</label>
                                            <input type="text" id="kyc-doc-num" class="filter-select w-full" value="US-987456123" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="font-bold text-sm">WhatsApp / Teléfono Internacional</label>
                                            <input type="tel" id="kyc-phone" class="filter-select w-full" value="+1 415 889 9000" required>
                                        </div>
                                    </div>

                                    <div class="form-group mb-4">
                                        <label class="font-bold text-sm">Carga de Documento / Pasaporte (PDF, JPG, PNG)</label>
                                        <div class="file-dropzone-mock">
                                            <i class="fas fa-id-card text-2xl text-primary mb-2"></i>
                                            <span class="text-sm font-semibold">Documento validado: <code>passport_alex_miller.pdf</code></span>
                                            <span class="text-xs text-muted">Encriptación SSL de 256 bits conforme a regulaciones GDPR y locales.</span>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label class="font-bold text-sm">Empresa / Perfil de LinkedIn / Prueba de Fondos</label>
                                        <input type="text" id="kyc-linkedin" class="filter-select w-full" value="linkedin.com/in/alexmiller-tech" placeholder="https://linkedin.com/in/tu-perfil">
                                    </div>
                                </div>

                                <div class="checkout-summary-card">
                                    ${this.buildSummarySnippet(prop, quote)}
                                </div>
                            </div>
                        </div>

                        <!-- PASO 3: Pre-Contrato & Confirmación de Reserva -->
                        <div class="checkout-step-content" id="checkout-step-3" style="display: none;">
                            <div class="checkout-grid-layout">
                                <div class="checkout-main-form">
                                    <h3 class="font-bold text-lg mb-2">3. Firma Digital y Garantía de Reserva</h3>
                                    <p class="text-sm text-muted mb-4">Revisa el contrato de arrendamiento temporal antes de formalizar la reserva.</p>

                                    <!-- Visor de Contrato -->
                                    <div class="digital-lease-box">
                                        <div class="lease-header">
                                            <i class="fas fa-file-contract text-primary"></i> <strong>CONTRATO DIGITAL DE ARRENDAMIENTO TEMPORAL (LEY N° 6822/21)</strong>
                                        </div>
                                        <div class="lease-body-text">
                                            <p><strong>Arrendador:</strong> Inmueble Verificado Zilla Paraguay (Código ${prop.id})</p>
                                            <p><strong>Arrendatario:</strong> Alex Miller (Pasaporte: US-987456123)</p>
                                            <p><strong>Inmueble:</strong> ${prop.title} - ${prop.address}, ${prop.neighborhood}, ${prop.city}</p>
                                            <p><strong>Duración:</strong> ${currentStayMonths} meses con tarifa preferencial fija de US$ ${quote.monthlyRentUSD} / mes.</p>
                                            <p><strong>Garantías:</strong> El depósito de garantía de US$ ${quote.securityDepositUSD} será restituido íntegramente al finalizar la estancia tras inventario.</p>
                                        </div>
                                    </div>

                                    <label class="terms-checkbox-label mt-4">
                                        <input type="checkbox" id="accept-lease-terms" checked>
                                        <span>Acepto los términos del contrato digital de media estancia, el reglamento interno del edificio y la política de reembolso de Zilla.</span>
                                    </label>

                                    <div class="payment-method-selector mt-4">
                                        <label class="font-bold text-sm mb-2 block">Método de Pago Preferido</label>
                                        <div class="payment-pills-row">
                                            <button type="button" class="pay-pill active"><i class="fas fa-credit-card"></i> Tarjeta Internacional (Visa/Mastercard)</button>
                                            <button type="button" class="pay-pill"><i class="fas fa-building-columns"></i> Transferencia Bancaria PYG / USD (SIPAP)</button>
                                            <button type="button" class="pay-pill"><i class="fab fa-bitcoin"></i> Criptomonedas (USDT)</button>
                                        </div>
                                    </div>
                                </div>

                                <div class="checkout-summary-card">
                                    ${this.buildSummarySnippet(prop, quote)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Navigation -->
                    <div class="modal-footer-sticky">
                        <button type="button" class="btn btn-secondary" id="checkout-prev-btn" style="display: none;">
                            <i class="fas fa-arrow-left"></i> Volver
                        </button>
                        <div class="total-quick-hint">
                            <span class="text-xs text-muted">Total Primer Mes + Depósito:</span>
                            <strong class="text-primary text-base" id="checkout-footer-price">US$ ${quote.totalFirstPaymentUSD.toLocaleString('es-PY')}</strong>
                        </div>
                        <button type="button" class="btn btn-primary" id="checkout-next-btn">
                            <span>Siguiente: Verificación KYC</span> <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
        },

        buildSummarySnippet: function (prop, quote) {
            return `
                <div class="summary-prop-mini">
                    <img src="${prop.images[0]}" alt="${prop.title}" class="summary-prop-img">
                    <div>
                        <h4 class="font-bold text-sm">${prop.title}</h4>
                        <p class="text-xs text-muted"><i class="fas fa-location-dot text-primary"></i> ${prop.neighborhood}, ${prop.city}</p>
                        <span class="micro-badge badge-primary text-xs mt-1 inline-block"><i class="fas fa-wifi"></i> WiFi 500 Mbps</span>
                    </div>
                </div>

                <div class="cost-breakdown-table mt-3">
                    <div class="cost-row">
                        <span>Alquiler (${quote.months} meses):</span>
                        <span><strong>US$ ${quote.monthlyRentUSD} / mes</strong></span>
                    </div>
                    ${quote.discountPercent > 0 ? `
                        <div class="cost-row text-success font-semibold text-xs">
                            <span><i class="fas fa-tag"></i> Descuento (${quote.discountPercent}% OFF):</span>
                            <span>- US$ ${quote.totalSavingsUSD} total</span>
                        </div>
                    ` : ''}
                    <div class="cost-row text-xs text-muted">
                        <span>Expensas & Mantenimiento:</span>
                        <span>Incluido</span>
                    </div>
                    <div class="cost-row text-xs text-muted">
                        <span>Internet Fibra 500Mbps + Luz est.:</span>
                        <span>US$ ${quote.utilitiesMonthlyUSD} / mes</span>
                    </div>
                    <div class="cost-row text-xs text-muted">
                        <span>Limpieza de Salida (única):</span>
                        <span>US$ ${quote.exitCleaningFeeUSD}</span>
                    </div>
                    <div class="cost-row text-xs text-muted">
                        <span>Depósito Reembolsable:</span>
                        <span>US$ ${quote.securityDepositUSD}</span>
                    </div>
                    ${selectedAddons.recurringCleaning ? `
                        <div class="cost-row text-xs text-primary font-semibold">
                            <span>Limpieza Quincenal:</span>
                            <span>US$ 35 / mes</span>
                        </div>
                    ` : ''}
                    ${selectedAddons.airportTransfer ? `
                        <div class="cost-row text-xs text-primary font-semibold">
                            <span>Transfer Aeropuerto:</span>
                            <span>US$ 30</span>
                        </div>
                    ` : ''}
                    <div class="cost-row-total pt-2 mt-2 border-t font-bold">
                        <span>Primer Pago (Reserva):</span>
                        <span class="text-primary text-base">US$ ${quote.totalFirstPaymentUSD.toLocaleString('es-PY')}</span>
                    </div>
                    <div class="text-xs text-muted text-right mt-1">
                        ≈ ₲ ${quote.totalFirstPaymentPYG.toLocaleString('es-PY')}
                    </div>
                </div>
            `;
        },

        bindWizardEvents: function (modal) {
            let currentStep = 1;
            const nextBtn = modal.querySelector("#checkout-next-btn");
            const prevBtn = modal.querySelector("#checkout-prev-btn");
            const slider = modal.querySelector("#checkout-months-slider");
            const durationDisplay = modal.querySelector("#checkout-duration-display");
            const cleaningCb = modal.querySelector("#upsell-cleaning");
            const transferCb = modal.querySelector("#upsell-transfer");

            const recalculateAll = () => {
                const quote = window.PricingEngine.calculateQuote(currentCheckoutProperty.priceUSD, currentStayMonths, {
                    expensesUSD: Math.round((currentCheckoutProperty.expensesPYG || 0) / 7950),
                    utilitiesUSD: 65,
                    cleaningFeeUSD: 45,
                    recurringCleaning: selectedAddons.recurringCleaning,
                    airportTransfer: selectedAddons.airportTransfer
                });

                if (durationDisplay) {
                    durationDisplay.textContent = `${currentStayMonths} meses (${quote.discountPercent}% OFF)`;
                }

                modal.querySelectorAll(".checkout-summary-card").forEach(el => {
                    el.innerHTML = this.buildSummarySnippet(currentCheckoutProperty, quote);
                });

                const footerPrice = modal.querySelector("#checkout-footer-price");
                if (footerPrice) {
                    footerPrice.textContent = `US$ ${quote.totalFirstPaymentUSD.toLocaleString('es-PY')}`;
                }
            };

            if (slider) {
                slider.addEventListener("input", (e) => {
                    currentStayMonths = parseInt(e.target.value, 10);
                    recalculateAll();
                });
            }

            if (cleaningCb) {
                cleaningCb.addEventListener("change", (e) => {
                    selectedAddons.recurringCleaning = e.target.checked;
                    cleaningCb.closest(".upsell-card-label")?.classList.toggle("selected", e.target.checked);
                    recalculateAll();
                });
            }

            if (transferCb) {
                transferCb.addEventListener("change", (e) => {
                    selectedAddons.airportTransfer = e.target.checked;
                    transferCb.closest(".upsell-card-label")?.classList.toggle("selected", e.target.checked);
                    recalculateAll();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener("click", () => {
                    if (currentStep === 1) {
                        this.updateStepView(2);
                        currentStep = 2;
                        prevBtn.style.display = "inline-flex";
                        nextBtn.innerHTML = `<span>Siguiente: Contrato & Pago</span> <i class="fas fa-arrow-right"></i>`;
                    } else if (currentStep === 2) {
                        this.updateStepView(3);
                        currentStep = 3;
                        nextBtn.innerHTML = `<i class="fas fa-check-circle"></i> <span>Confirmar y Pagar Reserva</span>`;
                        nextBtn.className = "btn btn-primary btn-checkout-pay";
                    } else if (currentStep === 3) {
                        // Confirmación exitosa
                        this.completeBooking();
                    }
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener("click", () => {
                    if (currentStep === 3) {
                        this.updateStepView(2);
                        currentStep = 2;
                        nextBtn.innerHTML = `<span>Siguiente: Contrato & Pago</span> <i class="fas fa-arrow-right"></i>`;
                    } else if (currentStep === 2) {
                        this.updateStepView(1);
                        currentStep = 1;
                        prevBtn.style.display = "none";
                        nextBtn.innerHTML = `<span>Siguiente: Verificación KYC</span> <i class="fas fa-arrow-right"></i>`;
                    }
                });
            }
        },

        updateStepView: function (step) {
            document.querySelectorAll(".checkout-step-content").forEach((el, idx) => {
                el.style.display = (idx + 1 === step) ? "block" : "none";
            });

            document.querySelectorAll(".checkout-step-tab").forEach(tab => {
                const s = parseInt(tab.dataset.step, 10);
                tab.classList.toggle("active", s === step);
                tab.classList.toggle("completed", s < step);
            });
        },

        completeBooking: function () {
            this.close();
            
            const successModal = document.createElement("div");
            successModal.className = "modal-container active";
            successModal.innerHTML = `
                <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
                <div class="modal-dialog-large" style="max-width: 500px; text-align: center; padding: 32px 24px;">
                    <div style="width: 72px; height: 72px; background: #ecfdf5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px auto;">
                        <i class="fas fa-circle-check"></i>
                    </div>
                    <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 8px;">¡Reserva Confirmada con Éxito!</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
                        Hemos generado tu contrato digital firmado por Zilla Paraguay. Te enviamos los códigos de acceso inteligente y recibo oficial a tu correo.
                    </p>
                    <div style="background: var(--bg-main); border-radius: var(--radius-md); padding: 14px; text-align: left; font-size: 0.82rem; margin-bottom: 24px; border: 1px solid var(--border-color);">
                        <div><strong>Propiedad:</strong> ${currentCheckoutProperty.title}</div>
                        <div><strong>Estancia:</strong> ${currentStayMonths} Meses</div>
                        <div><strong>Check-in:</strong> Llaves inteligentes vía App Zilla</div>
                    </div>
                    <button class="btn btn-primary btn-block" onclick="this.closest('.modal-container').remove(); window.AuthRolesManager.openTenantBookingsModal();">
                        Ver Mi Panel de Estancias
                    </button>
                </div>
            `;
            document.body.appendChild(successModal);
        }
    };

    window.CheckoutManager = CheckoutManager;
})();
