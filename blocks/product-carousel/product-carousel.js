import linkToImage, { wrapButtonLabels } from '../../scripts/scene7.js';

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

export default function decorate(block) {
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
