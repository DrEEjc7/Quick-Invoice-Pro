document.addEventListener('DOMContentLoaded', () => {
    new InvoiceApp();
});

class InvoiceApp {
    constructor() {
        this.state = {};
        this.storageKey = 'invoiceData';

        this.initialState = {
            companyName: 'Your Company LLC',
            companyAddress: '456 Your Street\nYour City, ST 12345',
            clientName: 'Client Inc.',
            clientEmail: 'contact@client.com',
            clientAddress: '123 Main Street\nAnytown, USA 54321',
            invoiceNumber: 'INV-001',
            currency: 'USD',
            invoiceDate: Processor.getTodayDate(),
            dueDate: Processor.getDueDateDefault(),
            items: [
                { description: 'Service or Product', quantity: 2, rate: 50.00 }
            ],
            discount: '0',
            taxRate: 0,
            notes: 'Thank you for your business!'
        };

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.populateForm();
        this.bindEvents();
        this.updatePreview();
    }

    bindEvents() {
        // Use event delegation on the sidebar for all form inputs
        document.querySelector('.sidebar').addEventListener('input', (e) => {
            if (e.target.id && this.state.hasOwnProperty(e.target.id)) {
                this.state[e.target.id] = e.target.value;
                this.updatePreview();
                this.saveToStorage();
            }
        });

        // Event delegation for item rows
        document.getElementById('itemsContainer').addEventListener('input', (e) => {
            if (e.target.classList.contains('item-input')) {
                const index = e.target.dataset.index;
                const field = e.target.dataset.field;
                this.state.items[index][field] = e.target.value;
                this.updatePreview();
                this.saveToStorage();
            }
        });
        document.getElementById('itemsContainer').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                this.removeItem(e.target.dataset.index);
            }
        });

        // Action Buttons
        document.getElementById('addItemBtn').addEventListener('click', () => this.addItem());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());
        document.getElementById('printBtn').addEventListener('click', () => this.printInvoice());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetForm());
    }

    // ===== DATA & STATE MANAGEMENT =====

    loadFromStorage() {
        const savedData = localStorage.getItem(this.storageKey);
        this.state = savedData ? JSON.parse(savedData) : { ...this.initialState };
        // Ensure items is always an array
        if (!Array.isArray(this.state.items) || this.state.items.length === 0) {
            this.state.items = [{ description: '', quantity: 1, rate: 0 }];
        }
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }

    resetForm() {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            localStorage.removeItem(this.storageKey);
            this.loadFromStorage();
            this.populateForm();
            this.updatePreview();
        }
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
            itemRow.innerHTML = `
                <input type="text" class="item-input" data-index="${index}" data-field="description" value="${item.description}" placeholder="Service description">
                <input type="number" class="item-input" data-index="${index}" data-field="quantity" value="${item.quantity}" min="0">
                <input type="number" class="item-input" data-index="${index}" data-field="rate" value="${item.rate}" min="0" step="0.01">
                <button class="remove-item-btn" data-index="${index}" title="Remove Item">&times;</button>
            `;
            container.appendChild(itemRow);
        });
    }

    updatePreview() {
        // Update headers
        document.getElementById('headerInvoiceNumber').textContent = this.state.invoiceNumber;
        document.getElementById('headerIssueDate').textContent = Processor.formatDate(this.state.invoiceDate);
        document.getElementById('headerDueDate').textContent = Processor.formatDate(this.state.dueDate);
        
        // Update Preview Panel
        document.getElementById('previewLogo').textContent = this.state.companyName.substring(0, 3).toUpperCase();
        document.getElementById('previewCompanyName').textContent = this.state.companyName;
        document.getElementById('previewInvoiceNumber').textContent = this.state.invoiceNumber;
        document.getElementById('previewInvoiceDate').innerHTML = `<strong>Invoice Date:</strong> ${Processor.formatDate(this.state.invoiceDate)}`;
        document.getElementById('previewDueDate').innerHTML = `<strong>Due Date:</strong> ${Processor.formatDate(this.state.dueDate)}`;
        
        document.getElementById('previewCompanyAddress').innerHTML = `<div class="name">${this.state.companyName}</div>${this.state.companyAddress.replace(/\n/g, '<br>')}`;
        document.getElementById('previewClientAddress').innerHTML = `<div class="name">${this.state.clientName}</div>${this.state.clientAddress.replace(/\n/g, '<br>')}`;

        // Update items table
        const tableBody = document.getElementById('invoiceTableBody');
        tableBody.innerHTML = '';
        this.state.items.forEach(item => {
            const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="item-description">${item.description || ''}</td>
                <td class="text-center">${item.quantity || 0}</td>
                <td class="text-right">${Processor.formatCurrency(item.rate || 0, this.state.currency)}</td>
                <td class="text-right">${Processor.formatCurrency(amount, this.state.currency)}</td>
            `;
        });

        // Update totals
        const totals = this.calculateTotals();
        document.getElementById('subtotalAmount').textContent = Processor.formatCurrency(totals.subtotal, this.state.currency);
        document.getElementById('totalAmount').textContent = Processor.formatCurrency(totals.total, this.state.currency);

        this.toggleRow('discountRow', 'discountAmount', totals.discount, `-`);
        this.toggleRow('taxRow', 'taxAmount', totals.tax);
        
        // Update notes
        const footer = document.getElementById('invoiceFooter');
        const notesP = document.getElementById('previewNotes');
        if (this.state.notes.trim()) {
            notesP.textContent = this.state.notes;
            footer.style.display = 'block';
        } else {
            footer.style.display = 'none';
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

    // ===== CALCULATIONS =====

    calculateTotals() {
        const subtotal = this.state.items.reduce((sum, item) => {
            return sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0);
        }, 0);

        const discountAmount = Processor.parseDiscount(this.state.discount, subtotal);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = (subtotalAfterDiscount * (Number(this.state.taxRate) || 0)) / 100;
        const total = subtotalAfterDiscount + taxAmount;

        return { subtotal, discount: discountAmount, tax: taxAmount, total };
    }
    
    // ===== ACTIONS (PDF, PRINT) =====

    validateForm() {
        if (!this.state.clientName.trim()) {
            alert('Please enter a client name.');
            document.getElementById('clientName').focus();
            return false;
        }
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
        const pageWidth = doc.internal.pageSize.getWidth();
    
        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text(this.state.companyName, 20, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(this.state.companyAddress.replace(/, /g, '\n'), 20, 28);
    
        // Invoice Meta
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(17, 24, 39);
        doc.text('INVOICE', pageWidth - 20, 20, { align: 'right' });
        doc.setFontSize(10);
        doc.text(`#${this.state.invoiceNumber}`, pageWidth - 20, 28, { align: 'right' });
    
        doc.line(20, 45, pageWidth - 20, 45); // Horizontal line
    
        // Billing Info
        let yPos = 55;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150);
        doc.text('BILL TO', 20, yPos);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'bold');
        doc.text(this.state.clientName, 20, yPos + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(this.state.clientAddress, 20, yPos + 14);
    
        // Dates
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150);
        doc.text('DATE ISSUED', pageWidth / 2, yPos);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'normal');
        doc.text(Processor.formatDate(this.state.invoiceDate), pageWidth / 2, yPos + 7);
    
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150);
        doc.text('DUE DATE', pageWidth / 1.5, yPos);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'normal');
        doc.text(Processor.formatDate(this.state.dueDate), pageWidth / 1.5, yPos + 7);
    
        // Items Table
        const tableBody = this.state.items.map(item => [
            item.description || '',
            String(item.quantity || 0),
            Processor.formatCurrency(item.rate || 0, this.state.currency),
            Processor.formatCurrency((Number(item.quantity) || 0) * (Number(item.rate) || 0), this.state.currency)
        ]);
    
        doc.autoTable({
            head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
            body: tableBody,
            startY: yPos + 30,
            theme: 'striped',
            headStyles: { fillColor: [22, 34, 57] },
            styles: { fontSize: 10 },
            columnStyles: {
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right' }
            }
        });
    
        // Totals
        let finalY = doc.autoTable.previous.finalY + 15;
        const addTotalRow = (label, value) => {
            doc.setFontSize(10);
            doc.text(label, pageWidth - 60, finalY, { align: 'left' });
            doc.text(value, pageWidth - 20, finalY, { align: 'right' });
            finalY += 7;
        };
    
        addTotalRow('Subtotal', Processor.formatCurrency(totals.subtotal, this.state.currency));
        if (totals.discount > 0) addTotalRow('Discount', `-${Processor.formatCurrency(totals.discount, this.state.currency)}`);
        if (totals.tax > 0) addTotalRow('Tax', Processor.formatCurrency(totals.tax, this.state.currency));
        
        doc.setLineWidth(0.5);
        doc.line(pageWidth - 65, finalY, pageWidth - 20, finalY);
        finalY += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        addTotalRow('Total', Processor.formatCurrency(totals.total, this.state.currency));
    
        // Notes
        if (this.state.notes) {
            finalY += 10;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Notes', 20, finalY);
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
            alert('Failed to generate PDF.');
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
            alert('Failed to prepare invoice for printing.');
        } finally {
            this.setButtonLoading(btn, false);
        }
    }
}
