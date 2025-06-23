document.addEventListener("DOMContentLoaded", () => {
  new InvoiceApp()
})

class InvoiceApp {
  constructor() {
    this.state = {}
    this.storageKey = "invoiceData-v4"
    
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
    }

    this.init()
  }

  init() {
    this.loadFromStorage()
    this.populateLanguageSelector()
    this.setLanguage(this.state.language, true)
    this.populateForm()
    this.bindEvents()
    this.updatePreview()
    document.getElementById("currentYear").textContent = new Date().getFullYear()
  }

  getTodayDate() {
    return new Date().toISOString().split('T')[0]
  }

  getDueDateDefault() {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  bindEvents() {
    const sidebar = document.querySelector(".sidebar")
    sidebar.addEventListener("input", (e) => {
      if (e.target.id && this.state.hasOwnProperty(e.target.id)) {
        if (e.target.type !== "file") {
          e.target.classList.remove("form-input-error")
          this.state[e.target.id] = e.target.value
          this.updatePreview()
          this.saveToStorage()
        }
      }
    })

    // Image upload handlers
    document.getElementById("logoUpload").addEventListener("change", (e) => this.handleImageUpload(e, "companyLogo"))
    document.getElementById("signatureUpload").addEventListener("change", (e) => this.handleImageUpload(e, "signatureImage"))
    document.getElementById("removeLogoBtn").addEventListener("click", () => this.removeImage("companyLogo"))
    document.getElementById("removeSignatureBtn").addEventListener("click", () => this.removeImage("signatureImage"))
    document.getElementById("changeLogoBtn").addEventListener("click", () => document.getElementById("logoUpload").click())
    document.getElementById("changeSignatureBtn").addEventListener("click", () => document.getElementById("signatureUpload").click())

    // Items handling
    const itemsContainer = document.getElementById("itemsContainer")
    itemsContainer.addEventListener("input", (e) => {
      if (e.target.classList.contains("item-input")) {
        const index = parseInt(e.target.dataset.index)
        const field = e.target.dataset.field
        
        let value = e.target.value
        if (field === 'quantity' || field === 'rate') {
          value = parseFloat(value) || 0
        }
        
        this.state.items[index][field] = value
        this.updatePreview()
        this.saveToStorage()
      }
    })
    
    itemsContainer.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".remove-item-btn")
      if (removeBtn) this.removeItem(parseInt(removeBtn.dataset.index))
    })

    // Button handlers
    document.getElementById("languageSelector").addEventListener("change", (e) => this.setLanguage(e.target.value))
    document.getElementById("addItemBtn").addEventListener("click", () => this.addItem())
    document.getElementById("downloadBtn").addEventListener("click", () => this.downloadPDF())
    document.getElementById("printBtn").addEventListener("click", () => this.printInvoice())
    document.getElementById("resetBtn").addEventListener("click", () => this.resetForm())
  }

  loadFromStorage() {
    const savedData = localStorage.getItem(this.storageKey)
    this.state = savedData ? { ...this.initialState, ...JSON.parse(savedData) } : { ...this.initialState }
    
    if (!Array.isArray(this.state.items) || this.state.items.length === 0) {
      this.state.items = [{ description: "Premium Web Development", quantity: 1, rate: 150 }]
    }
  }

  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state))
  }

  resetForm() {
    const t = i18n[this.state.language] || i18n["en"]
    if (confirm(t.resetConfirmation || "Are you sure you want to reset the form? All data will be lost.")) {
      const currentLang = this.state.language
      localStorage.removeItem(this.storageKey)
      this.loadFromStorage()
      this.state.language = currentLang
      this.saveToStorage()
      this.populateForm()
      this.updatePreview()
    }
  }

  handleImageUpload(event, stateKey) {
    const file = event.target.files[0]
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please select an image smaller than 2MB.")
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      this.state[stateKey] = e.target.result
      this.updatePreview()
      this.saveToStorage()
    }
    reader.readAsDataURL(file)
  }

  removeImage(stateKey) {
    this.state[stateKey] = null
    this.updatePreview()
    this.saveToStorage()
  }

  populateLanguageSelector() {
    const selector = document.getElementById("languageSelector")
    selector.innerHTML = ""
    
    for (const langCode in i18n) {
      const option = document.createElement("option")
      option.value = langCode
      option.textContent = i18n[langCode].langName
      selector.appendChild(option)
    }
    selector.value = this.state.language
  }

  setLanguage(langCode, isInitialization = false) {
    this.state.language = langCode
    document.documentElement.lang = langCode
    
    if (!isInitialization) {
      this.saveToStorage()
    }
    
    this.applyTranslations()
    this.updatePreview()
  }

  applyTranslations() {
    const lang = this.state.language
    const translations = i18n[lang] || i18n["en"]
    
    // Apply translations to elements with data-i18n-key
    document.querySelectorAll("[data-i18n-key]").forEach((el) => {
      const key = el.dataset.i18nKey
      const text = translations[key] || key
      
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (el.type !== "file" && el.type !== "date" && el.type !== "number") {
          el.placeholder = text
        }
      } else if (el.tagName === "OPTION") {
        el.textContent = text
      } else {
        el.textContent = text
      }
    })

    // Apply placeholder translations
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.dataset.i18nPlaceholder
      el.placeholder = translations[key] || key
    })
  }

  populateForm() {
    Object.keys(this.state).forEach((key) => {
      const el = document.getElementById(key)
      if (el && typeof this.state[key] !== "object" && el.type !== "file") {
        el.value = this.state[key]
      }
    })
    this.renderItems()
  }

  renderItems() {
    const container = document.getElementById("itemsContainer")
    container.innerHTML = ""
    const t = i18n[this.state.language] || i18n["en"]
    
    this.state.items.forEach((item, index) => {
      const itemRow = document.createElement("div")
      itemRow.className = "item-row"
      itemRow.innerHTML = `
        <input type="text" class="item-input" data-index="${index}" data-field="description" 
               value="${item.description || ''}" placeholder="${t.description || 'Description'}...">
        <input type="number" class="item-input" data-index="${index}" data-field="quantity" 
               value="${item.quantity || 1}" min="0" step="1">
        <input type="number" class="item-input" data-index="${index}" data-field="rate" 
               value="${item.rate || 0}" min="0" step="0.01">
        <button type="button" class="remove-item-btn" data-index="${index}" title="Remove Item">&times;</button>
      `
      container.appendChild(itemRow)
    })
  }

  updatePreview() {
    const t = i18n[this.state.language] || i18n["en"]

    // Update company info
    document.getElementById("previewCompanyName").textContent = this.state.companyName || t.companyNamePlaceholder
    document.getElementById("previewCompanyEmail").textContent = this.state.companyEmail || ""
    document.getElementById("previewCompanyInfo").innerHTML = (this.state.companyInfo || "").replace(/\n/g, "<br>")

    // Update client info  
    document.getElementById("previewClientName").textContent = this.state.clientName || t.clientNamePlaceholder
    document.getElementById("previewClientEmail").textContent = this.state.clientEmail || ""
    document.getElementById("previewClientInfo").innerHTML = (this.state.clientInfo || "").replace(/\n/g, "<br>")

    // Update invoice meta
    document.getElementById("previewInvoiceNumber").textContent = `#${this.state.invoiceNumber || 'INV-001'}`
    document.getElementById("previewInvoiceDate").innerHTML = 
      `<strong>${t.issueDate || 'Issue Date'}:</strong> ${this.formatDate(this.state.invoiceDate)}`
    document.getElementById("previewDueDate").innerHTML = 
      `<strong>${t.dueDate || 'Due Date'}:</strong> ${this.formatDate(this.state.dueDate)}`

    // Update status
    const statusBadge = document.getElementById("previewStatus")
    const statusKey = `status${this.state.invoiceStatus.charAt(0).toUpperCase() + this.state.invoiceStatus.slice(1)}`
    statusBadge.textContent = t[statusKey] || this.state.invoiceStatus
    statusBadge.className = `status-badge status-${this.state.invoiceStatus}`

    // Update table
    this.updateTable(t)
    
    // Update totals
    this.updateTotals(t)

    // Update payment link
    this.updatePaymentLink()

    // Update notes
    this.updateNotes()

    // Update images
    this.updateImages()
  }

  updateTable(t) {
    const tableHeader = document.getElementById("invoiceTableHeader")
    tableHeader.innerHTML = `
      <tr>
        <th>${t.description || 'Description'}</th>
        <th class="text-center">${t.qty || 'Qty'}</th>
        <th class="text-right">${t.price || 'Price'}</th>
        <th class="text-right">${t.pdfAmount || 'Amount'}</th>
      </tr>
    `

    const tableBody = document.getElementById("invoiceTableBody")
    tableBody.innerHTML = ""
    
    this.state.items.forEach((item) => {
      const quantity = parseFloat(item.quantity) || 0
      const rate = parseFloat(item.rate) || 0
      const amount = quantity * rate
      
      const row = tableBody.insertRow()
      row.innerHTML = `
        <td class="item-description">${item.description || ""}</td>
        <td class="text-center">${quantity}</td>
        <td class="text-right">${this.formatCurrency(rate)}</td>
        <td class="text-right">${this.formatCurrency(amount)}</td>
      `
    })
  }

  updateTotals(t) {
    const totals = this.calculateTotals()
    
    document.getElementById("subtotalAmount").textContent = this.formatCurrency(totals.subtotal)
    document.getElementById("totalAmount").textContent = this.formatCurrency(totals.total)
    
    // Show/hide discount row
    const discountRow = document.getElementById("discountRow")
    if (totals.discount > 0) {
      discountRow.style.display = "flex"
      document.getElementById("discountAmount").textContent = `-${this.formatCurrency(totals.discount)}`
    } else {
      discountRow.style.display = "none"
    }
    
    // Show/hide tax row
    const taxRow = document.getElementById("taxRow")
    if (totals.tax > 0) {
      taxRow.style.display = "flex"
      document.getElementById("taxAmount").textContent = this.formatCurrency(totals.tax)
    } else {
      taxRow.style.display = "none"
    }
  }

  updatePaymentLink() {
    const paymentWrapper = document.getElementById("previewPaymentLinkWrapper")
    const paymentLink = document.getElementById("previewPaymentLink")
    
    if (this.state.paymentLink && this.isValidUrl(this.state.paymentLink)) {
      paymentWrapper.style.display = "block"
      paymentLink.href = this.state.paymentLink
    } else {
      paymentWrapper.style.display = "none"
    }
  }

  updateNotes() {
    const notesSection = document.getElementById("notesSection")
    const notesText = document.getElementById("previewNotes")
    
    if (this.state.notes && this.state.notes.trim()) {
      notesSection.style.display = "block"
      notesText.textContent = this.state.notes
    } else {
      notesSection.style.display = "none"
    }
  }

  updateImages() {
    // Update logo
    const logoContainer = document.getElementById("logoUploadContainer")
    const logoPreview = document.getElementById("logoPreview")
    const previewLogoImg = document.getElementById("previewLogo")
    const previewLogoText = document.getElementById("previewLogoText")

    if (this.state.companyLogo) {
      logoPreview.src = this.state.companyLogo
      logoContainer.classList.add("has-image")
      previewLogoImg.src = this.state.companyLogo
      previewLogoImg.style.display = "block"
      previewLogoText.style.display = "none"
    } else {
      logoContainer.classList.remove("has-image")
      previewLogoImg.style.display = "none"
      previewLogoText.style.display = "flex"
      previewLogoText.textContent = (this.state.companyName || "QIP").substring(0, 3).toUpperCase()
    }

    // Update signature
    const signatureContainer = document.getElementById("signatureUploadContainer")
    const signaturePreview = document.getElementById("signaturePreview")
    const signatureSection = document.getElementById("signatureSection")
    const previewSignature = document.getElementById("previewSignature")

    if (this.state.signatureImage) {
      signatureContainer.classList.add("has-image")
      signaturePreview.src = this.state.signatureImage
      signatureSection.style.display = "block"
      previewSignature.src = this.state.signatureImage
    } else {
      signatureContainer.classList.remove("has-image")
      signatureSection.style.display = "none"
    }
  }

  addItem() {
    this.state.items.push({ description: "", quantity: 1, rate: 0 })
    this.renderItems()
    this.updatePreview()
    this.saveToStorage()
  }

  removeItem(index) {
    if (this.state.items.length > 1) {
      this.state.items.splice(index, 1)
      this.renderItems()
      this.updatePreview()
      this.saveToStorage()
    }
  }

  calculateTotals() {
    const subtotal = this.state.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const rate = parseFloat(item.rate) || 0
      return sum + (quantity * rate)
    }, 0)

    const discountAmount = this.parseDiscount(this.state.discount, subtotal)
    const subtotalAfterDiscount = subtotal - discountAmount
    const taxAmount = (subtotalAfterDiscount * (parseFloat(this.state.taxRate) || 0)) / 100
    const total = subtotalAfterDiscount + taxAmount

    return { 
      subtotal, 
      discount: discountAmount, 
      tax: taxAmount, 
      total 
    }
  }

  parseDiscount(discount, subtotal) {
    if (!discount || subtotal <= 0) return 0
    
    const input = String(discount).trim()
    if (input.includes('%')) {
      const percentage = parseFloat(input.replace(/[^0-9.]/g, ''))
      return isNaN(percentage) ? 0 : (subtotal * percentage) / 100
    } else {
      const amount = parseFloat(input.replace(/[^0-9.]/g, ''))
      return isNaN(amount) ? 0 : amount
    }
  }

  formatCurrency(amount) {
    const currencySymbols = {
      USD: '$', EUR: '€', GBP: '£', CAD: 'C$', 
      JPY: '¥', CNY: '¥', INR: '₹'
    }
    
    const symbol = currencySymbols[this.state.currency] || '$'
    const value = Number(amount).toFixed(2)
    return `${symbol}${value}`
  }

  formatDate(dateString) {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const userTimezoneOffset = date.getTimezoneOffset() * 60000
    const correctedDate = new Date(date.getTime() + userTimezoneOffset)
    
    return correctedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  isValidUrl(string) {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  validateForm() {
    const clientNameInput = document.getElementById("clientName")
    if (!this.state.clientName || !this.state.clientName.trim()) {
      clientNameInput.classList.add("form-input-error")
      clientNameInput.focus()
      return false
    }
    clientNameInput.classList.remove("form-input-error")
    return true
  }

  setButtonLoading(btn, isLoading) {
    btn.disabled = isLoading
    btn.classList.toggle("loading", isLoading)
  }

  async createPDF() {
    if (!this.validateForm()) return null

    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    
    // Use Inter font for better Unicode support
    doc.setFont("helvetica")
    
    const t = i18n[this.state.language] || i18n["en"]
    const pageWidth = doc.internal.pageSize.getWidth()
    const totals = this.calculateTotals()
    let finalY

    // Header with logo and company info
    if (this.state.companyLogo) {
      try {
        const imgType = this.state.companyLogo.split(';')[0].split('/')[1].toUpperCase()
        doc.addImage(this.state.companyLogo, imgType, 15, 15, 30, 15)
        doc.setFontSize(18)
        doc.setFont(undefined, "bold")
        doc.text(this.state.companyName || "", 50, 25)
      } catch (e) {
        console.error("Error adding logo:", e)
        doc.setFontSize(20)
        doc.setFont(undefined, "bold")
        doc.text(this.state.companyName || "", 20, 25)
      }
    } else {
      doc.setFontSize(20)
      doc.setFont(undefined, "bold")
      doc.text(this.state.companyName || "", 20, 25)
    }

    // Status and invoice number
    const statusKey = `status${this.state.invoiceStatus.charAt(0).toUpperCase() + this.state.invoiceStatus.slice(1)}`
    const statusText = (t[statusKey] || this.state.invoiceStatus).toUpperCase()
    
    doc.setFontSize(10)
    doc.setFont(undefined, "bold")
    doc.text(statusText, pageWidth - 20, 15, { align: "right" })

    doc.setFontSize(22)
    doc.text((t.pdfInvoice || "INVOICE").toUpperCase(), pageWidth - 20, 25, { align: "right" })
    
    doc.setFontSize(10)
    doc.setFont(undefined, "normal")
    doc.text(`#${this.state.invoiceNumber || 'INV-001'}`, pageWidth - 20, 32, { align: "right" })

    doc.line(15, 45, pageWidth - 15, 45)

    // Billing information and dates
    const yPos = 55
    doc.setFontSize(10)
    doc.setFont(undefined, "bold")
    doc.setTextColor(100)
    doc.text((t.pdfBillTo || "BILL TO").toUpperCase(), 20, yPos)
    doc.text((t.pdfDateIssued || "DATE ISSUED").toUpperCase(), pageWidth / 2, yPos)
    doc.text((t.pdfDueDate || "DUE DATE").toUpperCase(), pageWidth / 1.5, yPos)

    doc.setTextColor(0)
    doc.setFont(undefined, "normal")

    // Client information
    let clientY = yPos + 7
    doc.text(this.state.clientName || "", 20, clientY)
    
    if (this.state.clientEmail) {
      clientY += 5
      doc.text(this.state.clientEmail, 20, clientY)
    }
    
    if (this.state.clientInfo) {
      clientY += 5
      const clientInfoLines = this.state.clientInfo.split('\n')
      clientInfoLines.forEach((line, index) => {
        doc.text(line, 20, clientY + (index * 5))
      })
    }

    // Dates
    doc.text(this.formatDate(this.state.invoiceDate), pageWidth / 2, yPos + 7)
    doc.text(this.formatDate(this.state.dueDate), pageWidth / 1.5, yPos + 7)

    // Items table
    const tableBody = this.state.items.map((item) => [
      item.description || "",
      String(item.quantity || 0),
      this.formatCurrency(item.rate || 0),
      this.formatCurrency((item.quantity || 0) * (item.rate || 0))
    ])

    doc.autoTable({
      head: [[
        t.pdfDescription || "Description",
        t.pdfQuantity || "Quantity", 
        t.pdfUnitPrice || "Unit Price",
        t.pdfAmount || "Amount"
      ]],
      body: tableBody,
      startY: yPos + 35,
      theme: "striped",
      headStyles: { 
        fillColor: [22, 34, 57],
        fontStyle: "bold"
      },
      styles: {
        font: "helvetica",
        fontSize: 9
      }
    })

    finalY = doc.autoTable.previous.finalY

    // Totals section
    const addTotalRow = (label, value, isBold = false) => {
      finalY += isBold ? 8 : 6
      doc.setFontSize(isBold ? 12 : 10)
      doc.setFont(undefined, isBold ? "bold" : "normal")
      doc.text(label, pageWidth - 80, finalY, { align: "right" })
      doc.text(value, pageWidth - 20, finalY, { align: "right" })
    }

    addTotalRow(t.pdfSubtotal || "Subtotal", this.formatCurrency(totals.subtotal))
    
    if (totals.discount > 0) {
      addTotalRow(t.pdfDiscount || "Discount", `-${this.formatCurrency(totals.discount)}`)
    }
    
    if (totals.tax > 0) {
      addTotalRow(
        t.pdfTax || "Tax", 
        `${this.formatCurrency(totals.tax)} (${this.state.taxRate}%)`
      )
    }

    finalY += 2
    doc.line(pageWidth - 85, finalY, pageWidth - 15, finalY)
    addTotalRow(t.pdfTotal || "Total", this.formatCurrency(totals.total), true)

    // Footer section
    let footerY = Math.max(finalY + 20, 240)

    // Payment link
    if (this.state.paymentLink && this.isValidUrl(this.state.paymentLink)) {
      doc.setFontSize(11)
      doc.setTextColor(47, 128, 237)
      doc.textWithLink(t.pdfPayOnline || "Pay Online", 20, footerY, { 
        url: this.state.paymentLink 
      })
      doc.setTextColor(0)
      footerY += 10
    }

    // Notes
    if (this.state.notes && this.state.notes.trim()) {
      doc.setFont(undefined, "bold")
      doc.setFontSize(10)
      doc.text(t.pdfNotes || "Notes", 20, footerY)
      doc.setFont(undefined, "normal")
      
      const noteLines = doc.splitTextToSize(this.state.notes, pageWidth / 2 - 30)
      doc.text(noteLines, 20, footerY + 5)
      footerY += (noteLines.length * 5) + 10
    }

    // Signature
    if (this.state.signatureImage) {
      try {
        const imgType = this.state.signatureImage.split(';')[0].split('/')[1].toUpperCase()
        doc.setFont(undefined, "bold")
        doc.text(t.pdfSignature || "Signature", pageWidth / 2, footerY)
        doc.addImage(this.state.signatureImage, imgType, pageWidth / 2, footerY + 5, 50, 20)
        doc.line(pageWidth / 2, footerY + 27, pageWidth / 2 + 60, footerY + 27)
      } catch (e) {
        console.error("Error adding signature:", e)
      }
    }

    return doc
  }

  async downloadPDF() {
    const btn = document.getElementById("downloadBtn")
    this.setButtonLoading(btn, true)
    
    try {
      const doc = await this.createPDF()
      if (doc) {
        doc.save(`Invoice-${this.state.invoiceNumber || 'INV-001'}.pdf`)
      }
    } catch (error) {
      console.error("PDF generation failed:", error)
      alert("PDF generation failed. Please try again.")
    } finally {
      this.setButtonLoading(btn, false)
    }
  }

  async printInvoice() {
    const btn = document.getElementById("printBtn")
    this.setButtonLoading(btn, true)
    
    try {
      const doc = await this.createPDF()
      if (doc) {
        doc.autoPrint()
        window.open(doc.output("bloburl"), "_blank")
      }
    } catch (error) {
      console.error("Print failed:", error)
      alert("Print failed. Please try again.")
    } finally {
      this.setButtonLoading(btn, false)
    }
  }
}
