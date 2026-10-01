/**
 * सरकारी फॉर्म सेवा (Sarkari Form Seva) - Core Scripts & Video Player Hub
 * Curated by Niraj Kumar, Section Supervisor, RO, Faridabad
 * Contact: smart.webpage.storage@gmail.com | 8700383426
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. YouTube Video Guides Dictionary (Niraj Kumar can customize links here)
  // =========================================================================
  const formVideoTutorials = {
    'epfo-high-value-claim-verification': {
      title: 'EPFO High Value Claim KYC Email Verification Letter & Employer Reply Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-high-value-staff-letter': {
      title: 'High Value Verification Letter Guide By Niraj Kumar, Section Supervisor, RO, Faridabad',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-high-value-employer-reply': {
      title: 'High Value Claim KYC Employer Reply Guide By Niraj Kumar, Section Supervisor, RO, Faridabad',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-leave-and-joining': {
      title: 'Govt & EPFO All Types of Leave Application & Joining Report Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-form-31-advance': {
      title: 'EPFO Form 31: PF Advance Claim (अग्रिम पीएफ निकासी) कैसे भरें? Complete Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' // Custom link for Form 31
    },
    'epfo-death-claim': {
      title: 'EPFO Composite Claim Form (Death Case) कैसे भरें? Complete Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-death-case-verification-after-3-years': {
      title: 'EPFO Death Case Verification After 3 Years (EO Note Sheet) Complete Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'onroll-family-form': {
      title: 'On-Roll & Family Description Form कैसे तैयार करें? Employer Verification',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-composite-claim-aadhar': {
      title: 'EPFO Form 19, 10-C & 31 Aadhar Composite Claim Kaise Bharein?',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-form-10d': {
      title: 'EPFO Form 10-D Monthly Pension Claim Online Step-by-Step Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'gar14a-ta-bill': {
      title: 'Central Govt G.A.R-14A TA Bill Tour Claim Calculation & Filling',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'children-education-allowance': {
      title: 'Children Education Allowance (CEA) Claim Form & Bonafide Certificate Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'stationery-requirement-form': {
      title: 'EPFO Stationery Indent & Office Note Sheet Filling Tutorial',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'stationery-requisition': {
      title: 'Customizable Office Stationery Requisition Form Tutorial',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-letterhead-noting': {
      title: 'EPFO Letterhead & Official Noting Sheet Drafting Tutorial',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-guest-house-booking': {
      title: 'EPFO Holiday Home & Guest House Booking Form Video Tutorial',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-eps-to-pf-merger': {
      title: 'EPFO EPS to EPF Contribution Merger Employer Letter & Office Note Tutorial',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-revised-annexure-k': {
      title: 'EPFO Revised Annexure "K" (EPS Service Details & PF Transfer Certificate) Complete Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-form-5a': {
      title: 'EPFO Form 5-A Return of Ownership (स्वामित्व का विवरण) Kaise Bharein? Complete Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-joint-declaration': {
      title: 'EPFO Joint Declaration Format (Annexure-III Member & Employer Correction) Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-form13-signature-verification': {
      title: 'EPFO Form-13 Signature & Member Details Verification Official Letter Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-joint-declaration-eo-verification': {
      title: 'EPFO Joint Declaration EO Verification Noting Sheet & Office Note Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-rejoining-letter-and-noting': {
      title: 'EPFO Rejoining Letter & Official Legal Noting Sheet Tutorial',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-rejoining-letter': {
      title: 'EPFO Rejoining Request Letter (नियोक्ता अनुरोध पत्र) Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-rejoining-noting': {
      title: 'EPFO Rejoining Legal Office Note (विधिक कार्यालयीन नोटिंग) Tutorial',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-eps-to-pf-merger-noting': {
      title: 'EPFO EPS to EPF Contribution Merger Office Note Sheet Tutorial',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'tour-programme': {
      title: 'Tour Programme Application & Approval Form Complete Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'uidai-aadhaar-certificate': {
      title: 'UIDAI Aadhaar Enrolment & Update Standard Certificate (Gazetted Officer) Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'income-tax-form-15g': {
      title: 'Income Tax Form 15G (Nil TDS on Bank FD & PF) Filling & Calculation Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'rto-form-29-30': {
      title: 'RTO Form 29 & Form 30 Vehicle Ownership Transfer Step-by-Step Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'income-tax-form-15h': {
      title: 'Income Tax Form 15H Senior Citizen Nil TDS Declaration Step-by-Step Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'income-tax-form-12bb': {
      title: 'Income Tax Form 12BB Employee Investment & Tax Deduction Declaration Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'rto-form-35': {
      title: 'RTO Form 35 Notice of Termination of Hypothecation (Loan NOC) Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'central-govt-ltc-bill': {
      title: 'Central Govt LTC Advance & Final Claim Bill (CCS LTC Rules 1988) Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-form-10c': {
      title: 'EPFO Form 10-C EPS Withdrawal Benefit & Scheme Certificate Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    'epfo-form-11': {
      title: 'EPFO Form 11 (Revised) New Employee Declaration & UAN Seeding Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    }
  };

  // =========================================================================
  // 2. Video Player Modal System (YouTube + Uploaded Video Player)
  // =========================================================================
  const videoModal = document.getElementById('videoModal');
  const videoIframe = document.getElementById('videoModalIframe');
  const videoModalPlayer = document.getElementById('videoModalPlayer');
  const videoModalTitle = document.getElementById('videoModalTitle');
  const btnCloseVideoModal = document.getElementById('btnCloseVideoModal');

  async function openVideoModal(formId, customTitle, customUrl, customVideoObj = null) {
    if (!videoModal) return;

    let tutorial = null;
    if (customVideoObj) {
      tutorial = customVideoObj;
    } else if (formId && formVideoTutorials[formId]) {
      tutorial = formVideoTutorials[formId];
    } else {
      tutorial = {
        title: customTitle || 'Online Form Filling Video Guide',
        url: customUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
      };
    }

    if (videoModalTitle) videoModalTitle.textContent = tutorial.title;

    // Check if tutorial is an uploaded file or direct video file
    const isDirectVideo = tutorial.hasFileBlob || (tutorial.url && (tutorial.url.endsWith('.mp4') || tutorial.url.endsWith('.webm') || tutorial.url.startsWith('blob:')));

    if (isDirectVideo) {
      if (videoIframe) {
        videoIframe.style.display = 'none';
        videoIframe.src = '';
      }
      if (videoModalPlayer) {
        videoModalPlayer.style.display = 'block';
        if (tutorial.hasFileBlob && typeof UserDetailsHub !== 'undefined') {
          const resolved = await UserDetailsHub.resolveVideoPlaySource(tutorial);
          if (resolved && resolved.url) {
            videoModalPlayer.src = resolved.url;
          }
        } else if (tutorial.url) {
          videoModalPlayer.src = tutorial.url;
        }
        videoModalPlayer.load();
        videoModalPlayer.play().catch(e => console.log('Autoplay deferred:', e));
      }
    } else {
      if (videoModalPlayer) {
        videoModalPlayer.pause();
        videoModalPlayer.src = '';
        videoModalPlayer.style.display = 'none';
      }
      if (videoIframe) {
        videoIframe.style.display = 'block';
        const rawUrl = tutorial.url || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
        const embedUrl = rawUrl.includes('?') ? `${rawUrl}&autoplay=1` : `${rawUrl}?autoplay=1`;
        videoIframe.src = embedUrl;
      }
    }

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    if (videoModalPlayer) {
      videoModalPlayer.pause();
      videoModalPlayer.src = '';
      videoModalPlayer.style.display = 'none';
    }
    if (videoIframe) {
      videoIframe.src = '';
      videoIframe.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  // Click handler for all Video Guide buttons & thumbnails
  function attachVideoClickListeners(container = document) {
    container.querySelectorAll('.btn-video-guide, .video-thumb-wrap, .btn-watch-tutorial').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const formId = btn.getAttribute('data-form-id');
        const customTitle = btn.getAttribute('data-video-title');
        const customUrl = btn.getAttribute('data-video-url');
        const videoId = btn.getAttribute('data-video-id');
        let customObj = null;
        if (videoId && typeof UserDetailsHub !== 'undefined') {
          const allCustom = UserDetailsHub.getAllCustomVideos();
          customObj = allCustom.find(v => v.id === videoId);
        }
        openVideoModal(formId, customTitle, customUrl, customObj);
      });
    });
  }

  attachVideoClickListeners();

  // Dynamically render any custom videos created by Admin into #portalVideoGrid
  function renderCustomVideosInGrid() {
    const grid = document.getElementById('portalVideoGrid');
    if (!grid || typeof UserDetailsHub === 'undefined') return;
    const customVideos = UserDetailsHub.getAllCustomVideos();
    if (!customVideos || customVideos.length === 0) return;

    // Remove any previously rendered dynamic custom cards
    grid.querySelectorAll('.dynamic-custom-video-card').forEach(c => c.remove());

    customVideos.forEach(v => {
      // Also register into formVideoTutorials if bound to a form
      if (v.formId && formVideoTutorials[v.formId]) {
        formVideoTutorials[v.formId] = {
          title: v.title,
          url: v.url || '',
          hasFileBlob: v.hasFileBlob,
          id: v.id
        };
      }

      const card = document.createElement('div');
      card.className = 'video-guide-card dynamic-custom-video-card';
      card.setAttribute('data-vcat', 'custom');
      const durationText = v.duration || (v.hasFileBlob ? 'Local Video' : 'Video Tutorial');
      const speakerText = v.speaker || 'By Niraj Kumar, Section Supervisor, RO, Faridabad';
      const thumbImg = v.thumbUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60';
      const sourceBadge = v.hasFileBlob ? '📁 अपलोडेड वीडियो' : '▶ YouTube';

      card.innerHTML = `
        <div class="video-thumb-wrap" data-video-id="${v.id}" data-form-id="${v.formId || ''}">
          <img src="${thumbImg}" alt="${v.title}">
          <div class="play-button-overlay">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>
          </div>
          <span class="video-duration-badge" style="background: rgba(15, 23, 42, 0.85);">${durationText}</span>
          <span style="position: absolute; top: 8px; left: 8px; background: #dc2626; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${sourceBadge}</span>
        </div>
        <div class="video-card-info">
          <h4>${v.title}</h4>
          <p>${v.description || 'ऑनलाइन फॉर्म भरने एवं आवश्यक दस्तावेज संलग्न करने की विस्तृत वीडियो गाइड।'}</p>
          <div class="video-card-footer">
            <span class="video-speaker-tag">${speakerText}</span>
            <button type="button" class="btn-video-guide" data-video-id="${v.id}" data-form-id="${v.formId || ''}">▶ वीडियो देखें</button>
          </div>
        </div>
      `;

      grid.prepend(card);
    });

    attachVideoClickListeners(grid);
  }

  renderCustomVideosInGrid();

  // Video Filter Tabs Handler
  const videoFilterTabs = document.getElementById('videoFilterTabs');
  if (videoFilterTabs) {
    const filterBtns = videoFilterTabs.querySelectorAll('button[data-vfilter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterVal = btn.getAttribute('data-vfilter');
        const cards = document.querySelectorAll('#portalVideoGrid .video-guide-card');
        cards.forEach(c => {
          const cat = c.getAttribute('data-vcat') || 'all';
          if (filterVal === 'all' || cat === filterVal || (filterVal === 'office' && cat === 'office') || (filterVal === 'pf' && cat === 'pf')) {
            c.style.display = '';
          } else {
            c.style.display = 'none';
          }
        });
      });
    });
  }

  if (btnCloseVideoModal) {
    btnCloseVideoModal.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // =========================================================================
  // 3. User Authentication & Gatekeeper System
  // =========================================================================
  const authModal = document.getElementById('authGateModal');
  const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
  const tabBtnSignUp = document.getElementById('tabBtnSignUp');
  const tabBtnSignIn = document.getElementById('tabBtnSignIn');
  const formSignUpPane = document.getElementById('formSignUpPane');
  const formSignInPane = document.getElementById('formSignInPane');
  const formForgotPane = document.getElementById('formForgotPane');
  const formSignUp = document.getElementById('formSignUp');
  const formSignIn = document.getElementById('formSignIn');
  const signUpError = document.getElementById('signUpError');
  const signInError = document.getElementById('signInError');
  const navbarUserContainer = document.getElementById('navbarUserContainer');

  let pendingFormDestination = null;

  function openAuthModal(targetUrl = null, defaultTab = null, prefillEmail = null) {
    if (!authModal) return;
    pendingFormDestination = targetUrl;
    
    // Reset errors
    if (signUpError) { 
      signUpError.style.display = 'none'; 
      signUpError.textContent = ''; 
      signUpError.style.background = '#fee2e2';
      signUpError.style.color = '#dc2626';
    }
    if (signInError) { 
      signInError.style.display = 'none'; 
      signInError.textContent = ''; 
      signInError.style.background = '#fee2e2';
      signInError.style.color = '#dc2626';
    }

    const lastEmail = localStorage.getItem('portalLastRegisteredEmail') || '';
    const emailToUse = prefillEmail || lastEmail;
    if (emailToUse) {
      const signInEmailInput = document.getElementById('signInEmail');
      if (signInEmailInput && !signInEmailInput.value) {
        signInEmailInput.value = emailToUse;
      }
    }

    // Default to signin if user previously registered or if users already exist
    if (defaultTab) {
      activateAuthTab(defaultTab);
    } else if (emailToUse || (typeof UserDetailsHub !== 'undefined' && UserDetailsHub.getAllUsers().length > 0)) {
      activateAuthTab('signin');
    } else {
      activateAuthTab('signup');
    }

    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function activateAuthTab(tab) {
    if (formForgotPane) formForgotPane.style.display = 'none';
    if (tab === 'signin') {
      if (tabBtnSignIn) tabBtnSignIn.classList.add('active');
      if (tabBtnSignUp) tabBtnSignUp.classList.remove('active');
      if (formSignInPane) formSignInPane.style.display = 'block';
      if (formSignUpPane) formSignUpPane.style.display = 'none';
      const signInEmail = document.getElementById('signInEmail');
      if (signInEmail && !signInEmail.value) {
        const lastEmail = localStorage.getItem('portalLastRegisteredEmail');
        if (lastEmail) signInEmail.value = lastEmail;
      }
    } else {
      if (tabBtnSignUp) tabBtnSignUp.classList.add('active');
      if (tabBtnSignIn) tabBtnSignIn.classList.remove('active');
      if (formSignUpPane) formSignUpPane.style.display = 'block';
      if (formSignInPane) formSignInPane.style.display = 'none';
    }
  }

  if (tabBtnSignUp) {
    tabBtnSignUp.addEventListener('click', () => activateAuthTab('signup'));
  }
  if (tabBtnSignIn) {
    tabBtnSignIn.addEventListener('click', () => activateAuthTab('signin'));
  }
  if (btnCloseAuthModal) {
    btnCloseAuthModal.addEventListener('click', closeAuthModal);
  }
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Render Navbar User Session
  function renderNavbarUser() {
    if (!navbarUserContainer) return;
    const activeUser = (typeof UserDetailsHub !== 'undefined') ? UserDetailsHub.getActiveUser() : null;

    if (activeUser) {
      const firstName = (activeUser.name || 'User').split(' ')[0];
      let roleLabelShort = 'सदस्य';
      let roleBadgeBg = '#e0f2fe';
      let roleBadgeColor = '#0284c7';

      if (activeUser.userType === 'admin' || (activeUser.email || '').toLowerCase() === 'smart.webpage.storage@gmail.com') {
        roleLabelShort = '👑 एडमिन';
        roleBadgeBg = '#fee2e2';
        roleBadgeColor = '#dc2626';
      } else if (activeUser.userType === 'employer') {
        roleLabelShort = 'नियोक्ता';
        roleBadgeBg = '#fef3c7';
        roleBadgeColor = '#d97706';
      } else if (activeUser.userType === 'epfo_staff') {
        roleLabelShort = 'EPFO स्टाफ';
        roleBadgeBg = '#ecfdf5';
        roleBadgeColor = '#059669';
      } else if (activeUser.userType === 'govt_staff') {
        roleLabelShort = 'सरकारी';
        roleBadgeBg = '#ede9fe';
        roleBadgeColor = '#7c3aed';
      }

      const isAdminUser = activeUser.userType === 'admin' || (activeUser.email || '').toLowerCase() === 'smart.webpage.storage@gmail.com';
      const adminDashLink = isAdminUser ? `
        <a href="admin-users.html" class="btn-admin-nav-link" style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff; text-decoration: none; font-size: 11.5px; font-weight: 800; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(220,38,38,0.3); margin-right: 6px;">
          ⚙️ एडमिन पैनल
        </a>
      ` : '';

      navbarUserContainer.innerHTML = `
        <div style="display: inline-flex; align-items: center;">
          ${adminDashLink}
          <span class="user-navbar-profile" title="लॉगिन: ${activeUser.name} | ${activeUser.email} (${activeUser.mobile})">
            👤 ${firstName} <span style="font-size: 10.5px; background: ${roleBadgeBg}; color: ${roleBadgeColor}; padding: 2px 7px; border-radius: 4px; font-weight: 800; margin-left: 2px;">${roleLabelShort}</span>
            <button type="button" class="btn-navbar-logout" id="btnNavbarLogout" title="सत्र समाप्त करें / Logout">लॉगआउट</button>
          </span>
        </div>
      `;
      const btnLogout = document.getElementById('btnNavbarLogout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          if (confirm('क्या आप लॉगआउट करना चाहते हैं? (Do you want to logout?)')) {
            UserDetailsHub.logoutUser();
            renderNavbarUser();
          }
        });
      }
    } else {
      navbarUserContainer.innerHTML = `
        <button type="button" class="btn btn-primary" id="btnNavbarLoginTrigger" style="font-size: 12px; padding: 6px 14px; border-radius: 20px; font-weight: 700; background: linear-gradient(135deg, #0284c7, #0369a1); box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3);">
          👤 साइन इन / रजिस्टर
        </button>
      `;
      const btnTrigger = document.getElementById('btnNavbarLoginTrigger');
      if (btnTrigger) {
        btnTrigger.addEventListener('click', () => {
          const lastEmail = localStorage.getItem('portalLastRegisteredEmail');
          const allUsers = (typeof UserDetailsHub !== 'undefined') ? UserDetailsHub.getAllUsers() : [];
          if (lastEmail || allUsers.length > 0) {
            openAuthModal(null, 'signin', lastEmail);
          } else {
            openAuthModal(null, 'signup');
          }
        });
      }
    }
  }

  // Handle Sign-Up User Role Selection Switching
  const roleRadioCards = document.querySelectorAll('.auth-role-radio-card');
  const roleBadgeNoticeIcon = document.getElementById('roleBadgeNoticeIcon');
  const roleBadgeNoticeText = document.getElementById('roleBadgeNoticeText');
  const lblSignUpName = document.getElementById('lblSignUpName');
  const lblSignUpMobile = document.getElementById('lblSignUpMobile');
  const lblSignUpEmail = document.getElementById('lblSignUpEmail');
  const fieldsEmployerOnly = document.getElementById('fieldsEmployerOnly');
  const fieldsEpfoStaffOnly = document.getElementById('fieldsEpfoStaffOnly');
  const fieldsGovtStaffOnly = document.getElementById('fieldsGovtStaffOnly');
  const signUpEsttName = document.getElementById('signUpEsttName');
  const signUpEsttCode = document.getElementById('signUpEsttCode');
  const signUpEsttAddress = document.getElementById('signUpEsttAddress');
  const signUpOfficeName = document.getElementById('signUpOfficeName');
  const signUpEmployeeId = document.getElementById('signUpEmployeeId');
  const signUpDesignation = document.getElementById('signUpDesignation');
  const signUpGovtDeptName = document.getElementById('signUpGovtDeptName');
  const signUpGovtDesignation = document.getElementById('signUpGovtDesignation');

  function updateSignUpRoleFields(role) {
    roleRadioCards.forEach(card => {
      if (card.getAttribute('data-role-type') === role) {
        card.classList.add('active');
        const r = card.querySelector('input[type="radio"]');
        if (r) r.checked = true;
      } else {
        card.classList.remove('active');
      }
    });

    // Hide all role-specific groups first
    if (fieldsEmployerOnly) fieldsEmployerOnly.style.display = 'none';
    if (fieldsEpfoStaffOnly) fieldsEpfoStaffOnly.style.display = 'none';
    if (fieldsGovtStaffOnly) fieldsGovtStaffOnly.style.display = 'none';

    // Remove required from role-specific inputs
    if (signUpEsttName) signUpEsttName.required = false;
    if (signUpEsttCode) signUpEsttCode.required = false;
    if (signUpEsttAddress) signUpEsttAddress.required = false;
    if (signUpOfficeName) signUpOfficeName.required = false;
    if (signUpEmployeeId) signUpEmployeeId.required = false;
    if (signUpDesignation) signUpDesignation.required = false;
    if (signUpGovtDeptName) signUpGovtDeptName.required = false;
    if (signUpGovtDesignation) signUpGovtDesignation.required = false;

    if (role === 'employer') {
      if (fieldsEmployerOnly) fieldsEmployerOnly.style.display = 'block';
      if (signUpEsttName) signUpEsttName.required = true;
      if (signUpEsttCode) signUpEsttCode.required = true;
      if (signUpEsttAddress) signUpEsttAddress.required = true;

      if (lblSignUpName) lblSignUpName.textContent = 'अधिकृत प्रतिनिधि / HR का नाम (Authorized Person Name) *';
      if (lblSignUpMobile) lblSignUpMobile.textContent = 'संपर्क मोबाइल नंबर (10-Digit Mobile) *';
      if (lblSignUpEmail) lblSignUpEmail.textContent = 'कंपनी आधिकारिक ईमेल आईडी (Official Email) *';
      if (roleBadgeNoticeIcon) roleBadgeNoticeIcon.textContent = '🏢';
      if (roleBadgeNoticeText) roleBadgeNoticeText.innerHTML = '<strong>नियोक्ता / कंपनी पंजीकरण:</strong> कंपनी लेटरहेड पत्र, रिटर्न 5A, पुर्नकार्यग्रहण व सत्यापन हेतु आवश्यक विवरण भरें।';
    } else if (role === 'epfo_staff') {
      if (fieldsEpfoStaffOnly) fieldsEpfoStaffOnly.style.display = 'block';
      if (signUpOfficeName) signUpOfficeName.required = true;
      if (signUpEmployeeId) signUpEmployeeId.required = true;
      if (signUpDesignation) signUpDesignation.required = true;

      if (lblSignUpName) lblSignUpName.textContent = 'कर्मचारी / अधिकारी का नाम (Staff Name) *';
      if (lblSignUpMobile) lblSignUpMobile.textContent = 'मोबाइल नंबर (10-Digit Mobile) *';
      if (lblSignUpEmail) lblSignUpEmail.textContent = 'कार्यालयीन ईमेल आईडी (Official Email) *';
      if (roleBadgeNoticeIcon) roleBadgeNoticeIcon.textContent = '🏛️';
      if (roleBadgeNoticeText) roleBadgeNoticeText.innerHTML = '<strong>EPFO कार्यालयीन स्टाफ पंजीकरण:</strong> आंतरिक नोटिंग शीट, एनेक्सचर-K, टूर व अवकाश हेतु विवरण भरें।';
    } else if (role === 'govt_staff') {
      if (fieldsGovtStaffOnly) fieldsGovtStaffOnly.style.display = 'block';
      if (signUpGovtDeptName) signUpGovtDeptName.required = true;
      if (signUpGovtDesignation) signUpGovtDesignation.required = true;

      if (lblSignUpName) lblSignUpName.textContent = 'अधिकारी / कर्मचारी का नाम (Officer Name) *';
      if (lblSignUpMobile) lblSignUpMobile.textContent = 'मोबाइल नंबर (10-Digit Mobile) *';
      if (lblSignUpEmail) lblSignUpEmail.textContent = 'विभागीय ईमेल आईडी (Department Email) *';
      if (roleBadgeNoticeIcon) roleBadgeNoticeIcon.textContent = '🇮🇳';
      if (roleBadgeNoticeText) roleBadgeNoticeText.innerHTML = '<strong>अन्य सरकारी कार्यालय पंजीकरण:</strong> यात्रा भत्ता बिल (TA Bill), CEA व आधिकारिक प्रपत्रों हेतु विवरण भरें।';
    } else {
      // member
      if (lblSignUpName) lblSignUpName.textContent = 'सदस्य का पूरा नाम (Full Name) *';
      if (lblSignUpMobile) lblSignUpMobile.textContent = 'मोबाइल नंबर (10-Digit Mobile) *';
      if (lblSignUpEmail) lblSignUpEmail.textContent = 'ईमेल आईडी (Email Address) *';
      if (roleBadgeNoticeIcon) roleBadgeNoticeIcon.textContent = '👨‍💼';
      if (roleBadgeNoticeText) roleBadgeNoticeText.innerHTML = '<strong>EPFO सदस्य पंजीकरण:</strong> अपने पीएफ दावों, पेंशन व अग्रिम निकासी हेतु आवश्यक विवरण भरें।';
    }
  }

  // Bind radio card clicks
  roleRadioCards.forEach(card => {
    card.addEventListener('click', () => {
      const roleType = card.getAttribute('data-role-type') || 'member';
      updateSignUpRoleFields(roleType);
    });
  });

  // Handle Registration Submit
  if (formSignUp) {
    formSignUp.addEventListener('submit', (e) => {
      e.preventDefault();
      const userType = document.querySelector('input[name="signUpUserType"]:checked')?.value || 'member';
      const name = document.getElementById('signUpName')?.value;
      const email = document.getElementById('signUpEmail')?.value;
      const mobile = document.getElementById('signUpMobile')?.value;
      const password = document.getElementById('signUpPassword')?.value;

      if (typeof UserDetailsHub === 'undefined') {
        alert('User details system error. Please reload page.');
        return;
      }

      const payload = {
        userType,
        name,
        email,
        mobile,
        password,
        establishmentName: document.getElementById('signUpEsttName')?.value,
        establishmentCode: document.getElementById('signUpEsttCode')?.value,
        establishmentAddress: document.getElementById('signUpEsttAddress')?.value,
        officeName: document.getElementById('signUpOfficeName')?.value,
        employeeId: document.getElementById('signUpEmployeeId')?.value,
        designation: (userType === 'epfo_staff' ? document.getElementById('signUpDesignation')?.value : document.getElementById('signUpGovtDesignation')?.value),
        departmentName: document.getElementById('signUpGovtDeptName')?.value
      };

      const res = UserDetailsHub.registerUser(payload);
      if (!res.success) {
        // If already registered, seamlessly transition to Sign In tab!
        if (res.alreadyRegistered) {
          activateAuthTab('signin');
          const signInEmail = document.getElementById('signInEmail');
          if (signInEmail) signInEmail.value = email;
          const signInPassword = document.getElementById('signInPassword');
          if (signInPassword) {
            signInPassword.value = '';
            signInPassword.focus();
          }
          if (signInError) {
            signInError.textContent = 'ℹ️ यह ईमेल/मोबाइल पहले से पंजीकृत है! कृपया अपना पासवर्ड दर्ज करके साइन इन करें।';
            signInError.style.display = 'block';
            signInError.style.background = '#e0f2fe';
            signInError.style.color = '#0369a1';
          }
          return;
        }

        if (signUpError) {
          signUpError.textContent = res.message;
          signUpError.style.display = 'block';
          signUpError.style.background = '#fee2e2';
          signUpError.style.color = '#dc2626';
        } else {
          alert(res.message);
        }
        return;
      }

      // Success Message tailored to role
      let successMsg = `स्वागत है, ${name}! आपका पंजीकरण सफलतापूर्वक हो गया है।`;
      if (userType === 'employer') {
        successMsg = `स्वागत है! आपकी कंपनी '${payload.establishmentName}' का पंजीकरण सफलतापूर्वक हो गया है।`;
        setActiveRole('employer');
      } else if (userType === 'epfo_staff') {
        successMsg = `स्वागत है, ${name} (${payload.designation}, ${payload.officeName})! आपका EPFO स्टाफ पंजीकरण सफल रहा।`;
        setActiveRole('office');
      } else if (userType === 'govt_staff') {
        successMsg = `स्वागत है, ${name} (${payload.designation})! आपका सरकारी कर्मचारी पंजीकरण सफल रहा।`;
        setActiveRole('central-govt');
      } else {
        setActiveRole('member');
      }

      alert(successMsg);
      renderNavbarUser();
      closeAuthModal();

      // If user clicked on a form before registering, redirect them now
      if (pendingFormDestination) {
        const dest = pendingFormDestination;
        pendingFormDestination = null;
        window.location.href = dest;
      }
    });
  }

  // Handle Login Submit
  if (formSignIn) {
    formSignIn.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signInEmail')?.value;
      const password = document.getElementById('signInPassword')?.value;

      if (typeof UserDetailsHub === 'undefined') {
        alert('User details system error. Please reload page.');
        return;
      }

      const res = UserDetailsHub.loginUser({ email, password });
      if (!res.success) {
        if (signInError) {
          signInError.textContent = res.message;
          signInError.style.display = 'block';
          signInError.style.background = '#fee2e2';
          signInError.style.color = '#dc2626';
        } else {
          alert(res.message);
        }
        return;
      }

      // Success
      const loggedUser = res.user || {};
      const uType = loggedUser.userType || 'member';
      if (uType === 'employer') setActiveRole('employer');
      else if (uType === 'epfo_staff') setActiveRole('office');
      else if (uType === 'govt_staff') setActiveRole('central-govt');
      else setActiveRole('member');

      alert(`स्वागत है, ${loggedUser.name}! आपका लॉगिन सफल रहा।`);
      renderNavbarUser();
      closeAuthModal();

      // If user clicked on a form before signing in, redirect them now
      if (pendingFormDestination) {
        const dest = pendingFormDestination;
        pendingFormDestination = null;
        window.location.href = dest;
      }
    });
  }

  // Forgot Password / OTP Reset Flow
  const btnOpenForgotPassword = document.getElementById('btnOpenForgotPassword');
  const btnBackToSignIn = document.getElementById('btnBackToSignIn');
  const btnRequestOtp = document.getElementById('btnRequestOtp');
  const btnSubmitNewPassword = document.getElementById('btnSubmitNewPassword');
  const forgotStep1 = document.getElementById('forgotStep1');
  const forgotStep2 = document.getElementById('forgotStep2');
  const forgotIdentifier = document.getElementById('forgotIdentifier');
  const forgotFeedbackError = document.getElementById('forgotFeedbackError');
  const forgotFeedbackSuccess = document.getElementById('forgotFeedbackSuccess');
  const inputForgotOtp = document.getElementById('inputForgotOtp');
  const inputNewPassword = document.getElementById('inputNewPassword');
  const inputConfirmNewPassword = document.getElementById('inputConfirmNewPassword');

  let activeResetIdentifier = '';

  if (btnOpenForgotPassword) {
    btnOpenForgotPassword.addEventListener('click', () => {
      if (tabBtnSignUp) tabBtnSignUp.classList.remove('active');
      if (tabBtnSignIn) tabBtnSignIn.classList.remove('active');
      if (formSignUpPane) formSignUpPane.style.display = 'none';
      if (formSignInPane) formSignInPane.style.display = 'none';
      if (formForgotPane) formForgotPane.style.display = 'block';
      if (forgotStep1) forgotStep1.style.display = 'block';
      if (forgotStep2) forgotStep2.style.display = 'none';
      if (forgotFeedbackError) forgotFeedbackError.style.display = 'none';
      if (forgotFeedbackSuccess) forgotFeedbackSuccess.style.display = 'none';

      const signInEmail = document.getElementById('signInEmail');
      if (forgotIdentifier && signInEmail && signInEmail.value) {
        forgotIdentifier.value = signInEmail.value.trim();
      }
    });
  }

  if (btnBackToSignIn) {
    btnBackToSignIn.addEventListener('click', () => {
      activateAuthTab('signin');
    });
  }

  if (btnRequestOtp) {
    btnRequestOtp.addEventListener('click', () => {
      if (!forgotIdentifier || !forgotIdentifier.value.trim()) {
        if (forgotFeedbackError) {
          forgotFeedbackError.textContent = 'कृपया अपना पंजीकृत ईमेल अथवा 10-अंकीय मोबाइल दर्ज करें।';
          forgotFeedbackError.style.display = 'block';
        }
        return;
      }
      activeResetIdentifier = forgotIdentifier.value.trim();
      if (typeof UserDetailsHub === 'undefined') {
        alert('Authentication Hub not loaded.');
        return;
      }

      const res = UserDetailsHub.sendPasswordResetOtp(activeResetIdentifier);
      if (!res.success) {
        if (forgotFeedbackError) {
          forgotFeedbackError.textContent = res.message;
          forgotFeedbackError.style.display = 'block';
        }
        if (forgotFeedbackSuccess) forgotFeedbackSuccess.style.display = 'none';
      } else {
        if (forgotFeedbackError) forgotFeedbackError.style.display = 'none';
        if (forgotFeedbackSuccess) {
          forgotFeedbackSuccess.innerHTML = `✅ ${res.message}`;
          forgotFeedbackSuccess.style.display = 'block';
        }
        if (forgotStep1) forgotStep1.style.display = 'none';
        if (forgotStep2) forgotStep2.style.display = 'block';
        if (inputForgotOtp) {
          inputForgotOtp.value = res.otp;
          inputForgotOtp.focus();
        }
        alert(`ओटीपी जारी हो गया है:\n\nसत्यापन कोड: ${res.otp}\n\nयह 10 मिनट के लिए मान्य है।`);
      }
    });
  }

  if (btnSubmitNewPassword) {
    btnSubmitNewPassword.addEventListener('click', async () => {
      const otp = (inputForgotOtp?.value || '').trim();
      const newPwd = (inputNewPassword?.value || '').trim();
      const confirmPwd = (inputConfirmNewPassword?.value || '').trim();

      if (!otp) {
        alert('कृपया 6-अंकीय ओटीपी दर्ज करें।');
        return;
      }
      if (!newPwd || newPwd.length < 4) {
        alert('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
        return;
      }
      if (newPwd !== confirmPwd) {
        alert('दोनों पासवर्ड मेल नहीं खा रहे हैं! कृपया दोबारा जांचें।');
        return;
      }

      const verifyRes = UserDetailsHub.verifyPasswordResetOtp(activeResetIdentifier, otp);
      if (!verifyRes.success) {
        alert(verifyRes.message);
        return;
      }

      btnSubmitNewPassword.disabled = true;
      btnSubmitNewPassword.textContent = 'सेव हो रहा है...';

      const resetRes = await UserDetailsHub.resetUserPassword(activeResetIdentifier, newPwd);
      btnSubmitNewPassword.disabled = false;
      btnSubmitNewPassword.textContent = '✅ नया पासवर्ड सेव करें एवं लॉगिन करें (Reset & Save)';

      if (resetRes.success) {
        alert(resetRes.message);
        activateAuthTab('signin');
        const signInEmail = document.getElementById('signInEmail');
        const signInPassword = document.getElementById('signInPassword');
        if (signInEmail) signInEmail.value = activeResetIdentifier;
        if (signInPassword) {
          signInPassword.value = newPwd;
          signInPassword.focus();
        }
      } else {
        alert(resetRes.message);
      }
    });
  }

  // Role Denial Modal Elements
  const roleAccessDeniedModal = document.getElementById('roleAccessDeniedModal');
  const btnCloseRoleDeniedModal = document.getElementById('btnCloseRoleDeniedModal');
  const btnCloseDeniedModalHeader = document.getElementById('btnCloseDeniedModalHeader');
  const btnShowMyAllowedForms = document.getElementById('btnShowMyAllowedForms');
  const btnSwitchAccountFromDenied = document.getElementById('btnSwitchAccountFromDenied');
  const deniedModalFormTitle = document.getElementById('deniedModalFormTitle');
  const deniedModalAllowedRoles = document.getElementById('deniedModalAllowedRoles');
  const deniedModalUserRole = document.getElementById('deniedModalUserRole');

  function openRoleDeniedModal(formIdentifier, formTitle, activeUser) {
    if (!roleAccessDeniedModal) {
      alert(`⚠️ पहुंच प्रतिबंधित (Access Restricted)!\n\nयह प्रपत्र आपकी वर्तमान लॉगिन भूमिका के लिए उपलब्ध नहीं है।`);
      return;
    }

    const allowedRoles = (typeof UserDetailsHub !== 'undefined') 
      ? UserDetailsHub.getAllowedRolesForForm(formIdentifier)
      : [];
    
    const allowedDisplayNames = allowedRoles.map(r => {
      if (typeof UserDetailsHub !== 'undefined') return UserDetailsHub.getRoleDisplayName(r);
      return r;
    }).join(' अथवा ');

    const currentUserRoleName = (typeof UserDetailsHub !== 'undefined' && activeUser)
      ? UserDetailsHub.getRoleDisplayName(activeUser.userType)
      : 'अज्ञात';

    if (deniedModalFormTitle) {
      deniedModalFormTitle.textContent = formTitle || formIdentifier;
    }
    if (deniedModalAllowedRoles) {
      deniedModalAllowedRoles.textContent = allowedDisplayNames || 'अधिकृत कर्मचारी/उपयोगकर्ता';
    }
    if (deniedModalUserRole) {
      const uName = activeUser ? activeUser.name : 'User';
      deniedModalUserRole.textContent = `${currentUserRoleName} (${uName})`;
    }

    roleAccessDeniedModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeRoleDeniedModal() {
    if (!roleAccessDeniedModal) return;
    roleAccessDeniedModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (btnCloseRoleDeniedModal) {
    btnCloseRoleDeniedModal.addEventListener('click', closeRoleDeniedModal);
  }
  if (btnCloseDeniedModalHeader) {
    btnCloseDeniedModalHeader.addEventListener('click', closeRoleDeniedModal);
  }
  if (roleAccessDeniedModal) {
    roleAccessDeniedModal.addEventListener('click', (e) => {
      if (e.target === roleAccessDeniedModal) closeRoleDeniedModal();
    });
  }

  if (btnShowMyAllowedForms) {
    btnShowMyAllowedForms.addEventListener('click', () => {
      closeRoleDeniedModal();
      const activeUser = (typeof UserDetailsHub !== 'undefined') ? UserDetailsHub.getActiveUser() : null;
      if (activeUser) {
        const uType = activeUser.userType || 'member';
        let targetRole = 'member';
        if (uType === 'employer') targetRole = 'employer';
        else if (uType === 'epfo_staff') targetRole = 'office';
        else if (uType === 'govt_staff') targetRole = 'central-govt';
        setActiveRole(targetRole, true);
      }
    });
  }

  if (btnSwitchAccountFromDenied) {
    btnSwitchAccountFromDenied.addEventListener('click', () => {
      closeRoleDeniedModal();
      if (typeof UserDetailsHub !== 'undefined') {
        UserDetailsHub.logoutUser();
        renderNavbarUser();
      }
      openAuthModal(null, 'signin');
    });
  }

  // Form Access & Print Gatekeeper
  // फॉर्म देखना व ऑनलाइन भरना 100% खुला और बिना किसी रुकावट के है।
  // केवल 'सीधा प्रिंट' या फॉर्म पेज पर प्रिंट/डाउनलोड करते समय (यदि एडमिन टॉगल चालू हो) लॉगिन पूछा जाता है।
  function attachAuthGatekeeper() {
    const directPrintBtns = document.querySelectorAll('.btn-direct-print');

    directPrintBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isPrintLoginRequired = (typeof UserDetailsHub !== 'undefined') ? UserDetailsHub.isLoginRequiredForPrint() : false;
        const activeUser = (typeof UserDetailsHub !== 'undefined') ? UserDetailsHub.getActiveUser() : null;
        const targetHref = btn.getAttribute('href') || '';

        // Only intercept if admin has turned ON the login requirement for printing AND user is not logged in
        if (isPrintLoginRequired && !activeUser) {
          e.preventDefault();
          const lastEmail = localStorage.getItem('portalLastRegisteredEmail');
          const allUsers = (typeof UserDetailsHub !== 'undefined') ? UserDetailsHub.getAllUsers() : [];

          if (lastEmail || allUsers.length > 0) {
            openAuthModal(targetHref, 'signin', lastEmail);
          } else {
            openAuthModal(targetHref, 'signup');
          }
        }
      });
    });
  }

  // Initialize Navbar User & Gatekeeper
  renderNavbarUser();
  attachAuthGatekeeper();

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
      closeAuthModal();
      closeRoleDeniedModal();
    }
  });

  // =========================================================================
  // 4. Department Navigation, Search & Form Filtering
  // =========================================================================
  const searchInput = document.getElementById('searchFormsInput');
  let formCards = document.querySelectorAll('.form-card');
  const countDisplay = document.getElementById('liveFormsCount');
  let deptCards = document.querySelectorAll('.dept-card');

  // Default active department: null (no forms shown until user clicks a category)
  const urlParams = new URLSearchParams(window.location.search);
  const paramDept = urlParams.get('dept') || urlParams.get('category');
  let activeDept = paramDept || null;

  const deptMetadata = {
    'epfo-member': {
      icon: '👨‍💼',
      title: 'EPFO सदस्य प्रपत्र (EPFO Member Services)',
      desc: 'पीएफ अग्रिम निकासी (Form 31), मासिक पेंशन (Form 10-D), मृत्यु दावा कंपोजिट फॉर्म, आधार कंपोजिट दावा (19/10C/31), पुनर्विवाह न करने का घोषणा-पत्र, संयुक्त घोषणा, ऑन-रोल व गेस्ट हाउस प्रपत्र।'
    },
    'epfo-employer': {
      icon: '🏢',
      title: 'EPFO नियोक्ता प्रपत्र (EPFO Employer Services)',
      desc: 'पुनः कार्यग्रहण पत्र (Rejoining Letter), गलत NCP Days स्पष्टीकरण पत्र, नौकरी छोड़ने का कारण (Reason of Exit) संशोधन पत्र, स्वामित्व रिटर्न (Form 5-A), फॉर्म-13 हस्ताक्षर सत्यापन, ईपीएस अंशदान विलय व संयुक्त घोषणा।'
    },
    'epfo-staff': {
      icon: '🏛️',
      title: 'EPFO कार्यालयीन प्रपत्र (EPFO Staff & Office Notes)',
      desc: 'विधिक नोटिंग शीट (Rejoining Legal Note), संशोधित एनेक्सचर-K, कार्यालयीन नोटिंग, टूर प्रोग्राम, स्टेशनरी मांग पत्र, गेस्ट हाउस एवं अवकाश आवेदन।'
    },
    'govt': {
      icon: '🇮🇳',
      title: 'सरकारी कर्मचारी प्रपत्र (Govt Employee Forms)',
      desc: 'यात्रा भत्ता बिल (GAR 14-A TA Bill), बाल शिक्षा भत्ता (CEA), टूर प्रोग्राम, आधिकारिक अवकाश एवं कार्यभार ग्रहण रिपोर्ट, स्टेशनरी प्रपत्र।'
    },
    'uidai': {
      icon: '🆔',
      title: 'भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI / Aadhaar)',
      desc: 'आधार एनरोलमेंट व सुधार हेतु राजपत्रित अधिकारी, सांसद, विधायक, तहसीलदार एवं मान्यता प्राप्त शिक्षण संस्थान द्वारा जारी 1-पेज A4 मानक प्रमाणपत्र।'
    },
    'incometax': {
      icon: '💰',
      title: 'आयकर विभाग (Income Tax Department)',
      desc: 'बैंक एफडी ब्याज, लाभांश अथवा पीएफ निकासी पर टीडीएस कटौती से छूट (Nil TDS) हेतु धारा 197A(1)/(1A) के अंतर्गत फॉर्म 15G स्व-घोषणा प्रपत्र।'
    },
    'rto': {
      icon: '🚗',
      title: 'परिवहन विभाग एवं आरटीओ (Parivahan / RTO Forms)',
      desc: 'पुरानी कार, बाइक या किसी भी मोटर वाहन की खरीद-बिक्री के बाद आरटीओ में ओनरशिप ट्रांसफर हेतु नोटिस (Form 29) एवं आवेदन (Form 30)।'
    }
  };

  // Compute live counts for each department badge
  function updateDeptCounts() {
    const counts = {
      'all': formCards.length,
      'epfo-member': 0,
      'epfo-employer': 0,
      'epfo-staff': 0,
      'govt': 0,
      'uidai': 0,
      'incometax': 0,
      'rto': 0
    };

    formCards.forEach(card => {
      const deptAttr = (card.getAttribute('data-department') || '').toLowerCase();
      const catAttr = (card.getAttribute('data-category') || '').toLowerCase();
      const roleAttr = (card.getAttribute('data-role') || '').toLowerCase();
      
      const depts = (deptAttr + ' ' + catAttr).split(/\s+/).filter(Boolean);
      const roles = roleAttr.split(/\s+/).filter(Boolean);
      const isEpfo = depts.includes('epfo') || catAttr.includes('epfo');

      if ((isEpfo && roles.includes('member')) || deptAttr === 'epfo-member' || depts.includes('epfo-member')) {
        counts['epfo-member']++;
      }
      if ((isEpfo && roles.includes('employer')) || deptAttr === 'epfo-employer' || depts.includes('epfo-employer')) {
        counts['epfo-employer']++;
      }
      if ((isEpfo && (roles.includes('office') || roles.includes('staff'))) || deptAttr === 'epfo-staff' || depts.includes('epfo-staff')) {
        counts['epfo-staff']++;
      }
      if (depts.includes('govt') || depts.includes('central-govt') || deptAttr === 'govt') {
        counts['govt']++;
      }
      if (depts.includes('uidai') || deptAttr === 'uidai') {
        counts['uidai']++;
      }
      if (depts.includes('incometax') || deptAttr === 'incometax') {
        counts['incometax']++;
      }
      if (depts.includes('rto') || deptAttr === 'rto') {
        counts['rto']++;
      }

      // Count for custom departments
      if (deptAttr && !['epfo-member', 'epfo-employer', 'epfo-staff', 'govt', 'uidai', 'incometax', 'rto'].includes(deptAttr)) {
        counts[deptAttr] = (counts[deptAttr] || 0) + 1;
      }
    });

    const elEpfoMember = document.getElementById('countDeptEpfoMember');
    const elEpfoEmployer = document.getElementById('countDeptEpfoEmployer');
    const elEpfoStaff = document.getElementById('countDeptEpfoStaff');
    const elGovt = document.getElementById('countDeptGovt');
    const elUidai = document.getElementById('countDeptUidai');
    const elTax = document.getElementById('countDeptTax');
    const elRto = document.getElementById('countDeptRto');

    if (elEpfoMember) elEpfoMember.textContent = counts['epfo-member'];
    if (elEpfoEmployer) elEpfoEmployer.textContent = counts['epfo-employer'];
    if (elEpfoStaff) elEpfoStaff.textContent = counts['epfo-staff'];
    if (elGovt) elGovt.textContent = counts['govt'];
    if (elUidai) elUidai.textContent = counts['uidai'];
    if (elTax) elTax.textContent = counts['incometax'];
    if (elRto) elRto.textContent = counts['rto'];

    // Update custom department count badges
    const allCustom = (typeof UserDetailsHub !== 'undefined' && typeof UserDetailsHub.getCustomDepartments === 'function')
      ? UserDetailsHub.getCustomDepartments()
      : [];
    allCustom.forEach(cd => {
      const badge = document.getElementById('countDept_' + cd.id);
      if (badge) badge.textContent = `${counts[cd.id] || 0} प्रपत्र`;
    });
  }

  function filterForms() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    const noDeptPrompt = document.getElementById('noDeptSelectedPrompt');
    const activeCatHeader = document.getElementById('activeCategoryHeader');

    // Default state: If no category is selected and no search query, HIDE ALL forms and show prompt
    if (!activeDept && !query) {
      formCards.forEach(card => {
        card.style.display = 'none';
      });
      if (noDeptPrompt) noDeptPrompt.style.display = 'block';
      if (activeCatHeader) activeCatHeader.style.display = 'none';
      if (countDisplay) countDisplay.textContent = '0 Forms';
      return;
    }

    // Category or search active: hide prompt
    if (noDeptPrompt) noDeptPrompt.style.display = 'none';

    // Show active category header if category is selected
    if (activeDept) {
      if (activeCatHeader) activeCatHeader.style.display = 'flex';
      const meta = deptMetadata[activeDept];
      if (meta) {
        const iconEl = document.getElementById('activeCategoryIcon');
        const titleEl = document.getElementById('activeCategoryTitle');
        const descEl = document.getElementById('activeCategoryDesc');
        if (iconEl) iconEl.textContent = meta.icon;
        if (titleEl) titleEl.textContent = meta.title;
        if (descEl) descEl.textContent = meta.desc;
      }
    } else {
      if (activeCatHeader) activeCatHeader.style.display = 'none';
    }

    formCards.forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.hindi-desc')?.textContent || '').toLowerCase();
      const deptBadge = (card.querySelector('.badge-tag')?.textContent || '').toLowerCase();
      const roleBadge = (card.querySelector('.badge-role')?.textContent || '').toLowerCase();
      const formId = (card.getAttribute('data-form-id') || '').toLowerCase();
      const deptAttr = (card.getAttribute('data-department') || '').toLowerCase();
      const catAttr = (card.getAttribute('data-category') || '').toLowerCase();
      const roleAttr = (card.getAttribute('data-role') || '').toLowerCase();

      const depts = (deptAttr + ' ' + catAttr).split(/\s+/).filter(Boolean);
      const roles = roleAttr.split(/\s+/).filter(Boolean);
      const isEpfo = depts.includes('epfo') || catAttr.includes('epfo');

      const matchesQuery = !query || title.includes(query) || desc.includes(query) || deptBadge.includes(query) || roleBadge.includes(query) || formId.includes(query);
      
      let matchesDept = false;
      if (activeDept === 'all' || query) {
        matchesDept = true;
      } else if (activeDept === 'epfo-member') {
        matchesDept = (isEpfo && roles.includes('member')) || deptAttr === 'epfo-member' || depts.includes('epfo-member');
      } else if (activeDept === 'epfo-employer') {
        matchesDept = (isEpfo && roles.includes('employer')) || deptAttr === 'epfo-employer' || depts.includes('epfo-employer');
      } else if (activeDept === 'epfo-staff') {
        matchesDept = (isEpfo && (roles.includes('office') || roles.includes('staff'))) || deptAttr === 'epfo-staff' || depts.includes('epfo-staff');
      } else if (activeDept === 'govt') {
        matchesDept = depts.includes('govt') || depts.includes('central-govt') || deptAttr === 'govt';
      } else if (activeDept === 'uidai') {
        matchesDept = depts.includes('uidai') || deptAttr === 'uidai';
      } else if (activeDept === 'incometax') {
        matchesDept = depts.includes('incometax') || deptAttr === 'incometax';
      } else if (activeDept === 'rto') {
        matchesDept = depts.includes('rto') || deptAttr === 'rto';
      } else if (activeDept) {
        matchesDept = (deptAttr === activeDept) || depts.includes(activeDept);
      }

      if (matchesQuery && matchesDept) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const activeCatBadge = document.getElementById('activeCategoryCountBadge');
    if (activeCatBadge) {
      activeCatBadge.textContent = `${visibleCount} प्रपत्र उपलब्ध`;
    }
    if (countDisplay) {
      countDisplay.textContent = `Showing ${visibleCount} Forms`;
    }
  }

    // Map legacy role names to department keys
  function setActiveRole(role, shouldScroll = false) {
    let dept = 'all';
    if (role === 'employer') dept = 'epfo-employer';
    else if (role === 'office') dept = 'epfo-staff';
    else if (role === 'central-govt') dept = 'govt';
    else if (role === 'member') dept = 'epfo-member';
    else dept = role;
    setActiveDepartment(dept, shouldScroll);
  }
  window.setActiveRole = setActiveRole;


  // Render Dynamic Custom Departments created by Admin
  function renderCustomDepartmentsInPortal() {
    if (typeof UserDetailsHub === 'undefined' || typeof UserDetailsHub.getCustomDepartments !== 'function') return;
    const customDepts = UserDetailsHub.getCustomDepartments();
    const deptGrid = document.querySelector('.dept-grid');
    if (!deptGrid) return;

    // Register all custom departments into deptMetadata
    customDepts.forEach(dept => {
      deptMetadata[dept.id] = {
        icon: dept.icon || '📁',
        title: dept.title,
        desc: dept.desc || (dept.title + ' प्रपत्र')
      };
    });

    // Remove any previously rendered custom department cards
    deptGrid.querySelectorAll('.custom-dept-card').forEach(el => el.remove());

    if (!customDepts || !customDepts.length) {
      deptCards = document.querySelectorAll('.dept-card');
      return;
    }

    // Insert before the last element (video tutorials)
    const videoCard = deptGrid.querySelector('a[href="#videoGuidesSection"]');

    customDepts.forEach(dept => {
      const card = document.createElement('div');
      card.className = 'dept-card custom-dept-card';
      card.setAttribute('data-dept', dept.id);
      card.setAttribute('data-role', 'custom');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.style.position = 'relative';

      const color = dept.color || '#0284c7';
      card.innerHTML = `
        <div class="dept-icon-circle" style="background: ${color}15; color: ${color};">${dept.icon || '📁'}</div>
        <h4>${dept.shortName || dept.title}</h4>
        <span>${dept.subtitle || 'विभागीय प्रपत्र'}</span>
        <span class="dept-count-badge" id="countDept_${dept.id}" style="background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; margin-top: 6px; display: inline-block;">0 प्रपत्र</span>
      `;

      card.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        setActiveDepartment(dept.id, true);
      });

      if (videoCard) {
        deptGrid.insertBefore(card, videoCard);
      } else {
        deptGrid.appendChild(card);
      }
    });

    // Refresh deptCards NodeList
    deptCards = document.querySelectorAll('.dept-card');
  }
  window.renderCustomDepartmentsInPortal = renderCustomDepartmentsInPortal;

  // Render Dynamic Custom Letters & Notes created by Admin
  function renderCustomLettersInPortal() {
    if (typeof UserDetailsHub === 'undefined' || typeof UserDetailsHub.getAllCustomLetters !== 'function') return;
    const customLetters = UserDetailsHub.getAllCustomLetters();
    const formsGrid = document.querySelector('#formsSection .forms-grid');
    if (!formsGrid) return;

    // Remove any previously rendered custom cards
    formsGrid.querySelectorAll('.custom-letter-card').forEach(el => el.remove());

    if (!customLetters || !customLetters.length) return;

    const allDepts = (typeof UserDetailsHub.getAllDepartments === 'function') ? UserDetailsHub.getAllDepartments() : [];

    customLetters.forEach(item => {
      const card = document.createElement('article');
      card.className = 'form-card custom-letter-card';
      
      const dept = item.department || 'epfo-staff';
      const foundDept = allDepts.find(d => d.id === dept);

      let deptAttr = dept;
      let roleAttr = 'all';
      let badgeTag = foundDept?.shortName || foundDept?.title || 'विभागीय प्रपत्र';
      let roleTag = 'कस्टम प्रारूप';

      if (dept === 'epfo-employer') {
        deptAttr = 'epfo';
        roleAttr = 'employer';
        badgeTag = 'EPFO Employer';
        roleTag = 'नियोक्ता';
      } else if (dept === 'epfo-member') {
        deptAttr = 'epfo';
        roleAttr = 'member';
        badgeTag = 'EPFO Member';
        roleTag = 'सदस्य';
      } else if (dept === 'epfo-staff') {
        deptAttr = 'epfo';
        roleAttr = 'office staff';
        badgeTag = 'EPFO Official';
        roleTag = 'स्टाफ/कार्यालय';
      } else if (dept === 'govt') {
        deptAttr = 'govt central-govt';
        roleAttr = 'office staff';
        badgeTag = 'Govt Office';
        roleTag = 'केंद्रीय/राज्य';
      } else if (dept === 'uidai') {
        deptAttr = 'uidai';
        roleAttr = 'member';
        badgeTag = 'UIDAI';
        roleTag = 'आधार सेवा';
      } else if (dept === 'incometax') {
        deptAttr = 'incometax';
        roleAttr = 'member';
        badgeTag = 'Income Tax';
        roleTag = 'आयकर';
      } else if (dept === 'rto') {
        deptAttr = 'rto';
        roleAttr = 'member';
        badgeTag = 'RTO / Parivahan';
        roleTag = 'परिवहन';
      }

      card.setAttribute('data-form-id', 'custom-' + item.id);
      card.setAttribute('data-category', 'noting letter ' + deptAttr + ' ' + dept);
      card.setAttribute('data-department', dept);
      card.setAttribute('data-role', roleAttr);

      const targetUrl = 'epfo-letterhead-noting.html?custom_letter_id=' + encodeURIComponent(item.id);

      card.innerHTML = `
        <div>
          <div class="form-card-top">
            <div class="form-seal-box" style="background: #eff6ff; border-color: #93c5fd;">
              <span style="font-size: 26px;">${foundDept?.icon || '📜'}</span>
            </div>
            <div class="form-badges-right">
              <span class="badge-role" style="background: #0284c7; color: #ffffff;">${roleTag}</span>
              <span class="badge-tag" style="background: #f0fdf4; color: #166534; border-color: #bbf7d0; font-weight: 800;">${badgeTag}</span>
              <span class="badge-pages" style="background:#fef3c7; color:#92400e; font-weight:700;">कस्टम प्रारूप</span>
            </div>
          </div>

          <div class="form-card-body">
            <h3>${item.title || 'Official Letter / Note'}</h3>
            <p class="hindi-desc">${item.description || 'एडमिन द्वारा निर्मित आधिकारिक नोटिंग / पत्र प्रारूप। इसे भरकर प्रिंट अथवा पीडीएफ डाउनलोड करें।'}</p>

            <ul class="features-check-list">
              <li>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                <span>🏢 प्रारूप: ${item.docMode === 'letter' ? 'शासकीय पत्र (Official Letter)' : item.docMode === 'order' ? 'कार्यालय आदेश (Office Order)' : 'कार्यालयीन नोटिंग शीट'}</span>
              </li>
              <li>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                <span>📌 विषय: ${item.subject ? item.subject.substring(0, 70) + (item.subject.length > 70 ? '...' : '') : 'आधिकारिक विषय निर्धारित'}</span>
              </li>
              <li>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                <span>🖨️ A4 मानक प्रिंट एवं PDF एक्सपोर्ट हेतु पूर्णतः अनुकूलित</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="form-card-actions">
          <a href="${targetUrl}" class="btn-fill-online">✏️ ऑनलाइन भरें</a>
          <div class="action-sub-buttons">
            <a href="${targetUrl}&print=1" class="btn-direct-print" style="width: 100%; justify-content: center;">🖨️ डायरेक्ट प्रिंट</a>
          </div>
        </div>
      `;

      formsGrid.appendChild(card);
    });

    // Refresh formCards NodeList & counts
    formCards = document.querySelectorAll('.form-card');
  }
  window.renderCustomLettersInPortal = renderCustomLettersInPortal;

  function setActiveDepartment(dept, shouldScroll = false) {
    activeDept = dept || null;

    // Sync dept cards
    deptCards.forEach(card => {
      const cardDept = card.getAttribute('data-dept') || card.getAttribute('data-role');
      if (activeDept && cardDept === activeDept) {
        card.classList.add('active');
        card.setAttribute('aria-selected', 'true');
      } else {
        card.classList.remove('active');
        card.removeAttribute('aria-selected');
      }
    });

    filterForms();

    if (shouldScroll && activeDept) {
      const formsSec = document.getElementById('formsSection');
      if (formsSec) formsSec.scrollIntoView({ behavior: 'smooth' });
    }
  }
  window.setActiveDepartment = setActiveDepartment;

  function resetToNoDepartment() {
    activeDept = null;
    deptCards.forEach(card => card.classList.remove('active'));
    if (searchInput) searchInput.value = '';
    filterForms();
    const deptSec = document.getElementById('departmentsSection');
    if (deptSec) deptSec.scrollIntoView({ behavior: 'smooth' });
  }
  window.resetToNoDepartment = resetToNoDepartment;

  // Bind Department Top Cards
  deptCards.forEach(card => {
    card.addEventListener('click', () => {
      const dept = card.getAttribute('data-dept') || card.getAttribute('data-role');
      if (dept) {
        if (searchInput) searchInput.value = '';
        setActiveDepartment(dept, true);
      }
    });
  });

  // Alphabetical Quick Form Selector
  const selectAlphaForm = document.getElementById('alphabeticalFormSelect');
  const btnOpenSelectedForm = document.getElementById('btnOpenSelectedForm');

  function openSelectedAlphaForm() {
    if (!selectAlphaForm || !selectAlphaForm.value) return;
    const targetUrl = selectAlphaForm.value;
    window.location.href = targetUrl;
  }

  if (selectAlphaForm) {
    selectAlphaForm.addEventListener('change', openSelectedAlphaForm);
  }

  if (btnOpenSelectedForm) {
    btnOpenSelectedForm.addEventListener('click', (e) => {
      e.preventDefault();
      openSelectedAlphaForm();
    });
  }

  // "प्रपत्र सूची देखें →" Link
  const btnBrowseAllDepts = document.getElementById('btnBrowseAllDepts');
  if (btnBrowseAllDepts) {
    btnBrowseAllDepts.addEventListener('click', (e) => {
      e.preventDefault();
      const deptSec = document.getElementById('departmentsSection');
      if (deptSec) deptSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterForms);
  }

  const btnSearchSubmit = document.getElementById('btnSearchSubmit');
  if (btnSearchSubmit) {
    btnSearchSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      filterForms();
      const formsSec = document.getElementById('formsSection');
      if (formsSec) formsSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 1. Render custom departments and letters
  renderCustomDepartmentsInPortal();
  renderCustomLettersInPortal();

  // 2. Initialize Department Counts, Active Department & Filter
  updateDeptCounts();
  setActiveDepartment(activeDept, false);
  filterForms();

  // 3. Background Firestore Sync for real-time departments & letters
  if (typeof UserDetailsHub !== 'undefined') {
    if (typeof UserDetailsHub.fetchCustomDepartmentsFromFirestore === 'function') {
      UserDetailsHub.fetchCustomDepartmentsFromFirestore().then(() => {
        renderCustomDepartmentsInPortal();
        updateDeptCounts();
        filterForms();
      }).catch(() => {});
    }
    if (typeof UserDetailsHub.fetchCustomLettersFromFirestore === 'function') {
      UserDetailsHub.fetchCustomLettersFromFirestore().then(() => {
        renderCustomLettersInPortal();
        updateDeptCounts();
        filterForms();
      }).catch(() => {});
    }
  }

  // 4. Real-time Listeners for instant UI refresh
  window.addEventListener('portalDepartmentsChanged', () => {
    renderCustomDepartmentsInPortal();
    updateDeptCounts();
    filterForms();
  });
  window.addEventListener('portalCustomLettersChanged', () => {
    renderCustomLettersInPortal();
    updateDeptCounts();
    filterForms();
  });

  bookmarkButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-form-id');
      if (savedBookmarks.includes(id)) {
        savedBookmarks = savedBookmarks.filter(item => item !== id);
      } else {
        savedBookmarks.push(id);
      }
      localStorage.setItem('sarkariBookmarks', JSON.stringify(savedBookmarks));
      updateBookmarks();
    });
  });
  updateBookmarks();

  // =========================================================================
  // 6. Theme Switcher (Dark / Light Mode)
  // =========================================================================
  const themeToggle = document.getElementById('btnThemeToggle');
  const savedTheme = localStorage.getItem('sarkariTheme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('sarkariTheme', isDark ? 'dark' : 'light');
    });
  }

  // =========================================================================
  // 7. Quick Contact Form
  // =========================================================================
  const contactForm = document.getElementById('portalQuickContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('धन्यवाद! आपका संदेश प्राप्त हो गया है। Niraj Kumar, Section Supervisor, RO, Faridabad (ईमेल: smart.webpage.storage@gmail.com, मो.: 8700383426) शीघ्र आपसे संपर्क करेंगे।');
      contactForm.reset();
    });
  }
});
