// ── NAVBAR: scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── HERO: background zoom on load ──
window.addEventListener('load', () => {
  document.getElementById('hero').classList.add('loaded');
});

// ── SCROLL REVEAL: IntersectionObserver ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => revealObserver.observe(el));

// ── FORM: submit handler ──
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target;
  btn.textContent = "Sent! We'll be in touch ✓";
  btn.style.background = '#4A7A5A';
  btn.disabled = true;
}
