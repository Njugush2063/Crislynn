// ─────────────────────────────────────────────
// CONFIGURATION — replace with your own values
// ─────────────────────────────────────────────
const SUPABASE_URL     = 'https://hcalcyyzwtwbupkxpwkn.supabase.co';       // e.g. https://xyzxyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjYWxjeXl6d3R3YnVwa3hwd2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NzM2NjksImV4cCI6MjA4OTE0OTY2OX0.-VkzGML-CQIuWhH49iybrxwxnX1ClCeOSim_mjfZ4gM'; // your anon public key

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let galleryImages = [];
let lightboxIndex = 0;

// ─────────────────────────────────────────────
// INIT — fetch all data and render the page
// ─────────────────────────────────────────────
async function init() {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('id');

  if (!slug) { showError(); return; }

  try {
    // First fetch: get the experience and its UUID
    const expRes = await db.from('experiences').select('*').eq('slug', slug).single();
    if (expRes.error || !expRes.data) { showError(); return; }

    const exp = expRes.data;

    // Parallel fetch: itinerary + gallery + related
    const [itiRes, galRes, relRes] = await Promise.all([
      db.from('itinerary_items')
        .select('*')
        .eq('experience_id', exp.id)
        .order('step_order'),

      db.from('gallery_images')
        .select('*')
        .eq('experience_id', exp.id)
        .order('sort_order'),

      exp.related_ids && exp.related_ids.length > 0
        ? db.from('experiences').select('*').in('id', exp.related_ids).limit(3)
        : db.from('experiences').select('*').eq('category', exp.category).neq('slug', slug).limit(3)
    ]);

    const related = relRes.error ? [] : relRes.data;
    renderPage(exp, itiRes.data || [], galRes.data || [], related);

  } catch (err) {
    console.error('Destinations init error:', err);
    showError();
  }
}

// ─────────────────────────────────────────────
// RENDER — populate the DOM with fetched data
// ─────────────────────────────────────────────
function renderPage(exp, itinerary, gallery, related) {
  document.title = `${exp.title} — Crislynn Ventures`;

  // Hero
  const bg = document.getElementById('heroBg');
  bg.style.backgroundImage = `url('${exp.hero_image}')`;
  setTimeout(() => bg.classList.add('loaded'), 100);
  document.getElementById('heroCategoryText').textContent = exp.category;
  document.getElementById('heroDurationTag').textContent  = exp.duration_tag;
  document.getElementById('heroTitle').textContent        = exp.title;
  document.getElementById('heroTagline').textContent      = exp.tagline || '';

  // Overview text
  const descEl = document.getElementById('destDescription');
  (exp.description || '').split('\n\n').forEach(paragraph => {
    if (!paragraph.trim()) return;
    const p = document.createElement('p');
    p.textContent = paragraph.trim();
    descEl.appendChild(p);
  });

  // Meta card
  document.getElementById('metaDuration').textContent = exp.duration_tag;
  document.getElementById('metaCategory').textContent  = exp.category;

  // Sections
  renderItinerary(itinerary);
  renderGallery(gallery);
  renderMap(exp);
  renderRelated(related, exp.slug);

  // WhatsApp CTA
  const msg = encodeURIComponent(
    `Hi Crislynn Ventures! I'm interested in the *${exp.title}* experience. Could you share more details?`
  );
  document.getElementById('ctaWhatsApp').href = `https://wa.me/254794464898?text=${msg}`;

  // Reveal page
  document.getElementById('dest-content').classList.add('visible');
  document.getElementById('cta-band').style.display = 'block';
  document.getElementById('loading').classList.add('hidden');

  // Kick off scroll observers
  setupRevealObserver();
  setupItineraryObserver();
}

