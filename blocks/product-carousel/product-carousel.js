import linkToImage, { wrapButtonLabels } from '../../scripts/scene7.js';
import { inlineIcon } from '../../scripts/product.js';

// expand chevron, inlined from /icons (the source's own 18x11 SVG)
let chevron;
function chevronSvg() {
  chevron = chevron || fetch(`${window.hlx.codeBasePath}/icons/chevron-down.svg`).then((r) => r.text());
  return chevron;
}

function buildTile(row, index) {
  const [media, body, list, cta, style] = row.children;
  const tile = document.createElement('div');
  tile.className = 'product-carousel-tile';

  const mediaBox = document.createElement('div');
  mediaBox.className = 'product-carousel-media';
  const img = media ? linkToImage(media, { eager: false }) : null;
  if (img) mediaBox.append(img);
  tile.append(mediaBox);

  const content = document.createElement('div');
  content.className = 'product-carousel-content';
  const [title, subtitle, ...rest] = body ? [...body.children] : [];
  if (title) {
    title.className = 'product-carousel-title';
    content.append(title);
  }
  if (subtitle && subtitle.tagName === 'P') {
    subtitle.className = 'product-carousel-subtitle';
    content.append(subtitle);
  }

  const desc = document.createElement('div');
  desc.className = 'product-carousel-description';
  const white = style && style.textContent.trim().toLowerCase() === 'white';
  rest.filter((p) => p.tagName === 'P').forEach((p) => {
    // authored "white" rows are white spans inside the paragraph in the source;
    // other rows are #f7f7f7 paragraphs
    if (white) {
      const span = document.createElement('span');
      span.className = 'product-carousel-white';
      span.append(...p.childNodes);
      p.append(span);
    }
    desc.append(p);
  });

  const panelId = `product-carousel-panel-${index}`;
  const panel = document.createElement('div');
  panel.className = 'product-carousel-panel';
  panel.id = panelId;
  const ul = list && list.querySelector('ul');
  if (ul) panel.append(ul);
  if (cta) {
    wrapButtonLabels(cta);
    panel.append(...cta.children);
  }
  desc.append(panel);
  content.append(desc);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'product-carousel-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', panelId);
  toggle.setAttribute('aria-label', `Show ${title ? title.textContent.trim() : ''} products`);
  chevronSvg().then((svg) => { toggle.innerHTML = `<span class="product-carousel-chevron">${svg}</span>`; });
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    tile.classList.toggle('open', open);
  });
  content.append(toggle);
  tile.append(content);
  return tile;
}

function decorateHeading(block) {
  // source wraps the section heading text in a span; decorative rules are pseudo-elements on the h2
  const section = block.closest('.section');
  const h2 = section && section.querySelector('.default-content-wrapper h2');
  if (!h2 || h2.querySelector('span')) return;
  const span = document.createElement('span');
  // the source heading ends in &nbsp; (the EDS pipeline trims it);
  // it widens the heading by one space
  span.append(...h2.childNodes, ' ');
  h2.append(span);
}

// logo marquee timing measured on the source: row n scrolls -50% in DURATIONS[n] seconds
const DURATIONS = [40, 30];

/**
 * Logos variant (product pages): each row of image links becomes an endlessly scrolling
 * track. Items are duplicated once (hidden from assistive tech) so -50% loops seamlessly.
 */
function decorateLogos(block) {
  const rows = document.createElement('div');
  rows.className = 'product-carousel-rows';
  [...block.children].forEach((row, r) => {
    const track = document.createElement('div');
    track.className = 'product-carousel-marquee';
    track.style.animationDuration = `${DURATIONS[r % DURATIONS.length]}s`;
    const items = [...row.children].map((cell) => {
      const item = document.createElement('div');
      item.className = 'product-carousel-logo';
      const img = linkToImage(cell);
      if (img) item.append(img);
      return item;
    }).filter((item) => item.children.length);
    items.forEach((item) => track.append(item));
    items.forEach((item) => {
      const copy = item.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.append(copy);
    });
    rows.append(track);
  });
  const fadeStart = document.createElement('div');
  fadeStart.className = 'product-carousel-fade product-carousel-fade-start';
  const fadeEnd = document.createElement('div');
  fadeEnd.className = 'product-carousel-fade product-carousel-fade-end';
  block.replaceChildren(fadeStart, fadeEnd, rows);
}

/**
 * Gallery variant (product pages): image | title, text, link per row. Cards scroll
 * sideways with prev/next buttons; the text and the "Explore" label reveal on hover.
 */
