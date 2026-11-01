/**
 * Images are authored in DA as links to their Dynamic Media URL (Scene7 images.ansys.com, or
 * AEM Assets delivery) so they are not copied into the media bus.
 * Converts such a link into an <img>.
 * @param {Element} container element holding the authored link
 * @param {object} [options]
 * @param {boolean} [options.eager] load eagerly (LCP image)
 * @param {Object<number, number>} [options.renditions] AEM Assets delivery only: rendition width
 *   per max viewport width, e.g. { 1024: 522, 1280: 650 } (the source component's breakpoints)
 * @returns {HTMLImageElement|null} the image, or null if no image link was found
 */
export default function linkToImage(container, { eager = false, renditions = null } = {}) {
  // Scene7 (homepage), AEM Assets delivery (product pages), or a self-hosted file
  const a = container.querySelector('a[href*="images.ansys.com"], a[href*="adobeaemcloud.com/adobe/assets"], a[href$=".svg"], a[href$=".png"]');
  if (!a) return null;
  const img = document.createElement('img');
  img.src = a.href;
  img.alt = a.textContent.trim();
  img.loading = eager ? 'eager' : 'lazy';
  // AEM Assets delivery URLs name the rendition (width + smartcrop ratio): reserve its box
  try {
    const q = new URL(a.href).searchParams;
    const crop = /^(\d+)x(\d+)$/.exec(q.get('smartcrop') || '');
    const w = parseInt(q.get('width'), 10);
    if (crop && w) {
      img.width = w;
      img.height = Math.round((w * crop[2]) / crop[1]);
    }
  } catch (e) { /* not a URL with rendition params */ }
  if (eager) img.fetchPriority = 'high';
  let el = img;
  if (renditions && /adobeaemcloud\.com\/adobe\/assets/.test(a.href)) {
    // a <picture> with the component's per-breakpoint renditions, smallest breakpoint first
    el = document.createElement('picture');
    Object.keys(renditions).map(Number).sort((x, y) => x - y).forEach((max) => {
      const u = new URL(a.href);
      u.searchParams.set('width', renditions[max]);
      const source = document.createElement('source');
      source.media = `(max-width: ${max}px)`;
      source.srcset = u.href;
      el.append(source);
    });
    el.append(img);
  }
  const p = a.closest('p');
  (p && p.parentElement === container ? p : a).replaceWith(el);
  return img;
}

/**
 * Wraps a button's label in a span, the way the source markup does, so the
 * label and the button box carry separate styles.
 * @param {Element} root
 */
export function wrapButtonLabels(root) {
  root.querySelectorAll('a.button').forEach((a) => {
    if (a.querySelector('.button-text')) return;
    const span = document.createElement('span');
    span.className = 'button-text';
    span.append(...a.childNodes);
    // the source markup has whitespace between the label and the ::after arrow (3.3px at 12px)
    a.append(span, ' ');
  });
}
