const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.querySelector('span').textContent = isOpen ? '×' : '☰';
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('span').textContent = '☰';
  }));
}

// Each project group (Professional / Personal) has its own independent filter:
// buttons and cards are scoped to the group they belong to.
document.querySelectorAll('.project-group').forEach(group => {
  const filters = group.querySelectorAll('[data-filter]');
  const cards = group.querySelectorAll('.project-card[data-category]');

  // Hide filters that have no projects in this group (the "all" filter always stays).
  filters.forEach(button => {
    const filter = button.dataset.filter;
    if (filter === 'all') return;
    const hasProjects = Array.from(cards).some(card => card.dataset.category.split(' ').includes(filter));
    button.hidden = !hasProjects;
  });

  filters.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filters.forEach(item => item.classList.toggle('active', item === button));
      cards.forEach(card => {
        const categories = card.dataset.category.split(' ');
        card.hidden = filter !== 'all' && !categories.includes(filter);
      });
    });
  });
});

// Subtle reveal animation; content remains visible when reduced motion is requested.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.overview, .projects, .skills, .experience, .contact').forEach(section => {
    section.classList.add('reveal');
    observer.observe(section);
  });
}

// A missing CV should not fail silently during review.
document.querySelectorAll('[data-cv]').forEach(link => {
  link.addEventListener('click', event => {
    if (!link.getAttribute('href')) event.preventDefault();
  });
});

// ---------- Case Study Lightbox & Zoom Logic ----------
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.zoomable'));
  var box = document.getElementById('lightbox');
  if (!items.length || !box) return;
  var stage = document.getElementById('lbStage');
  var img = document.getElementById('lbImg');
  var count = document.getElementById('lbCount');
  var caption = document.getElementById('lbCaption');
  var btnClose = document.getElementById('lbClose');
  var btnPrev = document.getElementById('lbPrev');
  var btnNext = document.getElementById('lbNext');
  var current = 0, isOpen = false, zoomed = false, lastFocus = null, pushed = false;

  function fitWidth() {
    var nw = img.naturalWidth || 800, nh = img.naturalHeight || 600;
    var w = stage.clientWidth - 28, h = stage.clientHeight - 12;
    return Math.max(120, Math.min(w, h * nw / nh, nw * 1.6));
  }
  function layout() {
    var base = fitWidth();
    img.style.width = (zoomed ? Math.round(base * 2) : Math.round(base)) + 'px';
    img.style.height = 'auto';
    stage.classList.toggle('zoomed', zoomed);
  }
  function show(i) {
    current = (i + items.length) % items.length;
    var src = items[current].querySelector('img');
    zoomed = false;
    stage.scrollLeft = 0; stage.scrollTop = 0;
    img.onload = layout;
    img.src = src.currentSrc || src.src;
    img.alt = src.alt || '';
    count.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
    caption.innerHTML = (items[current].dataset.caption || '') + '<small>TAP IMAGE TO ZOOM · SWIPE OR USE ARROWS</small>';
    layout();
    [current + 1, current - 1].forEach(function (n) {
      var s = items[(n + items.length) % items.length].querySelector('img');
      if (s) { var p = new Image(); p.src = s.currentSrc || s.src; }
    });
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    isOpen = true;
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    try { history.pushState({ lb: 1 }, ''); pushed = true; } catch (e) { pushed = false; }
    btnClose.focus();
  }
  function hide() {
    if (!isOpen) return;
    isOpen = false;
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function closeUI() {
    if (!isOpen) return;
    if (pushed && history.state && history.state.lb) { pushed = false; history.back(); }
    else hide();
  }
  window.addEventListener('popstate', function () { pushed = false; hide(); });

  items.forEach(function (el, i) { el.addEventListener('click', function () { open(i); }); });
  btnClose.addEventListener('click', closeUI);
  btnPrev.addEventListener('click', function () { show(current - 1); });
  btnNext.addEventListener('click', function () { show(current + 1); });

  stage.addEventListener('click', function (e) {
    if (e.target !== img) { closeUI(); return; }
    var r = img.getBoundingClientRect();
    var fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    zoomed = !zoomed;
    layout();
    var r2 = img.getBoundingClientRect();
    stage.scrollLeft += (r2.left + fx * r2.width) - e.clientX;
    stage.scrollTop += (r2.top + fy * r2.height) - e.clientY;
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') closeUI();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      var f = [btnClose, btnPrev, btnNext], idx = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  var sx = 0, sy = 0;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (zoomed) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', function () { if (isOpen) layout(); });
})();