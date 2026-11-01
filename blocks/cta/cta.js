import linkToImage, { wrapButtonLabels } from '../../scripts/scene7.js';
import {
  decorateProductButtons, vidyardBackground, vidyardId, openVideo, playIcon,
} from '../../scripts/product.js';

const VARIANTS = ['compact', 'band', 'video', 'featured'];

/**
 * Featured media: image | heading + text over it, with a play button when a Vidyard link
 * is authored in the media cell (click-to-load, in a modal).
 */
function decorateFeatured(block) {
  const [media, content] = block.firstElementChild ? [...block.firstElementChild.children] : [];
  const box = document.createElement('div');
  box.className = 'cta-box';
  const video = media && [...media.querySelectorAll('a')].find((a) => vidyardId(a.href));
  if (video) video.closest('p')?.remove();
  const img = media ? linkToImage(media) : null;
  if (img) box.append(img);

  const overlay = document.createElement('div');
  overlay.className = 'cta-overlay';
  const header = document.createElement('div');
  header.className = 'cta-heading';
  if (content) header.append(...content.children);
  overlay.append(header);
  if (video) {
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'cta-play';
    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = 'Play video';
    play.append(label, playIcon());
    const id = vidyardId(video.href);
    play.addEventListener('click', () => openVideo(id, video.textContent.trim()));
    overlay.append(play);
  }
  box.append(overlay);
  block.replaceChildren(box);
}

/**
 * Product variants (Fluent pages):
 * - compact: 152px black bar, heading left, button right
 * - band: heading in the left 5/12, text + button in the right 7/12
 * - video: Vidyard background (first cell), centered eyebrow, heading and button
 */
function decorateVariant(block) {
  if (block.classList.contains('featured')) {
    decorateFeatured(block);
    return;
  }
  const cells = block.firstElementChild ? [...block.firstElementChild.children] : [];
  const parts = [];
  if (block.classList.contains('video') && cells.length > 1) {
    const bg = vidyardBackground(cells.shift());
    if (bg) parts.push(bg);
  }

  const heading = document.createElement('div');
  heading.className = 'cta-heading';
  const text = document.createElement('div');
  text.className = 'cta-text';
  const actions = document.createElement('div');
  actions.className = 'cta-actions';
  cells.forEach((cell) => [...cell.children].forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) heading.append(el);
    else if (el.querySelector('a.button')) actions.append(...el.querySelectorAll('a.button'));
    else text.append(el);
  }));
  decorateProductButtons(actions);

  const body = document.createElement('div');
  body.className = 'cta-body';
  if (text.children.length) body.append(text);
  if (actions.children.length) body.append(actions);
  const row = document.createElement('div');
  row.className = 'cta-row';
  row.append(heading, body);
  const frame = document.createElement('div');
  frame.className = 'cta-frame';
  frame.append(row);
  const inner = document.createElement('div');
  inner.className = 'cta-inner';
  inner.append(frame);
  parts.push(inner);
  block.replaceChildren(...parts);
}

/**
 * CTA: content | background image. The image (authored as a Scene7 link) becomes the
 * section background; the content sits in the left half of the 960px container.
 */
export default function decorate(block) {
  if (VARIANTS.some((v) => block.classList.contains(v))) {
    decorateVariant(block);
    return;
  }
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
