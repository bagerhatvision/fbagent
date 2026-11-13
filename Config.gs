/**
 * Tech Express 2.0 - AI Marketing Agent
 * Phase 1: Google Sheets connection + Google Drive media scanner
 *
 * IMPORTANT:
 * - This phase does NOT publish to Facebook.
 * - It only reads product rows and indexes image/video files.
 */

const TX_CONFIG = Object.freeze({
  SPREADSHEET_ID: "1KlQJ-FYMtc5L3V2-DyxNfzz5fQehiNRqYsQbmMa9sOY",
  TIMEZONE: "Asia/Dhaka",
  SHEETS: {
    PRODUCTS: "Products",
    MEDIA: "Media Library",
    QUEUE: "Post Queue",
    HISTORY: "Post History",
    SETTINGS: "Settings",
    ANALYTICS: "Analytics",
    LOG: "Automation Log"
  },
  HEADERS: {
    PRODUCTS: [
      "Product ID", "Product Name", "Category", "Min Price BDT",
      "Max Price BDT", "Stock Qty", "Drive Folder URL",
      "Active", "Preferred Style", "Verified Features"
    ],
    MEDIA: [
      "Media ID", "Product ID", "Drive File ID", "File Name",
      "Media Type", "Drive URL", "MIME Type", "File Size",
      "Duration (sec)", "Aspect Ratio", "Media Status",
      "Last Used At", "Usage Count", "Notes"
    ],
    LOG: [
      "Log ID", "Timestamp", "Workflow", "Product ID",
      "Action", "Status", "Details", "Related Post ID"
    ]
  },
  MEDIA_TYPES: {
    IMAGE: "Image",
    VIDEO: "Video"
  },
  STATUS: {
    AVAILABLE: "Available",
    NOT_FOUND: "Not Found"
  }
});
