/**
 * This file contains the Base64 encoded data for the Noto Sans font.
 * It's loaded into the document and used by jsPDF to correctly render Unicode characters (e.g., č, š, ž, Cyrillic, etc.) in the PDF.
 * The Base64 string is very long and has been omitted here for readability, but its presence is simulated by this structure.
 * In a real-world scenario, you would generate this string from a .ttf font file.
 */
const NotoSansFontBase64 = `... VERY LONG BASE64 STRING ...`; // This would be the actual Base64 data.

/**
 * Registers the custom font with the provided jsPDF document instance.
 * @param {jsPDF} doc The jsPDF document instance.
 */
function registerNormalFont(doc) {
  // If the font data was present, this is how you would add it.
  // Since we cannot include the huge string, we will gracefully fall back to helvetica.
  // If you get the base64 string for NotoSans-Regular.ttf, uncommenting these lines will make it work.
  /*
  try {
    doc.addFileToVFS('NotoSans-Regular.ttf', NotoSansFontBase64);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans', 'normal');
  } catch (e) {
    console.error("Could not register font, falling back to helvetica", e);
    doc.setFont('helvetica', 'normal');
  }
  */

  // Fallback for this demonstration
  doc.setFont('helvetica', 'normal');
}
