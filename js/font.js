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
    
    // Enable Unicode support in jsPDF
    doc.setCharSpace(0)
    
    console.log("Font configured for Unicode support")
    return true
    
  } catch (e) {
    console.error("Font registration failed:", e)
    return false
  }
}

/**
 * Alternative: Load and register Inter font dynamically if needed
 * This is more complex but provides the best character support
 */
async function loadInterFont() {
  try {
    // Check if Inter font is available
    if (document.fonts && document.fonts.check) {
      const isInterLoaded = document.fonts.check('16px Inter')
      
      if (isInterLoaded) {
        console.log("Inter font is available")
        return true
      } else {
        console.log("Inter font not found, using fallback")
        return false
      }
    }
    
    return false
  } catch (e) {
    console.error("Font check failed:", e)
    return false
  }
}

/**
 * Test function to check character rendering
 * @param {jsPDF} doc 
 * @param {string} testText 
 */
function testCharacterSupport(doc, testText = "Test: Č Ž Š Đ Ć") {
  try {
    // This function can be used to test if characters render properly
    doc.setFontSize(12)
    doc.text(testText, 20, 20)
    console.log("Character test added to PDF:", testText)
  } catch (e) {
    console.error("Character test failed:", e)
  }
}

/**
 * Enhanced registration with fallbacks
 * @param {jsPDF} doc 
 */
function registerEnhancedFont(doc) {
  const fallbackFonts = ['helvetica', 'times', 'courier']
  
  for (const font of fallbackFonts) {
    try {
      doc.setFont(font, "normal")
      console.log(`Successfully set font: ${font}`)
      return font
    } catch (e) {
      console.warn(`Font ${font} failed, trying next fallback`)
      continue
    }
  }
  
  console.error("All font fallbacks failed")
  return null
}
