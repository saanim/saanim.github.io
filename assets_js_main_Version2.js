// Main JS: theme toggle, accents on hover, custom cursor
(() => {
  // Utilities
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Theme handling: data-theme on :root
  const root = document.documentElement;
  const themeToggle = $('#theme-toggle');

  function applyTheme(name) {
    if (name === 'dark') root.setAttribute('data-theme', 'dark');
    else if (name === 'light') root.removeAttribute('data-theme');
    else {
      // remove to use OS preference
      root.removeAttribute('data-theme');
    }
  }

  const saved = localStorage.getItem('site-theme');
  if (saved) applyTheme(saved);

  themeToggle?.addEventListener('click', () => {
    // toggle between light/dark
    const isDark = root.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    applyTheme(next === 'dark' ? 'dark' : null);
    localStorage.setItem('site-theme', next === 'dark' ? 'dark' : 'light');
  });

  // Accent color behavior:
  // Elements with data-accent="#HEX" will set --accent on hover.
  const accentElems = $$('[data-accent]');

  function setAccent(color){
    root.style.setProperty('--accent', color);
  }

  accentElems.forEach(el => {
    const color = el.getAttribute('data-accent');
    el.addEventListener('mouseenter', () => setAccent(color || randomAccent()));
    el.addEventListener('mouseleave', () => {
      // optional: restore to default (from CSS variable) by removing inline var
      root.style.removeProperty('--accent');
    });
  });

  // Create a few fallback random accents if needed
  function randomAccent(){
    const pool = ['#ff6b6b','#6f8cff','#8effc1','#ffb86b','#d78cff'];
    return pool[Math.floor(Math.random()*pool.length)];
  }

  // Set current year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Custom cursor: dot + ring */
  const isHoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isHoverCapable) {
    document.body.classList.add('hide-default-cursor');
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    // starting positions
    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    let ringX = mouseX, ringY = mouseY;

    const lerp = (a,b,n) => (1-n)*a + n*b;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // position dot immediately for sharp feel
      if (dot) dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    // ring lags behind for a trailing effect
    function animateRing(){
      ringX = lerp(ringX, mouseX, 0.18);
      ringY = lerp(ringY, mouseY, 0.18);
      if (ring) ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    // Hover interactions: add a 'cursor-hover' class to body when over interactive elements
    const interactiveSelectors = 'a, .btn, button, .card, [data-accent]';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        // Optionally change accent color if the element has data-accent
        const col = el.getAttribute && el.getAttribute('data-accent');
        if (col) setAccent(col);
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
        // restore default accent if leaving
        root.style.removeProperty('--accent');
      });
    });

    // Hide cursor on window blur (optional polish)
    window.addEventListener('blur', () => {
      if (dot) dot.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
    });
    window.addEventListener('focus', () => {
      if (dot) dot.style.opacity = '';
      if (ring) ring.style.opacity = '';
    });
  } // end cursor

  // Small UX: make entire .card clickable to go to its first link (if present)
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      // ignore if user clicked a real link
      if (e.target.closest('a')) return;
      const a = card.querySelector('a');
      if (a) window.location = a.href;
    });
  });

})();