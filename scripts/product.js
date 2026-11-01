/* Shared helpers for the product template (Fluent pages). */

const SVG_NS = 'http://www.w3.org/2000/svg';
const ARROW = 'm553.85-253.85-42.16-43.38L664.46-450H180v-60h484.46L511.69-662.77l42.16-43.38L780-480 553.85-253.85Z';

/**
 * The 20px arrow the source puts after button labels (inline, so it inherits currentColor).
 * @returns {SVGElement}
 */
export function arrowIcon() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 -960 960 960');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('product-arrow');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', ARROW);
  svg.append(path);
  return svg;
}

const svgCache = {};

/**
 * Inline SVG from /icons, so it can take currentColor like the source's inline icons.
 * Returns a placeholder span that is swapped for the SVG once fetched.
 * @param {string} name icon file name without extension
 * @param {string} cls class for the svg
 * @returns {HTMLElement}
 */
export function inlineIcon(name, cls) {
  const span = document.createElement('span');
  span.className = cls;
  svgCache[name] = svgCache[name] || fetch(`${window.hlx.codeBasePath}/icons/${name}.svg`).then((r) => r.text());
  svgCache[name].then((txt) => {
    const svg = new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement;
    svg.setAttribute('class', cls);
    svg.setAttribute('aria-hidden', 'true');
    span.replaceWith(svg);
  });
  return span;
}

/**
 * Product buttons: trimmed label followed by the arrow, as in the source markup.
 * An authored icon (e.g. `:p-download:`) replaces the arrow; modal links get none.
 * @param {Element} root
 */
export function decorateProductButtons(root) {
  root.querySelectorAll('a.button').forEach((a) => {
    if (a.querySelector('.product-arrow')) return;
    const icon = a.querySelector('.icon');
    const name = icon && [...icon.classList].find((c) => c.startsWith('icon-'));
    if (icon) icon.remove();
    // links that open a modal carry no arrow on the source
    if (!name && new URL(a.href, window.location).pathname.includes('/modals/')) {
      a.replaceChildren(a.textContent.trim());
      return;
    }
    a.replaceChildren(a.textContent.trim(), name ? inlineIcon(name.slice(5), 'product-arrow') : arrowIcon());
  });
}

/**
 * Vidyard video id from an authored play.vidyard.com / share.vidyard.com link.
 * @param {string} href
 * @returns {string|null}
 */
export function vidyardId(href) {
  const m = /vidyard\.com\/(?:watch\/)?([A-Za-z0-9_-]{10,})/.exec(href || '');
  return m ? m[1] : null;
}

const backgroundSrc = (id) => `https://play.vidyard.com/${id}/type/background?disable_popouts=1&autoplay=1&type=inline&muted=1&loop=1&hidden_controls=1&disable_ctas=1&viral_sharing=0&embed_button=0`;

/**
 * Muted, looping Vidyard background (as on the source): the poster shows first and the
 * player is added once the page has loaded. Returns null if the cell has no Vidyard link.
 * @param {Element} cell authored cell holding the Vidyard link
 * @returns {HTMLElement|null} the background layer
 */
export function vidyardBackground(cell) {
  const link = cell && cell.querySelector('a');
  const id = link && vidyardId(link.href);
  if (!id) return null;
  const bg = document.createElement('div');
  bg.className = 'product-video-bg';
  const poster = document.createElement('img');
  poster.src = `https://play.vidyard.com/${id}.jpg`;
  poster.alt = '';
  poster.loading = 'lazy';
  bg.append(poster);
  const start = () => {
    const iframe = document.createElement('iframe');
    iframe.src = backgroundSrc(id);
    iframe.title = link.textContent.trim() || 'Background video';
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    bg.append(iframe);
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
  return bg;
}

const CLOSE = 'M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z';
const PLAY = 'M16 0C7.168 0 0 7.168 0 16C0 24.832 7.168 32 16 32C24.832 32 32 24.832 32 16C32 7.168 24.832 0 16 0ZM12.8 23.2V8.8L22.4 16L12.8 23.2Z';

function glyph(viewBox, d, cls) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add(cls);
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  svg.append(path);
  return svg;
}

/** The 32-unit filled play circle used on video thumbnails. */
export const playIcon = () => glyph('0 0 32 32', PLAY, 'product-play');

/**
 * Click-to-load player: opens a modal dialog and only then loads the Vidyard iframe;
 * the iframe is removed again on close.
 * @param {string} id Vidyard video id
 * @param {string} title accessible title for the player
 */
export function openVideo(id, title) {
  const dialog = document.createElement('dialog');
  dialog.className = 'product-video-modal';
  const panel = document.createElement('div');
  panel.className = 'product-video-panel';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'product-video-close';
  close.setAttribute('aria-label', 'Close video');
  close.append(glyph('0 -960 960 960', CLOSE, 'product-video-close-icon'));
  const frame = document.createElement('div');
  frame.className = 'product-video-frame';
  const iframe = document.createElement('iframe');
  iframe.src = `https://play.vidyard.com/${id}?disable_popouts=1&autoplay=1&type=inline`;
  iframe.title = title || 'Video';
  iframe.allow = 'autoplay; fullscreen; picture-in-picture';
  iframe.allowFullscreen = true;
  frame.append(iframe);
  panel.append(close, frame);
  dialog.append(panel);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}

/**
 * Groups an eyebrow paragraph with the heading that follows it, as the source's header
 * does (8px apart), so section intros keep one gap between heading and lead text.
 * @param {Element} main
 */
export function groupEyebrows(main) {
  main.querySelectorAll('.default-content-wrapper > p + :is(h1, h2, h3)').forEach((h) => {
    const p = h.previousElementSibling;
    if (p.querySelector('a, img, picture')) return;
    const group = document.createElement('div');
    group.className = 'product-heading';
    p.classList.add('product-eyebrow');
    p.before(group);
    group.append(p, h);
  });
}
