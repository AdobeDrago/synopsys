import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { wrapButtonLabels } from '../../scripts/scene7.js';

// social icons from the source site, keyed by the authored link label
const SOCIAL = {
  youtube: 'social-icon-youtube-white.png',
  facebook: 'social-facebook-white.svg',
  twitter: 'social-icon-twitter-white.svg',
  linkedin: 'social-icon-linkedin-white.png',
  instagram: 'social-icon-instagram-white.png',
};

function el(tag, cls, ...children) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.append(...children);
  return e;
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  const [linksSection, socialSection, legalSection] = [...fragment.children];

  // upper: cta + social (full row, overlapping), then four link columns that wrap 2 x 2
  const upper = el('div', 'footer-upper');
  const top = el('div', 'footer-top');
  const cta = socialSection && socialSection.querySelector('a');
  if (cta) {
    // outlined button: label span + whitespace before the ::after arrow, like the other buttons
    cta.className = 'button footer-cta';
    wrapButtonLabels(cta.parentElement);
    top.append(el('div', 'footer-cta-row', cta));
  }
  const social = el('ul', 'footer-social-list');
  if (socialSection) {
    socialSection.querySelectorAll('ul a').forEach((a) => {
      const key = a.textContent.trim().toLowerCase();
      a.className = `footer-social-icon footer-social-${key}`;
      if (SOCIAL[key]) a.style.backgroundImage = `url("${window.hlx.codeBasePath}/icons/${SOCIAL[key]}")`;
      // label stays in the link for assistive tech (visually hidden), as in the source
      a.replaceChildren(el('span', 'sr-only', a.textContent.trim()));
      social.append(el('li', '', a));
    });
  }
  top.append(el('div', 'footer-social', social));
  upper.append(top);

  if (linksSection) {
    linksSection.querySelectorAll(':scope .default-content-wrapper > ul, :scope > ul').forEach((ul, i) => {
      const col = el('div', `footer-col footer-col-${i + 1}`);
      const list = el('ul', 'footer-col-list');
      const head = ul.querySelector(':scope > li');
      const headLink = head && head.querySelector('a');
      if (headLink) {
        headLink.classList.remove('button');
        list.append(el('li', 'footer-col-head', headLink));
      }
      if (head) head.querySelectorAll(':scope ul > li > a').forEach((a) => list.append(el('li', '', a)));
      col.append(list);
      upper.append(col);
    });
  }

  // lower: copyright left, legal links right
  const lower = el('div', 'footer-lower');
  const copyright = legalSection && [...legalSection.querySelectorAll('p')].find((p) => !p.querySelector('a'));
  lower.append(el('div', 'footer-copyright', ...(copyright ? [copyright] : [])));
  const legal = legalSection && legalSection.querySelector('ul');
  if (legal) {
    legal.className = 'footer-legal-list';
    lower.append(el('div', 'footer-legal', legal));
  }

  block.replaceChildren(el('div', 'footer-inner', upper, lower));
}
