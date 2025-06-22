const Processor = {
    currencySymbols: {
        USD: '$',
        EUR: '€',
        GBP: '£',
        CAD: 'C$'
    },

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    },

    getDueDateDefault() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    },

    formatCurrency(amount, currency = 'USD') {
        const symbol = this.currencySymbols[currency] || '$';
        const value = Number(amount).toFixed(2);
        return `${symbol}${value}`;
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        // A simple timezone offset fix
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const correctedDate = new Date(date.getTime() + userTimezoneOffset);
        return correctedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    },

    parseDiscount(discountInput, subtotal) {
        if (!discountInput || subtotal <= 0) return 0;

        const input = String(discountInput).trim();
        if (input.includes('%')) {
            const percentage = parseFloat(input.replace(/[^0-9.]/g, ''));
            return isNaN(percentage) ? 0 : (subtotal * percentage) / 100;
        } else {
            const amount = parseFloat(input.replace(/[^0-9.]/g, ''));
            return isNaN(amount) ? 0 : amount;
        }
    }
};
