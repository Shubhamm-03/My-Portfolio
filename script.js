const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasHover = window.matchMedia('(hover: hover)').matches;

/* ============================================
   SCROLL REVEAL
   ============================================ */
const revealEls = document.querySelectorAll('.fade-up');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

/* ============================================
   MOBILE NAV
   ============================================ */
const navToggle = document.getElementById('navToggle');
const topbar = document.querySelector('.topbar');
navToggle.addEventListener('click', () => {
  const isOpen = topbar.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
document.querySelectorAll('.topnav a').forEach((link) => {
  link.addEventListener('click', () => {
    topbar.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ============================================
   3D TILT EFFECT (photo card + project cards)
   ============================================ */
function applyTilt(el, maxTilt = 10) {
  if (!hasHover || prefersReducedMotion) return;

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = x * maxTilt * 2;
    const rotateX = -y * maxTilt * 2;
    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    const glare = el.querySelector('.tilt-glare');
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.18), transparent 60%)`;
    }
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

document.querySelectorAll('.tilt-card, .tilt-card-3d').forEach((el) => applyTilt(el, 8));

/* ============================================
   AMBIENT PARTICLE FIELD
   ============================================ */
const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let width, height;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initParticles() {
  const count = Math.min(60, Math.floor((width * height) / 22000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.4 + 0.4,
    vy: Math.random() * 0.15 + 0.03,
    vx: (Math.random() - 0.5) * 0.08,
    hue: Math.random() > 0.5 ? '201,162,74' : '141,124,255',
    alpha: Math.random() * 0.35 + 0.08,
  }));
}
initParticles();
window.addEventListener('resize', initParticles);

function renderFrame(animate) {
  ctx.clearRect(0, 0, width, height);
  particles.forEach((p) => {
    if (animate) {
      p.y -= p.vy;
      p.x += p.vx;
      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue}, ${p.alpha})`;
    ctx.fill();
  });
  if (animate) requestAnimationFrame(() => renderFrame(true));
}

// Static single render for reduced-motion users, continuous drift otherwise
renderFrame(!prefersReducedMotion);
