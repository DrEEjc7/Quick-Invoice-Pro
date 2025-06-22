document.addEventListener('DOMContentLoaded', () => {
    new InvoiceApp(i18n, registerNormalFont);
});

class InvoiceApp {
    constructor(i18n, registerFont) {
        this.i18n = i18n;
        this.registerFont = registerFont;
        this.state = {};
        this.storageKey = 'invoiceData-v3';

        this.initialState = {
            language: 'en',
            companyName: 'Your Company LLC',
            companyAddress: '456 Your Street\nYour City, ST 12345',
            companyLogo: null,
            clientName: 'Client Inc.',
            clientAddress: '123 Main Street\nAnytown, USA 54321',
            invoiceNumber: 'INV-001',
            currency: 'USD',
            invoiceDate: Processor.getTodayDate(),
            dueDate: Processor.getDueDateDefault(),
            items: [{ description: 'Premium Web Development', quantity: 10, rate: 150.00 }],
            discount: '0',
            taxRate: 10,
            paymentLink: '',
            notes: '',
            signatureImage: null,
        };

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.populateLanguageSelector();
        this.setLanguage(this.state.language, true);
        this.populateForm();
        this.bindEvents();
        this.updatePreview();
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    bindEvents() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.addEventListener('input', (e) => {
            if (e.target.id && this.state.hasOwnProperty(e.target.id)) {
                if (e.target.type !== 'file') {
                    e.target.classList.remove('form-input-error');
                    this.state[e.target.id] = e.target.value;
                    this.updatePreview();
                    this.saveToStorage();
                }
            }
        });

        document.getElementById('logoUpload').addEventListener('change', (e) => this.handleImageUpload(e, 'companyLogo'));
        document.getElementById('signatureUpload').addEventListener('change', (e) => this.handleImageUpload(e, 'signatureImage'));
        document.getElementById('removeLogoBtn').addEventListener('click', () => this.removeImage('companyLogo'));
        document.getElementById('removeSignatureBtn').addEventListener('click', () => this.removeImage('signatureImage'));

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
            if (removeBtn) this.removeItem(removeBtn.dataset.index);
        });

        document.getElementById('languageSelector').addEventListener('change', (e) => this.setLanguage(e.target.value));
        document.getElementById('addItemBtn').addEventListener('click', () => this.addItem());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());
        document.getElementById('printBtn').addEventListener('click', () => this.printInvoice());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetForm());
    }

    loadFromStorage() {
        const savedData = localStorage.getItem(this.storageKey);
        this.state = savedData ? { ...this.initialState, ...JSON.parse(savedData) } : { ...this.initialState };
        if (!this.state.notes) {
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
        const t = this.i18n[this.state.language] || this.i18n['en'];
        if (confirm(t.resetConfirmation || 'Are you sure you want to reset the form? All data will be lost.')) {
            const currentLang = this.state.language;
            localStorage.removeItem(this.storageKey);
            this.loadFromStorage();
            this.state.language = currentLang;
            this.saveToStorage();
            this.populateForm();
            this.updatePreview();
        }
    }

    handleImageUpload(event, stateKey) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large. Please select an image smaller than 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            this.state[stateKey] = e.target.result;
            this.updatePreview();
            this.saveToStorage();
        };
        reader.readAsDataURL(file);
    }

    removeImage(stateKey) {
        this.state[stateKey] = null;
        this.updatePreview();
        this.saveToStorage();
    }
    
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
            if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[key] || fallback[key];
            } else {
                el.textContent = translations[key] || fallback[key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = translations[key] || fallback[key];
        });
    }

    populateForm() {
        Object.keys(this.state).forEach(key => {
            const el = document.getElementById(key);
            if (el && typeof this.state[key] !== 'object' && el.type !== 'file') {
                el.value = this.state[key];
            }
        });
        this.renderItems();
    }

    renderItems() {
        const container = document.getElementById('itemsContainer');
        container.innerHTML = '';
        const t = this.i18n[this.state.language] || this.i18n['en'];
        this.state.items.forEach((item, index) => {
            const itemRow = document.createElement('div');
            itemRow.className = 'item-row';
            itemRow.innerHTML = `
                <input type="text" class="item-input" data-index="${index}" data-field="description" value="${item.description}" placeholder="${t.description}...">
                <input type="number" class="item-input" data-index="${index}" data-field="quantity" value="${item.quantity}" min="0">
                <input type="number" class="item-input" data-index="${index}" data-field="rate" value="${item.rate}" min="0" step="0.01">
                <button type="button" class="remove-item-btn" data-index="${index}" title="Remove Item">&times;</button>
            `;
            container.appendChild(itemRow);
        });
    }

    updatePreview() {
        const t = this.i18n[this.state.language] || this.i18n['en'];
        document.getElementById('previewCompanyName').textContent = this.state.companyName;
        document.getElementById('previewInvoiceNumber').textContent = `#${this.state.invoiceNumber}`;
        document.getElementById('previewInvoiceDate').innerHTML = `<strong>${t.issueDate}:</strong> ${Processor.formatDate(this.state.invoiceDate)}`;
        document.getElementById('previewDueDate').innerHTML = `<strong>${t.dueDate}:</strong> ${Processor.formatDate(this.state.dueDate)}`;
        document.getElementById('previewCompanyAddress').innerHTML = `<div class="name">${this.state.companyName}</div>${this.state.companyAddress.replace(/\n/g, '<br>')}`;
        document.getElementById('previewClientAddress').innerHTML = `<div class="name">${this.state.clientName}</div>${this.state.clientAddress.replace(/\n/g, '<br>')}`;
        
        document.getElementById('invoiceTableHeader').innerHTML = `
            <tr><th>${t.description}</th><th class="text-center">${t.qty}</th><th class="text-right">${t.price}</th><th class="text-right">${t.pdfAmount}</th></tr>`;
        
        const tableBody = document.getElementById('invoiceTableBody');
        tableBody.innerHTML = '';
        this.state.items.forEach(item => {
            const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
            tableBody.insertRow().innerHTML = `
                <td class="item-description">${item.description || ''}</td><td class="text-center">${item.quantity || 0}</td>
                <td class="text-right">${Processor.formatCurrency(item.rate || 0, this.state.currency)}</td><td class="text-right">${Processor.formatCurrency(amount, this.state.currency)}</td>`;
        });

        const totals = this.calculateTotals();
        document.getElementById('subtotalAmount').textContent = Processor.formatCurrency(totals.subtotal, this.state.currency);
        document.getElementById('totalAmount').textContent = Processor.formatCurrency(totals.total, this.state.currency);
        this.toggleRow('discountRow', 'discountAmount', totals.discount, `-`);
        this.toggleRow('taxRow', 'taxAmount', totals.tax);
        
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        this.toggleElement('previewPaymentLinkWrapper', this.state.paymentLink && urlRegex.test(this.state.paymentLink), (el) => {
            document.getElementById('previewPaymentLink').href = this.state.paymentLink;
        });
        
        this.toggleElement('notesSection', this.state.notes.trim(), (el) => {
            document.getElementById('previewNotes').textContent = this.state.notes;
        });

        const logoPreview = document.getElementById('logoPreview');
        const logoContainer = logoPreview.closest('.image-upload-wrapper');
        const previewLogoImg = document.getElementById('previewLogo');
        const previewLogoText = document.getElementById('previewLogoText');
        if (this.state.companyLogo) {
            logoPreview.src = this.state.companyLogo;
            logoContainer.classList.add('has-image');
            previewLogoImg.src = this.state.companyLogo;
            previewLogoImg.style.display = 'block';
            previewLogoText.style.display = 'none';
        } else {
            logoPreview.src = '';
            logoContainer.classList.remove('has-image');
            previewLogoImg.style.display = 'none';
            previewLogoText.style.display = 'flex';
            previewLogoText.textContent = this.state.companyName.substring(0, 3).toUpperCase();
        }

        const signaturePreview = document.getElementById('signaturePreview');
        const signatureContainer = signaturePreview.closest('.image-upload-wrapper');
        this.toggleElement('signatureSection', this.state.signatureImage, (el) => {
            signaturePreview.src = this.state.signatureImage;
            signatureContainer.classList.add('has-image');
            document.getElementById('previewSignature').src = this.state.signatureImage;
        }, () => {
            signaturePreview.src = '';
            signatureContainer.classList.remove('has-image');
        });
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
    
    toggleElement(elementId, condition, onTrue, onFalse) {
        const el = document.getElementById(elementId);
        if (condition) {
            el.style.display = 'block';
            if(onTrue) onTrue(el);
        } else {
            el.style.display = 'none';
            if(onFalse) onFalse(el);
        }
    }

    addItem() {
        this.state.items.push({ description: '', quantity: 1, rate: 0 });
        this.renderItems(); this.updatePreview(); this.saveToStorage();
    }

    removeItem(index) {
        if (this.state.items.length > 1) {
            this.state.items.splice(index, 1);
            this.renderItems(); this.updatePreview(); this.saveToStorage();
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
        if (!this.validateForm()) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        this.registerFont(doc); // Apply custom font for Unicode support
        const t = this.i18n[this.state.language] || this.i18n['en'];
        const pageWidth = doc.internal.pageSize.getWidth();
        const totals = this.calculateTotals();
        let finalY;

        // Header
        if (this.state.companyLogo) {
            try {
                const imgType = this.state.companyLogo.split(';')[0].split('/')[1].toUpperCase();
                doc.addImage(this.state.companyLogo, imgType, 15, 15, 30, 15);
                doc.setFontSize(18);
                doc.setFont(undefined, 'bold');
                doc.text(this.state.companyName, 50, 25);
            } catch(e) { console.error("Error adding logo to PDF:", e); }
        } else {
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text(this.state.companyName, 20, 25);
        }
    
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text(t.pdfInvoice.toUpperCase(), pageWidth - 20, 25, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`#${this.state.invoiceNumber}`, pageWidth - 20, 32, { align: 'right' });
    
        doc.line(15, 45, pageWidth - 15, 45);
    
        // Billing Info & Dates
        let yPos = 55;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100);
        doc.text(t.pdfBillTo.toUpperCase(), 20, yPos);
        doc.text(t.pdfDateIssued.toUpperCase(), pageWidth / 2, yPos);
        doc.text(t.pdfDueDate.toUpperCase(), pageWidth / 1.5, yPos);
        
        doc.setTextColor(0);
        doc.setFont(undefined, 'normal');
        doc.text(this.state.clientName, 20, yPos + 7);
        doc.text(this.state.clientAddress, 20, yPos + 12);
        doc.text(Processor.formatDate(this.state.invoiceDate), pageWidth / 2, yPos + 7);
        doc.text(Processor.formatDate(this.state.dueDate), pageWidth / 1.5, yPos + 7);
    
        // Items Table
        const tableBody = this.state.items.map(item => [item.description, item.quantity, Processor.formatCurrency(item.rate, this.state.currency), Processor.formatCurrency(item.quantity * item.rate, this.state.currency)]);
        doc.autoTable({
            head: [[t.pdfDescription, t.pdfQuantity, t.pdfUnitPrice, t.pdfAmount]],
            body: tableBody,
            startY: yPos + 25,
            theme: 'striped',
            headStyles: { fillColor: [22, 34, 57], font: 'NotoSans', fontStyle: 'bold' },
        });
        finalY = doc.autoTable.previous.finalY;

        // Totals
        const addTotalRow = (label, value, isBold = false) => {
            finalY += (isBold ? 8 : 6);
            doc.setFontSize(isBold ? 12 : 10);
            doc.setFont(undefined, isBold ? 'bold' : 'normal');
            doc.text(label, pageWidth - 80, finalY, { align: 'right' });
            doc.text(value, pageWidth - 20, finalY, { align: 'right' });
        };
        addTotalRow(t.pdfSubtotal, Processor.formatCurrency(totals.subtotal, this.state.currency));
        if (totals.discount > 0) addTotalRow(t.pdfDiscount, `-${Processor.formatCurrency(totals.discount, this.state.currency)}`);
        if (totals.tax > 0) addTotalRow(t.pdfTax, `${Processor.formatCurrency(totals.tax, this.state.currency)} (${this.state.taxRate}%)`);
        finalY += 2;
        doc.line(pageWidth - 85, finalY, pageWidth - 15, finalY);
        addTotalRow(t.pdfTotal, Processor.formatCurrency(totals.total, this.state.currency), true);

        // Footer Section
        let footerY = 240;
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        if (this.state.paymentLink && urlRegex.test(this.state.paymentLink)) {
            doc.setFontSize(11);
            doc.setTextColor(47, 128, 237);
            doc.textWithLink(t.pdfPayOnline, 20, footerY, { url: this.state.paymentLink });
            doc.setTextColor(0);
            footerY += 10;
        }

        if (this.state.notes) {
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.text(t.pdfNotes, 20, footerY);
            doc.setFont(undefined, 'normal');
            doc.text(this.state.notes, 20, footerY + 5, { maxWidth: pageWidth / 2 - 30 });
        }

        if (this.state.signatureImage) {
            try {
                const imgType = this.state.signatureImage.split(';')[0].split('/')[1].toUpperCase();
                doc.setFont(undefined, 'bold');
                doc.text(t.pdfSignature, pageWidth / 2, footerY);
                doc.addImage(this.state.signatureImage, imgType, pageWidth / 2, footerY + 5, 50, 20);
                doc.line(pageWidth / 2, footerY + 27, pageWidth / 2 + 60, footerY + 27);
            } catch(e) { console.error("Error adding signature to PDF:", e); }
        }
        
        return doc;
    }

    async downloadPDF() {
        const btn = document.getElementById('downloadBtn');
        this.setButtonLoading(btn, true);
        try {
            const doc = await this.createPDF();
            if(doc) doc.save(`Invoice-${this.state.invoiceNumber}.pdf`);
        } catch (error) { console.error('PDF generation failed:', error); } 
        finally { this.setButtonLoading(btn, false); }
    }

    async printInvoice() {
        const btn = document.getElementById('printBtn');
        this.setButtonLoading(btn, true);
        try {
            const doc = await this.createPDF();
            if(doc) {
                doc.autoPrint();
                window.open(doc.output('bloburl'), '_blank');
            }
        } catch (error) { console.error('Print failed:', error); } 
        finally { this.setButtonLoading(btn, false); }
    }
}
