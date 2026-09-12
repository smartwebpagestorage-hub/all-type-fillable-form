/**
 * Forms Portal - Common Dropdown & Navigation Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Dropdown Toggles (Works on both Home and Form pages)
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

  // Home Page Live Search Filtering
  const searchInput = document.getElementById('searchFormsInput');
  const formCards = document.querySelectorAll('.form-card');

  if (searchInput && formCards.length > 0) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      formCards.forEach(card => {
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const sub = (card.querySelector('.sub-hi')?.textContent || '').toLowerCase();
        const dept = (card.querySelector('.dept-badge')?.textContent || '').toLowerCase();

        if (title.includes(query) || sub.includes(query) || dept.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
});
