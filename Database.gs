/** Spreadsheet access, header validation, and safe row helpers. */

function getSpreadsheet_() {
  return SpreadsheetApp.openById(TX_CONFIG.SPREADSHEET_ID);
}

function getSheet_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('শিট পাওয়া যায়নি: "' + sheetName + '"');
  }
  return sheet;
}

function getHeaderMap_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) throw new Error('শিটে কোনো header নেই: ' + sheet.getName());

  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  const map = {};
  headers.forEach((header, index) => {
    const key = String(header || "").trim();
    if (key) map[key] = index;
  });
  return map;
}

function validateHeaders_(sheetName, requiredHeaders) {
  const sheet = getSheet_(sheetName);
  const map = getHeaderMap_(sheet);
  const missing = requiredHeaders.filter(header => map[header] === undefined);
  if (missing.length) {
    throw new Error(
      '"' + sheetName + '" শিটে প্রয়োজনীয় কলাম নেই: ' + missing.join(", ")
    );
  }
  return { sheet: sheet, map: map };
}

function getCell_(row, map, header) {
  const index = map[header];
  return index === undefined ? "" : row[index];
}

function readProducts_() {
  const validated = validateHeaders_(
    TX_CONFIG.SHEETS.PRODUCTS,
    TX_CONFIG.HEADERS.PRODUCTS
  );
  const sheet = validated.sheet;
  const map = validated.map;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  return rows.map((row, i) => ({
    rowNumber: i + 2,
    productId: String(getCell_(row, map, "Product ID") || "").trim(),
    productName: String(getCell_(row, map, "Product Name") || "").trim(),
    category: String(getCell_(row, map, "Category") || "").trim(),
    minPrice: Number(getCell_(row, map, "Min Price BDT") || 0),
    maxPrice: Number(getCell_(row, map, "Max Price BDT") || 0),
    stockQty: Number(getCell_(row, map, "Stock Qty") || 0),
    folderUrl: String(getCell_(row, map, "Drive Folder URL") || "").trim(),
    active: String(getCell_(row, map, "Active") || "").trim().toLowerCase() === "yes",
    creativeStyle: String(getCell_(row, map, "Preferred Style") || "Auto").trim(),
    offerNotes: "",
    verifiedFeatures: String(getCell_(row, map, "Verified Features") || "").trim(),
    lastPostedAt: "",
    notes: ""
  })).filter(product => product.productId);
}

function extractDriveFolderId_(url) {
  const text = String(url || "").trim();
  if (!text) return "";
  const match = text.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
                text.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : "";
}

function assertRequiredSheets_() {
  const ss = getSpreadsheet_();
  const required = Object.values(TX_CONFIG.SHEETS);
  const missing = required.filter(name => !ss.getSheetByName(name));
  if (missing.length) {
    throw new Error("এই Tab/শিটগুলো পাওয়া যায়নি: " + missing.join(", "));
  }
  validateHeaders_(TX_CONFIG.SHEETS.PRODUCTS, TX_CONFIG.HEADERS.PRODUCTS);
  validateHeaders_(TX_CONFIG.SHEETS.MEDIA, TX_CONFIG.HEADERS.MEDIA);
  validateHeaders_(TX_CONFIG.SHEETS.LOG, TX_CONFIG.HEADERS.LOG);
  return ss;
}
