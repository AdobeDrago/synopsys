import linkToImage from '../../scripts/scene7.js';

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
