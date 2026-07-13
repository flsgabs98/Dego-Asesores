// ---------- Nav scroll state + mobile toggle ----------
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

if (navToggle) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ---------- Parallax blobs in hero ----------
const parallaxEls = document.querySelectorAll('[data-parallax]');
window.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  parallaxEls.forEach(el => {
    const factor = parseFloat(el.dataset.parallax) * 200;
    el.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
  });
});

// ---------- Hero video mute toggle ----------
const heroVideo = document.getElementById('heroVideo');
const heroMuteBtn = document.getElementById('heroMuteBtn');
if (heroVideo && heroMuteBtn) {
  heroMuteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    heroVideo.muted = !heroVideo.muted;
    heroMuteBtn.innerHTML = heroVideo.muted
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19 9a5 5 0 0 1 0 6M22 6a9 9 0 0 1 0 12"/></svg> Activar sonido`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/></svg> Silenciar`;
  });
}

// ---------- Footer year ----------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
