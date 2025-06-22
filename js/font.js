/**
 * This file would contain the Base64 encoded data for a Unicode-compatible font like Noto Sans.
 * It's loaded into the document and used by jsPDF to correctly render special Unicode characters 
 * (e.g., č, š, ž, Cyrillic, CJK characters, etc.) in the PDF.
 *
 * The actual Base64 string is many megabytes long and is too large to include in this response.
 * In a real-world project, you would:
 * 1. Download a .ttf font file (e.g., NotoSans-Regular.ttf from Google Fonts).
 * 2. Convert the .ttf file to a Base64 string using an online tool or a local script.
 * 3. Paste that very long string as the value for the `NotoSansFontBase64` constant below.
 */
const NotoSansFontBase64 = ``; // PASTE THE VERY LONG BASE64 STRING HERE

/**
 * Registers the custom font with the provided jsPDF document instance.
 * @param {jsPDF} doc The jsPDF document instance.
 */
function registerNormalFont(doc) {
  // If the font data was pasted above, this code would embed it into the PDF.
  if (NotoSansFontBase64) {
      try {
        // Register the virtual file system entry for the font.
        doc.addFileToVFS('NotoSans-Regular.ttf', NotoSansFontBase64);
        // Add the font to jsPDF's font list.
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
        // Set the newly added font as the active font.
        doc.setFont('NotoSans', 'normal');
        return; // Exit if custom font is successfully set.
      } catch (e) {
        console.error("Could not register custom font. Falling back to default.", e);
      }
  }

  // If the custom font isn't available, fall back to the default.
  // Note: This will not render special characters correctly.
  console.warn("Custom font data not found. PDF characters may not render correctly for all languages.");
  doc.setFont('helvetica', 'normal');
}
