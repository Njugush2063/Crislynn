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
}, { threshold: 0.1 });
reveals.forEach(el => revealObserver.observe(el));

// ── ITINERARY TOGGLE ──
function toggleItinerary(btn) {
  const itinerary = btn.nextElementSibling;
  const isOpen = itinerary.classList.contains('open');
  // Close all open itineraries
  document.querySelectorAll('.exp-itinerary.open').forEach(el => {
    el.classList.remove('open');
    el.previousElementSibling.textContent = 'View Itinerary ›';
  });
  // Open clicked one if it was closed
  if (!isOpen) {
    itinerary.classList.add('open');
    btn.textContent = 'Close ×';
  }
}

// ── MOBILE NAV ──
const navBurger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');
if (navBurger) {
  navBurger.addEventListener('click', () => {
    const isOpen = navLinks.style.display === 'flex';
    navLinks.style.display = isOpen ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '80px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(245,240,232,0.98)';
    navLinks.style.padding = '24px 48px';
    navLinks.style.gap = '20px';
  });
}

// ── FORM: submit handler ──
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target;
  btn.textContent = "Sent! We'll be in touch ✓";
  btn.style.background = '#4A7A5A';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "Request Services ›";
    btn.style.background = '';
    btn.disabled = false;
  }, 4000);
}
