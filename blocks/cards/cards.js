import { createOptimizedPicture } from '../../scripts/aem.js';
import linkToImage from '../../scripts/scene7.js';
import { arrowIcon, inlineIcon, slashLink } from '../../scripts/product.js';

/**
 * Keypoints variant (product pages): icon | title + text per row. The authored icon
 * (e.g. :p-kp-speed:) is inlined so it takes the gold currentColor.
 */
function decorateKeypoints(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const cells = [...row.children];
    const iconEl = row.querySelector('.icon');
    const name = iconEl && [...iconEl.classList].find((c) => c.startsWith('icon-'));
    if (name) {
      const figure = document.createElement('figure');
      figure.append(inlineIcon(name.slice(5), 'cards-keypoint-icon'));
      li.append(figure);
      iconEl.closest('p')?.remove();
    }
    cells.forEach((cell) => li.append(...cell.children));
    ul.append(li);
  });
  block.replaceChildren(ul);
}

const iconName = (el) => {
  const icon = el && el.querySelector('.icon');
  return icon && [...icon.classList].find((c) => c.startsWith('icon-')).slice(5);
};

/**
 * Resources family (product pages): an optional h5 title row, card rows and an optional
 * trailing link row (rendered as the source's slash link). Variants:
 * - resources: icon | h4, text, link (dark outlined card; the whole card is the link)
 * - resources curated: same model, gold card with an outlined button
 * - resources blog / events: image | heading, link (image card with a gradient and an inline
 *   link; the first event card spans two columns)
 * - resources papers / actions: icon | h3 with link (list rows / bordered link tiles)
 */
function decorateResources(block) {
  const inner = document.createElement('div');
  inner.className = 'cards-resources-inner';
  const grid = document.createElement('ul');
  grid.className = 'cards-resources-grid';
  const linkRow = block.classList.contains('papers') || block.classList.contains('actions');
  let header = null;
  let footer = null;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const only = cells.length === 1 ? cells[0] : null;
    if (only && only.querySelector('h5') && !only.querySelector('a')) {
      header = document.createElement('div');
      header.className = 'cards-resources-title';
      header.append(...only.children);
      return;
    }
    if (only && !only.querySelector('h1, h2, h3, h4, h5, h6') && only.querySelector('a')) {
      footer = slashLink(only.querySelector('a'));
      return;
    }
    const copy = cells[cells.length - 1];
    const media = cells.length > 1 ? cells[0] : null;
    const link = (linkRow ? copy.querySelector('h3 a') : copy.querySelector('a:last-of-type'));
    if (!link) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.href;
    a.className = 'cards-resource';
    a.setAttribute('aria-label', (copy.querySelector('h2, h3, h4') || link).textContent.trim());
    const card = document.createElement(linkRow ? 'div' : 'article');
    card.className = 'cards-resource-card';
    const icon = iconName(media);
    if (linkRow) {
      const h3 = document.createElement('h3');
      h3.textContent = link.textContent.trim();
      const badge = document.createElement('div');
      badge.className = 'cards-resource-badge';
      if (icon) badge.append(inlineIcon(icon, 'cards-resource-badge-icon'));
      card.append(h3, badge);
    } else {
      const cta = document.createElement('span');
      cta.className = 'cards-resource-cta';
      cta.append(link.textContent.trim(), arrowIcon());
      link.closest('p')?.remove();
      // blog cards carry the source's per-breakpoint renditions; event cards one 556px image
      const renditions = block.classList.contains('blog') ? { 1024: 556, 1280: 442 } : null;
      const img = media && !icon ? linkToImage(media, { renditions }) : null;
      if (img) {
        const visual = document.createElement('div');
        visual.className = 'cards-resource-media';
        const shade = document.createElement('div');
        shade.className = 'cards-resource-shade';
        visual.append(img.closest('picture') || img, shade);
        const body = document.createElement('div');
        body.className = 'cards-resource-body';
        const head = document.createElement('div');
        head.className = 'cards-resource-head';
        const wrap = document.createElement('div');
        wrap.append(...copy.querySelectorAll('h2, h3, h4'));
        head.append(wrap);
        body.append(head, cta);
        card.append(visual, body);
      } else {
        const figure = document.createElement('figure');
        if (icon) figure.append(inlineIcon(icon, 'cards-resource-icon'));
        const body = document.createElement('div');
        body.className = 'cards-resource-body';
        body.append(...copy.children);
        card.append(figure, body, cta);
      }
    }
    a.append(card);
    li.append(a);
    grid.append(li);
  });
  if (header) inner.append(header);
  inner.append(grid);
  if (footer) inner.append(footer);
  block.replaceChildren(inner);
}

export default function decorate(block) {
  if (block.classList.contains('resources')) {
    decorateResources(block);
    return;
  }
  if (block.classList.contains('keypoints')) {
    decorateKeypoints(block);
    return;
  }
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
