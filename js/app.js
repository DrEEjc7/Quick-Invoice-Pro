/**
 * Main application class for the Quick Invoice Pro tool.
 * Handles state management, event binding, DOM updates, and PDF generation.
 */
document.addEventListener("DOMContentLoaded", () => {
  new InvoiceApp();
});

class InvoiceApp {
  /**
   * Initializes the application.
   */
  constructor() {
    this.storageKey = "invoiceData-v6"; // Updated version for new structure
    
    // Default state for a new invoice
    this.initialState = {
      language: "en",
      companyName: "Your Company LLC",
      companyEmail: "hello@yourcompany.com", 
      companyInfo: "456 Your Street\nYour City, ST 12345\nPhone: (555) 123-4567",
      companyLogo: null,
      clientName: "Client Inc.",
      clientEmail: "client@example.com",
      clientInfo: "123 Main Street\nAnytown, USA 54321\nPhone: (555) 987-6543",
      invoiceNumber: "INV-001",
      invoiceStatus: "draft",
      currency: "USD",
      invoiceDate: this.getTodayDate(),
      dueDate: this.getDueDateDefault(),
      items: [{ description: "Premium Web Development", quantity: 10, rate: 150.0 }],
      discount: "0",
      taxRate: 10,
      paymentLink: "",
      notes: "Thank you for your business!",
      signatureImage: null
    };

    this.state = {};
    this.init();
  }

  /**
   * Sets up the application by loading data, populating the UI,
   * binding events, and performing an initial render.
   */
  init() {
    this.loadFromStorage();
    this.populateLanguageSelector();
    this.setLanguage(this.state.language, true); // Initial language set without saving
    this.populateForm();
    this.bindEvents();
    this.updatePreview();
    document.getElementById("currentYear").textContent = new Date().getFullYear();
  }

  // --- State and Data Management ---

  /**
   * Loads invoice data from localStorage. If no data is found,
   * it initializes with the default state.
   */
  loadFromStorage() {
    const savedData = localStorage.getItem(this.storageKey);
    this.state = savedData ? { ...this.initialState, ...JSON.parse(savedData) } : { ...this.initialState };
    
    // Ensure items array is valid
    if (!Array.isArray(this.state.items) || this.state.items.length === 0) {
      this.state.items = [{ description: "Premium Web Development", quantity: 1, rate: 150 }];
    }
  }

  /**
   * Saves the current application state to localStorage.
   */
  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  /**
   * Resets the form to its initial state after user confirmation.
   */
  resetForm() {
    const t = this.getTranslations();
    if (confirm(t.resetConfirmation)) {
      const currentLang = this.state.language; // Preserve language setting
      localStorage.removeItem(this.storageKey);
      this.state = { ...this.initialState, language: currentLang };
      this.saveToStorage();
      this.populateForm();
      this.updatePreview();
    }
  }

  // --- Event Binding ---

  /**
   * Binds all necessary event listeners to the DOM elements.
   */
  bindEvents() {
    // Listen for changes in the entire sidebar form for efficiency
    document.querySelector(".sidebar").addEventListener("input", (e) => {
      if (e.target.id && this.state.hasOwnProperty(e.target.id) && e.target.type !== "file") {
        this.state[e.target.id] = e.target.value;
        this.updateAndSave();
      }
    });

    // Image upload handlers
    this.bindImageUpload("logoUpload", "companyLogo");
    this.bindImageUpload("signatureUpload", "signatureImage");

    // Item-related event delegation
    const itemsContainer = document.getElementById("itemsContainer");
    itemsContainer.addEventListener("input", this.handleItemInput.bind(this));
    itemsContainer.addEventListener("click", this.handleItemClick.bind(this));
    
    // Main action buttons
    document.getElementById("languageSelector").addEventListener("change", (e) => this.setLanguage(e.target.value));
    document.getElementById("addItemBtn").addEventListener("click", () => this.addItem());
    document.getElementById("downloadBtn").addEventListener("click", () => this.downloadPDF());
    document.getElementById("printBtn").addEventListener("click", () => this.printInvoice());
    document.getElementById("resetBtn").addEventListener("click", () => this.resetForm());
  }

