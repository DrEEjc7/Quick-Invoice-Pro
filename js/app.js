document.addEventListener('DOMContentLoaded', () => {
    new InvoiceApp();
});

class InvoiceApp {
    constructor() {
        this.state = {};
        this.storageKey = 'invoiceData';
        
        // --- MULTILINGUAL DICTIONARY ---
        this.i18n = {
            // English
            'en': {
                langName: 'English', title: 'Quick Invoice Pro', clientDetails: 'Client Details', companyName: 'Company Name', clientNamePlaceholder: 'Client Inc.', address: 'Address', addressPlaceholder: '123 Main Street...', yourDetails: 'Your Details', yourCompanyNamePlaceholder: 'Your Company LLC', yourAddressPlaceholder: '456 Your Street...', invoiceDetails: 'Invoice Details', invoiceNumber: 'Invoice Number', issueDate: 'Issue Date', dueDate: 'Due Date', currency: 'Currency', invoiceItems: 'Invoice Items', description: 'Description', qty: 'Qty', price: 'Price', addItem: '+ Add Item', totalsAndNotes: 'Totals & Notes', discount: 'Discount', discountPlaceholder: '10% or 50', taxRate: 'Tax Rate (%)', paymentLink: 'Payment Link', paymentLinkPlaceholder: 'https://provider.com/pay', notes: 'Notes', notesPlaceholder: 'Thank you for your business!', downloadPDF: 'Download PDF', print: 'Print', reset: 'Reset', from: 'From', to: 'To', subtotal: 'Subtotal', tax: 'Tax', total: 'Total', payNow: 'Pay Now', pdfBillTo: 'BILL TO', pdfDateIssued: 'DATE ISSUED', pdfDueDate: 'DUE DATE', pdfInvoice: 'INVOICE', pdfDescription: 'Description', pdfQuantity: 'Quantity', pdfUnitPrice: 'Unit Price', pdfAmount: 'Amount', pdfSubtotal: 'Subtotal', pdfDiscount: 'Discount', pdfTax: 'Tax', pdfTotal: 'Total', pdfNotes: 'Notes', pdfPayOnline: 'Pay Online',
            },
            // Spanish
            'es': {
                langName: 'Español', title: 'Factura Rápida Pro', clientDetails: 'Detalles del Cliente', companyName: 'Nombre de la Empresa', clientNamePlaceholder: 'Cliente Inc.', address: 'Dirección', addressPlaceholder: 'Calle Principal 123...', yourDetails: 'Tus Detalles', yourCompanyNamePlaceholder: 'Tu Empresa SL', yourAddressPlaceholder: 'Tu Calle 456...', invoiceDetails: 'Detalles de la Factura', invoiceNumber: 'Número de Factura', issueDate: 'Fecha de Emisión', dueDate: 'Fecha de Vencimiento', currency: 'Moneda', invoiceItems: 'Artículos de la Factura', description: 'Descripción', qty: 'Cant.', price: 'Precio', addItem: '+ Añadir Artículo', totalsAndNotes: 'Totales y Notas', discount: 'Descuento', discountPlaceholder: '10% o 50', taxRate: 'Tasa de Impuestos (%)', paymentLink: 'Enlace de Pago', paymentLinkPlaceholder: 'https://proveedor.com/pagar', notes: 'Notas', notesPlaceholder: '¡Gracias por su compra!', downloadPDF: 'Descargar PDF', print: 'Imprimir', reset: 'Reiniciar', from: 'De', to: 'Para', subtotal: 'Subtotal', tax: 'Impuestos', total: 'Total', payNow: 'Pagar Ahora', pdfBillTo: 'FACTURAR A', pdfDateIssued: 'FECHA DE EMISIÓN', pdfDueDate: 'FECHA DE VENCIMIENTO', pdfInvoice: 'FACTURA', pdfDescription: 'Descripción', pdfQuantity: 'Cantidad', pdfUnitPrice: 'Precio Unitario', pdfAmount: 'Importe', pdfSubtotal: 'Subtotal', pdfDiscount: 'Descuento', pdfTax: 'Impuestos', pdfTotal: 'Total', pdfNotes: 'Notas', pdfPayOnline: 'Pagar Online',
            },
            // French
            'fr': {
                langName: 'Français', title: 'Facture Rapide Pro', clientDetails: 'Détails du Client', companyName: 'Nom de l\'entreprise', clientNamePlaceholder: 'Client Inc.', address: 'Adresse', addressPlaceholder: '123 Rue Principale...', yourDetails: 'Vos Coordonnées', yourCompanyNamePlaceholder: 'Votre Entreprise SARL', yourAddressPlaceholder: '456 Votre Rue...', invoiceDetails: 'Détails de la Facture', invoiceNumber: 'Numéro de Facture', issueDate: 'Date d\'émission', dueDate: 'Date d\'échéance', currency: 'Devise', invoiceItems: 'Éléments de la Facture', description: 'Description', qty: 'Qté', price: 'Prix', addItem: '+ Ajouter un article', totalsAndNotes: 'Totaux et Notes', discount: 'Remise', discountPlaceholder: '10% ou 50', taxRate: 'Taux de TVA (%)', paymentLink: 'Lien de paiement', paymentLinkPlaceholder: 'https://fournisseur.com/payer', notes: 'Notes', notesPlaceholder: 'Merci pour votre confiance!', downloadPDF: 'Télécharger le PDF', print: 'Imprimer', reset: 'Réinitialiser', from: 'De', to: 'À', subtotal: 'Sous-total', tax: 'Taxe', total: 'Total', payNow: 'Payer Maintenant', pdfBillTo: 'FACTURER À', pdfDateIssued: 'DATE D\'ÉMISSION', pdfDueDate: 'DATE D\'ÉCHÉANCE', pdfInvoice: 'FACTURE', pdfDescription: 'Description', pdfQuantity: 'Quantité', pdfUnitPrice: 'Prix Unitaire', pdfAmount: 'Montant', pdfSubtotal: 'Sous-total', pdfDiscount: 'Remise', pdfTax: 'Taxe', pdfTotal: 'Total', pdfNotes: 'Notes', pdfPayOnline: 'Payer en ligne',
            },
            // German
            'de': {
                langName: 'Deutsch', title: 'Schnellrechnung Pro', clientDetails: 'Kundendetails', companyName: 'Firmenname', clientNamePlaceholder: 'Kunde GmbH', address: 'Adresse', addressPlaceholder: 'Hauptstraße 123...', yourDetails: 'Ihre Details', yourCompanyNamePlaceholder: 'Ihre Firma GmbH', yourAddressPlaceholder: 'Ihre Straße 456...', invoiceDetails: 'Rechnungsdetails', invoiceNumber: 'Rechnungsnummer', issueDate: 'Ausstellungsdatum', dueDate: 'Fälligkeitsdatum', currency: 'Währung', invoiceItems: 'Rechnungspositionen', description: 'Beschreibung', qty: 'Menge', price: 'Preis', addItem: '+ Position hinzufügen', totalsAndNotes: 'Summen & Notizen', discount: 'Rabatt', discountPlaceholder: '10% oder 50', taxRate: 'Steuersatz (%)', paymentLink: 'Zahlungslink', paymentLinkPlaceholder: 'https://anbieter.com/zahlen', notes: 'Notizen', notesPlaceholder: 'Vielen Dank für Ihren Auftrag!', downloadPDF: 'PDF herunterladen', print: 'Drucken', reset: 'Zurücksetzen', from: 'Von', to: 'An', subtotal: 'Zwischensumme', tax: 'Steuer', total: 'Gesamt', payNow: 'Jetzt bezahlen', pdfBillTo: 'RECHNUNG AN', pdfDateIssued: 'AUSSTELLUNGSDATUM', pdfDueDate: 'FÄLLIGKEITSDATUM', pdfInvoice: 'RECHNUNG', pdfDescription: 'Beschreibung', pdfQuantity: 'Menge', pdfUnitPrice: 'Stückpreis', pdfAmount: 'Betrag', pdfSubtotal: 'Zwischensumme', pdfDiscount: 'Rabatt', pdfTax: 'Steuer', pdfTotal: 'Gesamt', pdfNotes: 'Notizen', pdfPayOnline: 'Online bezahlen',
            },
            // Portuguese
            'pt': {
                langName: 'Português', title: 'Fatura Rápida Pro', clientDetails: 'Detalhes do Cliente', companyName: 'Nome da Empresa', clientNamePlaceholder: 'Cliente Ltda.', address: 'Endereço', addressPlaceholder: 'Rua Principal, 123...', yourDetails: 'Seus Dados', yourCompanyNamePlaceholder: 'Sua Empresa Ltda.', yourAddressPlaceholder: 'Sua Rua, 456...', invoiceDetails: 'Detalhes da Fatura', invoiceNumber: 'Número da Fatura', issueDate: 'Data de Emissão', dueDate: 'Data de Vencimento', currency: 'Moeda', invoiceItems: 'Itens da Fatura', description: 'Descrição', qty: 'Qtd', price: 'Preço', addItem: '+ Adicionar Item', totalsAndNotes: 'Totais e Notas', discount: 'Desconto', discountPlaceholder: '10% ou 50', taxRate: 'Taxa de Imposto (%)', paymentLink: 'Link de Pagamento', paymentLinkPlaceholder: 'https://provedor.com/pagar', notes: 'Notas', notesPlaceholder: 'Obrigado pelo seu negócio!', downloadPDF: 'Baixar PDF', print: 'Imprimir', reset: 'Redefinir', from: 'De', to: 'Para', subtotal: 'Subtotal', tax: 'Imposto', total: 'Total', payNow: 'Pagar Agora', pdfBillTo: 'FATURAR PARA', pdfDateIssued: 'DATA DE EMISSÃO', pdfDueDate: 'DATA DE VENCIMENTO', pdfInvoice: 'FATURA', pdfDescription: 'Descrição', pdfQuantity: 'Quantidade', pdfUnitPrice: 'Preço Unitário', pdfAmount: 'Valor', pdfSubtotal: 'Subtotal', pdfDiscount: 'Desconto', pdfTax: 'Imposto', pdfTotal: 'Total', pdfNotes: 'Notas', pdfPayOnline: 'Pagar Online',
            },
            // Russian
            'ru': {
                langName: 'Русский', title: 'Экспресс-Счёт Pro', clientDetails: 'Данные клиента', companyName: 'Название компании', clientNamePlaceholder: 'Клиент ООО', address: 'Адрес', addressPlaceholder: 'Главная ул., 123...', yourDetails: 'Ваши данные', yourCompanyNamePlaceholder: 'Ваша Компания ООО', yourAddressPlaceholder: 'Ваша ул., 456...', invoiceDetails: 'Детали счёта', invoiceNumber: 'Номер счёта', issueDate: 'Дата выставления', dueDate: 'Срок оплаты', currency: 'Валюта', invoiceItems: 'Позиции счёта', description: 'Описание', qty: 'Кол-во', price: 'Цена', addItem: '+ Добавить позицию', totalsAndNotes: 'Итоги и примечания', discount: 'Скидка', discountPlaceholder: '10% или 50', taxRate: 'Налоговая ставка (%)', paymentLink: 'Ссылка для оплаты', paymentLinkPlaceholder: 'https://provider.com/pay', notes: 'Примечания', notesPlaceholder: 'Спасибо за ваш заказ!', downloadPDF: 'Скачать PDF', print: 'Печать', reset: 'Сбросить', from: 'От', to: 'Кому', subtotal: 'Подытог', tax: 'Налог', total: 'Итого', payNow: 'Оплатить сейчас', pdfBillTo: 'СЧЁТ ДЛЯ', pdfDateIssued: 'ДАТА ВЫСТАВЛЕНИЯ', pdfDueDate: 'СРОК ОПЛАТЫ', pdfInvoice: 'СЧЁТ', pdfDescription: 'Описание', pdfQuantity: 'Количество', pdfUnitPrice: 'Цена за ед.', pdfAmount: 'Сумма', pdfSubtotal: 'Подытог', pdfDiscount: 'Скидка', pdfTax: 'Налог', pdfTotal: 'Итого', pdfNotes: 'Примечания', pdfPayOnline: 'Оплатить онлайн',
            },
            // Slovene
            'sl': {
                langName: 'Slovenščina', title: 'Hitri Račun Pro', clientDetails: 'Podrobnosti o stranki', companyName: 'Ime podjetja', clientNamePlaceholder: 'Stranka d.o.o.', address: 'Naslov', addressPlaceholder: 'Glavna ulica 123...', yourDetails: 'Vaši podatki', yourCompanyNamePlaceholder: 'Vaše podjetje d.o.o.', yourAddressPlaceholder: 'Vaša ulica 456...', invoiceDetails: 'Podrobnosti računa', invoiceNumber: 'Številka računa', issueDate: 'Datum izdaje', dueDate: 'Datum zapadlosti', currency: 'Valuta', invoiceItems: 'Postavke računa', description: 'Opis', qty: 'Količina', price: 'Cena', addItem: '+ Dodaj postavko', totalsAndNotes: 'Vsote in opombe', discount: 'Popust', discountPlaceholder: '10% ali 50', taxRate: 'Davčna stopnja (%)', paymentLink: 'Povezava za plačilo', paymentLinkPlaceholder: 'https://ponudnik.com/placaj', notes: 'Opombe', notesPlaceholder: 'Hvala za vaše poslovanje!', downloadPDF: 'Prenesi PDF', print: 'Natisni', reset: 'Ponastavi', from: 'Od', to: 'Za', subtotal: 'Vmesni znesek', tax: 'Davek', total: 'Skupaj', payNow: 'Plačaj zdaj', pdfBillTo: 'RAČUN ZA', pdfDateIssued: 'DATUM IZDAJE', pdfDueDate: 'DATUM ZAPADLOSTI', pdfInvoice: 'RAČUN', pdfDescription: 'Opis', pdfQuantity: 'Količina', pdfUnitPrice: 'Cena na enoto', pdfAmount: 'Znesek', pdfSubtotal: 'Vmesni znesek', pdfDiscount: 'Popust', pdfTax: 'Davek', pdfTotal: 'Skupaj', pdfNotes: 'Opombe', pdfPayOnline: 'Plačaj na spletu',
            },
            // Croatian
            'hr': {
                langName: 'Hrvatski', title: 'Brza Faktura Pro', clientDetails: 'Detalji klijenta', companyName: 'Naziv tvrtke', clientNamePlaceholder: 'Klijent d.o.o.', address: 'Adresa', addressPlaceholder: 'Glavna ulica 123...', yourDetails: 'Vaši podaci', yourCompanyNamePlaceholder: 'Vaša tvrtka d.o.o.', yourAddressPlaceholder: 'Vaša ulica 456...', invoiceDetails: 'Detalji fakture', invoiceNumber: 'Broj fakture', issueDate: 'Datum izdavanja', dueDate: 'Datum dospijeća', currency: 'Valuta', invoiceItems: 'Stavke fakture', description: 'Opis', qty: 'Količina', price: 'Cijena', addItem: '+ Dodaj stavku', totalsAndNotes: 'Ukupno i bilješke', discount: 'Popust', discountPlaceholder: '10% ili 50', taxRate: 'Porezna stopa (%)', paymentLink: 'Link za plaćanje', paymentLinkPlaceholder: 'https://pruatelj.com/plati', notes: 'Bilješke', notesPlaceholder: 'Hvala na suradnji!', downloadPDF: 'Preuzmi PDF', print: 'Ispis', reset: 'Resetiraj', from: 'Od', to: 'Za', subtotal: 'Međuzbroj', tax: 'Porez', total: 'Ukupno', payNow: 'Plati sada', pdfBillTo: 'RAČUN ZA', pdfDateIssued: 'DATUM IZDAVANJA', pdfDueDate: 'DATUM DOSPIJEĆA', pdfInvoice: 'RAČUN', pdfDescription: 'Opis', pdfQuantity: 'Količina', pdfUnitPrice: 'Jedinična cijena', pdfAmount: 'Iznos', pdfSubtotal: 'Međuzbroj', pdfDiscount: 'Popust', pdfTax: 'Porez', pdfTotal: 'Ukupno', pdfNotes: 'Bilješke', pdfPayOnline: 'Plati online',
            },
            // Hindi
            'hi': {
                langName: 'हिन्दी', title: 'क्विक इनवॉइस प्रो', clientDetails: 'ग्राहक विवरण', companyName: 'कंपनी का नाम', clientNamePlaceholder: 'ग्राहक इंक।', address: 'पता', addressPlaceholder: '123 मुख्य सड़क...', yourDetails: 'आपके विवरण', yourCompanyNamePlaceholder: 'आपकी कंपनी LLC', yourAddressPlaceholder: '456 आपकी सड़क...', invoiceDetails: 'चालान विवरण', invoiceNumber: 'चालान संख्या', issueDate: 'जारी करने की तारीख', dueDate: 'देय तिथि', currency: 'मुद्रा', invoiceItems: 'चालान आइटम', description: 'विवरण', qty: 'मात्रा', price: 'कीमत', addItem: '+ आइटम जोड़ें', totalsAndNotes: 'योग और नोट्स', discount: 'छूट', discountPlaceholder: '10% या 50', taxRate: 'कर दर (%)', paymentLink: 'भुगतान लिंक', paymentLinkPlaceholder: 'https://provider.com/pay', notes: 'टिप्पणियाँ', notesPlaceholder: 'आपके व्यवसाय के लिए धन्यवाद!', downloadPDF: 'पीडीएफ डाउनलोड करें', print: 'प्रिंट', reset: 'रीसेट', from: 'से', to: 'को', subtotal: 'उप-योग', tax: 'कर', total: 'कुल', payNow: 'अभी भुगतान करें', pdfBillTo: 'बिल किसको', pdfDateIssued: 'जारी करने की तारीख', pdfDueDate: 'देय तिथि', pdfInvoice: 'चालान', pdfDescription: 'विवरण', pdfQuantity: 'मात्रा', pdfUnitPrice: 'इकाई मूल्य', pdfAmount: 'राशि', pdfSubtotal: 'उप-योग', pdfDiscount: 'छूट', pdfTax: 'कर', pdfTotal: 'कुल', pdfNotes: 'टिप्पणियाँ', pdfPayOnline: 'ऑनलाइन भुगतान करें',
            },
            // Chinese (Simplified)
            'zh': {
                langName: '中文 (简体)', title: '快速发票 Pro', clientDetails: '客户详情', companyName: '公司名称', clientNamePlaceholder: '客户公司', address: '地址', addressPlaceholder: '主要街道123号...', yourDetails: '您的详情', yourCompanyNamePlaceholder: '您的公司', yourAddressPlaceholder: '您的街道456号...', invoiceDetails: '发票详情', invoiceNumber: '发票号码', issueDate: '开票日期', dueDate: '到期日期', currency: '货币', invoiceItems: '发票项目', description: '描述', qty: '数量', price: '价格', addItem: '+ 添加项目', totalsAndNotes: '总计与备注', discount: '折扣', discountPlaceholder: '10% 或 50', taxRate: '税率 (%)', paymentLink: '付款链接', paymentLinkPlaceholder: 'https://provider.com/pay', notes: '备注', notesPlaceholder: '感谢您的惠顾！', downloadPDF: '下载PDF', print: '打印', reset: '重置', from: '来自', to: '至', subtotal: '小计', tax: '税额', total: '总计', payNow: '立即付款', pdfBillTo: '账单收件人', pdfDateIssued: '开票日期', pdfDueDate: '到期日期', pdfInvoice: '发票', pdfDescription: '描述', pdfQuantity: '数量', pdfUnitPrice: '单价', pdfAmount: '金额', pdfSubtotal: '小计', pdfDiscount: '折扣', pdfTax: '税额', pdfTotal: '总计', pdfNotes: '备注', pdfPayOnline: '在线支付',
            },
            // Japanese
            'ja': {
                langName: '日本語', title: 'クイック請求書 Pro', clientDetails: '顧客詳細', companyName: '会社名', clientNamePlaceholder: 'クライアント株式会社', address: '住所', addressPlaceholder: '東京都千代田区1-1...', yourDetails: 'あなたの詳細', yourCompanyNamePlaceholder: 'あなたの会社', yourAddressPlaceholder: 'あなたの住所456...', invoiceDetails: '請求書の詳細', invoiceNumber: '請求書番号', issueDate: '発行日', dueDate: '支払期日', currency: '通貨', invoiceItems: '請求書項目', description: '説明', qty: '数量', price: '価格', addItem: '+ 項目を追加', totalsAndNotes: '合計とメモ', discount: '割引', discountPlaceholder: '10% または 50', taxRate: '税率 (%)', paymentLink: '支払いリンク', paymentLinkPlaceholder: 'https://provider.com/pay', notes: 'メモ', notesPlaceholder: 'お取引ありがとうございます！', downloadPDF: 'PDFをダウンロード', print: '印刷', reset: 'リセット', from: 'から', to: 'へ', subtotal: '小計', tax: '税金', total: '合計', payNow: '今すぐ支払う', pdfBillTo: '請求先', pdfDateIssued: '発行日', pdfDueDate: '支払期日', pdfInvoice: '請求書', pdfDescription: '説明', pdfQuantity: '数量', pdfUnitPrice: '単価', pdfAmount: '金額', pdfSubtotal: '小計', pdfDiscount: '割引', pdfTax: '税金', pdfTotal: '合計', pdfNotes: 'メモ', pdfPayOnline: 'オンラインで支払う',
            }
        };

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
                { description: 'Service or Product', quantity: 1, rate: 100.00 }
            ],
            discount: '0',
            taxRate: 0,
            paymentLink: '',
            notes: 'Thank you for your business!'
        };

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.populateLanguageSelector();
        this.applyTranslations();
        this.populateForm();
        this.bindEvents();
        this.updatePreview();
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    bindEvents() {
        document.querySelector('.sidebar').addEventListener('input', (e) => {
            if (e.target.id && this.state.hasOwnProperty(e.target.id)) {
                this.state[e.target.id] = e.target.value;
                this.updatePreview();
                this.saveToStorage();
            }
        });

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

        document.getElementById('languageSelector').addEventListener('change', (e) => this.setLanguage(e.target.value));
        document.getElementById('addItemBtn').addEventListener('click', () => this.addItem());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());
        document.getElementById('printBtn').addEventListener('click', () => this.printInvoice());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetForm());
    }

    // ===== DATA & STATE MANAGEMENT =====

    loadFromStorage() {
        const savedData = localStorage.getItem(this.storageKey);
        // Deep merge to ensure new properties are added to old saved states
        this.state = savedData 
            ? { ...this.initialState, ...JSON.parse(savedData) } 
            : { ...this.initialState };
            
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

    setLanguage(langCode) {
        this.state.language = langCode;
        document.documentElement.lang = langCode;
        this.saveToStorage();
        this.applyTranslations();
        this.updatePreview(); // Re-render preview with new language
    }

    applyTranslations() {
        const lang = this.state.language;
        const translations = this.i18n[lang];

        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            const key = el.dataset.i18nKey;
            if (translations[key]) {
                el.textContent = translations[key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (translations[key]) {
                el.placeholder = translations[key];
            }
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
        // Repopulate default note text if it's the initial default
        if (this.state.notes === 'Thank you for your business!') {
            this.state.notes = this.i18n[this.state.language].notesPlaceholder;
            document.getElementById('notes').value = this.state.notes;
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
                <input type="text" class="item-input" data-index="${index}" data-field="description" value="${item.description}" placeholder="${this.i18n[this.state.language].description}...">
                <input type="number" class="item-input" data-index="${index}" data-field="quantity" value="${item.quantity}" min="0">
                <input type="number" class="item-input" data-index="${index}" data-field="rate" value="${item.rate}" min="0" step="0.01">
                <button class="remove-item-btn" data-index="${index}" title="Remove Item">&times;</button>
            `;
            container.appendChild(itemRow);
        });
    }

    updatePreview() {
        const t = this.i18n[this.state.language];

        // Update headers
        document.getElementById('previewLogo').textContent = this.state.companyName.substring(0, 3).toUpperCase();
        document.getElementById('previewCompanyName').textContent = this.state.companyName;
        document.getElementById('previewInvoiceNumber').textContent = `#${this.state.invoiceNumber}`;
        document.getElementById('previewInvoiceDate').innerHTML = `<strong>${t.issueDate}:</strong> ${Processor.formatDate(this.state.invoiceDate)}`;
        document.getElementById('previewDueDate').innerHTML = `<strong>${t.dueDate}:</strong> ${Processor.formatDate(this.state.dueDate)}`;
        
        document.getElementById('previewCompanyAddress').innerHTML = `<div class="name">${this.state.companyName}</div>${this.state.companyAddress.replace(/\n/g, '<br>')}`;
        document.getElementById('previewClientAddress').innerHTML = `<div class="name">${this.state.clientName}</div>${this.state.clientAddress.replace(/\n/g, '<br>')}`;

        // Update items table header
        document.getElementById('invoiceTableHeader').innerHTML = `
            <tr>
                <th>${t.description}</th>
                <th class="text-center">${t.qty}</th>
                <th class="text-right">${t.price}</th>
                <th class="text-right">${t.pdfAmount}</th>
            </tr>
        `;
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
        
        // Update Payment Link
        const linkWrapper = document.getElementById('previewPaymentLinkWrapper');
        const linkEl = document.getElementById('previewPaymentLink');
        if(this.state.paymentLink && this.state.paymentLink.startsWith('http')) {
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

    // ===== CALCULATIONS =====

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
        const t = this.i18n[this.state.language];
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Add Inter font to PDF
        // Note: jsPDF has limited unicode support. For full CJK/Russian etc. support, a custom font needs to be embedded.
        // This is a complex process. For this implementation, we will rely on standard fonts which may not render all characters correctly.
        doc.setFont('helvetica');

        // Header
        doc.setFontSize(20);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'bold');
        doc.text(this.state.companyName, 20, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(this.state.companyAddress.replace(/, /g, '\n'), 20, 28);
    
        // Invoice Meta
        doc.setFontSize(24);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'bold');
        doc.text(t.pdfInvoice.toUpperCase(), pageWidth - 20, 20, { align: 'right' });
        doc.setFontSize(10);
        doc.text(`#${this.state.invoiceNumber}`, pageWidth - 20, 28, { align: 'right' });
    
        doc.line(20, 45, pageWidth - 20, 45);
    
        // Billing Info
        let yPos = 55;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150);
        doc.text(t.pdfBillTo.toUpperCase(), 20, yPos);
        doc.setTextColor(17, 24, 39);
        doc.text(this.state.clientName, 20, yPos + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(this.state.clientAddress, 20, yPos + 14);
    
        // Dates
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
    
        // Items Table
        const tableBody = this.state.items.map(item => [
            item.description || '',
            String(item.quantity || 0),
            Processor.formatCurrency(item.rate || 0, this.state.currency),
            Processor.formatCurrency((Number(item.quantity) || 0) * (Number(item.rate) || 0), this.state.currency)
        ]);
    
        doc.autoTable({
            head: [[t.pdfDescription, t.pdfQuantity, t.pdfUnitPrice, t.pdfAmount]],
            body: tableBody,
            startY: yPos + 30,
            theme: 'striped',
            headStyles: { fillColor: [22, 34, 57] },
            styles: { font: 'helvetica' },
        });
    
        // Totals
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
    
        // Payment Link
        if(this.state.paymentLink && this.state.paymentLink.startsWith('http')) {
            finalY += 10;
            doc.setFontSize(11);
            doc.setTextColor(var(--accent-primary));
            doc.textWithLink(t.pdfPayOnline, 20, finalY, { url: this.state.paymentLink });
            doc.setTextColor(17, 24, 39);
        }

        // Notes
        if (this.state.notes) {
            finalY += 10;
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
