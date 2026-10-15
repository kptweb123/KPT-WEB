const loader = document.getElementById('site-loader');
const loaderVideo = document.getElementById('loader-video');
const pageElements = [...document.body.children].filter(element => element !== loader).map(element => [element, element.inert]);
let loaderTimeout;

function finishLoader() {
  if (loader.classList.contains('is-hiding')) return;
  window.clearTimeout(loaderTimeout);
  loaderVideo.pause();
  loader.classList.add('is-hiding');
  loader.setAttribute('aria-hidden', 'true');
  loader.inert = true;
  document.documentElement.classList.remove('loader-active');
  pageElements.forEach(([element, wasInert]) => { element.inert = wasInert; });
  window.setTimeout(() => { loader.hidden = true; }, 550);
}

if (document.documentElement.classList.contains('intro-seen')) {
  loader.remove();
} else {
  try { sessionStorage.setItem('kpt-intro-seen-v3', '1'); } catch (error) {}
  try {
    const previousState = history.state && typeof history.state === 'object' ? history.state : {};
    history.replaceState({ ...previousState, kptIntroSeen: true }, '');
  } catch (error) {}

  document.documentElement.classList.add('loader-active');
  pageElements.forEach(([element]) => { element.inert = true; });
  loaderVideo.addEventListener('ended', finishLoader, { once: true });
  loaderVideo.addEventListener('error', finishLoader, { once: true });
  loaderTimeout = window.setTimeout(finishLoader, 8000);
  try {
    const playback = loaderVideo.play();
    if (playback?.catch) playback.catch(() => {
      if (loaderVideo.paused) {
        window.clearTimeout(loaderTimeout);
        loaderTimeout = window.setTimeout(finishLoader, 1500);
      }
    });
  } catch (error) {
    window.clearTimeout(loaderTimeout);
    loaderTimeout = window.setTimeout(finishLoader, 1500);
  }
}

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');
const siteHeader = document.querySelector('.site-header');

function updateHeaderOnScroll() {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
}
updateHeaderOnScroll();
window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
window.addEventListener('pageshow', updateHeaderOnScroll);

function closeMenu() {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

const filters = [...document.querySelectorAll('.filter')];
const galleryItems = [...document.querySelectorAll('.gallery-item:not(.gallery-video-item)')];
const filterableGalleryItems = [...document.querySelectorAll('.gallery [data-category]')];
filters.forEach(filter => filter.addEventListener('click', () => {
  const category = filter.dataset.filter;
  filters.forEach(button => {
    const selected = button === filter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  filterableGalleryItems.forEach(item => {
    item.hidden = category !== 'todos' && !item.dataset.category.split(' ').includes(category);
  });
}));

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxNote = document.getElementById('lightbox-note');
let lastGalleryTrigger = null;
galleryItems.forEach(item => item.addEventListener('click', () => {
  lastGalleryTrigger = item;
  lightboxImage.src = item.dataset.image;
  lightboxImage.alt = item.querySelector('img').alt;
  lightboxCaption.textContent = item.dataset.title;
  lightboxNote.textContent = item.dataset.note || 'IMAGEN ILUSTRATIVA';
  lightbox.showModal();
}));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('close', () => { lightboxImage.src = ''; lastGalleryTrigger?.focus(); });

const videoTriggers = [...document.querySelectorAll('.gallery-video-item')];
const videoLightbox = document.getElementById('video-lightbox');
const galleryVideo = videoLightbox.querySelector('video');
const galleryVideoSource = galleryVideo.querySelector('source');
let lastVideoTrigger = null;
videoTriggers.forEach(trigger => trigger.addEventListener('click', () => {
  lastVideoTrigger = trigger;
  galleryVideoSource.src = trigger.dataset.video;
  galleryVideo.poster = trigger.dataset.poster;
  videoLightbox.classList.toggle('is-portrait', trigger.dataset.orientation === 'portrait');
  videoLightbox.classList.toggle('is-portrait-wide', trigger.dataset.orientation === 'portrait-wide');
  document.getElementById('video-lightbox-caption').textContent = trigger.dataset.title;
  document.getElementById('video-lightbox-note').textContent = trigger.dataset.note;
  galleryVideo.load();
  videoLightbox.showModal();
  galleryVideo.play().catch(() => {});
}));
videoLightbox.querySelector('.lightbox-close').addEventListener('click', () => videoLightbox.close());
videoLightbox.addEventListener('click', event => { if (event.target === videoLightbox) videoLightbox.close(); });
videoLightbox.addEventListener('close', () => {
  galleryVideo.pause();
  galleryVideoSource.removeAttribute('src');
  galleryVideo.load();
  lastVideoTrigger?.focus();
});

const form = document.getElementById('contact-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const name = form.elements.namedItem('name').value.trim();
  const vehicle = form.elements.namedItem('vehicle').value.trim();
  const service = form.elements.namedItem('service').value;
  const message = form.elements.namedItem('message').value.trim();
  const lines = [
    'Hola KPT, quiero hacer una consulta.',
    `Nombre: ${name}`,
    `Vehículo: ${vehicle}`,
    `Servicio: ${service}`,
    `Mensaje: ${message || 'Sin mensaje adicional.'}`
  ];
  const url = `https://wa.me/5492613343032?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

document.getElementById('year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: .08, rootMargin: '0px 0px -30px 0px'});
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
}