  /**
   * Sets up event listeners for an image upload component.
   * @param {string} inputId - The ID of the file input element.
   * @param {string} stateKey - The key in the state object to update.
   */
  bindImageUpload(inputId, stateKey) {
    const containerId = `${inputId}Container`;
    document.getElementById(inputId).addEventListener("change", (e) => this.handleImageUpload(e, stateKey));
    document.getElementById(`remove${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}Btn`).addEventListener("click", () => this.removeImage(stateKey));
    document.getElementById(`change${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}Btn`).addEventListener("click", () => document.getElementById(inputId).click());
  }
  
  /**
   * Handles dynamic input within the items list.
   * @param {Event} e - The input event object.
   */
  handleItemInput(e) {
    if (e.target.classList.contains("item-input")) {
      const index = parseInt(e.target.dataset.index, 10);
      const field = e.target.dataset.field;
      let value = e.target.value;
      if (field === 'quantity' || field === 'rate') {
        value = parseFloat(value) || 0;
      }
      this.state.items[index][field] = value;
      this.updateAndSave();
    }
  }

  /**
   * Handles clicks inside the items container, specifically for removing items.
   * @param {Event} e - The click event object.
   */
  handleItemClick(e) {
    const removeBtn = e.target.closest(".remove-item-btn");
    if (removeBtn) {
      this.removeItem(parseInt(removeBtn.dataset.index, 10));
    }
  }

  // --- UI Population and Updates ---

  /**
   * Populates the form inputs with data from the current state.
   */
  populateForm() {
    Object.keys(this.state).forEach((key) => {
      const el = document.getElementById(key);
      if (el && typeof this.state[key] !== "object" && el.type !== "file") {
        el.value = this.state[key];
      }
    });
    this.renderItems();
  }

  /**
   * Renders the list of invoice items into the DOM.
   */
  renderItems() {
    const container = document.getElementById("itemsContainer");
    const t = this.getTranslations();
    container.innerHTML = this.state.items.map((item, index) => `
      <div class="item-row">
        <input type="text" class="item-input" data-index="${index}" data-field="description" 
               value="${item.description || ''}" placeholder="${t.description}">
        <input type="number" class="item-input" data-index="${index}" data-field="quantity" 
               value="${item.quantity || 1}" min="0" step="1">
        <input type="number" class="item-input" data-index="${index}" data-field="rate" 
               value="${item.rate || 0}" min="0" step="0.01">
        <button type="button" class="remove-item-btn" data-index="${index}" title="${t.remove}">&times;</button>
      </div>
    `).join('');
  }

  /**
   * A wrapper function to update the preview and save to storage.
   */
  updateAndSave() {
    this.updatePreview();
    this.saveToStorage();
  }
  
  /**
   * Updates the entire invoice preview panel based on the current state.
   */
  updatePreview() {
    const t = this.getTranslations();

    // Update headers and addresses
    this.updateTextContent("previewCompanyName", this.state.companyName);
    this.updateTextContent("previewCompanyNameAddr", this.state.companyName);
    this.updateTextContent("previewCompanyEmailAddr", this.state.companyEmail);
    this.updateHTMLContent("previewCompanyInfoAddr", this.state.companyInfo);
    
    this.updateTextContent("previewClientNameAddr", this.state.clientName);
    this.updateTextContent("previewClientEmailAddr", this.state.clientEmail);
    this.updateHTMLContent("previewClientInfoAddr", this.state.clientInfo);

    // Update invoice metadata
    this.updateTextContent("previewInvoiceNumber", `#${this.state.invoiceNumber || 'INV-001'}`);
    document.getElementById("previewInvoiceDate").innerHTML = `<strong>${t.issueDate}:</strong> ${this.formatDate(this.state.invoiceDate)}`;
    document.getElementById("previewDueDate").innerHTML = `<strong>${t.dueDate}:</strong> ${this.formatDate(this.state.dueDate)}`;
    
    // Update status badge
    const statusBadge = document.getElementById("previewStatus");
    const statusKey = `status${this.state.invoiceStatus.charAt(0).toUpperCase() + this.state.invoiceStatus.slice(1)}`;
    statusBadge.textContent = t[statusKey] || this.state.invoiceStatus;
    statusBadge.className = `status-badge status-${this.state.invoiceStatus}`;

    // Update items table, totals, notes, and images
    this.updateTable(t);
    this.updateTotals();
    this.updatePaymentLink();
    this.updateNotes();
    this.updateImages();
  }

