import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { wrapButtonLabels } from '../../scripts/scene7.js';
import { arrowIcon, inlineIcon } from '../../scripts/product.js';

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

const srOnly = (text) => el('span', 'sr-only', text);

/**
 * Product footer (template: product). Fragment sections: brand (logo link, tagline, CTA,
 * social list) | link columns (heading + list each) | copyright + legal list | accessibility.
 */
function decorateProduct(block, fragment) {
  const [brandSection, linksSection, legalSection, a11ySection] = [...fragment.children];

  const about = el('div', 'footer-about');
  const follow = el('div', 'footer-follow');
  if (brandSection) {
    const links = [...brandSection.querySelectorAll('p a')];
    const logo = links.find((a) => new URL(a.href).pathname === '/');
    if (logo) {
      logo.className = 'footer-brand-logo';
      logo.replaceChildren(srOnly(logo.textContent.trim()), inlineIcon('p-logo', 'footer-brand-logo-icon'));
      about.append(logo);
    }
    const tagline = [...brandSection.querySelectorAll('p')].find((p) => !p.querySelector('a') && p.textContent.trim());
    if (tagline) about.append(tagline);
    const cta = links.find((a) => a !== logo);
    if (cta) {
      cta.className = 'footer-latest';
      cta.replaceChildren(cta.textContent.trim(), arrowIcon());
      follow.append(cta);
    }
    const social = el('div', 'footer-socials');
    brandSection.querySelectorAll('ul a').forEach((a) => {
      const label = a.textContent.trim();
      const key = label.toLowerCase().split('/')[0].replace(/[^a-z]/g, '');
      a.className = 'footer-socials-link';
      a.replaceChildren(srOnly(label), inlineIcon(`p-social-${key}`, 'footer-socials-icon'));
      social.append(a);
    });
    follow.append(social);
  }

  const columns = el('div', 'footer-columns');
  if (linksSection) {
    linksSection.querySelectorAll('h2, h3, h4').forEach((h) => {
      const title = el('h3', 'footer-column-title', el('span', '', h.textContent.trim()));
      const list = h.nextElementSibling && h.nextElementSibling.tagName === 'UL' ? h.nextElementSibling : el('ul');
      list.querySelectorAll('a').forEach((a) => a.replaceChildren(a.textContent.trim(), arrowIcon()));
      columns.append(el('div', 'footer-column', title, list));
    });
  }

  const legal = el('section', 'footer-terms');
  if (legalSection) {
    const copy = legalSection.querySelector('p');
    if (copy) legal.append(copy);
    const row = el('div', 'footer-terms-links');
    legalSection.querySelectorAll('ul a').forEach((a) => row.append(a));
    legal.append(row);
  }

  const parts = [el('div', 'footer-product', el('section', 'footer-main', el('aside', 'footer-brand', about, follow), columns), legal)];
  if (a11ySection) {
    const text = [...a11ySection.querySelectorAll('p')].find((p) => !p.querySelector('a'));
    const link = a11ySection.querySelector('a');
    const row = el('div', 'footer-a11y-inner');
    if (text) row.append(el('div', 'footer-a11y-text', text));
    if (link) {
      link.replaceChildren(link.textContent.trim(), arrowIcon());
      row.append(el('div', 'footer-a11y-link', link));
    }
    parts.push(el('div', 'footer-a11y', row));
  }
  block.replaceChildren(...parts);
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (document.body.classList.contains('product')) {
    decorateProduct(block, fragment);
    return;
  }
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
