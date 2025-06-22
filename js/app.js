document.addEventListener('DOMContentLoaded', () => {
    // The 'i18n' constant is now globally available from 'translations.js'
    new InvoiceApp(i18n);
});

class InvoiceApp {
    constructor(i18n) {
        this.i18n = i18n;
        this.state = {};
        this.storageKey = 'invoiceData-v2'; // New key for the updated state structure

        this.initialState = {
            language: 'en',
            companyName: 'Your Company LLC',
            companyAddress: '456 Your Street\nYour City, ST 12345',
            clientName: 'Client Inc.',
            clientAddress: '123 Main Street\nAnytown, USA 54321',
            invoiceNumber: 'INV-001',
            currency: 'USD',
            invoiceDate: Processor.getTodayDate(),
            dueDate: Processor.getDueDateDefault(),
            items: [
                { description: 'Premium Web Development', quantity: 10, rate: 150.00 }
            ],
            discount: '0',
            taxRate: 10,
            paymentLink: '',
            notes: ''
        };

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.populateLanguageSelector();
        this.setLanguage(this.state.language, true); // Set language without re-saving
        this.populateForm();
        this.bindEvents();
        this.updatePreview();
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    bindEvents() {
        // Use event delegation for better performance
        const sidebar = document.querySelector('.sidebar');
        sidebar.addEventListener('input', (e) => {
            if (e.target.id && this.state.hasOwnProperty(e.target.id)) {
                // Clear validation error on input
                e.target.classList.remove('form-input-error');
                this.state[e.target.id] = e.target.value;
                this.updatePreview();
                this.saveToStorage();
            }
        });

        const itemsContainer = document.getElementById('itemsContainer');
        itemsContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('item-input')) {
                const index = e.target.dataset.index;
                const field = e.target.dataset.field;
                this.state.items[index][field] = e.target.value;
                this.updatePreview();
                this.saveToStorage();
            }
        });
        itemsContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-item-btn');
            if (removeBtn) {
                this.removeItem(removeBtn.dataset.index);
            }
        });

        document.getElementById('languageSelector').addEventListener('change', (e) => this.setLanguage(e.target.value));
        document.getElementById('addItemBtn').addEventListener('click', () => this.addItem());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());
        document.getElementById('printBtn').addEventListener('click', () => this.printInvoice());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetForm());
    }

    // ===== DATA & STATE MANAGEMENT =====
    loadFromStorage() {
        const savedData = localStorage.getItem(this.storageKey);
        // Deep merge to ensure new properties from initialState are added to old saved states
        this.state = savedData 
            ? { ...this.initialState, ...JSON.parse(savedData) } 
            : { ...this.initialState };
            
        // Set default note if empty
        if(!this.state.notes) {
            this.state.notes = this.i18n[this.state.language || 'en'].notesPlaceholder;
        }

        if (!Array.isArray(this.state.items) || this.state.items.length === 0) {
            this.state.items = [{ description: '', quantity: 1, rate: 0 }];
        }
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }

    resetForm() {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            const currentLang = this.state.language;
            localStorage.removeItem(this.storageKey);
            this.loadFromStorage();
            this.state.language = currentLang; // Preserve language
            this.saveToStorage();
            this.populateForm();
            this.updatePreview();
        }
    }

    // ===== I18N - MULTILINGUAL =====
    populateLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        selector.innerHTML = '';
        for (const langCode in this.i18n) {
            const option = document.createElement('option');
            option.value = langCode;
            option.textContent = this.i18n[langCode].langName;
            selector.appendChild(option);
        }
        selector.value = this.state.language;
    }

    setLanguage(langCode, isInitialization = false) {
        this.state.language = langCode;
        document.documentElement.lang = langCode;
        if (!isInitialization) {
            this.saveToStorage();
        }
        this.applyTranslations();
        this.updatePreview();
    }

    applyTranslations() {
        const lang = this.state.language;
        const translations = this.i18n[lang];
        const fallback = this.i18n['en'];

        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            const key = el.dataset.i18nKey;
            el.textContent = translations[key] || fallback[key];
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = translations[key] || fallback[key];
        });
    }

    // ===== DOM POPULATION & RENDERING =====
    populateForm() {
        for (const key in this.state) {
            const el = document.getElementById(key);
            if (el && typeof this.state[key] !== 'object') {
                el.value = this.state[key];
            }
        }
        this.renderItems();
    }

    renderItems() {
        const container = document.getElementById('itemsContainer');
        container.innerHTML = '';
        this.state.items.forEach((item, index) => {
            const itemRow = document.createElement('div');
            itemRow.className = 'item-row';
            const placeholder = this.i18n[this.state.language].description || this.i18n['en'].description;
            itemRow.innerHTML = `
                <input type="text" class="item-input" data-index="${index}" data-field="description" value="${item.description}" placeholder="${placeholder}...">
                <input type="number" class="item-input" data-index="${index}" data-field="quantity" value="${item.quantity}" min="0">
                <input type="number" class="item-input" data-index="${index}" data-field="rate" value="${item.rate}" min="0" step="0.01">
                <button class="remove-item-btn" data-index="${index}" title="Remove Item">&times;</button>
            `;
            container.appendChild(itemRow);
        });
    }

    updatePreview() {
        const t = this.i18n[this.state.language];
        const fallback = this.i18n['en'];

        // Update headers
        document.getElementById('previewLogo').textContent = this.state.companyName.substring(0, 3).toUpperCase();
        document.getElementById('previewCompanyName').textContent = this.state.companyName;
        document.getElementById('previewInvoiceNumber').textContent = `#${this.state.invoiceNumber}`;
        document.getElementById('previewInvoiceDate').innerHTML = `<strong>${t.issueDate || fallback.issueDate}:</strong> ${Processor.formatDate(this.state.invoiceDate)}`;
        document.getElementById('previewDueDate').innerHTML = `<strong>${t.dueDate || fallback.dueDate}:</strong> ${Processor.formatDate(this.state.dueDate)}`;
        
        document.getElementById('previewCompanyAddress').innerHTML = `<div class="name">${this.state.companyName}</div>${this.state.companyAddress.replace(/\n/g, '<br>')}`;
        document.getElementById('previewClientAddress').innerHTML = `<div class="name">${this.state.clientName}</div>${this.state.clientAddress.replace(/\n/g, '<br>')}`;

        // Update items table header
        document.getElementById('invoiceTableHeader').innerHTML = `
            <tr>
                <th>${t.description || fallback.description}</th>
                <th class="text-center">${t.qty || fallback.qty}</th>
                <th class="text-right">${t.price || fallback.price}</th>
                <th class="text-right">${t.pdfAmount || fallback.pdfAmount}</th>
            </tr>`;
        
        // Update items table body
        const tableBody = document.getElementById('invoiceTableBody');
        tableBody.innerHTML = '';
        this.state.items.forEach(item => {
            const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="item-description">${item.description || ''}</td>
                <td class="text-center">${item.quantity || 0}</td>
                <td class="text-right">${Processor.formatCurrency(item.rate || 0, this.state.currency)}</td>
                <td class="text-right">${Processor.formatCurrency(amount, this.state.currency)}</td>`;
        });

        const totals = this.calculateTotals();
        document.getElementById('subtotalAmount').textContent = Processor.formatCurrency(totals.subtotal, this.state.currency);
        document.getElementById('totalAmount').textContent = Processor.formatCurrency(totals.total, this.state.currency);
        this.toggleRow('discountRow', 'discountAmount', totals.discount, `-`);
        this.toggleRow('taxRow', 'taxAmount', totals.tax);
        
        const footer = document.getElementById('invoiceFooter');
        const notesP = document.getElementById('previewNotes');
        if (this.state.notes.trim()) {
            notesP.textContent = this.state.notes;
            footer.style.display = 'block';
        } else {
            footer.style.display = 'none';
        }
        
        const linkWrapper = document.getElementById('previewPaymentLinkWrapper');
        const linkEl = document.getElementById('previewPaymentLink');
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        if(this.state.paymentLink && urlRegex.test(this.state.paymentLink)) {
            linkEl.href = this.state.paymentLink;
            linkWrapper.style.display = 'block';
        } else {
            linkWrapper.style.display = 'none';
        }
    }

    toggleRow(rowId, amountId, value, prefix = '') {
        const row = document.getElementById(rowId);
        if (value > 0) {
            row.style.display = 'flex';
            document.getElementById(amountId).textContent = `${prefix}${Processor.formatCurrency(value, this.state.currency)}`;
        } else {
            row.style.display = 'none';
        }
    }

    addItem() {
        this.state.items.push({ description: '', quantity: 1, rate: 0 });
        this.renderItems();
        this.updatePreview();
        this.saveToStorage();
    }

    removeItem(index) {
        if (this.state.items.length > 1) {
            this.state.items.splice(index, 1);
            this.renderItems();
            this.updatePreview();
            this.saveToStorage();
        }
    }

    calculateTotals() {
        const subtotal = this.state.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
        const discountAmount = Processor.parseDiscount(this.state.discount, subtotal);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = (subtotalAfterDiscount * (Number(this.state.taxRate) || 0)) / 100;
        const total = subtotalAfterDiscount + taxAmount;
        return { subtotal, discount: discountAmount, tax: taxAmount, total };
    }
    
    // ===== ACTIONS (PDF, PRINT) =====
    validateForm() {
        const clientNameInput = document.getElementById('clientName');
        if (!this.state.clientName.trim()) {
            clientNameInput.classList.add('form-input-error');
            clientNameInput.focus();
            return false;
        }
        clientNameInput.classList.remove('form-input-error');
        return true;
    }

    setButtonLoading(btn, isLoading) {
        btn.disabled = isLoading;
        btn.classList.toggle('loading', isLoading);
    }
    
    async createPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const totals = this.calculateTotals();
        const t = this.i18n[this.state.language] || this.i18n['en'];
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // IMPORTANT: jsPDF's default fonts have limited Unicode support.
        // For full character support in languages like Japanese, Chinese, or Russian,
        // you would need to embed a custom font that includes those character sets.
        // This is an advanced feature beyond this scope. We will proceed with 'helvetica'.
        doc.setFont('helvetica');

        doc.setFontSize(20);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'bold');
        doc.text(this.state.companyName, 20, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(this.state.companyAddress.replace(/, /g, '\n'), 20, 28);
    
        doc.setFontSize(24);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'bold');
        doc.text(t.pdfInvoice.toUpperCase(), pageWidth - 20, 20, { align: 'right' });
        doc.setFontSize(10);
        doc.text(`#${this.state.invoiceNumber}`, pageWidth - 20, 28, { align: 'right' });
    
        doc.line(20, 45, pageWidth - 20, 45);
    
        let yPos = 55;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150);
        doc.text(t.pdfBillTo.toUpperCase(), 20, yPos);
        doc.setTextColor(17, 24, 39);
        doc.text(this.state.clientName, 20, yPos + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(this.state.clientAddress, 20, yPos + 14);
    
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150);
        doc.text(t.pdfDateIssued.toUpperCase(), pageWidth / 2, yPos);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'normal');
        doc.text(Processor.formatDate(this.state.invoiceDate), pageWidth / 2, yPos + 7);
    
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150);
        doc.text(t.pdfDueDate.toUpperCase(), pageWidth / 1.5, yPos);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'normal');
        doc.text(Processor.formatDate(this.state.dueDate), pageWidth / 1.5, yPos + 7);
    
        const tableBody = this.state.items.map(item => [
            item.description || '', String(item.quantity || 0),
            Processor.formatCurrency(item.rate || 0, this.state.currency),
            Processor.formatCurrency((Number(item.quantity) || 0) * (Number(item.rate) || 0), this.state.currency)
        ]);
    
        doc.autoTable({
            head: [[t.pdfDescription, t.pdfQuantity, t.pdfUnitPrice, t.pdfAmount]],
            body: tableBody,
            startY: yPos + 30,
            theme: 'striped',
            headStyles: { fillColor: [22, 34, 57], font: 'helvetica', fontStyle: 'bold' },
            styles: { font: 'helvetica' },
        });
    
        let finalY = doc.autoTable.previous.finalY + 15;
        const addTotalRow = (label, value) => {
            doc.setFontSize(10);
            doc.text(label, pageWidth - 60, finalY, { align: 'left' });
            doc.text(value, pageWidth - 20, finalY, { align: 'right' });
            finalY += 7;
        };
    
        addTotalRow(t.pdfSubtotal, Processor.formatCurrency(totals.subtotal, this.state.currency));
        if (totals.discount > 0) addTotalRow(t.pdfDiscount, `-${Processor.formatCurrency(totals.discount, this.state.currency)}`);
        if (totals.tax > 0) addTotalRow(t.pdfTax, Processor.formatCurrency(totals.tax, this.state.currency));
        
        doc.setLineWidth(0.5);
        doc.line(pageWidth - 65, finalY, pageWidth - 20, finalY);
        finalY += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        addTotalRow(t.pdfTotal, Processor.formatCurrency(totals.total, this.state.currency));
    
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        if(this.state.paymentLink && urlRegex.test(this.state.paymentLink)) {
            finalY += 10;
            doc.setFontSize(11);
            doc.setTextColor(47, 128, 237); // A nice blue for the link
            doc.textWithLink(t.pdfPayOnline, 20, finalY, { url: this.state.paymentLink });
            doc.setTextColor(17, 24, 39);
        }

        if (this.state.notes) {
            finalY += (this.state.paymentLink && urlRegex.test(this.state.paymentLink)) ? 10 : 20;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(t.pdfNotes, 20, finalY);
            doc.setFont('helvetica', 'normal');
            doc.text(this.state.notes, 20, finalY + 7, { maxWidth: pageWidth - 40 });
        }
    
        return doc;
    }

    async downloadPDF() {
        if (!this.validateForm()) return;
        const btn = document.getElementById('downloadBtn');
        this.setButtonLoading(btn, true);
        try {
            const doc = await this.createPDF();
            doc.save(`Invoice-${this.state.invoiceNumber}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
        } finally {
            this.setButtonLoading(btn, false);
        }
    }

    async printInvoice() {
        if (!this.validateForm()) return;
        const btn = document.getElementById('printBtn');
        this.setButtonLoading(btn, true);
        try {
            const doc = await this.createPDF();
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } catch (error) {
            console.error('Print failed:', error);
        } finally {
            this.setButtonLoading(btn, false);
        }
    }
}
