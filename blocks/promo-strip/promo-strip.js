import linkToImage from '../../scripts/scene7.js';
import { arrowIcon } from '../../scripts/product.js';

// sticky product sub-nav: the fixed copy shows once the bar's slot reaches the 57px utility bar
const STICKY_TOP = 57;
const trimSlash = (path) => path.replace(/\/$/, '');

/**
 * Sub-nav variant: product title | page links | CTA. Builds the in-flow bar, which overlaps
 * the hero by 48px, and a fixed compact copy shown while the page is scrolled past it.
 */
function decorateSubnav(block) {
  const row = block.firstElementChild;
  const [titleCell, linksCell, ctaCell] = row ? [...row.children] : [];

  const title = document.createElement('p');
  title.className = 'promo-strip-title';
  title.textContent = titleCell ? titleCell.textContent.trim() : '';

  const links = document.createElement('span');
  links.className = 'promo-strip-links';
  const here = trimSlash(window.location.pathname);
  (linksCell ? [...linksCell.querySelectorAll('a')] : []).forEach((a) => {
    const link = document.createElement('a');
    link.href = a.href;
    link.textContent = a.textContent.trim();
    if (trimSlash(new URL(a.href).pathname) === here) link.setAttribute('aria-current', 'page');
    links.append(link);
  });

  const cta = document.createElement('span');
  cta.className = 'promo-strip-cta';
  const ctaLink = ctaCell && ctaCell.querySelector('a');
  if (ctaLink) {
    const a = document.createElement('a');
    a.href = ctaLink.href;
    a.append(ctaLink.textContent.trim(), arrowIcon());
    cta.append(a);
  }

  const rowEl = document.createElement('div');
  rowEl.className = 'promo-strip-row';
  rowEl.append(title, links, cta);
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', title.textContent);
  nav.append(rowEl);
  const inner = document.createElement('div');
  inner.className = 'promo-strip-inner';
  inner.append(nav);
  const bar = document.createElement('div');
  bar.className = 'promo-strip-bar';
  bar.append(inner);

  const sticky = document.createElement('div');
  sticky.className = 'promo-strip-sticky';
  sticky.append(bar.cloneNode(true));

  block.replaceChildren(bar, sticky);

  const section = block.closest('.section') || block;
  let ticking = false;
  const update = () => {
    ticking = false;
    const stuck = section.getBoundingClientRect().top <= STICKY_TOP;
    block.classList.toggle('is-sticky', stuck);
    bar.inert = stuck;
    sticky.inert = !stuck;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/**
 * Promo strip: logo | message | link, on the Synopsys gradient bar.
 * Markup mirrors the source: logo box, then a nav box holding the message and a one-item link list.
 */
export default function decorate(block) {
  if (block.classList.contains('subnav')) {
    decorateSubnav(block);
    return;
  }

  const row = block.firstElementChild;
  const [logoCell, textCell, linkCell] = row ? [...row.children] : [];

  const logo = document.createElement('div');
  logo.className = 'promo-strip-logo';
  if (logoCell) {
    const img = linkToImage(logoCell);
    if (img) logo.append(img);
  }

  const nav = document.createElement('div');
  nav.className = 'promo-strip-nav';
  const p = textCell && textCell.querySelector('p');
  if (p) nav.append(p);

  const a = linkCell && linkCell.querySelector('a');
  if (a) {
    a.classList.remove('button');
    const label = document.createElement('span');
    label.className = 'promo-strip-label';
    label.textContent = a.textContent.trim();
    // whitespace between label and ::after arrow, as in the source markup
    a.replaceChildren(label, ' ');
    const li = document.createElement('li');
    li.append(a);
    const ul = document.createElement('ul');
    ul.append(li);
    nav.append(ul);
  }

  block.replaceChildren(logo, nav);
}
