/** Central automation log writer. */

function logEvent_(workflow, productId, action, status, details, relatedPostId) {
  try {
    const validated = validateHeaders_(
      TX_CONFIG.SHEETS.LOG,
      TX_CONFIG.HEADERS.LOG
    );
    const sheet = validated.sheet;
    const map = validated.map;
    const record = {
      "Log ID": Utilities.getUuid(),
      "Timestamp": new Date(),
      "Workflow": workflow || "",
      "Product ID": productId || "",
      "Action": action || "",
      "Status": status || "",
      "Details": details || "",
      "Related Post ID": relatedPostId || ""
    };
    const row = new Array(sheet.getLastColumn()).fill("");
    Object.keys(record).forEach(key => {
      if (map[key] !== undefined) row[map[key]] = record[key];
    });
    sheet.appendRow(row);
  } catch (err) {
    console.error("Log write failed: " + err.message);
  }
}
