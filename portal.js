/**
 * Forms Portal - Common Dropdown & Navigation Interactions
 * High-Performance Search, Category Filtering, & Smooth UI Helpers
 * Curated by Niraj Kumar, PF Wale
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dropdown Toggles (Works on both Home and Form pages)
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = toggle.closest('.nav-dropdown');
      // Close other dropdowns
      document.querySelectorAll('.nav-dropdown').forEach(d => {
        if (d !== parent) d.classList.remove('open');
      });
      parent.classList.toggle('open');
    });
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    }
  });

  // Close dropdown on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    }
  });

  // 2. Home Page Search & Category Filter System
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

    // Show or hide clear button
    if (btnClearSearch) {
      btnClearSearch.style.display = query.length > 0 ? 'flex' : 'none';
    }

    formCards.forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const sub = (card.querySelector('.sub-hi')?.textContent || '').toLowerCase();
      const dept = (card.querySelector('.dept-badge')?.textContent || '').toLowerCase();
      const features = (card.querySelector('.form-features-list')?.textContent || '').toLowerCase();
      const cardCategory = card.getAttribute('data-category') || '';

      const matchesQuery = !query || title.includes(query) || sub.includes(query) || dept.includes(query) || features.includes(query);
      const matchesCategory = activeCategory === 'all' || 
        cardCategory === activeCategory || 
        (activeCategory === 'epfo' && (cardCategory === 'epfo' || cardCategory === 'epfo-cert'));

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update count display
    if (countDisplay) {
      countDisplay.innerHTML = `Showing <strong>${visibleCount}</strong> of ${totalCards} Forms`;
    }

    // Toggle Empty State
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.add('show');
        const emptyQueryText = document.getElementById('emptySearchQuery');
        if (emptyQueryText) {
          emptyQueryText.textContent = query ? `"${query}"` : 'selected category';
        }
      } else {
        emptyState.classList.remove('show');
      }
    }
  }

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', filterForms);

    // Press '/' to focus search input anywhere on the page
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // Clear Search Button
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        filterForms();
      }
    });
  }

  // Category Filter Pills
  if (filterPills.length > 0) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategory = pill.getAttribute('data-filter') || 'all';
        filterForms();
      });
    });
  }

  // Reset Button in Empty State
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

  // 3. Floating Back to Top Button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
