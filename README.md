# 📑 All-Type Fillable Forms Portal (शासकीय एवं वैधानिक प्रपत्र पोर्टल)

An interactive, responsive, and high-fidelity web-based government and statutory forms portal. Fill forms digitally with real-time auto-calculation, export clean multi-page PDFs, and print directly onto standard A4 or Legal paper sizes.

---

## 🚀 Live Demo & Production Deployment
- **Live Website**: [https://sarkari-forms-seva-555.web.app](https://sarkari-forms-seva-555.web.app)
- **Admin Portal**: [https://sarkari-forms-seva-555.web.app/admin-users.html](https://sarkari-forms-seva-555.web.app/admin-users.html)
- **Local Preview**: Open `index.html` directly or serve via `python -m http.server 3000`.

---

## 🔐 Administrative Dashboard, Form Editor & Video Hub
Access **[admin-users.html](admin-users.html)** for centralized portal management.
- **Admin Access**:
  - Email: `smart.webpage.storage@gmail.com`
  - Password: `EPFO#Admin123` or Master PIN: `EPFO#121007`
  - Universal access to all 20 forms without role restrictions.
- **Tab 1 — पंजीकृत यूज़र्स (User Database & Sync)**:
  - Role Breakdown Analytics: Live counters for Members, Employers, EPFO Staff, and Central Govt Staff.
  - Data Exporting: 1-click Export to Excel (CSV), JSON download, and code snippet backup.
  - Google Sheets Real-Time Sync: Webhook integration forwarding all registrations instantly to Google Sheets with full 13-column schema.
- **Tab 2 — प्रपत्र सामग्री संपादक (Form Content Manager & Live Visual Editor)**:
  - Select any of the 20 forms to customize Office Header, Subtitle, Custom Notice, and Signatory Notes.
  - One-click launch into **Live Visual Editor (`?admin_edit=true`)**: edit any text, title, or table on the form directly in the browser and save with 1 click.
- **Tab 3 — वीडियो एवं मीडिया ट्यूटोरियल प्रबंधक (Video Hub Manager)**:
  - Add video tutorials for any existing form or new custom topic.
  - Add YouTube links (auto-converts to embed player) OR upload local video files (`.mp4`, `.webm`, `.ogg`) saved locally via IndexedDB.
  - Preview any video directly within the dashboard or view on the main home page.

---

## ✨ Core Highlights & Technical Features

- **Pixel-Perfect Official Layouts**: Bilingual (Hindi & English) matching physical government and EPFO forms.
- **Top Sticky Action Bar**: Identical across all forms with:
  - 🏠 **Home Portal Navigation**
  - 📂 **Form List (प्रपत्र सूची) Dropdown**: Quick switching across all 5 forms.
  - 📐 **Page Size Switcher (A4 / Legal)**: Balanced vertical layout for both formats.
  - ⚡ **Fill Sample Data**: Instant 1-click population of realistic test data.
  - 🧹 **Clear Blank Form**: Resets all inputs to a clean state.
  - 📄 **Save as PDF**: Multi-sheet PDF generation using `html2pdf.js`.
  - 🖨️ **Print Form (<kbd>Ctrl</kbd> + <kbd>P</kbd>)**: Clean print stylesheet hiding toolbars and buttons.
- **Pure Vanilla Web Tech**: Pure HTML5, CSS3, and JavaScript — no heavyweight dependencies or build steps required.

---

## 🛠️ How to Run Locally

1. Clone or download this repository:
   ```bash
   git clone https://github.com/smartwebpagestorage-hub/all-type-fillable-form.git
   cd all-type-fillable-form
   ```
2. Start any local HTTP server, e.g., using Python:
   ```bash
   python -m http.server 3000
   ```
3. Open `http://localhost:3000` in your browser.

---

## 📄 License
Open source and free to use for official, organizational, and educational purposes.