function decorateGallery(block) {
  const track = document.createElement('div');
  track.className = 'product-carousel-gallery-track';
  [...block.children].forEach((row) => {
    const [media, body] = row.children;
    const link = body && body.querySelector('a');
    const card = document.createElement(link ? 'a' : 'div');
    card.className = 'product-carousel-card';
    if (link) {
      card.href = link.href;
      link.closest('p')?.remove();
    }
    const heading = body && body.querySelector('h2, h3, h4');
    if (heading) card.setAttribute('aria-label', heading.textContent.trim());

    const mediaBox = document.createElement('div');
    mediaBox.className = 'product-carousel-card-media';
    const img = media ? linkToImage(media) : null;
    if (img) mediaBox.append(img);
    const content = document.createElement('div');
    content.className = 'product-carousel-card-body';
    const header = document.createElement('div');
    header.className = 'product-carousel-card-header';
    if (heading) header.append(heading);
    const text = document.createElement('div');
    text.className = 'product-carousel-card-text';
    const inner = document.createElement('div');
    if (body) inner.append(...body.children);
    text.append(inner);
    header.append(text);
    const pill = document.createElement('span');
    pill.className = 'product-carousel-card-pill';
    const label = document.createElement('span');
    label.className = 'product-carousel-card-label';
    label.textContent = link ? link.textContent.trim() : '';
    pill.append(label, inlineIcon('p-explore', 'product-carousel-card-icon'));
    content.append(header, pill);
    const article = document.createElement('article');
    article.append(mediaBox, content);
    card.append(article);
    track.append(card);
  });

  const viewport = document.createElement('div');
  viewport.className = 'product-carousel-gallery-viewport';
  const fadeStart = document.createElement('div');
  fadeStart.className = 'product-carousel-gallery-fade product-carousel-gallery-fade-start';
  const fadeEnd = document.createElement('div');
  fadeEnd.className = 'product-carousel-gallery-fade product-carousel-gallery-fade-end';
  viewport.append(track, fadeStart, fadeEnd);

  const controls = document.createElement('div');
  controls.className = 'product-carousel-gallery-controls';
  const button = (dir, labelText) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', labelText);
    b.append(inlineIcon(`p-${dir}`, 'product-carousel-gallery-icon'));
    b.addEventListener('click', () => {
      const card = track.querySelector('.product-carousel-card');
      const step = card ? card.getBoundingClientRect().width + 24 : track.clientWidth;
      track.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
    });
    return b;
  };
  const prev = button('prev', 'Previous');
  const next = button('next', 'Next');
  controls.append(prev, next);

  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 1;
    prev.disabled = track.scrollLeft <= 0;
    next.disabled = track.scrollLeft >= max;
    fadeStart.classList.toggle('visible', track.scrollLeft > 0);
    fadeEnd.classList.toggle('visible', track.scrollLeft < max);
    controls.hidden = max <= 0;
  };
  track.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(track);
  block.replaceChildren(viewport, controls);
  update();
}

export default function decorate(block) {
  if (block.classList.contains('gallery')) {
    decorateGallery(block);
    return;
  }
  if (block.classList.contains('logos')) {
    decorateLogos(block);
    return;
  }
  decorateHeading(block);
  const viewport = document.createElement('div');
  viewport.className = 'product-carousel-viewport';
  const track = document.createElement('div');
  track.className = 'product-carousel-track';
  [...block.children].forEach((row, i) => track.append(buildTile(row, i)));
  viewport.append(track);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'product-carousel-prev';
  prev.textContent = 'Previous';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'product-carousel-next';
  next.textContent = 'Next';
  const nav = document.createElement('div');
  nav.className = 'product-carousel-nav';
  nav.append(prev, next);

  // the source sizes slides as ceil(viewport width / slidesToShow), with 2.3 slides on desktop
  const SLIDES_TO_SHOW = 2.3;
  const size = () => {
    const w = Math.ceil(viewport.clientWidth / SLIDES_TO_SHOW);
    [...track.children].forEach((t) => { t.style.width = `${w}px`; });
    return w;
  };

  let index = 0;
  const count = track.children.length;
  const update = () => {
    const step = size();
    track.style.transform = `translateX(${-index * step}px)`;
    prev.disabled = index === 0;
    next.disabled = index >= count - 1;
  };
  prev.addEventListener('click', () => { if (index > 0) { index -= 1; update(); } });
  next.addEventListener('click', () => { if (index < count - 1) { index += 1; update(); } });

  block.replaceChildren(viewport, nav);
  // sections are hidden while loading (width 0):
  // size slides whenever the viewport gets or changes width
  new ResizeObserver(() => { if (viewport.clientWidth) update(); }).observe(viewport);
  update();
}
