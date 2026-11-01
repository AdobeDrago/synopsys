/**
 * Images are authored in DA as links to their Scene7 URL (images.ansys.com) so they
 * stay on Dynamic Media instead of being copied into the media bus.
 * Converts such a link into an <img>.
 * @param {Element} container element holding the authored link
 * @param {object} [options]
 * @param {boolean} [options.eager] load eagerly (LCP image)
 * @returns {HTMLImageElement|null} the image, or null if no image link was found
 */
export default function linkToImage(container, { eager = false } = {}) {
  const a = container.querySelector('a[href*="images.ansys.com"], a[href$=".svg"], a[href$=".png"]');
  if (!a) return null;
  const img = document.createElement('img');
  img.src = a.href;
  img.alt = a.textContent.trim();
  img.loading = eager ? 'eager' : 'lazy';
  if (eager) img.fetchPriority = 'high';
  const p = a.closest('p');
  (p && p.parentElement === container ? p : a).replaceWith(img);
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
