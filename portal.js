/**
 * सरकारी फॉर्म सेवा (Sarkari Form Seva) - Core Scripts & Video Player Hub
 * Curated by Niraj Kumar, PF Wale
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. YouTube Video Guides Dictionary (Niraj Kumar can customize links here)
  // =========================================================================
  const formVideoTutorials = {
    'epfo-death-claim': {
      title: 'EPFO Composite Claim Form (Death Case) कैसे भरें? Complete Guide',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' // Replace with Niraj Kumar's video link
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
      // Add autoplay parameter
      const embedUrl = tutorial.url.includes('?') ? `${tutorial.url}&autoplay=1` : `${tutorial.url}?autoplay=1`;
      videoIframe.src = embedUrl;
    }

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    if (videoIframe) videoIframe.src = ''; // Stop video playback immediately
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
  });

  // =========================================================================
  // 3. Popular Searches Chips & Department Filtering
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
        // Scroll to forms
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
  // 4. Bookmarks System (LocalStorage)
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
  // 5. Theme Switcher (Dark / Light Mode)
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
  // 6. Quick Contact Form
  // =========================================================================
  const contactForm = document.getElementById('portalQuickContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('धन्यवाद! आपका संदेश प्राप्त हो गया है। Niraj Kumar (PF Wale) शीघ्र आपसे संपर्क करेंगे।');
      contactForm.reset();
    });
  }
});
