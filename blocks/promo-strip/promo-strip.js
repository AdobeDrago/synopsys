import linkToImage from '../../scripts/scene7.js';

/**
 * Promo strip: logo | message | link, on the Synopsys gradient bar.
 * Markup mirrors the source: logo box, then a nav box holding the message and a one-item link list.
 */
export default function decorate(block) {
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
