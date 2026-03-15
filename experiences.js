// ─────────────────────────────────────────────
// experiences.js
// Wires each .exp-card to destinations.html?id=SLUG
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.exp-card[data-slug]').forEach(card => {
    const slug = card.getAttribute('data-slug');
    if (!slug) return;

    card.style.cursor = 'pointer';

    // Replace the toggle button with a link
    const toggle = card.querySelector('.exp-toggle');
    if (toggle) {
      const link = document.createElement('a');
      link.href      = `destinations.html?id=${slug}`;
      link.className = 'exp-toggle';
      link.style.textDecoration = 'none';
      link.textContent = 'Explore Experience ›';
      toggle.replaceWith(link);
    }

    // Clicking the image also navigates
    const imgEl = card.querySelector('.exp-card-img');
    if (imgEl) {
      imgEl.style.cursor = 'pointer';
      imgEl.addEventListener('click', () => {
        window.location.href = `destinations.html?id=${slug}`;
      });
    }
  });
});
