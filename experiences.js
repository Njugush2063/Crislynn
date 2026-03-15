// ─────────────────────────────────────────────
// experiences.js
// Drop this file next to index.html
// It makes every .exp-card clickable → destinations.html?id=SLUG
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.exp-card[data-slug]').forEach(card => {
    const slug = card.getAttribute('data-slug');
    if (!slug) return;

    // Make the whole card feel clickable
    card.style.cursor = 'pointer';

    // Replace the "View Itinerary" button with a "Explore" link
    const toggle = card.querySelector('.exp-toggle');
    if (toggle) {
      const link = document.createElement('a');
      link.href = `destinations.html?id=${slug}`;
      link.className = 'exp-toggle';
      link.style.textDecoration = 'none';
      link.textContent = 'Explore Experience ›';
      toggle.replaceWith(link);
    }

    // Also allow clicking anywhere on the card image area
    const imgEl = card.querySelector('.exp-card-img');
    if (imgEl) {
      imgEl.style.cursor = 'pointer';
      imgEl.addEventListener('click', () => {
        window.location.href = `destinations.html?id=${slug}`;
      });
    }
  });
});
