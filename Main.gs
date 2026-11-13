/** Custom spreadsheet menu and setup/test actions. */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Tech Express AI")
    .addItem("১. Connection Test", "testConnection")
    .addItem("২. Drive Media Scan", "scanAllProductMedia")
    .addSeparator()
    .addItem("শেষ Scan-এর Summary", "showLastScanSummary")
    .addToUi();
}

function setupProject() {
  const ss = assertRequiredSheets_();
  ss.setSpreadsheetTimeZone(TX_CONFIG.TIMEZONE);
  logEvent_("Setup", "", "Project setup", "Success", "Sheet tabs and required headers verified");
  SpreadsheetApp.getUi().alert(
    "Setup সফল",
    "Spreadsheet connection এবং প্রয়োজনীয় ৭টি Tab/headers ঠিক আছে।\nএখন Connection Test, তারপর Drive Media Scan চালান।",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function testConnection() {
  const ss = assertRequiredSheets_();
  const products = readProducts_();
  const active = products.filter(p => p.active);
  const invalidFolders = active.filter(p => !extractDriveFolderId_(p.folderUrl));

  const message =
    "Spreadsheet: Connected\n" +
    "Spreadsheet Name: " + ss.getName() + "\n" +
    "Product rows: " + products.length + "\n" +
    "Active products: " + active.length + "\n" +
    "Invalid/missing folder links: " + invalidFolders.length +
    (invalidFolders.length ? "\n" + invalidFolders.map(p => p.productId).join(", ") : "");

  logEvent_("Connection Test", "", "Test connection", "Success", message);
  SpreadsheetApp.getUi().alert("Connection Test", message, SpreadsheetApp.getUi().ButtonSet.OK);
  return message;
}

function showLastScanSummary() {
  const raw = PropertiesService.getScriptProperties().getProperty("TX_LAST_SCAN_SUMMARY");
  if (!raw) {
    SpreadsheetApp.getUi().alert("এখনো কোনো Drive Scan করা হয়নি।");
    return;
  }
  const s = JSON.parse(raw);
  SpreadsheetApp.getUi().alert(
    "শেষ Scan Summary",
    "Product scanned: " + s.productsScanned +
    "\nProduct skipped: " + s.productsSkipped +
    "\nMedia found: " + s.mediaFound +
    "\nFinished: " + new Date(s.finishedAt).toLocaleString("en-GB", { timeZone: TX_CONFIG.TIMEZONE }) +
    (s.errors && s.errors.length ? "\n\nErrors:\n" + s.errors.slice(0, 10).join("\n") : ""),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
