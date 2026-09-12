/**
 * EPFO Composite Claim Form in Death Cases (Forms 20, 10-D, 5-IF)
 * Interactive Script for Blank/Filled forms, Sample Data, PDF export, and Printing
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('compositeClaimForm');
  const btnPrint = document.getElementById('btnPrint');
  const btnSavePdf = document.getElementById('btnSavePdf');
  const btnSampleData = document.getElementById('btnSampleData');
  const btnClearForm = document.getElementById('btnClearForm');
  const btnSizeA4 = document.getElementById('btnSizeA4');
  const btnSizeLegal = document.getElementById('btnSizeLegal');

  // Page Size State (Default: A4)
  let currentPaperSize = 'a4';

  if (btnSizeA4 && btnSizeLegal) {
    btnSizeA4.addEventListener('click', () => setPaperSize('a4'));
    btnSizeLegal.addEventListener('click', () => setPaperSize('legal'));
  }

  function setPaperSize(size) {
    currentPaperSize = size;
    const dynamicStyle = document.getElementById('dynamicPageSizeStyle');
    if (size === 'legal') {
      btnSizeLegal.classList.add('active');
      btnSizeA4.classList.remove('active');
      document.body.classList.remove('size-a4');
      document.body.classList.add('size-legal');
      if (dynamicStyle) {
        dynamicStyle.textContent = '@page { size: legal portrait; margin: 7mm 8mm 7mm 8mm; }';
      }
    } else {
      btnSizeA4.classList.add('active');
      btnSizeLegal.classList.remove('active');
      document.body.classList.remove('size-legal');
      document.body.classList.add('size-a4');
      if (dynamicStyle) {
        dynamicStyle.textContent = '@page { size: A4 portrait; margin: 5mm 6mm 5mm 6mm; }';
      }
    }
  }

  // Print Form Action
  btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Save as PDF Action
  btnSavePdf.addEventListener('click', () => {
    exportToPDF();
  });

  // Clear Form to Blank State
  btnClearForm.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all fields and start with a blank form?')) {
      clearAllFields();
    }
  });

  // Fill Realistic Sample Data
  btnSampleData.addEventListener('click', () => {
    fillSampleData();
  });

  // Auto uppercase deceased member name
  const deceasedNameInput = document.getElementById('deceasedName');
  if (deceasedNameInput) {
    deceasedNameInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
    });
  }

  // Format Aadhaar inputs (12 digits with spaces: XXXX XXXX XXXX)
  const aadhaarFields = document.querySelectorAll('.aadhaar-field');
  aadhaarFields.forEach(field => {
    field.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 12);
      let parts = [];
      for (let i = 0; i < val.length; i += 4) {
        parts.push(val.substring(i, i + 4));
      }
      e.target.value = parts.join(' ');
    });
  });

  // Format Mobile field (10 digits numeric)
  const mobileInput = document.getElementById('mobileNumber');
  if (mobileInput) {
    mobileInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
    });
  }

  // Format UAN field (12 digits numeric)
  const uanInput = document.getElementById('deceasedUAN');
  if (uanInput) {
    uanInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 12);
    });
  }

  /**
   * Clears all fields in the form
   */
  function clearAllFields() {
    form.reset();
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  }

  /**
   * Populates authentic sample data into all fields
   */
  function fillSampleData() {
    // Checkboxes
    document.getElementById('claimPF').checked = true;
    document.getElementById('claimPension').checked = true;
    document.getElementById('pensionClaimType').value = 'विधवा एवं बाल पेंशन / Widow & Children Pension';
    document.getElementById('claimEDLI').checked = true;

    // Header Mobile
    document.getElementById('mobileNumber').value = '9820123456';

    // Member Details
    document.getElementById('deceasedName').value = 'RAMESH CHOKIKAR';
    document.getElementById('fatherName').value = 'SHIVAJI CHOKIKAR';
    document.getElementById('spouseName').value = 'RAGINEE CHOKIKAR';
    document.getElementById('maritalStatus').value = 'विवाहित / Married';

    // Identifiers
    document.getElementById('deceasedAadhaar').value = '4321 8765 9012';
    document.getElementById('deceasedUAN').value = '100026389870';
    document.getElementById('deceasedPFNo').value = 'MH/BAN/0014526/000/0087412';

    // Service & Death
    document.getElementById('dateOfLeaving').value = '15/04/2023';
    document.getElementById('schemeCertIssued').value = 'No / नहीं';
    document.getElementById('schemeCertNo').value = '';
    document.getElementById('schemeCertOffice').value = '';

    document.getElementById('ncpYears').value = '0';
    document.getElementById('ncpMonths').value = '2';
    document.getElementById('ncpDays').value = '14';

    document.getElementById('dateOfDeath').value = '22/04/2023';
    document.getElementById('diedInService').value = 'Yes / हां';

    // Claimants Table (Row 11)
    // Claimant 1 (Spouse)
    setField('c1_name', 'RAGINEE CHOKIKAR');
    setField('c1_parentSpouse', 'W/O LATE RAMESH CHOKIKAR');
    setField('c1_aadhaar', '8976 5432 1098');
    setField('c1_gender', 'Female / स्त्री');
    setField('c1_dob', '12/08/1985');
    setField('c1_marital', 'Widow');
    setField('c1_relMember', 'Wife / पत्नी');
    setField('c1_relGuardian', '-');

    // Claimant 2 (Minor Son)
    setField('c2_name', 'ROHAN CHOKIKAR');
    setField('c2_parentSpouse', 'S/O LATE RAMESH CHOKIKAR');
    setField('c2_aadhaar', '6543 2109 8765');
    setField('c2_gender', 'Male / पु');
    setField('c2_dob', '05/11/2010');
    setField('c2_marital', 'Unmarried');
    setField('c2_relMember', 'Son / पुत्र');
    setField('c2_relGuardian', 'Raginee Chokikar (Mother)');

    // Claimant 3 (Minor Daughter)
    setField('c3_name', 'RIYA CHOKIKAR');
    setField('c3_parentSpouse', 'D/O LATE RAMESH CHOKIKAR');
    setField('c3_aadhaar', '7654 3210 9876');
    setField('c3_gender', 'Female / स्त्री');
    setField('c3_dob', '18/02/2014');
    setField('c3_marital', 'Unmarried');
    setField('c3_relMember', 'Daughter / पुत्री');
    setField('c3_relGuardian', 'Raginee Chokikar (Mother)');

    // Bank Details PF & EDLI (Section 12)
    setField('pf_bank_c1_name', 'RAGINEE CHOKIKAR');
    setField('pf_bank_c1_acc', '30245678901');
    setField('pf_bank_c1_bank', 'State Bank of India, Bandra (E), Mumbai');
    setField('pf_bank_c1_ifsc', 'SBIN0000321');

    setField('pf_bank_c2_name', 'ROHAN CHOKIKAR (Minor)');
    setField('pf_bank_c2_acc', '30245678902');
    setField('pf_bank_c2_bank', 'State Bank of India, Bandra (E), Mumbai');
    setField('pf_bank_c2_ifsc', 'SBIN0000321');

    setField('pf_bank_c3_name', 'RIYA CHOKIKAR (Minor)');
    setField('pf_bank_c3_acc', '30245678903');
    setField('pf_bank_c3_bank', 'State Bank of India, Bandra (E), Mumbai');
    setField('pf_bank_c3_ifsc', 'SBIN0000321');

    // Bank Details Pension (Section 13)
    setField('pension_bank_c1_name', 'RAGINEE CHOKIKAR');
    setField('pension_bank_c1_acc', '30245678901');
    setField('pension_bank_c1_bank', 'State Bank of India, Bandra (E), Mumbai');
    setField('pension_bank_c1_ifsc', 'SBIN0000321');

    setField('pension_bank_c2_name', 'ROHAN CHOKIKAR (Minor)');
    setField('pension_bank_c2_acc', '30245678902');
    setField('pension_bank_c2_bank', 'State Bank of India, Bandra (E), Mumbai');
    setField('pension_bank_c2_ifsc', 'SBIN0000321');

    setField('pension_bank_c3_name', 'RIYA CHOKIKAR (Minor)');
    setField('pension_bank_c3_acc', '30245678903');
    setField('pension_bank_c3_bank', 'State Bank of India, Bandra (E), Mumbai');
    setField('pension_bank_c3_ifsc', 'SBIN0000321');

    // Address (Row 14)
    document.getElementById('postalAddress').value = 'Flat No. 402, Building 3B, Sai Kripa CHS, Station Road, Bandra (East), Mumbai, Maharashtra - 400051';

    // Signatures
    document.getElementById('claimantSignName').value = 'RAGINEE CHOKIKAR';
  }

  function setField(name, value) {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) {
      el.value = value;
    }
  }

  /**
   * Direct PDF Export using html2pdf with fallback to window.print()
   */
  function exportToPDF() {
    const element = document.getElementById('printableFormArea');
    const deceasedName = document.getElementById('deceasedName').value.trim() || 'BLANK';
    const filename = `EPFO_Composite_Claim_Form_${currentPaperSize.toUpperCase()}_${deceasedName.replace(/\s+/g, '_')}.pdf`;

    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: currentPaperSize === 'legal' ? [6, 6, 6, 6] : [4, 5, 4, 5],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: currentPaperSize, orientation: 'portrait' }
      };

      // Show user feedback
      const originalText = btnSavePdf.innerHTML;
      btnSavePdf.innerHTML = `
        <svg class="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity:0.25;"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" style="opacity:0.75;"></path>
        </svg> Generating PDF...
      `;
      btnSavePdf.disabled = true;

      html2pdf().set(opt).from(element).save().then(() => {
        btnSavePdf.innerHTML = originalText;
        btnSavePdf.disabled = false;
      }).catch(err => {
        console.error('html2pdf generation error:', err);
        btnSavePdf.innerHTML = originalText;
        btnSavePdf.disabled = false;
        // Fallback to native print dialog
        window.print();
      });
    } else {
      // Fallback: standard print which has Save as PDF
      window.print();
    }
  }
});
