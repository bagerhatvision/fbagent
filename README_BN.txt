TECH EXPRESS AI — COMPLETE GOOGLE APPS SCRIPT STARTER
======================================================

Repository / project name: tech-express-ai
Backend: Google Apps Script Web App
Database: Existing Google Sheet
Media storage: Google Drive
Timezone: Asia/Dhaka

FILES IN THIS PACKAGE
---------------------
Code.gs           Web App doGet() + dashboard server functions
Config.gs         Spreadsheet ID, tab names and expected headers
Database.gs       Sheet access, product reader and validation
DriveScanner.gs   Recursive Drive image/video scan and Media Library indexing
Logger.gs         Automation Log writer
Main.gs           Setup, connection test, spreadsheet menu and scan summary
index.html        Responsive dashboard (PC sidebar, mobile bottom navigation,
                  dark/light theme, product/media/log views)
appsscript.json   Apps Script manifest
README_BN.txt     Bengali installation and deployment guide

IMPORTANT — WHAT THIS PACKAGE DOES NOW
--------------------------------------
This is the complete Phase-1 Dashboard + Google Sheets/Drive connection package.
It is not yet the complete AI/Facebook automation system.

Working after installation/authorization:
1. Serves the Dashboard from Google Apps Script Web App.
2. Connects to the configured Google Spreadsheet.
3. Reads Products rows.
4. Scans product Drive folders recursively for image/* and video/*.
5. Indexes media into Media Library without moving/renaming/deleting Drive files.
6. Shows Products, Media Library and Automation Logs in the Dashboard.
7. Logs setup, connection tests and media scans.

Not implemented/activated in this phase:
- AI caption/offer generation
- Image creative generation/editing
- FFmpeg video processing (requires a separate local PC worker)
- Meta/Facebook OAuth and publishing
- Daily scheduled publishing triggers
- Meta analytics/insights
These must be developed and tested in later phases. The UI labels these as inactive.
No fake publishing or AI status is shown.

INSTALLATION — STEP BY STEP
---------------------------
A. Open the existing Google Sheet:
   https://docs.google.com/spreadsheets/d/1KlQJ-FYMtc5L3V2-DyxNfzz5fQehiNRqYsQbmMa9sOY/edit

B. Click Extensions > Apps Script.

C. In Apps Script, create/replace these files:
   - Code.gs       (paste Code.gs)
   - Config.gs
   - Database.gs
   - DriveScanner.gs
   - Logger.gs
   - Main.gs
   - index.html    (Add file > HTML; the file name must be index)
   Do not create a second doGet() function in another file.

D. Project Settings > enable "Show appsscript.json manifest file in editor".
   Open appsscript.json and replace its content with the included manifest.
   Save all files.

E. In Apps Script editor, select setupProject and click Run.
   Review the Google permission prompt and authorize the account that owns/has
   access to the spreadsheet and every product Drive folder.

F. If setupProject succeeds, reload the Google Sheet. A menu named
   "Tech Express AI" should appear.
   Run "Connection Test", then "Drive Media Scan".
   Confirm that Media Library rows are populated.

G. Deploy the Dashboard:
   Deploy > New deployment > Select type: Web app.
   Execute as: Me (the authorizing account).
   Who has access: choose the narrowest access that works for your use.
   For a personal admin dashboard, do not choose public/anonymous access unless
   you intentionally want anyone with the URL to access it.
   Click Deploy, authorize if prompted, then open the Web App URL.

H. Dashboard > Connections > Test Connection.
   Then check Products and Media Library pages.

SHEET TAB NAMES
---------------
Products
Media Library
Post Queue
Post History
Settings
Analytics
Automation Log

REQUIRED HEADERS
----------------
Products:
Product ID | Product Name | Category | Min Price BDT | Max Price BDT |
Stock Qty | Drive Folder URL | Active | Preferred Style | Verified Features

Media Library:
Media ID | Product ID | Drive File ID | File Name | Media Type | Drive URL |
MIME Type | File Size | Duration (sec) | Aspect Ratio | Media Status |
Last Used At | Usage Count | Notes

Automation Log:
Log ID | Timestamp | Workflow | Product ID | Action | Status | Details |
Related Post ID

SECURITY NOTES
--------------
- The Spreadsheet ID is already set in Config.gs to the spreadsheet provided.
- Apps Script runs with the permissions granted during authorization.
- Keep the Web App access restricted. Anyone granted access may see the data
  returned by the Dashboard.
- Never paste Facebook Page access tokens, app secrets or passwords into
  index.html, GitHub, Google Sheets, or screenshots. Store secrets server-side
  in Script Properties in a later integration phase.
- Google Apps Script has quotas and execution-time limits; this is not an
  unlimited cloud compute service.
- The GitHub repository can store source code privately. This Apps Script
  deployment serves the actual Dashboard, so Cloudflare/GitHub Pages hosting
  is not needed for this architecture.

TROUBLESHOOTING
---------------
- "Sheet not found": confirm all seven tab names exactly.
- "Required columns missing": compare row 1 headers with the lists above.
- Drive access error: authorize using an account that can open every product
  folder; grant that account at least Viewer access if needed.
- Dashboard does not load: confirm HTML file name is exactly "index" and
  redeploy after saving.
- After code changes, use Deploy > Manage deployments > Edit > New version >
  Deploy to update the deployed Web App.

NEXT PHASE
----------
After this phase is installed and the user confirms the Dashboard connection,
we will build and test the next feature set incrementally:
1. Dashboard summary/queue/history improvements.
2. AI content generation with strict min/max price and verified-feature rules.
3. Creative workflow using the actual product images.
4. Facebook Page authorization and publishing.
5. Scheduled publishing at 10:00, 14:00 and 20:00 Bangladesh time.
