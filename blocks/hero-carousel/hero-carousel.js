import linkToImage, { wrapButtonLabels } from '../../scripts/scene7.js';
import { decorateProductButtons, vidyardBackground } from '../../scripts/product.js';

// timings measured on the source carousel: 10s autoplay, 500ms linear crossfade
const AUTOPLAY_MS = 10000;

function buildTitle(h) {
  // source markup: <h2><span class="h1">lead <span class="gold">highlight</span></span></h2>
  const title = document.createElement('span');
  title.className = 'hero-carousel-title';
  h.querySelectorAll('strong').forEach((s) => {
    const gold = document.createElement('span');
    gold.className = 'hero-carousel-highlight';
    gold.append(...s.childNodes);
    s.replaceWith(gold);
  });
  title.append(...h.childNodes);
  h.append(title);
}

/**
 * Product variant: a single hero (no tabs, no autoplay). Cells: [media] | content.
 * Media is an image link or a Vidyard link; a media hero centers its copy over it.
 */
function decorateProduct(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];
  const content = cells[cells.length - 1];
  const media = cells.length > 1 ? cells[0] : null;

  const parts = [];
  if (media) {
    let bg = vidyardBackground(media);
    if (bg) {
      bg.querySelector('img').loading = 'eager';
      bg.querySelector('img').fetchPriority = 'high';
    } else {
      const img = linkToImage(media, { eager: true });
      if (img) {
        bg = document.createElement('div');
        bg.className = 'product-video-bg';
        bg.append(img);
      }
    }
    if (bg) {
      block.classList.add('hero-carousel-has-media');
      parts.push(bg);
    }
  }

  const heading = document.createElement('div');
  heading.className = 'hero-carousel-heading';
  const body = document.createElement('div');
  body.className = 'hero-carousel-body';
  const text = document.createElement('div');
  text.className = 'hero-carousel-text';
  const actions = document.createElement('div');
  actions.className = 'hero-carousel-actions';
  if (content) {
    [...content.children].forEach((el) => {
      if (/^H[1-6]$/.test(el.tagName)) heading.append(el);
      else if (el.querySelector('a.button')) actions.append(...el.querySelectorAll('a.button'));
      else text.append(el);
    });
  }
  // h1 above an h2 is the eyebrow line
  if (heading.querySelector('h1 + h2')) block.classList.add('hero-carousel-eyebrow');
  decorateProductButtons(actions);
  if (text.children.length) body.append(text);
  if (actions.children.length) body.append(actions);

  const article = document.createElement('div');
  article.className = 'hero-carousel-article';
  article.append(heading, body);
  const frame = document.createElement('div');
  frame.className = 'hero-carousel-frame';
  frame.append(article);
  const inner = document.createElement('div');
  inner.className = 'hero-carousel-inner';
  inner.append(frame);
  parts.push(inner);
  block.replaceChildren(...parts);
}

export default function decorate(block) {
  if (block.classList.contains('product')) {
    decorateProduct(block);
    return;
  }
  const slides = document.createElement('div');
  slides.className = 'hero-carousel-slides';
  const tabs = document.createElement('ul');
  tabs.className = 'hero-carousel-tabs';

  [...block.children].forEach((row, i) => {
    const [media, content, label] = row.children;
    const slide = document.createElement('div');
    slide.className = 'hero-carousel-slide';
    slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');

    const img = media ? linkToImage(media, { eager: i === 0 }) : null;
    if (img) {
      const wrap = document.createElement('div');
      wrap.className = 'hero-carousel-media';
      wrap.append(img);
      slide.append(wrap);
    }

    if (content) {
      content.className = 'hero-carousel-content';
      const h = content.querySelector('h1, h2');
      if (h) buildTitle(h);
      wrapButtonLabels(content);
      const texts = [...content.querySelectorAll(':scope > p:not(.button-wrapper)')];
      if (texts.length) {
        const desc = document.createElement('div');
        desc.className = 'hero-carousel-description';
        texts[0].before(desc);
        desc.append(...texts);
      }
      slide.append(content);
    }
    slides.append(slide);

    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label ? label.textContent.trim() : '';
    li.append(button);
    tabs.append(li);
  });

  let current = 0;
  let timer;
  const show = (n) => {
    current = (n + slides.children.length) % slides.children.length;
    [...slides.children].forEach((s, i) => {
      s.classList.toggle('active', i === current);
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      // hidden slides must not keep focusable links reachable
      s.inert = i !== current;
    });
    [...tabs.children].forEach((t, i) => t.classList.toggle('active', i === current));
  };
  const stop = () => clearInterval(timer);
  const start = () => {
    stop();
    timer = setInterval(() => show(current + 1), AUTOPLAY_MS);
  };

  [...tabs.children].forEach((li, i) => li.querySelector('button').addEventListener('click', () => {
    show(i);
    start();
  }));
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);

  block.replaceChildren(slides, tabs);
  show(0);
  start();

  // test hook: lets the visual-diff harness freeze carousels on their first slide
  const prevFreeze = window.freezeCarousels;
  window.freezeCarousels = () => {
    if (prevFreeze) prevFreeze();
    stop();
    show(0);
  };
}
