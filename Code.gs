/**
 * Tech Express AI Dashboard — Google Apps Script Web App entry and API.
 * The HTML is served by HtmlService, so the browser uses google.script.run
 * instead of cross-origin fetch requests.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Tech Express AI — Marketing Command Center")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function dashboardApiPing() {
  try {
    const ss = assertRequiredSheets_();
    const products = readProducts_();
    logEvent_("Dashboard", "", "Connection test", "Success", "Dashboard API connected");
    return {
      ok: true,
      message: "Connected",
      spreadsheetName: ss.getName(),
      productCount: products.length,
      activeProductCount: products.filter(p => p.active).length,
      timezone: TX_CONFIG.TIMEZONE,
      checkedAt: Utilities.formatDate(new Date(), TX_CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss")
    };
  } catch (err) {
    throw new Error("Backend connection failed: " + err.message);
  }
}

function dashboardApiProducts() {
  return {
    ok: true,
    products: readProducts_().map(p => ({
      id: p.productId,
      name: p.productName,
      category: p.category,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      stock: p.stockQty,
      active: p.active
    }))
  };
}

function dashboardApiMedia() {
  const v = validateHeaders_(TX_CONFIG.SHEETS.MEDIA, TX_CONFIG.HEADERS.MEDIA);
  const sheet = v.sheet, map = v.map, last = sheet.getLastRow();
  if (last < 2) return { ok: true, media: [] };
  const rows = sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getDisplayValues();
  const media = rows.map(r => ({
    productId: r[map["Product ID"]],
    name: r[map["File Name"]],
    type: r[map["Media Type"]],
    url: r[map["Drive URL"]],
    status: r[map["Media Status"]]
  })).filter(x => x.name);
  return { ok: true, media: media };
}

function dashboardApiLogs() {
  const v = validateHeaders_(TX_CONFIG.SHEETS.LOG, TX_CONFIG.HEADERS.LOG);
  const sheet = v.sheet, map = v.map, last = sheet.getLastRow();
  if (last < 2) return { ok: true, logs: [] };
  const start = Math.max(2, last - 99);
  const rows = sheet.getRange(start, 1, last - start + 1, sheet.getLastColumn()).getDisplayValues();
  const logs = rows.reverse().map(r => ({
    time: r[map["Timestamp"]],
    workflow: r[map["Workflow"]],
    productId: r[map["Product ID"]],
    action: r[map["Action"]],
    status: r[map["Status"]],
    details: r[map["Details"]]
  }));
  return { ok: true, logs: logs };
}

function dashboardApiScan() {
  const summary = scanAllProductMedia(false);
  return {
    ok: true,
    productsScanned: summary.productsScanned,
    productsSkipped: summary.productsSkipped,
    mediaFound: summary.mediaFound,
    errors: summary.errors || []
  };
}
