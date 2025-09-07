// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (toggle) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}
 
// Active nav link
const path = location.pathname.replace(/\/+$/, '');
document.querySelectorAll('.site-nav a').forEach(a => {
  const href = a.getAttribute('href');
  if (!href) return;
  const isSame = href === '#' ? false : path.endsWith(href.replace('./','').replace(/^\//,''));
  if (isSame) a.classList.add('active');
});
 
// Footer year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
 
// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '40px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
 
// Tilt hover
document.querySelectorAll('.tilt').forEach(card => {
  let raf = null;
  const state = { rx: 0, ry: 0 };
  function onMove(e){
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const ry = (x - 0.5) * 8;
    const rx = (0.5 - y) * 8;
    state.rx = rx; state.ry = ry;
    if (!raf) raf = requestAnimationFrame(apply);
  }
  function onLeave(){ state.rx = 0; state.ry = 0; if (!raf) raf = requestAnimationFrame(apply); }
  function apply(){ raf = null; card.style.transform = `perspective(900px) rotateX(${state.rx}deg) rotateY(${state.ry}deg) translateY(-2px)`; }
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseleave', onLeave);
});
 
// Smooth in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
   const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    }
  });
});
