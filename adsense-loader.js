/**
 * Google AdSense Smart Loader & Print-Safe Monetization Hub
 * Sarkari Forms Seva (सरकारी फॉर्म सेवा)
 * Curated by Niraj Kumar, Section Supervisor, RO, Faridabad
 * 
 * Features:
 * - Dynamic publisher ID and ad slots configuration via Admin Hub
 * - Strict @media print suppression (Forms print 100% clean without ads)
 * - Auto-Ads injection and responsive banner placements
 */

(function() {
  'use strict';

  const STORAGE_KEY_PUB_ID = 'portal_adsense_pub_id';
  const STORAGE_KEY_ENABLED = 'portal_adsense_enabled';
  const STORAGE_KEY_TEST_MODE = 'portal_adsense_test_mode';
  const STORAGE_KEY_TOP_SLOT = 'portal_adsense_slot_top';
  const STORAGE_KEY_BOTTOM_SLOT = 'portal_adsense_slot_bottom';

  // Default fallback credentials (can be updated dynamically in admin-users.html)
  const DEFAULT_PUB_ID = 'ca-pub-4356289331524516'; 

  // Injects print-safety CSS immediately
  function injectPrintProtectionStyles() {
    if (document.getElementById('adsensePrintSafeStyle')) return;
    const style = document.createElement('style');
    style.id = 'adsensePrintSafeStyle';
    style.textContent = `
      .adsense-slot-wrap {
        width: 100%;
        max-width: 1020px;
        margin: 16px auto;
        padding: 0 16px;
        box-sizing: border-box;
        text-align: center;
        clear: both;
      }
      .adsense-box {
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 10px;
        padding: 12px;
        min-height: 90px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #64748b;
        font-size: 12.5px;
        position: relative;
        overflow: hidden;
      }
      body.dark-mode .adsense-box {
        background: #0f172a;
        border-color: #334155;
        color: #94a3b8;
      }
      .adsense-tag-label {
        position: absolute;
        top: 4px;
        right: 8px;
        font-size: 9.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #94a3b8;
      }
      /* CRITICAL: Never ever print ads on official government forms */
      @media print {
        .adsense-slot-wrap,
        .adsense-box,
        .adsbygoogle,
        [id^="google_ads_"],
        .portal-ad-container {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          overflow: hidden !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Load Google AdSense Script Tag
  function loadGoogleAdSenseScript(pubId) {
    if (!pubId || document.getElementById('googleAdSenseScript')) return;
    const cleanPubId = pubId.startsWith('ca-') ? pubId : `ca-${pubId}`;
    
    const script = document.createElement('script');
    script.id = 'googleAdSenseScript';
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cleanPubId}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }

  // Check state
  function getPubId() {
    return localStorage.getItem(STORAGE_KEY_PUB_ID) || DEFAULT_PUB_ID;
  }

  function isAdsEnabled() {
    const val = localStorage.getItem(STORAGE_KEY_ENABLED);
    return val === null ? true : val === 'true';
  }

  function isTestMode() {
    const val = localStorage.getItem(STORAGE_KEY_TEST_MODE);
    return val === null ? true : val === 'true';
  }

  // Create slot markup
  function createSlotElement(slotType, slotId) {
    const wrap = document.createElement('div');
    wrap.className = `adsense-slot-wrap adsense-${slotType}-wrap`;
    wrap.setAttribute('data-ad-type', slotType);

    const pubId = getPubId();
    const testMode = isTestMode();

    // If live slotId is configured, render official AdSense tag
    if (slotId) {
      wrap.innerHTML = `
        <div class="adsense-box" style="border:none; padding:0; background:transparent;">
          <span class="adsense-tag-label" style="display:none;">विज्ञापन / Advertisement</span>
          <ins class="adsbygoogle"
               style="display:block; text-align:center;"
               data-ad-layout="in-article"
               data-ad-format="fluid"
               data-ad-client="${pubId}"
               data-ad-slot="${slotId}"></ins>
        </div>
      `;
      try {
        ((window.adsbygoogle = window.adsbygoogle || []).push({}));
      } catch (e) {
        console.warn('AdSense push error:', e);
      }
    } else {
      // Clean, unobtrusive container without showing private IDs or debug text to users
      wrap.style.display = 'none';
    }
    return wrap;
  }

  // Auto-inject ad slots in current page
  function initAutoSlots() {
    if (!isAdsEnabled()) return;
    injectPrintProtectionStyles();

    const pubId = getPubId();
    loadGoogleAdSenseScript(pubId);

    // 1. Top Banner Placement (Right after header/action-bar or hero)
    const topSlotTarget = document.querySelector('.portal-hero') || 
                          document.querySelector('.action-bar-container') ||
                          document.querySelector('.page-header') ||
                          document.querySelector('header.portal-navbar');

    if (topSlotTarget && !document.querySelector('.adsense-top-wrap')) {
      const topSlot = createSlotElement('top', localStorage.getItem(STORAGE_KEY_TOP_SLOT));
      topSlotTarget.insertAdjacentElement('afterend', topSlot);
    }

    // 2. Bottom Banner Placement (Before footer)
    const bottomSlotTarget = document.querySelector('footer.portal-footer') || 
                             document.querySelector('footer') ||
                             document.querySelector('.print-action-box');

    if (bottomSlotTarget && !document.querySelector('.adsense-bottom-wrap')) {
      const bottomSlot = createSlotElement('bottom', localStorage.getItem(STORAGE_KEY_BOTTOM_SLOT));
      bottomSlotTarget.insertAdjacentElement('beforebegin', bottomSlot);
    }
  }

  // Global API for admin panel
  window.PortalAds = {
    getPubId,
    setPubId: function(id) {
      localStorage.setItem(STORAGE_KEY_PUB_ID, (id || '').trim());
    },
    isAdsEnabled,
    setAdsEnabled: function(val) {
      localStorage.setItem(STORAGE_KEY_ENABLED, String(!!val));
    },
    isTestMode,
    setTestMode: function(val) {
      localStorage.setItem(STORAGE_KEY_TEST_MODE, String(!!val));
    },
    getSlotId: function(type) {
      return localStorage.getItem(type === 'top' ? STORAGE_KEY_TOP_SLOT : STORAGE_KEY_BOTTOM_SLOT) || '';
    },
    setSlotId: function(type, id) {
      localStorage.setItem(type === 'top' ? STORAGE_KEY_TOP_SLOT : STORAGE_KEY_BOTTOM_SLOT, (id || '').trim());
    },
    refresh: function() {
      document.querySelectorAll('.adsense-slot-wrap').forEach(el => el.remove());
      initAutoSlots();
    }
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoSlots);
  } else {
    initAutoSlots();
  }

})();
