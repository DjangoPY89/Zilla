// Servidor Backend Node.js / Express para Zilla Flex
const express = require("express");
const cors = require("cors");
const { sendLeadToGoogleSheets } = require("./webhook");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint de salud
app.get("/api/health", (req, res) => {
    res.json({
        status: "online",
        platform: "Zilla Flex Mid-Term Rentals API",
        timestamp: new Date().toISOString()
    });
});

// Endpoint para calcular cotización dinámica de media estancia
app.post("/api/pricing/quote", (req, res) => {
    const { basePriceUSD, months, options } = req.body;
    const m = Math.max(1, Math.min(11, parseInt(months, 10) || 1));

    let discountPercent = 0;
    if (m >= 9) discountPercent = 0.22;
    else if (m >= 6) discountPercent = 0.15;
    else if (m >= 3) discountPercent = 0.08;

    const monthlyRentUSD = Math.round(basePriceUSD * (1 - discountPercent));
    const totalRentUSD = monthlyRentUSD * m;
    const totalSavingsUSD = (basePriceUSD * m) - totalRentUSD;

    res.json({
        months: m,
        discountPercent: Math.round(discountPercent * 100),
        baseMonthlyUSD: basePriceUSD,
        monthlyRentUSD: monthlyRentUSD,
        totalRentUSD: totalRentUSD,
        totalSavingsUSD: totalSavingsUSD,
        securityDepositUSD: monthlyRentUSD,
        cleaningFeeUSD: 45,
        estimatedUtilitiesUSD: 65
    });
});

// Endpoint para registrar solicitud de reserva y notificar webhook
app.post("/api/bookings", async (req, res) => {
    const { propertyId, guestName, guestEmail, guestPhone, months, startMonth, totalPriceUSD, paymentMethod } = req.body;

    if (!propertyId || !guestName || !guestEmail) {
        return res.status(400).json({ error: "Faltan datos obligatorios para la reserva." });
    }

    const bookingRecord = {
        bookingId: `BK-${Date.now().toString().slice(-6)}`,
        propertyId,
        guestName,
        guestEmail,
        guestPhone,
        months,
        startMonth,
        totalPriceUSD,
        paymentMethod,
        status: "confirmed",
        createdAt: new Date().toISOString()
    };

    // Notificar a Google Sheets vía Webhook
    await sendLeadToGoogleSheets({
        type: "NEW_BOOKING",
        ...bookingRecord
    });

    res.status(201).json({
        success: true,
        message: "¡Reserva procesada exitosamente en Zilla Flex!",
        booking: bookingRecord
    });
});

// Endpoint para capturar leads de propietarios interesados
app.post("/api/hosts/leads", async (req, res) => {
    const { hostName, hostEmail, hostPhone, propertyType, neighborhood, estimatedMonthlyUSD } = req.body;

    const hostLead = {
        type: "HOST_LEAD",
        hostName,
        hostEmail,
        hostPhone,
        propertyType,
        neighborhood,
        estimatedMonthlyUSD,
        createdAt: new Date().toISOString()
    };

    await sendLeadToGoogleSheets(hostLead);

    res.status(201).json({
        success: true,
        message: "¡Registro de propietario recibido! Te contactaremos para verificar tu unidad.",
        lead: hostLead
    });
});

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`🚀 [Zilla Flex Server] API corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
