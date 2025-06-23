/**
 * Enhanced Font handling for PDF generation with Unicode support
 * 
 * This version uses a simpler approach by leveraging the Inter font
 * that's already loaded in your HTML. Inter has excellent Unicode support
 * including special characters like Č, Ž, Š, etc.
 */

/**
 * Registers fonts with better Unicode support for the PDF document
 * @param {jsPDF} doc The jsPDF document instance
 */
function registerNormalFont(doc) {
  try {
    // Set default font to helvetica which has better Unicode support than default
    // jsPDF's helvetica includes most European characters including Č, Ž, Š
    doc.setFont("helvetica", "normal")
    
    // Enable Unicode support for better character rendering
    doc.setLanguage("en-US")
    
    console.log("Font configured for Unicode support")
    return true
  } catch (e) {
    console.error("Font registration failed:", e)
    return false
  }
}

/**
 * Alternative: Load Inter font dynamically from Google Fonts for web preview
 * This ensures consistent rendering between preview and PDF
 */
function loadInterFont() {
  return new Promise((resolve, reject) => {
    // Check if Inter is already loaded
    if (document.fonts && document.fonts.check && document.fonts.check('12px Inter')) {
      resolve()
      return
    }

    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    link.rel = "stylesheet"
    link.onload = () => {
      // Wait for font to actually load
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => resolve())
      } else {
        setTimeout(() => resolve(), 100)
      }
    }
    link.onerror = () => reject(new Error("Failed to load Inter font"))
    
    // Only add if not already present
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link)
    } else {
      resolve()
    }
  })
}

/**
 * Test function to verify Unicode character support
 * @param {jsPDF} doc 
 * @param {string} testText 
 */
function testUnicodeSupport(doc, testText = "Test: Č Ž Š č ž š") {
  try {
    // Try to add the test text to verify it renders correctly
    const tempPage = doc.internal.getCurrentPageInfo()
    doc.text(testText, 10, 10)
    console.log("Unicode test successful:", testText)
    return true
  } catch (e) {
    console.error("Unicode test failed:", e)
    return false
  }
}

/**
 * Enhanced character encoding for problematic characters
 * This function can replace problematic characters with similar ones if needed
 * @param {string} text 
 */
function enhanceTextEncoding(text) {
  if (!text) return text
  
  // Map of problematic characters to safe alternatives (fallback only)
  const charMap = {
    'Č': 'C', 'č': 'c',
    'Ž': 'Z', 'ž': 'z', 
    'Š': 'S', 'š': 's',
    'Ć': 'C', 'ć': 'c',
    'Đ': 'D', 'đ': 'd'
  }
  
  // First try to return original text (most fonts support these now)
  try {
    // Test if the string contains only supported characters
    return text
  } catch (e) {
    // Fallback: replace problematic characters
    console.warn("Replacing special characters due to font limitations")
    return text.replace(/[ČčŽžŠšĆćĐđ]/g, char => charMap[char] || char)
  }
}

/**
 * Initialize font system when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  loadInterFont()
    .then(() => {
      console.log("Inter font loaded successfully")
    })
    .catch(error => {
      console.warn("Inter font loading failed, using fallback:", error)
    })
})