// ─────────────────────────────────────────────
// ITINERARY
// ─────────────────────────────────────────────
function renderItinerary(items) {
  const container = document.getElementById('itineraryList');

  // Group steps by day_label (null → '__single__')
  const days = {};
  items.forEach(item => {
    const key = item.day_label || '__single__';
    if (!days[key]) days[key] = [];
    days[key].push(item);
  });

  let globalStep = 0;
  Object.entries(days).forEach(([dayKey, steps]) => {
    const group = document.createElement('div');
    group.className = 'day-group';

    if (dayKey !== '__single__') {
      const label = document.createElement('span');
      label.className = 'day-label';
      label.textContent = dayKey;
      group.appendChild(label);
    }

    steps.forEach(step => {
      globalStep++;
      const el = document.createElement('div');
      el.className = 'itinerary-step';
      el.innerHTML = `
        <div class="step-dot">${globalStep}</div>
        <div class="step-text">${step.description}</div>
      `;
      group.appendChild(el);
    });

    container.appendChild(group);
  });
}

// ─────────────────────────────────────────────
// GALLERY
// ─────────────────────────────────────────────
function renderGallery(images) {
  if (!images.length) {
    document.getElementById('gallery-section').style.display = 'none';
    return;
  }

  galleryImages = images;
  const grid = document.getElementById('galleryGrid');

  images.slice(0, 4).forEach((img, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${img.url}" alt="${img.alt_text || ''}" loading="lazy">
      <div class="gallery-item-overlay">
        <div class="gallery-zoom">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
        </div>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(i));
    grid.appendChild(item);
  });
}

// ─────────────────────────────────────────────
// MAP
// ─────────────────────────────────────────────
function renderMap(exp) {
  if (!exp.map_embed) {
    document.getElementById('map-section').style.display = 'none';
    return;
  }
  document.getElementById('mapFrame').src = exp.map_embed;
  document.getElementById('mapLabel').textContent = exp.title;
}

// ─────────────────────────────────────────────
// RELATED EXPERIENCES
// ─────────────────────────────────────────────
function renderRelated(items, currentSlug) {
  if (!items.length) {
    document.getElementById('related-section').style.display = 'none';
    return;
  }

  const grid = document.getElementById('relatedGrid');
  items.forEach((exp, i) => {
    const card = document.createElement('a');
    card.href      = `destinations.html?id=${exp.slug}`;
    card.className = `related-card reveal-up delay-${i + 1}`;
    card.innerHTML = `
      <div class="related-card-img" style="background-image:url('${exp.hero_image}')"></div>
      <div class="related-card-body">
        <div class="related-card-tag">${exp.duration_tag}</div>
        <h3 class="related-card-title">${exp.title}</h3>
        <p class="related-card-desc">${exp.tagline || ''}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─────────────────────────────────────────────
// LIGHTBOX
// ─────────────────────────────────────────────
function openLightbox(index) {
  lightboxIndex = index;
  updateLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function shiftLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + galleryImages.length) % galleryImages.length;
  updateLightbox();
}

function updateLightbox() {
  const img = galleryImages[lightboxIndex];
  const el  = document.getElementById('lightboxImg');
  el.style.opacity = '0';
  el.src = img.url;
  el.alt = img.alt_text || '';
  el.onload = () => {
    el.style.transition = 'opacity 0.3s';
    el.style.opacity    = '1';
  };
  document.getElementById('lightboxCounter').textContent =
    `${lightboxIndex + 1} / ${galleryImages.length}`;
}

// Lightbox button events
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => shiftLightbox(-1));
document.getElementById('lightboxNext').addEventListener('click', () => shiftLightbox(1));

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  shiftLightbox(-1);
  if (e.key === 'ArrowRight') shiftLightbox(1);
  if (e.key === 'Escape')     closeLightbox();
});

// ─────────────────────────────────────────────
// SCROLL REVEAL OBSERVERS
// ─────────────────────────────────────────────
function setupRevealObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}

function setupItineraryObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.itinerary-step').forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────────
// ERROR STATE
// ─────────────────────────────────────────────
function showError() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('error-state').classList.add('visible');
}

// ─────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────
init();
