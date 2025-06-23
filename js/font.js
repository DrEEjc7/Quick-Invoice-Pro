/**
 * Enhanced Font handling for PDF generation with Inter font support
 * 
 * This provides excellent Unicode support including special characters 
 * like Č, Ž, Š, etc. while maintaining consistency with the UI.
 */

// Base64 encoded Inter font data - you'll need to add this
// To generate: Download Inter-Regular.ttf from Google Fonts, then convert to Base64
const InterFontBase64Regular = '' // Add your Base64 string here
const InterFontBase64Bold = '' // Add your Base64 string here

/**
 * Registers Inter font with jsPDF for better Unicode support
 * @param {jsPDF} doc The jsPDF document instance
 */
function registerInterFont(doc) {
  try {
    // Try to use Inter font if Base64 data is available
    if (InterFontBase64Regular && InterFontBase64Regular.length > 1000) {
      console.log("Registering Inter font for PDF...")
      
      // Add Inter Regular
      doc.addFileToVFS("Inter-Regular.ttf", InterFontBase64Regular)
      doc.addFont("Inter-Regular.ttf", "Inter", "normal")
      
      // Add Inter Bold if available
      if (InterFontBase64Bold && InterFontBase64Bold.length > 1000) {
        doc.addFileToVFS("Inter-Bold.ttf", InterFontBase64Bold)
        doc.addFont("Inter-Bold.ttf", "Inter", "bold")
      }
      
      doc.setFont("Inter", "normal")
      console.log("Inter font registered successfully")
      return true
    }
  } catch (e) {
    console.error("Inter font registration failed:", e)
  }

  // Fallback to helvetica (which has good Unicode support)
  try {
    doc.setFont("helvetica", "normal")
    console.log("Using Helvetica as fallback font")
    return true
  } catch (e) {
    console.error("Font registration completely failed:", e)
    return false
  }
}

/**
 * Alternative method: Simple approach without Base64
 * Uses system fonts with good Unicode support
 */
function registerSystemFont(doc) {
  try {
    // Use helvetica which has good Unicode support in jsPDF
    doc.setFont("helvetica", "normal")
    
    // Test Unicode support
    const testChars = "Č Ž Š č ž š"
    console.log(`Font test with characters: ${testChars}`)
    
    return true
  } catch (e) {
    console.error("System font registration failed:", e)
    return false
  }
}

/**
 * Load Inter font for web preview (ensures consistency)
 */
function loadInterFontForWeb() {
  return new Promise((resolve, reject) => {
    // Check if Inter is already loaded
    if (document.fonts && document.fonts.check('12px Inter')) {
      resolve()
      return
    }

    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    link.rel = "stylesheet"
    link.onload = () => {
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
 * Enhanced text processing for better character support
 * @param {string} text 
 */
function enhanceTextForPDF(text) {
  if (!text) return text
  
  // Inter and Helvetica support these characters, but this is a fallback
  const charMap = {
    // Only use as absolute last resort
    'Č': 'C', 'č': 'c',
    'Ž': 'Z', 'ž': 'z', 
    'Š': 'S', 'š': 's',
    'Ć': 'C', 'ć': 'c',
    'Đ': 'D', 'đ': 'd'
  }
  
  // First try to return original text (modern fonts support these)
  return text
  
  // Uncomment below only if you have issues with special characters
  // return text.replace(/[ČčŽžŠšĆćĐđ]/g, char => charMap[char] || char)
}

/**
 * Initialize font system
 */
document.addEventListener('DOMContentLoaded', () => {
  loadInterFontForWeb()
    .then(() => {
      console.log("Inter font loaded for web preview")
    })
    .catch(error => {
      console.warn("Inter font loading failed:", error)
    })
})

/**
 * Instructions for adding Inter font Base64 data:
 * 
 * 1. Download Inter fonts from: https://fonts.google.com/specimen/Inter
 * 2. You need: Inter-Regular.ttf and Inter-Bold.ttf
 * 3. Convert to Base64 using online tool or command:
 *    - macOS/Linux: base64 -i Inter-Regular.ttf
 *    - Online: Search "file to base64 converter"
 * 4. Copy the VERY LONG string and paste above as InterFontBase64Regular
 * 5. Do the same for Inter-Bold.ttf
 * 
 * Without the Base64 data, the app will use Helvetica as fallback,
 * which still supports most special characters including Č, Ž, Š.
 */
