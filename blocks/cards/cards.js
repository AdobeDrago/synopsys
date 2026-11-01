import { createOptimizedPicture } from '../../scripts/aem.js';
import { inlineIcon } from '../../scripts/product.js';

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

export default function decorate(block) {
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
