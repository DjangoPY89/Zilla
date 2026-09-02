// Módulo de conversión de moneda USD <-> Guaraníes (PYG)
// Cotización de referencia para Paraguay: 1 USD = 7.950 PYG
(function () {
    const USD_TO_PYG_RATE = 7950;
    let currentCurrency = localStorage.getItem("zilla_currency") || "USD"; // 'USD' | 'PYG'

    const CurrencyManager = {
        rate: USD_TO_PYG_RATE,

        getCurrency: function () {
            return currentCurrency;
        },

        setCurrency: function (currency) {
            if (currency === "USD" || currency === "PYG") {
                currentCurrency = currency;
                localStorage.setItem("zilla_currency", currency);
                document.querySelectorAll(".currency-toggle-btn").forEach(btn => {
                    btn.classList.toggle("active", btn.dataset.currency === currency);
                });
                // Disparar evento personalizado para actualizar toda la UI
                window.dispatchEvent(new CustomEvent("currencyChanged", { detail: { currency } }));
            }
        },

        toggleCurrency: function () {
            const next = currentCurrency === "USD" ? "PYG" : "USD";
            this.setCurrency(next);
        },

        formatPrice: function (usdAmount, pygAmount) {
            if (currentCurrency === "USD") {
                const amount = usdAmount || (pygAmount / USD_TO_PYG_RATE);
                return `US$ ${Math.round(amount).toLocaleString('es-PY')}`;
            } else {
                const amount = pygAmount || (usdAmount * USD_TO_PYG_RATE);
                return `₲ ${Math.round(amount).toLocaleString('es-PY')}`;
            }
        },

        formatCompactPrice: function (usdAmount, pygAmount) {
            if (currentCurrency === "USD") {
                const val = usdAmount || (pygAmount / USD_TO_PYG_RATE);
                if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `$${Math.round(val / 1000)}k`;
                return `$${Math.round(val)}`;
            } else {
                const val = pygAmount || (usdAmount * USD_TO_PYG_RATE);
                if (val >= 1000000000) return `₲ ${(val / 1000000000).toFixed(1)}B`;
                if (val >= 1000000) return `₲ ${Math.round(val / 1000000)}M`;
                return `₲ ${Math.round(val / 1000)}k`;
            }
        },

        toUSD: function (amountInCurrent) {
            if (currentCurrency === "USD") return Number(amountInCurrent);
            return Number(amountInCurrent) / USD_TO_PYG_RATE;
        },

        toCurrent: function (usdAmount) {
            if (currentCurrency === "USD") return Number(usdAmount);
            return Number(usdAmount) * USD_TO_PYG_RATE;
        }
    };

    window.CurrencyManager = CurrencyManager;
})();
