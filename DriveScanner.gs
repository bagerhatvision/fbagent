/**
 * Scans product folders recursively for image/video files.
 * Existing Media Library records are updated by Drive File ID; duplicates are not added.
 * Files are never moved, renamed, or deleted.
 */

function scanAllProductMedia(showAlert) {
  if (showAlert === undefined) showAlert = true;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error("আরেকটি Scan চলছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
  }

  const started = new Date();
  let productsScanned = 0;
  let filesFound = 0;
  let productsSkipped = 0;
  const errors = [];
  const successfullyScannedProductIds = [];

  try {
    assertRequiredSheets_();
    const products = readProducts_().filter(p => p.active);
    const allFound = [];

    products.forEach(product => {
      try {
        const folderId = extractDriveFolderId_(product.folderUrl);
        if (!folderId) {
          productsSkipped++;
          const message = "Drive Product Folder URL ফাঁকা বা ভুল";
          errors.push(product.productId + ": " + message);
          logEvent_("Drive Scanner", product.productId, "Folder validation", "Skipped", message);
          return;
        }

        const folder = DriveApp.getFolderById(folderId);
        const found = [];
        scanFolderRecursive_(folder, product, found);
        allFound.push.apply(allFound, found);
        successfullyScannedProductIds.push(product.productId);
        productsScanned++;
        filesFound += found.length;
        logEvent_(
          "Drive Scanner", product.productId, "Folder scan", "Success",
          found.length + "টি image/video পাওয়া গেছে"
        );
      } catch (err) {
        productsSkipped++;
        errors.push(product.productId + ": " + err.message);
        logEvent_("Drive Scanner", product.productId, "Folder scan", "Error", err.message);
      }
    });

    upsertMediaLibrary_(allFound, successfullyScannedProductIds);
    const summary = {
      startedAt: started,
      finishedAt: new Date(),
      productsScanned: productsScanned,
      productsSkipped: productsSkipped,
      mediaFound: filesFound,
      errors: errors
    };
    PropertiesService.getScriptProperties().setProperty(
      "TX_LAST_SCAN_SUMMARY", JSON.stringify(summary)
    );
    logEvent_(
      "Drive Scanner", "", "Full scan",
      errors.length ? "Completed with warnings" : "Success",
      JSON.stringify(summary)
    );
    if (showAlert) {
      SpreadsheetApp.getUi().alert(
        "Drive Scan সম্পন্ন",
        "স্ক্যান করা Product: " + productsScanned +
        "\nস্কিপ/সমস্যা: " + productsSkipped +
        "\nপাওয়া Image/Video: " + filesFound +
        (errors.length ? "\n\nসমস্যা:\n" + errors.slice(0, 8).join("\n") : ""),
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
    return summary;
  } finally {
    lock.releaseLock();
  }
}

function scanFolderRecursive_(folder, product, output) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const mime = file.getMimeType();
    let mediaType = "";

    if (mime && mime.indexOf("image/") === 0) {
      mediaType = TX_CONFIG.MEDIA_TYPES.IMAGE;
    } else if (mime && mime.indexOf("video/") === 0) {
      mediaType = TX_CONFIG.MEDIA_TYPES.VIDEO;
    } else {
      continue;
    }

    output.push({
      mediaId: product.productId + "_" + file.getId(),
      productId: product.productId,
      fileId: file.getId(),
      fileName: file.getName(),
      mediaType: mediaType,
      driveUrl: file.getUrl(),
      mimeType: mime,
      fileSize: file.getSize(),
      mediaStatus: TX_CONFIG.STATUS.AVAILABLE
    });
  }

  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    scanFolderRecursive_(subfolders.next(), product, output);
  }
}

function upsertMediaLibrary_(foundMedia, scannedProductIds) {
  const validated = validateHeaders_(
    TX_CONFIG.SHEETS.MEDIA,
    TX_CONFIG.HEADERS.MEDIA
  );
  const sheet = validated.sheet;
  const map = validated.map;
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  const existingRows = lastRow >= 2
    ? sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues()
    : [];

  const fileIdCol = map["Drive File ID"];
  const productIdCol = map["Product ID"];
  const rowByKey = new Map();

  existingRows.forEach((row, index) => {
    const key = String(row[productIdCol] || "") + "|" + String(row[fileIdCol] || "");
    if (key !== "|") rowByKey.set(key, index + 2);
  });

  // Mark previous entries for scanned products as not found. Found files are set back to Available.
  const scannedSet = new Set(scannedProductIds);
  existingRows.forEach((row, index) => {
    const pid = String(row[productIdCol] || "");
    if (scannedSet.has(pid) && map["Media Status"] !== undefined) {
      sheet.getRange(index + 2, map["Media Status"] + 1).setValue(TX_CONFIG.STATUS.NOT_FOUND);
    }
  });

  foundMedia.forEach(media => {
    const key = media.productId + "|" + media.fileId;
    let rowNumber = rowByKey.get(key);
    if (!rowNumber) rowNumber = sheet.getLastRow() + 1;

    const values = {
      "Media ID": media.mediaId,
      "Product ID": media.productId,
      "Drive File ID": media.fileId,
      "File Name": media.fileName,
      "Media Type": media.mediaType,
      "Drive URL": media.driveUrl,
      "MIME Type": media.mimeType,
      "File Size": media.fileSize,
      "Duration (sec)": "",
      "Aspect Ratio": "",
      "Media Status": TX_CONFIG.STATUS.AVAILABLE,
      "Last Used At": "",
      "Usage Count": 0,
      "Notes": ""
    };

    Object.keys(values).forEach(header => {
      if (map[header] !== undefined) {
        sheet.getRange(rowNumber, map[header] + 1).setValue(values[header]);
      }
    });
  });
}
