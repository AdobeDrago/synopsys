import { wrapButtonLabels } from '../../scripts/scene7.js';

/**
 * CTA: content | background image. The image (authored as a Scene7 link) becomes the
 * section background; the content sits in the left half of the 960px container.
 */
export default function decorate(block) {
  const [content, media] = block.firstElementChild ? [...block.firstElementChild.children] : [];
  const section = block.closest('.section');
  const a = media && media.querySelector('a');
  if (a && section) section.style.setProperty('--cta-background', `url("${a.href}")`);

  const col = document.createElement('div');
  col.className = 'cta-content';
  if (content) {
    col.append(...content.children);
    wrapButtonLabels(col);
  }
  block.replaceChildren(col);
}
