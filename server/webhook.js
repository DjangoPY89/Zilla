// Integración de Webhooks con Google Sheets (vía Google Apps Script)
// Envía leads de inquilinos y propietarios a hojas de cálculo en tiempo real

const GOOGLE_APPS_SCRIPT_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbx_EXAMPLEReqZillaFlexWebhook/exec";

/**
 * Envía un lead de reserva o contacto a Google Sheets
 * @param {Object} payload Datos del lead (Nombre, Email, WhatsApp, Estancia, Propiedad, Presupuesto, Rol)
 */
async function sendLeadToGoogleSheets(payload) {
    try {
        console.log(`📤 [Webhook] Enviando lead a Google Sheets:`, payload);

        // Si no hay URL configurada en producción, simulamos éxito en desarrollo
        if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
            console.log(`⚡ [Webhook Mock] Webhook registrado en memoria. Configura GOOGLE_SHEETS_WEBHOOK_URL en producción.`);
            return { success: true, mocked: true };
        }

        const response = await fetch(GOOGLE_APPS_SCRIPT_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                ...payload
            })
        });

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("❌ [Webhook Error] Error enviando lead a Google Sheets:", error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendLeadToGoogleSheets
};
