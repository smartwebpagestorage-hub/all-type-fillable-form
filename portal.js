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
    'epfo-form-31-advance': {
      title: 'EPFO Form 31: PF Advance Claim (अग्रिम पीएफ निकासी) कैसे भरें? Complete Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' // Custom link for Form 31
    },
    'epfo-death-claim': {
      title: 'EPFO Composite Claim Form (Death Case) कैसे भरें? Complete Guide',
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
    }
  };

  // =========================================================================
  // 2. Video Player Modal System
  // =========================================================================
  const videoModal = document.getElementById('videoModal');
  const videoIframe = document.getElementById('videoModalIframe');
  const videoModalTitle = document.getElementById('videoModalTitle');
  const btnCloseVideoModal = document.getElementById('btnCloseVideoModal');

  function openVideoModal(formId, customTitle, customUrl) {
    if (!videoModal) return;
    const tutorial = formVideoTutorials[formId] || {
      title: customTitle || 'Online Form Filling Video Guide',
      url: customUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    };

    if (videoModalTitle) videoModalTitle.textContent = tutorial.title;
    if (videoIframe) {
      const embedUrl = tutorial.url.includes('?') ? `${tutorial.url}&autoplay=1` : `${tutorial.url}?autoplay=1`;
      videoIframe.src = embedUrl;
    }

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    if (videoIframe) videoIframe.src = '';
    document.body.style.overflow = '';
  }

  // Click handler for all Video Guide buttons & thumbnails
  document.querySelectorAll('.btn-video-guide, .video-thumb-wrap, .btn-watch-tutorial').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const formId = btn.getAttribute('data-form-id');
      const customTitle = btn.getAttribute('data-video-title');
      const customUrl = btn.getAttribute('data-video-url');
      openVideoModal(formId, customTitle, customUrl);
    });
  });

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
  const formSignUp = document.getElementById('formSignUp');
  const formSignIn = document.getElementById('formSignIn');
  const signUpError = document.getElementById('signUpError');
  const signInError = document.getElementById('signInError');
  const navbarUserContainer = document.getElementById('navbarUserContainer');

  let pendingFormDestination = null;

  function openAuthModal(targetUrl = null, defaultTab = 'signup') {
    if (!authModal) return;
    pendingFormDestination = targetUrl;
    
    // Reset errors
    if (signUpError) { signUpError.style.display = 'none'; signUpError.textContent = ''; }
    if (signInError) { signInError.style.display = 'none'; signInError.textContent = ''; }

    // Switch to requested tab
    if (defaultTab === 'signin') {
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
    if (tab === 'signin') {
      if (tabBtnSignIn) tabBtnSignIn.classList.add('active');
      if (tabBtnSignUp) tabBtnSignUp.classList.remove('active');
      if (formSignInPane) formSignInPane.style.display = 'block';
      if (formSignUpPane) formSignUpPane.style.display = 'none';
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
      navbarUserContainer.innerHTML = `
        <span class="user-navbar-profile" title="लॉगिन: ${activeUser.email} (${activeUser.mobile})">
          👤 ${firstName}
          <button type="button" class="btn-navbar-logout" id="btnNavbarLogout" title="सत्र समाप्त करें / Logout">लॉगआउट</button>
        </span>
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
        btnTrigger.addEventListener('click', () => openAuthModal(null, 'signin'));
      }
    }
  }

  // Handle Registration Submit
  if (formSignUp) {
    formSignUp.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signUpName')?.value;
      const email = document.getElementById('signUpEmail')?.value;
      const mobile = document.getElementById('signUpMobile')?.value;
      const password = document.getElementById('signUpPassword')?.value;

      if (typeof UserDetailsHub === 'undefined') {
        alert('User details system error. Please reload page.');
        return;
      }

      const res = UserDetailsHub.registerUser({ name, email, mobile, password });
      if (!res.success) {
        if (signUpError) {
          signUpError.textContent = res.message;
          signUpError.style.display = 'block';
        } else {
          alert(res.message);
        }
        return;
      }

      // Success
      alert(`स्वागत है, ${name}! आपका पंजीकरण सफलतापूर्वक हो गया है। अब आप सभी सरकारी फॉर्म भर सकते हैं।`);
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
        } else {
          alert(res.message);
        }
        return;
      }

      // Success
      alert(`स्वागत है, ${res.user.name}! आपका लॉगिन सफल रहा।`);
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

  // Intercept all form access buttons with the Auth Gatekeeper
  function attachAuthGatekeeper() {
    const formAccessLinks = document.querySelectorAll(
      '.btn-fill-online, .btn-direct-print, a.form-title-link, a[href$=".html"]:not([href*="index.html"]):not([href*="admin-users.html"])'
    );

    formAccessLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const activeUser = (typeof UserDetailsHub !== 'undefined') ? UserDetailsHub.getActiveUser() : null;
        
        // If user is not logged in, intercept and require auth pop-up
        if (!activeUser) {
          e.preventDefault();
          const targetHref = link.getAttribute('href');
          openAuthModal(targetHref, 'signup');
        }
        // If user is already logged in, let the browser proceed naturally to the form
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
    }
  });

  // =========================================================================
  // 4. Popular Searches Chips & Department Filtering
  // =========================================================================
  const searchInput = document.getElementById('searchFormsInput');
  const formCards = document.querySelectorAll('.form-card');
  const countDisplay = document.getElementById('liveFormsCount');
  let activeCategory = 'all';

  function filterForms() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let count = 0;

    formCards.forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.hindi-desc')?.textContent || '').toLowerCase();
      const dept = (card.querySelector('.badge-tag')?.textContent || '').toLowerCase();
      const category = card.getAttribute('data-category') || '';
      const formId = card.getAttribute('data-form-id') || '';

      const matchesQuery = !query || title.includes(query) || desc.includes(query) || dept.includes(query) || formId.includes(query);
      
      let matchesCategory = false;
      if (activeCategory === 'all') {
        matchesCategory = true;
      } else if (activeCategory === 'epfo') {
        matchesCategory = (category === 'epfo' || category === 'epfo-cert');
      } else {
        matchesCategory = (category === activeCategory);
      }

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
        count++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countDisplay) {
      countDisplay.textContent = `Showing ${count} of ${formCards.length} Forms`;
    }
  }

  // Popular search chip clicks
  document.querySelectorAll('.search-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const term = chip.getAttribute('data-search') || chip.textContent.trim();
      if (searchInput) {
        searchInput.value = term;
        activeCategory = 'all';
        filterForms();
        const formsSec = document.getElementById('formsSection');
        if (formsSec) formsSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Department card clicks
  document.querySelectorAll('.dept-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.dept-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeCategory = card.getAttribute('data-category') || 'all';

      if (searchInput) searchInput.value = '';
      filterForms();

      const formsSec = document.getElementById('formsSection');
      if (formsSec) formsSec.scrollIntoView({ behavior: 'smooth' });
    });
  });

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

  // =========================================================================
  // 5. Bookmarks System (LocalStorage)
  // =========================================================================
  let savedBookmarks = JSON.parse(localStorage.getItem('sarkariBookmarks') || '[]');
  const bookmarkButtons = document.querySelectorAll('.btn-star-bookmark');

  function updateBookmarks() {
    bookmarkButtons.forEach(btn => {
      const id = btn.getAttribute('data-form-id');
      if (savedBookmarks.includes(id)) {
        btn.classList.add('bookmarked');
        btn.innerHTML = '★';
      } else {
        btn.classList.remove('bookmarked');
        btn.innerHTML = '☆';
      }
    });
  }

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
