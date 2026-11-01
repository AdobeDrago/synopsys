import linkToImage from '../../scripts/scene7.js';
import { decorateProductButtons, inlineIcon } from '../../scripts/product.js';

const el = (tag, cls, ...kids) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.append(...kids);
  return e;
};

/**
 * Quotes variant (product pages): one full-width slide per row.
 * Cells: background image [+ customer logo] |
 * stat (bold), stat label, quote (h3), cite (italic), button.
 */
function decorateQuotes(block) {
  const track = el('div', 'testimonial-carousel-quotes-track');
  [...block.children].forEach((row) => {
    const [media, body] = row.children;
    const links = media ? [...media.querySelectorAll('a')] : [];
    const bg = el('div', 'testimonial-carousel-quote-bg');
    const bgImg = links[0] ? linkToImage(links[0].closest('p') || media) : null;
    if (bgImg) bg.append(bgImg);
    const logoImg = media ? linkToImage(media) : null;

    const parts = body ? [...body.children] : [];
    const statEl = parts.find((x) => x.querySelector('strong') && !x.querySelector('a'));
    const labelEl = statEl && statEl.nextElementSibling && statEl.nextElementSibling.tagName === 'P' ? statEl.nextElementSibling : null;
    const quoteEl = parts.find((x) => /^H[1-6]$/.test(x.tagName));
    const citeEl = parts.find((x) => x.querySelector('em') && !x.querySelector('a'));
    const actions = el('div', 'testimonial-carousel-quote-actions', ...parts.filter((x) => x.querySelector('a.button')).flatMap((x) => [...x.querySelectorAll('a.button')]));
    decorateProductButtons(actions);

    const stat = el('figure', 'testimonial-carousel-quote-stat', el('p', 'testimonial-carousel-quote-value', statEl ? statEl.textContent.trim() : ''), el('div', 'testimonial-carousel-quote-label', labelEl ? labelEl.textContent.trim() : ''));
    const top = el('div', 'testimonial-carousel-quote-top', stat);
    if (logoImg) top.append(el('div', 'testimonial-carousel-quote-logo', el('figure', '', logoImg)));
    const quote = el('blockquote', '');
    if (quoteEl) {
      quoteEl.prepend(el('span', 'testimonial-carousel-quote-mark', '\u201c'));
      quote.append(quoteEl);
    }
    if (citeEl) quote.append(el('footer', '', el('cite', '', citeEl.textContent.trim())));
    const main = el('div', 'testimonial-carousel-quote-main', el('div', 'testimonial-carousel-quote-body', quote, actions));
    const frame = el('div', 'testimonial-carousel-quote-frame', el('div', 'testimonial-carousel-quote-inner', top, main));
    track.append(el('article', 'testimonial-carousel-quote', bg, frame));
  });

  const slides = [...track.children];
  const dots = el('div', 'testimonial-carousel-quotes-dots');
  dots.setAttribute('aria-label', 'Gallery pagination');
  const go = (i) => track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  slides.forEach((s, i) => {
    const dot = el('button', '');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => go(i));
    dots.append(dot);
  });
  const nav = (dir, label) => {
    const b = el('button', `testimonial-carousel-quotes-${dir}`, inlineIcon(`p-${dir}`, 'testimonial-carousel-quotes-icon'));
    b.type = 'button';
    b.setAttribute('aria-label', label);
    return b;
  };
  const prev = nav('prev', 'Previous slide');
  const next = nav('next', 'Next slide');
  const current = () => Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
  prev.addEventListener('click', () => go(Math.max(current() - 1, 0)));
  next.addEventListener('click', () => go(Math.min(current() + 1, slides.length - 1)));
  const update = () => {
    const i = current();
    [...dots.children].forEach((d, n) => d.classList.toggle('active', n === i));
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    slides.forEach((s, n) => { s.inert = n !== i; });
  };
  track.addEventListener('scroll', update, { passive: true });
  block.replaceChildren(el('div', 'testimonial-carousel-quotes', track, prev, dots, next));
  update();
}

// source carousel: 3 cards per view, 3 per step, no loop, 500ms ease
const PER_VIEW = 3;

function buildCard(row) {
  const [media, title, quote, cta] = row.children;
  const slide = document.createElement('div');
  slide.className = 'testimonial-carousel-slide';
  const card = document.createElement('div');
  card.className = 'testimonial-carousel-card';

  const img = media ? linkToImage(media) : null;
  if (img) {
    img.className = 'testimonial-carousel-image';
    const mediaBox = document.createElement('div');
    mediaBox.className = 'testimonial-carousel-media';
    mediaBox.append(img);
    card.append(mediaBox);
  }

  const content = document.createElement('div');
  content.className = 'testimonial-carousel-content';
  const h = title && title.querySelector('h3, h2, p');
  if (h) {
    const h3 = document.createElement('h3');
    h3.className = 'testimonial-carousel-title';
    h3.append(...h.childNodes);
    content.append(h3);
  }
  const q = quote && quote.querySelector('p');
  if (q) {
    q.className = 'testimonial-carousel-quote';
    const desc = document.createElement('div');
    desc.className = 'testimonial-carousel-description';
    desc.append(q);
    content.append(desc);
  }
  const a = cta && cta.querySelector('a');
  if (a) {
    a.className = 'testimonial-carousel-link';
    const wrap = document.createElement('div');
    wrap.className = 'testimonial-carousel-action';
    wrap.append(a);
    content.append(wrap);
  }
  card.append(content);
  slide.append(card);
  return slide;
}

export default function decorate(block) {
  if (block.classList.contains('quotes')) {
    decorateQuotes(block);
    return;
  }
  const viewport = document.createElement('div');
  viewport.className = 'testimonial-carousel-viewport';
  const track = document.createElement('div');
  track.className = 'testimonial-carousel-track';
  [...block.children].forEach((row) => track.append(buildCard(row)));
  viewport.append(track);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'testimonial-carousel-prev';
  prev.textContent = 'Previous';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'testimonial-carousel-next';
  next.textContent = 'Next';

  let page = 0;
  const pages = Math.max(1, Math.ceil(track.children.length / PER_VIEW));
  const update = () => {
    track.style.transform = `translateX(${-page * viewport.clientWidth}px)`;
    prev.disabled = page === 0;
    next.disabled = page >= pages - 1;
  };
  prev.addEventListener('click', () => { if (page > 0) { page -= 1; update(); } });
  next.addEventListener('click', () => { if (page < pages - 1) { page += 1; update(); } });

  block.replaceChildren(prev, viewport, next);
  new ResizeObserver(() => { if (viewport.clientWidth) update(); }).observe(viewport);
  update();
}
