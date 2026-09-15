# 📑 All-Type Fillable Forms Portal (शासकीय एवं वैधानिक प्रपत्र पोर्टल)

An interactive, responsive, and high-fidelity web-based government and statutory forms portal. Fill forms digitally with real-time auto-calculation, export clean multi-page PDFs, and print directly onto standard A4 or Legal paper sizes.

---

## 🚀 Live Demo & Portal
Open `index.html` in any modern web browser or access the published GitHub Pages site.

---

## 📋 Available Active Forms

| # | Form Name | Description | Key Features |
|---|---|---|---|
| 1 | **[EPFO Composite Claim Form (Death Cases)](epfo-death-claim.html)** | Forms 20 (PF), 10-D (Pension), and 5-IF (EDLI) for deceased members | 4-column layout, 14 data sections, claimant particulars, bank accounts, enclosures |
| 2 | **[On-Roll & Family Description Certificates](onroll-family-form.html)** | Two separate A4 statutory certificates issued by employer | **Real-time 2-way auto-sync**, dynamic beneficiary rows, auto-expanding dotted blanks |
| 3 | **[EPFO Form 10-D (Monthly Pension)](epfo-form-10d.html)** | Application for monthly pension under EPS 1995 (Full 6 Sheets) | Complete 6 pages, 12-month wages table, family particulars, descriptive roll |
| 4 | **[G.A.R-14A: TA Bill for Tour](gar14a-ta-bill.html)** | Tour Traveling Allowance Bill under Rules 66(1) & 90(1)(i) (3 Sheets) | Journey particulars, **dynamic row addition/deletion**, **live total auto-calculation**, Part-B entitlement section |
| 5 | **[EPFO Composite Claim Form (Aadhar)](epfo-composite-claim-aadhar.html)** | Unified single form combining **Form 19, 10C & 31** (3 Sheets) | 10 withdrawal purpose options, PAN details, Page 1 form + Pages 2-3 official instructions |
| 6 | **[Children Education Allowance (CEA)](children-education-allowance.html)** | CEA & Hostel Subsidy claim form for Central Govt employees (4 Sheets) | 4 complete pages, expenditure table, dynamic child rows, Bonafide school certificate, self-declaration |
| 7 | **[Stationery Requisition Form](stationery-requisition.html)** | Office Stationery Requisition Slip / Note Sheet | **Customizable Office Header (Name & Address)**, dynamic item addition/deletion, **[+] and [-] quantity adjusters**, storekeeper action block |

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
