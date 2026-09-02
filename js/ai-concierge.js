// Zilla AI Concierge 24/7 (Asistente PropTech Inteligente para Inquilinos y Propietarios)
(function () {
    const AIConciergeManager = {
        init: function () {
            this.renderFloatingWidget();
            this.bindEvents();
        },

        renderFloatingWidget: function () {
            if (document.getElementById("ai-concierge-container")) return;

            const container = document.createElement("div");
            container.id = "ai-concierge-container";
            container.innerHTML = `
                <!-- Botón Flotante Launcher -->
                <button id="ai-concierge-launcher" class="ai-launcher-btn" title="Chatear con Zilla AI Concierge">
                    <div class="ai-pulse-ring"></div>
                    <i class="fas fa-sparkles"></i>
                    <span class="ai-launcher-label">AI Concierge</span>
                </button>

                <!-- Ventana de Chat Inteligente -->
                <div id="ai-concierge-chatbox" class="ai-chatbox-window">
                    <div class="ai-chatbox-header">
                        <div class="ai-header-info">
                            <div class="ai-avatar-badge">
                                <i class="fas fa-robot"></i>
                                <span class="ai-status-dot"></span>
                            </div>
                            <div>
                                <div class="ai-bot-name">Zilla AI Concierge</div>
                                <div class="ai-bot-status">Asistente 24/7 • Media Estancia</div>
                            </div>
                        </div>
                        <button class="ai-close-btn" id="ai-close-btn">&times;</button>
                    </div>

                    <!-- Mensajes del Chat -->
                    <div class="ai-chatbox-messages" id="ai-chatbox-messages">
                        <div class="ai-msg bot">
                            <div class="ai-msg-bubble">
                                ¡Hola! 👋 Soy tu <strong>Concierge PropTech de Zilla</strong>. Te ayudo con dudas sobre alquileres de 1 a 11 meses, contratos digitales, velocidad de WiFi o cómo rentabilizar tu propiedad.
                            </div>
                        </div>
                    </div>

                    <!-- Preguntas Frecuentes Rápidas -->
                    <div class="ai-quick-prompts" id="ai-quick-prompts">
                        <button class="ai-chip-btn" data-query="wifi">📶 ¿Qué velocidad de WiFi tienen?</button>
                        <button class="ai-chip-btn" data-query="contract">📄 ¿Cómo funciona el contrato digital?</button>
                        <button class="ai-chip-btn" data-query="foreigners">🌍 Soy extranjero, ¿necesito garante?</button>
                        <button class="ai-chip-btn" data-query="host">🔑 ¿Cómo publicar como propietario?</button>
                    </div>

                    <!-- Formulario de Input -->
                    <form class="ai-chatbox-input-form" id="ai-input-form">
                        <input type="text" id="ai-user-text" placeholder="Pregunta sobre WiFi, contrato, depósitos..." autocomplete="off">
                        <button type="submit" class="ai-send-btn"><i class="fas fa-paper-plane"></i></button>
                    </form>
                </div>
            `;
            document.body.appendChild(container);
        },

        bindEvents: function () {
            const launcher = document.getElementById("ai-concierge-launcher");
            const chatbox = document.getElementById("ai-concierge-chatbox");
            const closeBtn = document.getElementById("ai-close-btn");
            const form = document.getElementById("ai-input-form");
            const input = document.getElementById("ai-user-text");

            if (launcher && chatbox) {
                launcher.addEventListener("click", () => {
                    chatbox.classList.toggle("active");
                });
            }

            if (closeBtn && chatbox) {
                closeBtn.addEventListener("click", () => {
                    chatbox.classList.remove("active");
                });
            }

            if (form && input) {
                form.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const text = input.value.trim();
                    if (!text) return;
                    this.handleUserQuery(text);
                    input.value = "";
                });
            }

            // Chips rápidos
            document.querySelectorAll(".ai-chip-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const queryKey = btn.dataset.query;
                    this.handleQuickQuery(queryKey, btn.textContent);
                });
            });
        },

        open: function () {
            const chatbox = document.getElementById("ai-concierge-chatbox");
            if (chatbox) chatbox.classList.add("active");
        },

        appendMessage: function (sender, htmlContent) {
            const messagesContainer = document.getElementById("ai-chatbox-messages");
            if (!messagesContainer) return;

            const msgEl = document.createElement("div");
            msgEl.className = `ai-msg ${sender}`;
            msgEl.innerHTML = `<div class="ai-msg-bubble">${htmlContent}</div>`;
            messagesContainer.appendChild(msgEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        },

        handleQuickQuery: function (key, buttonText) {
            this.appendMessage("user", buttonText);
            setTimeout(() => {
                let response = "";
                if (key === "wifi") {
                    response = "🚀 <strong>WiFi de Alta Velocidad Garantizado:</strong> Todas las propiedades en Zilla cuentan con fibra óptica dedicada certificada de <strong>300 a 500 Mbps</strong> con router dual-band, ideal para videollamadas Zoom, streaming 4K y trabajo remoto simultáneo.";
                } else if (key === "contract") {
                    response = "📄 <strong>Contratos 100% Digitales:</strong> Emitimos contratos de arrendamiento temporal bajo la Ley Paraguaya N° 6822/21. Puedes firmar desde tu smartphone en 2 minutos sin pisar una escribanía ni pagar comisiones inmobiliarias.";
                } else if (key === "foreigners") {
                    response = "🌍 <strong>Cero Garantes Locales:</strong> Si eres extranjero o nómada digital, solo necesitas tu <strong>Pasaporte vigente</strong> y un comprobante de ingresos o perfil profesional (LinkedIn). No te pedimos codeudor paraguayo.";
                } else if (key === "host") {
                    response = "🔑 <strong>Para Propietarios:</strong> Gestionamos alquileres de 1 a 11 meses para ejecutivos y nómadas con <strong>92% de ocupación promedio</strong> y hasta un 40% más de rentabilidad que el alquiler tradicional. Puedes hacer clic en 'Publicar' para estimar tus ingresos.";
                }
                this.appendMessage("bot", response);
            }, 400);
        },

        handleUserQuery: function (text) {
            this.appendMessage("user", text);
            const lower = text.toLowerCase();

            setTimeout(() => {
                let response = "";
                if (lower.includes("precio") || lower.includes("descuento") || lower.includes("cuanto cuesta")) {
                    response = "💡 <strong>Precios con Descuento Dinámico:</strong> A mayor duración de estancia, menor es la tarifa mensual:<br>• 1-2 meses: Tarifa base<br>• 3-5 meses: <strong>8% OFF</strong><br>• 6-8 meses: <strong>15% OFF</strong><br>• 9-11 meses: <strong>22% OFF</strong>";
                } else if (lower.includes("mascota") || lower.includes("perro") || lower.includes("gato") || lower.includes("pet")) {
                    response = "🐾 <strong>Pet Friendly:</strong> Disponemos de una amplia selección de unidades que aceptan mascotas. Puedes activar el filtro rápido 'Acepta Mascotas' en la barra superior.";
                } else if (lower.includes("factura") || lower.includes("iva") || lower.includes("empresa")) {
                    response = "🏢 <strong>Facturación con IVA:</strong> Emitimos facturas legales con RUC paraguayo o invoices corporativas deducibles para nómadas y empresas internacionales.";
                } else if (lower.includes("limpieza") || lower.includes("cleaning")) {
                    response = "✨ <strong>Servicio de Limpieza:</strong> Todas las estancias incluyen una limpieza profunda final. Además, puedes añadir el servicio de limpieza quincenal por solo US$ 35/mes en el checkout.";
                } else {
                    response = `Entendido. Para tu consulta sobre "${text}", nuestro equipo de soporte humano y concierge local te puede asistir directamente por WhatsApp o puedes iniciar tu reserva online seleccionando la propiedad que más te guste.`;
                }
                this.appendMessage("bot", response);
            }, 450);
        }
    };

    window.AIConciergeManager = AIConciergeManager;
})();
