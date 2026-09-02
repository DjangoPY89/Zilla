// Motor de Precios Dinámicos para Alquileres de Media Estancia (1 a 11 meses)
// Aplica curva de descuento matemáticamente decreciente según la duración de la estancia
(function () {
    const PricingEngine = {
        /**
         * Curva de descuentos según duración:
         * 1 - 2 meses: Tarifa Base (0% OFF)
         * 3 - 5 meses: 8% OFF mensual
         * 6 - 8 meses: 15% OFF mensual
         * 9 - 11 meses: 22% OFF mensual
         */
        getDiscountRate: function (months) {
            const m = parseInt(months, 10) || 1;
            if (m >= 9) return 0.22;
            if (m >= 6) return 0.15;
            if (m >= 3) return 0.08;
            return 0.0;
        },

        getDiscountLabel: function (months) {
            const rate = this.getDiscountRate(months);
            if (rate > 0) {
                return `${Math.round(rate * 100)}% de Descuento por Estancia Flexible`;
            }
            return "Tarifa Base";
        },

        /**
         * Calcula el desglose completo mensual y total de la estancia
         */
        calculateQuote: function (baseMonthlyUSD, months, options = {}) {
            const m = Math.max(1, Math.min(11, parseInt(months, 10) || 1));
            const discountRate = this.getDiscountRate(m);
            const rate = (window.CurrencyManager && window.CurrencyManager.rate) || 7950;

            // Precios de alquiler
            const discountedMonthlyUSD = Math.round(baseMonthlyUSD * (1 - discountRate));
            const discountedMonthlyPYG = Math.round(discountedMonthlyUSD * rate);

            const originalTotalUSD = baseMonthlyUSD * m;
            const totalRentUSD = discountedMonthlyUSD * m;
            const totalRentPYG = Math.round(totalRentUSD * rate);
            const totalSavingsUSD = originalTotalUSD - totalRentUSD;
            const totalSavingsPYG = Math.round(totalSavingsUSD * rate);

            // Costos Fijos & Servicios Transparentes
            const expensesMonthlyUSD = options.expensesUSD || 0;
            const utilitiesMonthlyUSD = options.utilitiesUSD || 65; // Luz + Fibra Óptica 300Mbps estimada
            const exitCleaningFeeUSD = options.cleaningFeeUSD || 45; // Tarifa única de salida
            const securityDepositUSD = discountedMonthlyUSD; // 1 mes de depósito reembolsable

            // Upsells opcionales
            let recurringCleaningTotalUSD = 0;
            if (options.recurringCleaning) {
                // $35/mes por limpieza quincenal
                recurringCleaningTotalUSD = 35 * m;
            }

            let airportTransferUSD = 0;
            if (options.airportTransfer) {
                airportTransferUSD = 30;
            }

            const totalFirstPaymentUSD = discountedMonthlyUSD + expensesMonthlyUSD + utilitiesMonthlyUSD + exitCleaningFeeUSD + securityDepositUSD + airportTransferUSD + (options.recurringCleaning ? 35 : 0);
            const totalContractUSD = totalRentUSD + ((expensesMonthlyUSD + utilitiesMonthlyUSD) * m) + exitCleaningFeeUSD + securityDepositUSD + recurringCleaningTotalUSD + airportTransferUSD;

            return {
                months: m,
                discountPercent: Math.round(discountRate * 100),
                baseMonthlyUSD: baseMonthlyUSD,
                baseMonthlyPYG: Math.round(baseMonthlyUSD * rate),
                monthlyRentUSD: discountedMonthlyUSD,
                monthlyRentPYG: discountedMonthlyPYG,
                totalRentUSD: totalRentUSD,
                totalRentPYG: totalRentPYG,
                totalSavingsUSD: totalSavingsUSD,
                totalSavingsPYG: totalSavingsPYG,
                expensesMonthlyUSD: expensesMonthlyUSD,
                utilitiesMonthlyUSD: utilitiesMonthlyUSD,
                exitCleaningFeeUSD: exitCleaningFeeUSD,
                securityDepositUSD: securityDepositUSD,
                recurringCleaningTotalUSD: recurringCleaningTotalUSD,
                airportTransferUSD: airportTransferUSD,
                totalFirstPaymentUSD: totalFirstPaymentUSD,
                totalFirstPaymentPYG: Math.round(totalFirstPaymentUSD * rate),
                totalContractUSD: totalContractUSD,
                totalContractPYG: Math.round(totalContractUSD * rate)
            };
        }
    };

    window.PricingEngine = PricingEngine;
})();
