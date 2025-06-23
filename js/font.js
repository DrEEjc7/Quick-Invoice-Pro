/**
 * Font handling for PDF generation with Unicode support
 *
 * To fix special characters (Č, Ž, Š, etc.) in PDF exports:
 * 1. Download NotoSans-Regular.ttf from Google Fonts
 * 2. Convert it to Base64 using an online converter or this command:
 *    base64 -i NotoSans-Regular.ttf -o noto-sans-base64.txt
 * 3. Copy the Base64 string and paste it as the value for NotoSansFontBase64 below
 */

// Paste your Base64 encoded font data here
const NotoSansFontBase64 = `` // PASTE THE VERY LONG BASE64 STRING HERE

/**
 * Registers the custom font with the provided jsPDF document instance.
 * @param {jsPDF} doc The jsPDF document instance.
 */
function registerNormalFont(doc) {
  // Try to use custom font for Unicode support
  if (NotoSansFontBase64 && NotoSansFontBase64.length > 1000) {
    try {
      console.log("Registering custom Unicode font...")
      doc.addFileToVFS("NotoSans-Regular.ttf", NotoSansFontBase64)
      doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal")
      doc.setFont("NotoSans", "normal")
      console.log("Custom font registered successfully")
      return
    } catch (e) {
      console.error("Could not register custom font:", e)
    }
  }

  // Fallback: Try to use a system font that supports more characters
  try {
    // Try Arial Unicode MS or other system fonts
    doc.setFont("helvetica", "normal")
    console.warn("Using fallback font. Special characters may not render correctly.")
    console.warn("To fix this, add NotoSans font data to js/font.js")
  } catch (e) {
    console.error("Font registration failed:", e)
  }
}

/**
 * Alternative method: You can also use web fonts by loading them dynamically
 * This is a more complex but potentially better solution for web apps
 */
function loadWebFont() {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap"
    link.rel = "stylesheet"
    link.onload = () => resolve()
    link.onerror = () => reject()
    document.head.appendChild(link)
  })
}