  /**
   * Updates the invoice items table in the preview.
   * @param {object} t - The translation object.
   */
  updateTable(t) {
    const tableHeader = document.getElementById("invoiceTableHeader");
    tableHeader.innerHTML = `
      <tr>
        <th>${t.description}</th>
        <th class="text-center">${t.qty}</th>
        <th class="text-right">${t.price}</th>
        <th class="text-right">${t.pdfAmount}</th>
      </tr>
    `;

    const tableBody = document.getElementById("invoiceTableBody");
    tableBody.innerHTML = this.state.items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return `
        <tr>
          <td class="item-description">${item.description || ""}</td>
          <td class="text-center">${quantity}</td>
          <td class="text-right">${this.formatCurrency(rate)}</td>
          <td class="text-right">${this.formatCurrency(quantity * rate)}</td>
        </tr>
      `;
    }).join('');
  }
  
  /**
   * Updates the totals section (subtotal, discount, tax, total) in the preview.
   */
  updateTotals() {
    const totals = this.calculateTotals();
    this.updateTextContent("subtotalAmount", this.formatCurrency(totals.subtotal));
    this.updateTextContent("totalAmount", this.formatCurrency(totals.total));
    
    this.toggleRow("discountRow", totals.discount > 0, `-${this.formatCurrency(totals.discount)}`);
    this.toggleRow("taxRow", totals.tax > 0, this.formatCurrency(totals.tax));
  }
  
  /**
   * Updates the visibility and content of various preview elements.
   */
  updatePaymentLink() { this.toggleElement("previewPaymentLinkWrapper", this.isValidUrl(this.state.paymentLink), el => el.querySelector('a').href = this.state.paymentLink); }
  updateNotes() { this.toggleElement("notesSection", this.state.notes.trim(), el => el.querySelector('p').textContent = this.state.notes); }
  
  /**
   * Updates logo and signature images in both the form and the preview.
   */
  updateImages() {
    this.updateImage("companyLogo", "logoUploadContainer", "logoPreview", "previewLogo", "previewLogoText");
    this.updateImage("signatureImage", "signatureUploadContainer", "signaturePreview", "previewSignature", "signatureSection");
  }

  /**
   * Helper to update a single image component.
   */
  updateImage(stateKey, containerId, previewId, finalImgId, finalContainerId) {
    const hasImage = !!this.state[stateKey];
    document.getElementById(containerId).classList.toggle("has-image", hasImage);
    if(hasImage) {
        document.getElementById(previewId).src = this.state[stateKey];
        document.getElementById(finalImgId).src = this.state[stateKey];
    }
    this.toggleElement(finalContainerId, hasImage);
    if(finalImgId === 'previewLogo') {
        this.toggleElement('previewLogoText', !hasImage, el => el.textContent = (this.state.companyName || "QIP").substring(0, 3).toUpperCase());
    }
  }


  // --- Language and Translations ---

  /**
   * Populates the language dropdown selector.
   */
  populateLanguageSelector() {
    const selector = document.getElementById("languageSelector");
    selector.innerHTML = Object.keys(i18n).map(langCode => 
      `<option value="${langCode}">${i18n[langCode].langName}</option>`
    ).join('');
    selector.value = this.state.language;
  }

  /**
   * Sets the application language and updates the UI.
   * @param {string} langCode - The language code (e.g., 'en', 'es').
   * @param {boolean} isInitialization - Flag to prevent saving on initial load.
   */
  setLanguage(langCode, isInitialization = false) {
    this.state.language = langCode;
    document.documentElement.lang = langCode;
    
    if (!isInitialization) {
      this.saveToStorage();
    }
    
    this.applyTranslations();
    this.updatePreview(); // Re-render preview with new language
    this.renderItems(); // Re-render items to update placeholders
  }

  /**
   * Applies translations to all tagged DOM elements.
   */
  applyTranslations() {
    const t = this.getTranslations();
    document.querySelectorAll("[data-i18n-key]").forEach(el => {
      const key = el.dataset.i18nKey;
      if (t[key]) {
        el.textContent = t[key];
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (t[key]) {
        el.placeholder = t[key];
      }
    });
  }

  /**
   * Returns the translation object for the current language.
   * @returns {object}
   */
  getTranslations() {
    return i18n[this.state.language] || i18n["en"];
  }

  // --- Item and Image Handling ---

  /**
   * Adds a new, empty item to the invoice.
   */
  addItem() {
    this.state.items.push({ description: "", quantity: 1, rate: 0 });
    this.renderItems();
    this.updateAndSave();
  }

  /**
   * Removes an item from the invoice by its index.
   * @param {number} index - The index of the item to remove.
   */
  removeItem(index) {
    if (this.state.items.length > 1) {
      this.state.items.splice(index, 1);
      this.renderItems();
      this.updateAndSave();
    }
  }

  /**
   * Handles file selection for image uploads.
   * @param {Event} event - The file input change event.
   * @param {string} stateKey - The state key for the image.
   */
  handleImageUpload(event, stateKey) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert("File is too large. Please select an image smaller than 2MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.state[stateKey] = e.target.result;
      this.updateAndSave();
    };
    reader.readAsDataURL(file);
  }

  /**
   * Removes an image from the state.
   * @param {string} stateKey - The state key for the image.
   */
  removeImage(stateKey) {
    this.state[stateKey] = null;
    this.updateAndSave();
  }
  
  // --- Calculations and Formatting ---

  /**
   * Calculates subtotal, discount, tax, and total.
   * @returns {object} An object with all calculated totals.
   */
  calculateTotals() {
    const subtotal = this.state.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0);
    const discountAmount = this.parseDiscount(this.state.discount, subtotal);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * (parseFloat(this.state.taxRate) || 0)) / 100;
    const total = subtotalAfterDiscount + taxAmount;
    return { subtotal, discount: discountAmount, tax: taxAmount, total };
  }

  /**
   * Parses the discount string (e.g., '10%' or '50').
   * @param {string} discount - The discount string from the input.
   * @param {number} subtotal - The subtotal to calculate percentage against.
   * @returns {number} The calculated discount amount.
   */
  parseDiscount(discount, subtotal) {
    if (!discount || subtotal <= 0) return 0;
    const input = String(discount).trim();
    if (input.includes('%')) {
      const percentage = parseFloat(input.replace(/[^0-9.]/g, ''));
      return isNaN(percentage) ? 0 : (subtotal * percentage) / 100;
    }
    const amount = parseFloat(input.replace(/[^0-9.]/g, ''));
    return isNaN(amount) ? 0 : amount;
  }

  /**
   * Formats a number as currency based on the selected currency.
   * @param {number} amount - The number to format.
   * @returns {string} The formatted currency string.
   */
  formatCurrency(amount) {
    const currencySymbols = {
        USD: '$', EUR: '€', GBP: '£', CAD: 'C$',
        JPY: '¥', CNY: '¥', INR: '₹'
    };
    const symbol = currencySymbols[this.state.currency] || '';
    return `${symbol}${Number(amount).toFixed(2)}`;
  }

  /**
   * Formats a date string into a more readable format.
   * @param {string} dateString - The date string (e.g., '2025-06-23').
   * @returns {string} The formatted date string.
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const correctedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return correctedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // --- PDF Generation ---

  /**
   * Validates the form before PDF generation.
   * @returns {boolean} True if the form is valid.
   */
  validateForm() {
    const t = this.getTranslations();
    document.querySelectorAll(".form-input-error").forEach(el => el.classList.remove("form-input-error"));

    if (!this.state.clientName.trim()) {
        const el = document.getElementById("clientName");
        el.classList.add("form-input-error");
        el.focus();
        alert(t.validationClientName);
        return false;
    }
    
    for (let i = 0; i < this.state.items.length; i++) {
        const item = this.state.items[i];
        if (!item.description.trim() || !item.quantity || !item.rate) {
            alert(`${t.validationItem}${i + 1}`);
            // Highlight the problematic row
            const row = document.querySelector(`.item-row input[data-index="${i}"]`);
            if (row) row.closest('.item-row').querySelector('input').focus();
            return false;
        }
    }
    return true;
  }

  /**
   * Creates the jsPDF document object.
   * @returns {Promise<jsPDF|null>} A promise that resolves with the jsPDF object or null.
   */
  async createPDF() {
    if (!this.validateForm()) return null;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    registerInterFont(doc); // Register custom/fallback font

    const t = this.getTranslations();
    const totals = this.calculateTotals();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y;

    // --- PDF Content Sections ---
    this._addPdfHeader(doc, t, pageWidth, margin);
    this._addPdfBillingInfo(doc, t, pageWidth, margin);
    y = this._addPdfTable(doc, t);
    y = this._addPdfTotals(doc, t, totals, pageWidth, y);
    this._addPdfFooter(doc, t, totals, pageWidth, y, margin);

    return doc;
  }

  _addPdfHeader(doc, t, pageWidth, margin) {
    if (this.state.companyLogo) {
        try {
            const imgType = this.state.companyLogo.split(';')[0].split('/')[1].toUpperCase();
            doc.addImage(this.state.companyLogo, imgType, margin, margin, 30, 15);
            doc.setFontSize(18).setFont("Inter", "bold").text(this.state.companyName || "", margin + 35, margin + 7);
        } catch (e) {
            console.error("Error adding logo:", e);
        }
    } else {
        doc.setFontSize(20).setFont("Inter", "bold").text(this.state.companyName || "", margin, margin + 7);
    }
    
    const statusKey = `status${this.state.invoiceStatus.charAt(0).toUpperCase() + this.state.invoiceStatus.slice(1)}`;
    doc.setFontSize(10).setFont("Inter", "bold").text((t[statusKey] || this.state.invoiceStatus).toUpperCase(), pageWidth - margin, margin, { align: "right" });
    doc.setFontSize(22).text(t.pdfInvoice.toUpperCase(), pageWidth - margin, margin + 10, { align: "right" });
    doc.setFontSize(10).setFont("Inter", "normal").text(`#${this.state.invoiceNumber}`, pageWidth - margin, margin + 17, { align: "right" });
    doc.line(margin, margin + 30, pageWidth - margin, margin + 30);
  }

  _addPdfBillingInfo(doc, t, pageWidth, margin) {
      const y = margin + 40;
      doc.setFontSize(10).setFont("Inter", "bold").setTextColor(100);
      doc.text(t.pdfBillTo.toUpperCase(), margin, y);
      doc.text(t.pdfDateIssued.toUpperCase(), pageWidth / 2, y);
      doc.text(t.pdfDueDate.toUpperCase(), pageWidth / 1.5, y);

      doc.setTextColor(0).setFont("Inter", "normal");
      doc.text(this.state.clientName || "", margin, y + 7);
      if(this.state.clientEmail) doc.text(this.state.clientEmail, margin, y + 12);
      if(this.state.clientInfo) doc.text(this.state.clientInfo.split('\n'), margin, y + 17);

      doc.text(this.formatDate(this.state.invoiceDate), pageWidth / 2, y + 7);
      doc.text(this.formatDate(this.state.dueDate), pageWidth / 1.5, y + 7);
  }

  _addPdfTable(doc, t) {
      const tableBody = this.state.items.map(item => [
        item.description || "",
        String(item.quantity || 0),
        this.formatCurrency(item.rate || 0),
        this.formatCurrency((item.quantity || 0) * (item.rate || 0))
      ]);

      doc.autoTable({
        head: [[t.pdfDescription, t.pdfQuantity, t.pdfUnitPrice, t.pdfAmount]],
        body: tableBody,
        startY: 85,
        theme: "striped",
        headStyles: { fillColor: [22, 34, 57], fontStyle: "bold", font: "Inter" },
        styles: { font: "Inter", fontSize: 9 }
      });
      return doc.autoTable.previous.finalY;
  }
  
  _addPdfTotals(doc, t, totals, pageWidth, y) {
      let finalY = y + 5;
      const addTotalRow = (label, value, isBold = false) => {
          finalY += isBold ? 8 : 6;
          doc.setFontSize(isBold ? 12 : 10).setFont("Inter", isBold ? "bold" : "normal");
          doc.text(label, pageWidth - 80, finalY, { align: "right" });
          doc.text(value, pageWidth - 15, finalY, { align: "right" });
      };
      
      addTotalRow(t.pdfSubtotal, this.formatCurrency(totals.subtotal));
      if (totals.discount > 0) addTotalRow(t.pdfDiscount, `-${this.formatCurrency(totals.discount)}`);
      if (totals.tax > 0) addTotalRow(`${t.pdfTax} (${this.state.taxRate}%)`, this.formatCurrency(totals.tax));
      
      finalY += 2;
      doc.line(pageWidth - 85, finalY, pageWidth - 15, finalY);
      addTotalRow(t.pdfTotal, this.formatCurrency(totals.total), true);
      return finalY;
  }

  _addPdfFooter(doc, t, totals, pageWidth, y, margin) {
      let footerY = Math.max(y + 20, 240); // Start footer at least at a certain position
      if (this.state.paymentLink && this.isValidUrl(this.state.paymentLink)) {
          doc.setFontSize(11).setTextColor(47, 128, 237).textWithLink(t.pdfPayOnline, margin, footerY, { url: this.state.paymentLink });
          footerY += 10;
          doc.setTextColor(0);
      }
      if (this.state.notes.trim()) {
          doc.setFont("Inter", "bold").setFontSize(10).text(t.pdfNotes, margin, footerY);
          const noteLines = doc.splitTextToSize(this.state.notes, pageWidth / 2 - (margin * 2));
          doc.setFont("Inter", "normal").text(noteLines, margin, footerY + 5);
      }
      if (this.state.signatureImage) {
          try {
              const imgType = this.state.signatureImage.split(';')[0].split('/')[1].toUpperCase();
              doc.setFont("Inter", "bold").text(t.pdfSignature, pageWidth / 2, footerY);
              doc.addImage(this.state.signatureImage, imgType, pageWidth / 2, footerY + 5, 50, 20);
              doc.line(pageWidth / 2, footerY + 27, pageWidth / 2 + 60, footerY + 27);
          } catch(e) { console.error("Error adding signature image:", e); }
      }
  }


  /**
   * Handles the download PDF button click.
   */
  async downloadPDF() {
    this.withLoading("downloadBtn", async () => {
      const doc = await this.createPDF();
      if (doc) {
        doc.save(`Invoice-${this.state.invoiceNumber || '001'}.pdf`);
      }
    });
  }

  /**
   * Handles the print invoice button click.
   */
  async printInvoice() {
    this.withLoading("printBtn", async () => {
      const doc = await this.createPDF();
      if (doc) {
        doc.autoPrint();
        window.open(doc.output("bloburl"), "_blank");
      }
    });
  }

  // --- Utility Helpers ---

  getTodayDate = () => new Date().toISOString().split('T')[0];
  getDueDateDefault = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };
  isValidUrl = (s) => { try { new URL(s); return true; } catch (e) { return false; } };

  updateTextContent(id, text) { document.getElementById(id).textContent = text || ''; }
  updateHTMLContent(id, text) { document.getElementById(id).innerHTML = (text || '').replace(/\n/g, "<br>"); }

  toggleRow(rowId, condition, textContent) {
    const row = document.getElementById(rowId);
    row.style.display = condition ? "flex" : "none";
    if (condition) {
      row.querySelector(".total-amount").textContent = textContent;
    }
  }
  
  toggleElement(id, condition, callback) {
    const el = document.getElementById(id);
    el.style.display = condition ? "" : "none";
    if (condition && callback) callback(el);
  }

  async withLoading(btnId, action) {
    const btn = document.getElementById(btnId);
    btn.disabled = true;
    btn.classList.add("loading");
    try {
      await action();
    } catch (error) {
      console.error(`Action for ${btnId} failed:`, error);
      alert("An error occurred. Please check the console for details.");
    } finally {
      btn.disabled = false;
      btn.classList.remove("loading");
    }
  }
}
