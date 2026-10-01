/**
 * सरकारी फॉर्म सेवा (Sarkari Form Seva) - Universal Form Admin & Live Visual Editor
 * Curated by Niraj Kumar, Section Supervisor, RO, Faridabad
 * 
 * Automatically applies admin customizations (headers, subjects, paras, notices, titles, notes),
 * and enables in-browser visual editing when in admin mode (?admin_edit=true or admin session).
 * Syncs directly to Firebase Cloud Firestore and localStorage.
 */

(function() {
  function getFormKey() {
    let path = window.location.pathname.split('/').pop() || '';
    path = path.replace('.html', '').toLowerCase();
    return path.split('?')[0].split('#')[0];
  }

  const formKey = getFormKey();
  if (!formKey || formKey === 'index' || formKey === 'admin-users') return;

  const urlParams = new URLSearchParams(window.location.search);
  const isAdminEditParam = urlParams.get('admin_edit') === 'true';

  // Strict check: verified admin session or UserDetailsHub admin credentials
  function checkIsAdmin() {
    try {
      if (sessionStorage.getItem('epfo_admin_session_auth') === 'true') return true;
      if (localStorage.getItem('epfo_admin_session_auth') === 'true') return true;
      if (typeof UserDetailsHub !== 'undefined') {
        const user = UserDetailsHub.getActiveUser();
        if (user && (user.userType === 'admin' || (user.email || '').toLowerCase() === 'smart.webpage.storage@gmail.com')) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  const isAdmin = checkIsAdmin();
  // Live Visual Editor MUST ONLY activate if user is authenticated admin AND explicit query param ?admin_edit=true
  const isLiveEditMode = isAdmin && isAdminEditParam;

  // Mapping of pages to official letter/noting keys
  const LETTER_PAGE_MAP = {
    'epfo-rejoining-letter-and-noting': ['epfo-rejoining-letter', 'epfo-rejoining-noting'],
    'epfo-eps-to-pf-merger': ['epfo-eps-merger-letter', 'epfo-eps-merger-noting'],
    'epfo-high-value-claim-verification': ['epfo-high-value-letter'],
    'epfo-high-value-employer-reply': ['epfo-high-value-letter'],
    'epfo-high-value-staff-letter': ['epfo-high-value-letter'],
    'epfo-form13-signature-verification': ['epfo-form13-letter'],
    'stationery-requirement-form': ['stationery-indent-noting'],
    'epfo-letterhead-noting': ['epfo-letterhead-noting-tpl'],
    'epfo-non-remarriage-declaration': ['epfo-non-remarriage-tpl'],
    'epfo-clarification-incorrect-ncp-days': ['epfo-ncp-clarification-tpl'],
    'epfo-clarification-reason-of-exit': ['epfo-exit-reason-clarification-tpl']
  };

  // Find printable sheet container
  function getSheetContainer() {
    return document.getElementById('printableFormSheet') ||
           document.getElementById('printableSheet') ||
           document.getElementById('sheetEmployerPrint') ||
           document.querySelector('.declaration-sheet') ||
           document.querySelector('.sheet-page') ||
           document.querySelector('.printable-sheet') ||
           document.querySelector('.form-sheet') ||
           document.querySelector('.form-wrapper') ||
           document.querySelector('.a4-page') ||
           document.querySelector('main');
  }

  // 1. Apply Saved Customizations (Both Structured & Letter Overrides)
  function applySavedCustomizations() {
    // 1. Apply Official Letter Overrides first
    const mappedLetterKeys = LETTER_PAGE_MAP[formKey] || [];
    if (typeof UserDetailsHub !== 'undefined') {
      mappedLetterKeys.forEach(lKey => {
        const custom = UserDetailsHub.getLetterCustomization(lKey);
        if (custom) applyLetterDataToDOM(lKey, custom);

        // Background sync latest from Firebase Firestore
        if (typeof UserDetailsHub.fetchLetterCustomizationFromFirestore === 'function') {
          UserDetailsHub.fetchLetterCustomizationFromFirestore(lKey).then(cloudData => {
            if (cloudData) applyLetterDataToDOM(lKey, cloudData);
          }).catch(() => {});
        }
      });
    }

    // 2. Check for full saved HTML override if any
    const savedHtml = localStorage.getItem('form_override_html_' + formKey);
    const container = getSheetContainer();

    if (savedHtml && container && !mappedLetterKeys.length) {
      const inputValues = {};
      container.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.id) inputValues[el.id] = el.value;
      });

      container.innerHTML = savedHtml;

      Object.keys(inputValues).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = inputValues[id];
      });
    }

    // 3. Apply structured form settings (for non-letter forms)
    let customSettings = null;
    if (typeof UserDetailsHub !== 'undefined') {
      customSettings = UserDetailsHub.getFormCustomization(formKey);
    } else {
      try {
        const all = JSON.parse(localStorage.getItem('portalFormCustomizations') || '{}');
        customSettings = all[formKey] || null;
      } catch (e) {}
    }

    if (customSettings) {
      if (customSettings.officeHeader) {
        const hTitles = document.querySelectorAll('.header-text-box h2, .form-header h2, .office-title, .sheet-header h2');
        if (hTitles.length > 0) hTitles[0].textContent = customSettings.officeHeader;
      }
      if (customSettings.officeAddress) {
        const hSub = document.querySelectorAll('.header-text-box h3, .form-header h3, .office-address, .sheet-header h3');
        if (hSub.length > 0) hSub[0].textContent = customSettings.officeAddress;
      }
      if (customSettings.customNotice) {
        const existingNotice = document.getElementById('adminCustomFormNoticeBanner');
        if (!existingNotice && container) {
          const banner = document.createElement('div');
          banner.id = 'adminCustomFormNoticeBanner';
          banner.className = 'custom-form-notice-banner no-print';
          banner.style.cssText = 'background:#fef3c7; border:1.5px solid #d97706; padding:8px 14px; border-radius:6px; margin-bottom:12px; font-size:12.5px; color:#92400e; font-weight:700; display:flex; align-items:center; gap:8px; box-shadow: 0 2px 6px rgba(217, 119, 6, 0.15);';
          banner.innerHTML = `<span style="font-size:18px;">📢</span> <span>${customSettings.customNotice}</span>`;
          container.prepend(banner);
        }
      }
    }
  }

  // DOM Replacer Helper for Official Letters & Notings
  function applyLetterDataToDOM(lKey, custom) {
    if (!custom) return;

    if (lKey === 'epfo-rejoining-letter') {
      // Company / Office Header
      const compName = document.getElementById('comp_name') || document.querySelector('.comp-name-input');
      if (compName && custom.officeHeader) {
        if (compName.tagName === 'INPUT') compName.value = custom.officeHeader;
        else compName.textContent = custom.officeHeader;
      }
      const compSub = document.getElementById('comp_sub') || document.querySelector('.comp-sub-input');
      if (compSub && custom.officeAddress) {
        if (compSub.tagName === 'INPUT') compSub.value = custom.officeAddress;
        else compSub.textContent = custom.officeAddress;
      }
      // Subject
      const subContent = document.getElementById('letterSubjectSpan') || document.querySelector('.subject-content');
      if (subContent && custom.subject) subContent.textContent = custom.subject;

      // Recipient
      const recip = document.getElementById('recipientArea') || document.querySelector('.recipient-area');
      if (recip && custom.recipient) recip.innerHTML = custom.recipient.replace(/\n/g, '<br>');

      // Main Content / Paragraphs
      if (custom.mainContent) {
        const paras = document.querySelectorAll('#sheetEmployerPrint .doc-para, .employer-sheet .doc-para');
        const splitParas = custom.mainContent.split('\n\n').filter(p => p.trim());
        splitParas.forEach((pText, idx) => {
          if (paras[idx]) paras[idx].textContent = pText.replace(/\n/g, ' ');
        });
      }
      // Signatory
      const sig = document.getElementById('employerSignTitle') || document.querySelector('.sign-input');
      if (sig && custom.signatory) {
        if (sig.tagName === 'INPUT') sig.value = custom.signatory.split('\n')[0];
        else sig.textContent = custom.signatory.split('\n')[0];
      }
    }

    else if (lKey === 'epfo-rejoining-noting') {
      const notH2 = document.querySelector('.noting-header-center h2, #sheetNotingPrint h2');
      if (notH2 && custom.officeHeader) notH2.textContent = custom.officeHeader.split('\n')[0];
      const notH3 = document.querySelector('.noting-header-center h3, #sheetNotingPrint h3');
      if (notH3 && custom.officeAddress) notH3.textContent = custom.officeAddress;

      const notSub = document.querySelector('#sheetNotingPrint .subject-block, .noting-subject-row');
      if (notSub && custom.subject) notSub.textContent = custom.subject;

      if (custom.mainContent) {
        const notParas = document.querySelectorAll('#sheetNotingPrint .doc-para, .sheet-noting-green .doc-para');
        const splitParas = custom.mainContent.split('\n\n').filter(p => p.trim());
        splitParas.forEach((pText, idx) => {
          if (notParas[idx]) notParas[idx].textContent = pText.replace(/\n/g, ' ');
        });
      }
    }

    else if (lKey === 'epfo-eps-merger-letter') {
      const empName = document.querySelector('.employer-name');
      if (empName && custom.officeHeader) empName.textContent = custom.officeHeader;
      const empAddr = document.querySelector('.employer-address');
      if (empAddr && custom.officeAddress) empAddr.textContent = custom.officeAddress;

      const subBox = document.querySelector('.letter-subject-box');
      if (subBox && custom.subject) subBox.textContent = custom.subject;

      const recip = document.querySelector('.recipient-block');
      if (recip && custom.recipient) recip.innerHTML = custom.recipient.replace(/\n/g, '<br>');

      if (custom.mainContent) {
        const paras = document.querySelectorAll('.letter-body-para');
        const splitParas = custom.mainContent.split('\n\n').filter(p => p.trim());
        splitParas.forEach((pText, idx) => {
          if (paras[idx]) paras[idx].textContent = pText.replace(/\n/g, ' ');
        });
      }
    }

    else if (lKey === 'epfo-eps-merger-noting') {
      const notSub = document.querySelector('.noting-subject-box');
      if (notSub && custom.subject) notSub.textContent = custom.subject;

      if (custom.mainContent) {
        const paras = document.querySelectorAll('.noting-body-para');
        const splitParas = custom.mainContent.split('\n\n').filter(p => p.trim());
        splitParas.forEach((pText, idx) => {
          if (paras[idx]) paras[idx].textContent = pText.replace(/\n/g, ' ');
        });
      }
    }

    else if (lKey === 'epfo-high-value-letter') {
      const orgHi = document.querySelector('.org-title-hi');
      if (orgHi && custom.officeHeader) orgHi.textContent = custom.officeHeader;
      const orgEn = document.querySelector('.org-title-en');
      if (orgEn && custom.officeAddress) orgEn.textContent = custom.officeAddress;

      const subRow = document.querySelector('.letter-subject-row, .subject-row');
      if (subRow && custom.subject) subRow.textContent = custom.subject;
    }

    else if (lKey === 'epfo-letterhead-noting-tpl') {
      const lhHi = document.querySelector('.lh-header-hi, .office-title-hi');
      if (lhHi && custom.officeHeader) lhHi.textContent = custom.officeHeader;
      const lhEn = document.querySelector('.lh-header-en, .office-title-en');
      if (lhEn && custom.officeAddress) lhEn.textContent = custom.officeAddress;

      const sub = document.getElementById('metaSubject');
      if (sub && custom.subject) {
        if (sub.tagName === 'INPUT') sub.value = custom.subject;
        else sub.textContent = custom.subject;
      }
    }
  }

  // 2. Inject Admin Live Visual Editing Toolbar
  function injectAdminToolbar() {
    if (!isLiveEditMode) return;
    if (document.getElementById('adminLiveToolbar')) return;

    // Add CSS styles
    const style = document.createElement('style');
    style.id = 'adminLiveEditorStyles';
    style.textContent = `
      @media print {
        #adminLiveToolbar, #adminFloatingEditBtn, .no-print { display: none !important; }
        body { padding-top: 0 !important; }
      }
      body {
        padding-top: 112px !important;
      }
      #adminLiveToolbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 50px;
        background: #0f172a;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        box-shadow: 0 3px 15px rgba(0,0,0,0.5);
        z-index: 10001;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif;
        border-bottom: 2px solid #10b981;
      }
      /* Ensure page's normal toolbar is NEVER covered, pushed down below admin toolbar */
      .app-toolbar,
      .page-toolbar,
      .controls-bar {
        top: 50px !important;
      }
      .admin-live-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .admin-live-title {
        font-size: 13px;
        font-weight: 800;
        color: #f8fafc;
      }
      .admin-live-badge {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        font-size: 10px;
        font-weight: 800;
        padding: 2.5px 7px;
        border-radius: 4px;
        letter-spacing: 0.5px;
      }
      .admin-live-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .btn-admin-action {
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        padding: 6px 12px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s;
        text-decoration: none;
        font-family: inherit;
      }
      .btn-admin-save {
        background: #10b981;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
      }
      .btn-admin-save:hover { background: #059669; transform: translateY(-1px); }
      .btn-admin-reset {
        background: #475569;
        color: #ffffff;
      }
      .btn-admin-reset:hover { background: #334155; }
      .btn-admin-dash {
        background: #0284c7;
        color: #ffffff;
      }
      .btn-admin-dash:hover { background: #0369a1; }
      .btn-admin-exit {
        background: #e11d48;
        color: #ffffff;
        box-shadow: 0 2px 6px rgba(225, 29, 72, 0.35);
      }
      .btn-admin-exit:hover { background: #be123c; color: #fff; }
      .admin-editable-item {
        transition: outline 0.15s, background-color 0.15s;
      }
      .admin-editable-item:hover {
        outline: 1.5px dashed #10b981 !important;
        background-color: rgba(16, 185, 129, 0.05) !important;
        cursor: text !important;
      }
      .admin-editable-item:focus {
        outline: 2px solid #10b981 !important;
        background-color: rgba(16, 185, 129, 0.08) !important;
      }
    `;
    document.head.appendChild(style);

    // Toolbar Markup
    const toolbar = document.createElement('div');
    toolbar.id = 'adminLiveToolbar';
    toolbar.className = 'no-print';
    toolbar.innerHTML = `
      <div class="admin-live-brand">
        <span style="font-size: 18px;">👑</span>
        <span class="admin-live-title">एडमिन लाइव संपादक (Live Visual Editor)</span>
        <span class="admin-live-badge">🔥 FIREBASE SYNC</span>
        <span style="font-size: 11px; color: #94a3b8; margin-left: 4px;">(टेक्स्ट पर क्लिक करके सीधे टाइप करें)</span>
      </div>
      <div class="admin-live-actions">
        <button type="button" class="btn-admin-action btn-admin-save" id="btnAdminSaveLiveForm">
          💾 Firebase में सेव करें (Save)
        </button>
        <button type="button" class="btn-admin-action btn-admin-reset" id="btnAdminResetLiveForm">
          🔄 रीसेट (Reset)
        </button>
        <a href="admin-users.html" class="btn-admin-action btn-admin-dash">
          ⚙️ एडमिन डैशबोर्ड
        </a>
        <button type="button" class="btn-admin-action btn-admin-exit" id="btnAdminExitLiveMode" title="एडिट मोड बंद करें और सामान्य प्रिंट व्यू पर जाएं">
          🖨️ सामान्य व्यू / प्रिंट (Exit Edit)
        </button>
      </div>
    `;
    document.body.prepend(toolbar);

    // Enable contentEditable on text nodes
    enableContentEditable();

    // Event Handlers
    document.getElementById('btnAdminSaveLiveForm').addEventListener('click', () => {
      saveLiveChanges();
    });

    document.getElementById('btnAdminResetLiveForm').addEventListener('click', async () => {
      if (confirm('क्या आप इस पत्र के सभी बदलाव रीसेट करके मूल डिफ़ॉल्ट रूप में लाना चाहते हैं? (Reset to original?)')) {
        localStorage.removeItem('form_override_html_' + formKey);
        const mappedKeys = LETTER_PAGE_MAP[formKey] || [];
        if (typeof UserDetailsHub !== 'undefined') {
          for (const k of mappedKeys) {
            await UserDetailsHub.resetLetterCustomization(k);
          }
          UserDetailsHub.resetFormCustomization(formKey);
        }
        alert('प्रपत्र सफलतापूर्वक मूल डिफ़ॉल्ट रूप पर रीसेट हो गया है।');
        window.location.reload();
      }
    });

    document.getElementById('btnAdminExitLiveMode').addEventListener('click', () => {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('admin_edit');
      window.location.href = cleanUrl.toString();
    });
  }

  // Floating button for authenticated Admin when viewing normal form
  function injectAdminFloatingButton() {
    if (!isAdmin || isLiveEditMode) return;
    if (document.getElementById('adminFloatingEditBtn')) return;

    const btn = document.createElement('a');
    btn.id = 'adminFloatingEditBtn';
    btn.className = 'no-print';
    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set('admin_edit', 'true');
    btn.href = targetUrl.toString();
    btn.title = 'एडमिन: इस प्रपत्र की सामग्री को लाइव एडिट करें';
    btn.innerHTML = `<span style="font-size:14px;">👑</span> <span>लाइव एडिट करें</span>`;
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #059669, #047857);
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      z-index: 9999;
      border: 1.5px solid #34d399;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    btn.onmouseover = () => { btn.style.transform = 'translateY(-2px) scale(1.03)'; };
    btn.onmouseout = () => { btn.style.transform = 'translateY(0) scale(1)'; };
    document.body.appendChild(btn);
  }

  function enableContentEditable() {
    const container = getSheetContainer();
    if (!container) return;

    const editableSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'label', 'span:not(.az-badge)', 'strong', 'em', 'td', 'th',
      '.doc-para', '.letter-body-para', '.noting-body-para', '.subject-block', '.subject-content',
      '.letter-subject-box', '.noting-subject-box', '.recipient-area', '.recipient-block'
    ];

    container.querySelectorAll(editableSelectors.join(',')).forEach(el => {
      // Do not make inputs, toolbar or button containers editable
      if (el.closest('.app-toolbar') || el.closest('#adminLiveToolbar') || el.closest('button') || el.querySelector('input, select, textarea')) {
        return;
      }
      el.contentEditable = "true";
      el.classList.add('admin-editable-item');
    });
  }

  async function saveLiveChanges() {
    const container = getSheetContainer();
    if (!container) {
      alert('फॉर्म कंटेनर नहीं मिला।');
      return;
    }

    const saveBtn = document.getElementById('btnAdminSaveLiveForm');
    const origBtnText = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '⏳ Firebase में सेव हो रहा है...';
    }

    // 1. Temporarily disable contentEditable and remove editable class before saving
    container.querySelectorAll('.admin-editable-item').forEach(el => {
      el.removeAttribute('contenteditable');
      el.classList.remove('admin-editable-item');
    });

    const notice = document.getElementById('adminCustomFormNoticeBanner');
    if (notice) notice.remove();

    const cleanHtml = container.innerHTML;

    // 2. Extract structured fields if mapped to official letters
    const mappedKeys = LETTER_PAGE_MAP[formKey] || [];
    let savedToFirestore = false;

    if (mappedKeys.length > 0 && typeof UserDetailsHub !== 'undefined') {
      for (const lKey of mappedKeys) {
        const curData = UserDetailsHub.getLetterCustomization(lKey) || {};
        
        if (lKey === 'epfo-rejoining-letter') {
          const compName = document.getElementById('comp_name') || document.querySelector('.comp-name-input');
          if (compName) curData.officeHeader = compName.value || compName.textContent.trim();
          const compSub = document.getElementById('comp_sub') || document.querySelector('.comp-sub-input');
          if (compSub) curData.officeAddress = compSub.value || compSub.textContent.trim();
          const subContent = document.getElementById('letterSubjectSpan') || document.querySelector('.subject-content');
          if (subContent) curData.subject = subContent.textContent.trim();
          const recip = document.getElementById('recipientArea') || document.querySelector('.recipient-area');
          if (recip) curData.recipient = recip.innerText.trim();
          const paras = document.querySelectorAll('#sheetEmployerPrint .doc-para, .employer-sheet .doc-para');
          if (paras.length > 0) {
            curData.mainContent = Array.from(paras).map(p => p.textContent.trim()).join('\n\n');
          }
        }
        else if (lKey === 'epfo-rejoining-noting') {
          const notSub = document.querySelector('#sheetNotingPrint .subject-block, .noting-subject-row');
          if (notSub) curData.subject = notSub.textContent.trim();
          const notParas = document.querySelectorAll('#sheetNotingPrint .doc-para, .sheet-noting-green .doc-para');
          if (notParas.length > 0) {
            curData.mainContent = Array.from(notParas).map(p => p.textContent.trim()).join('\n\n');
          }
        }
        else if (lKey === 'epfo-eps-merger-letter') {
          const empName = document.querySelector('.employer-name');
          if (empName) curData.officeHeader = empName.textContent.trim();
          const empAddr = document.querySelector('.employer-address');
          if (empAddr) curData.officeAddress = empAddr.textContent.trim();
          const subBox = document.querySelector('.letter-subject-box');
          if (subBox) curData.subject = subBox.textContent.trim();
          const paras = document.querySelectorAll('.letter-body-para');
          if (paras.length > 0) curData.mainContent = Array.from(paras).map(p => p.textContent.trim()).join('\n\n');
        }
        else if (lKey === 'epfo-eps-merger-noting') {
          const notSub = document.querySelector('.noting-subject-box');
          if (notSub) curData.subject = notSub.textContent.trim();
          const paras = document.querySelectorAll('.noting-body-para');
          if (paras.length > 0) curData.mainContent = Array.from(paras).map(p => p.textContent.trim()).join('\n\n');
        }

        const res = await UserDetailsHub.saveLetterCustomization(lKey, curData);
        if (res && res.firestore) savedToFirestore = true;
      }
    }

    try {
      localStorage.setItem('form_override_html_' + formKey, cleanHtml);
      const syncMsg = savedToFirestore ? '🔥 Firebase Cloud Firestore एवं लोकल स्टोरेज' : 'लोकल स्टोरेज';
      alert(`🎉 बधाई हो! इस प्रपत्र में किए गए सभी टेक्स्ट, हेडिंग, विषय एवं सामग्री बदलाव सफलतापूर्वक ${syncMsg} में सुरक्षित हो गए हैं!\n\nअब जब भी कोई सदस्य या कर्मचारी यह पत्र खोलेगा, उसे यही नया रूप दिखाई देगा।`);
      window.location.reload();
    } catch (e) {
      alert('त्रुटि: स्टोरेज सीमा समाप्त। ' + e.message);
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origBtnText;
      }
    }
  }

  // Run when DOM is ready
  function init() {
    applySavedCustomizations();
    if (isLiveEditMode) {
      injectAdminToolbar();
    } else if (isAdmin) {
      injectAdminFloatingButton();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
