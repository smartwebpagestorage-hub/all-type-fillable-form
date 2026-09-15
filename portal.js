/**
 * Forms Portal - Core Interactions & Dynamic Features
 * Inspired by sarkaridocs.in layout & experience
 * Curated by Niraj Kumar, PF Wale
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Dark Mode / Light Mode Toggle System with LocalStorage
  // =========================================================================
  const themeToggleBtn = document.getElementById('btnThemeToggle');
  const savedTheme = localStorage.getItem('portalTheme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('portalTheme', isDark ? 'dark' : 'light');
      showToast(isDark ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
    });
  }

  // =========================================================================
  // 2. Dropdown Navigation Menu
  // =========================================================================
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = toggle.closest('.nav-dropdown');
      document.querySelectorAll('.nav-dropdown').forEach(d => {
        if (d !== parent) d.classList.remove('open');
      });
      parent.classList.toggle('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    }
  });

  // =========================================================================
  // 3. Bookmarking System (Save Favorite Forms to LocalStorage)
  // =========================================================================
  const bookmarkStars = document.querySelectorAll('.btn-bookmark-star');
  const bookmarkCountDisplay = document.getElementById('navBookmarkCount');
  let savedBookmarks = JSON.parse(localStorage.getItem('portalBookmarkedForms') || '[]');

  function updateBookmarkUI() {
    bookmarkStars.forEach(star => {
      const formId = star.getAttribute('data-form-id');
      if (savedBookmarks.includes(formId)) {
        star.classList.add('bookmarked');
        star.setAttribute('title', 'Remove from Bookmarks');
        star.innerHTML = '★';
      } else {
        star.classList.remove('bookmarked');
        star.setAttribute('title', 'Bookmark this Form');
        star.innerHTML = '☆';
      }
    });

    if (bookmarkCountDisplay) {
      bookmarkCountDisplay.textContent = savedBookmarks.length;
    }
    const bookmarkPillCount = document.getElementById('filterBookmarkCount');
    if (bookmarkPillCount) {
      bookmarkPillCount.textContent = savedBookmarks.length;
    }
  }

  bookmarkStars.forEach(star => {
    star.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const formId = star.getAttribute('data-form-id');
      const formTitle = star.closest('.form-card')?.querySelector('h3')?.textContent || 'Form';

      if (savedBookmarks.includes(formId)) {
        savedBookmarks = savedBookmarks.filter(id => id !== formId);
        showToast(`Removed "${formTitle.substring(0, 25)}..." from Bookmarks`);
      } else {
        savedBookmarks.push(formId);
        showToast(`⭐ Bookmarked "${formTitle.substring(0, 25)}..."`);
      }

      localStorage.setItem('portalBookmarkedForms', JSON.stringify(savedBookmarks));
      updateBookmarkUI();

      // If currently on Bookmarks filter, re-run filtering
      if (activeCategory === 'bookmarks') {
        filterForms();
      }
    });
  });

  updateBookmarkUI();

  // =========================================================================
  // 4. Search & Category Filter System
  // =========================================================================
  const searchInput = document.getElementById('searchFormsInput');
  const btnClearSearch = document.getElementById('btnSearchClear');
  const formCards = document.querySelectorAll('.form-card');
  const filterPills = document.querySelectorAll('.filter-pill');
  const countDisplay = document.getElementById('liveFormsCount');
  const emptyState = document.getElementById('emptySearchState');
  const btnResetEmpty = document.getElementById('btnResetSearch');
  const totalCards = formCards.length;

  let activeCategory = 'all';

  function filterForms() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    if (btnClearSearch) {
      btnClearSearch.style.display = query.length > 0 ? 'inline-flex' : 'none';
    }

    formCards.forEach(card => {
      const formId = card.getAttribute('data-form-id') || '';
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const sub = (card.querySelector('.sub-hi')?.textContent || '').toLowerCase();
      const dept = (card.querySelector('.dept-badge')?.textContent || '').toLowerCase();
      const features = (card.querySelector('.form-features-list')?.textContent || '').toLowerCase();
      const cardCategory = card.getAttribute('data-category') || '';

      const matchesQuery = !query || title.includes(query) || sub.includes(query) || dept.includes(query) || features.includes(query);
      
      let matchesCategory = false;
      if (activeCategory === 'all') {
        matchesCategory = true;
      } else if (activeCategory === 'epfo') {
        matchesCategory = (cardCategory === 'epfo' || cardCategory === 'epfo-cert');
      } else if (activeCategory === 'central-govt') {
        matchesCategory = (cardCategory === 'central-govt');
      } else if (activeCategory === 'general-office') {
        matchesCategory = (cardCategory === 'general-office');
      } else if (activeCategory === 'bookmarks') {
        matchesCategory = savedBookmarks.includes(formId);
      }

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countDisplay) {
      countDisplay.innerHTML = `Showing <strong>${visibleCount}</strong> of ${totalCards} Forms`;
    }

    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.add('show');
        const emptyQueryText = document.getElementById('emptySearchQuery');
        if (emptyQueryText) {
          if (activeCategory === 'bookmarks' && savedBookmarks.length === 0) {
            emptyQueryText.textContent = 'No bookmarked forms. Click the ☆ icon on any card to save it.';
          } else {
            emptyQueryText.textContent = query ? `"${query}"` : 'selected category';
          }
        }
      } else {
        emptyState.classList.remove('show');
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterForms);

    // Global '/' hotkey to jump to search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
        window.scrollTo({ top: searchInput.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
      }
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        filterForms();
      }
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-filter') || 'all';
      filterForms();
    });
  });

  if (btnResetEmpty) {
    btnResetEmpty.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      activeCategory = 'all';
      filterPills.forEach(p => {
        if (p.getAttribute('data-filter') === 'all') p.classList.add('active');
        else p.classList.remove('active');
      });
      filterForms();
    });
  }

  // =========================================================================
  // 5. Interactive Contact Us Form Handling
  // =========================================================================
  const contactForm = document.getElementById('portalContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const name = nameInput ? nameInput.value.trim() : 'User';

      showToast(`Thank you, ${name}! Your query has been received. Niraj Kumar (PF Wale) will respond soon.`);
      contactForm.reset();
    });
  }

  // =========================================================================
  // 6. Toast Notification Helper
  // =========================================================================
  let toastTimeout;
  function showToast(message) {
    let toast = document.getElementById('portalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'portalToast';
      toast.className = 'portal-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
});
