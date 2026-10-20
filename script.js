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

const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('.project-card[data-category]');
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
