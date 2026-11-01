import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const ICON_BASE = `${window.hlx.codeBasePath}/icons`;
// the source adds `utility-nav--scrolled` once scrolled by the utility bar's own height
// (52px; measured off at 51, on at 52)
const SCROLLED_AT = 52;

const svgCache = {};

// icons are inline <svg> like the source (inherit currentColor, no <img> elements)
const PRODUCT = document.body.classList.contains('product');
// product pages have their own header icon set (icons/p-*.svg)
const PRODUCT_ICONS = ['globe', 'chevron', 'search', 'user', 'caret', 'trial'];

function icon(name, cls) {
  const span = document.createElement('span');
  span.className = `header-icon header-icon-${cls || name}`;
  const file = PRODUCT && PRODUCT_ICONS.includes(name) ? `p-${name}` : name;
  svgCache[file] = svgCache[file] || fetch(`${ICON_BASE}/${file}.svg`).then((r) => r.text());
  svgCache[file].then((txt) => {
    const svg = new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement;
    svg.setAttribute('class', span.className);
    svg.setAttribute('aria-hidden', 'true');
    span.replaceWith(svg);
  });
  return span;
}

function el(tag, cls, ...children) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.append(...children);
  return e;
}

function closeAll(header, except) {
  header.querySelectorAll('[aria-expanded="true"]').forEach((b) => {
    if (b !== except) b.setAttribute('aria-expanded', 'false');
  });
}

function toggle(header, button) {
  const open = button.getAttribute('aria-expanded') !== 'true';
  closeAll(header, button);
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// breadcrumb (product pages): names from the `breadcrumb` metadata, links from the URL path
function buildBreadcrumb() {
  const names = (getMetadata('breadcrumb') || '').split(',').map((n) => n.trim()).filter(Boolean);
  const parts = window.location.pathname.split('/').filter(Boolean);
  const crumb = el('nav', 'header-breadcrumb');
  crumb.setAttribute('aria-label', 'Breadcrumb');
  names.forEach((name, i) => {
    crumb.append(el('span', 'header-breadcrumb-sep', '/'));
    const last = i === names.length - 1;
    if (last) {
      crumb.append(el('span', 'header-breadcrumb-current', name));
    } else {
      const a = el('a', 'header-breadcrumb-link', name);
      a.href = `/${parts.slice(0, i + 1).join('/')}`;
      crumb.append(a);
    }
  });
  return crumb;
}

function buildUtility(brandSection) {
  const links = [...brandSection.querySelectorAll('a')];
  const locale = [...brandSection.querySelectorAll('p')].find((p) => !p.querySelector('a'));
  // "Synopsys |" collapses on scroll; "Ansys" stays (same grouping as the source)
  const logos = el('div', 'header-utility-logos');
  const group = el('div', 'header-utility-group');
  links.forEach((a, i) => {
    a.className = `header-utility-logo header-utility-logo-${i === 0 ? 'synopsys' : 'ansys'}`;
    if (i === 0) {
      group.append(a, el('span', 'header-utility-divider'));
      logos.append(group);
    } else {
      logos.append(a);
    }
  });
  if (PRODUCT) logos.append(buildBreadcrumb());
  const tools = el('div', 'header-utility-tools');
  if (locale) {
    const globe = icon('globe');
    const label = el('span', 'header-locale-label', locale.textContent.trim());
    // product source: unpadded button with a hidden label, padding on an inner wrapper
    const localeBtn = PRODUCT
      ? el('button', 'header-locale', el('span', 'sr-only', 'Countries & Regions'), el('span', 'header-locale-inner', globe, label))
      : el('button', 'header-locale', globe, label);
    localeBtn.type = 'button';
    tools.append(localeBtn);
  }
  // mount point for the third-party "Ask" concierge widget (not part of this build);
  // keeps its footprint
  tools.append(el('div', 'header-utility-ask'));
  return el('div', 'header-utility', logos, tools);
}

// authored `:menu-xyz:` icons arrive as <span class="icon icon-menu-xyz">;
// render them as inline svg
function inlineIcon(span, cls) {
  const name = [...span.classList].find((c) => c.startsWith('icon-') && c !== 'icon').slice(5);
  const svg = icon(name, cls);
  span.replaceWith(svg);
  return svg;
}

function marker(li) {
  const em = li.querySelector(':scope > p > em, :scope > em');
  return em ? em.textContent.trim() : null;
}

// category: optional title row (icon + link + arrow) and a list of links
function buildCategory(li) {
  const cat = el('div', 'header-category');
  const head = li.querySelector(':scope > p');
  if (head) {
    const title = el('div', 'header-category-title');
    const iconSpan = head.querySelector('span.icon');
    if (iconSpan) title.append(inlineIcon(iconSpan, 'category'));
    const a = head.querySelector('a');
    if (a) {
      a.className = 'header-category-link';
      a.replaceChildren(el('span', '', a.textContent.trim()), icon('menu-arrow', 'arrow'));
      title.append(a);
    }
    cat.append(title);
  }
  const list = li.querySelector(':scope > ul');
  if (list) {
    list.className = 'header-category-list';
    list.querySelectorAll('li').forEach((item) => {
      const a = item.querySelector('a');
      if (!a) return;
      const iconSpan = item.querySelector('span.icon');
      a.className = 'header-category-item';
      // optional per-link icon (Products by Collection) sits inside the link before the label
      // trailing arrow reserves its space and shows on hover, as in the source
      a.replaceChildren(...(iconSpan ? [inlineIcon(iconSpan, 'item')] : []), el('span', '', a.textContent.trim()), icon('menu-arrow', 'item-arrow'));
      if (iconSpan) item.classList.add('has-icon');
    });
    cat.append(list);
  }
  return cat;
}

// featured card: icon box, title, text, button
function buildCard(li) {
  const [iconP, titleP, textP, ctaP] = li.querySelectorAll(':scope > p');
  const card = el('div', 'header-card');
  const box = el('div', 'header-card-icon');
  const iconSpan = iconP && iconP.querySelector('span.icon');
  if (iconSpan) box.append(inlineIcon(iconSpan, 'card'));
  card.append(box);
  const content = el('div', 'header-card-content');
  if (titleP) content.append(el('p', 'header-card-title', titleP.textContent.trim()));
  if (textP) content.append(el('p', 'header-card-text', textP.textContent.trim()));
  const a = ctaP && ctaP.querySelector('a');
  card.append(content);
  // the button follows the content box (not inside it), as in the source
  if (a) {
    a.className = 'header-card-button';
    a.replaceChildren(a.textContent.trim(), ' ', icon('menu-arrow', 'card-arrow'));
    card.append(a);
  }
  return card;
}

function buildPane(tabLi) {
  const pane = el('div', 'header-pane');
  const row = el('div', 'header-pane-row');
  let bar = null;
  let promo = null;
  [...tabLi.querySelectorAll(':scope > ul > li')].forEach((li) => {
    const kind = marker(li);
    const list = li.querySelector(':scope > ul');
    if (kind === 'links') {
      bar = el('div', 'header-panel-bar');
      const ul = el('ul', '');
      [...list.children].forEach((item) => {
        const a = item.querySelector('a');
        const iconSpan = item.querySelector('span.icon');
        a.className = 'header-bar-link';
        // label is a direct text node of the flex link, as in the source
        a.replaceChildren(...(iconSpan ? [inlineIcon(iconSpan, 'bar')] : []), a.textContent.trim(), icon('menu-arrow-small', 'bar-arrow'));
        ul.append(el('li', '', a));
      });
      bar.append(ul);
    } else if (kind === 'promo') {
      // text + dark pill button, shown in the bottom bar (Learn / About)
      const items = [...list.children];
      const btnLi = items.find((x) => x.querySelector('a'));
      const texts = items.filter((x) => x !== btnLi);
      promo = el('div', 'header-panel-bar header-panel-banner');
      const inner = el('div', 'header-banner');
      const content = el('div', 'header-banner-content');
      if (texts[0]) content.append(el('p', 'header-banner-text', texts[0].textContent.trim()));
      if (texts[1]) content.append(el('div', 'header-banner-description', texts[1].textContent.trim()));
      inner.append(content);
      const a = btnLi && btnLi.querySelector('a');
      if (a) {
        a.className = 'header-banner-button';
        a.replaceChildren(a.textContent.trim(), icon('trial', 'banner-arrow'));
        inner.append(a);
      }
      promo.append(inner);
    } else if (list) {
      const col = el('div', 'header-pane-col');
      [...list.children].forEach((comp) => col.append(marker(comp) === 'card' ? buildCard(comp) : buildCategory(comp)));
      if (col.querySelector('.header-card')) col.classList.add('header-pane-col-card');
      row.append(col);
    }
  });
  // column widths as in the source: a card column is 50%; next to a card, category columns share
  // the other 50%; without a card, columns are 25%
  const cols = [...row.children];
  const hasCard = cols.some((c) => c.classList.contains('header-pane-col-card'));
  const catCols = cols.filter((c) => !c.classList.contains('header-pane-col-card'));
  cols.forEach((c) => {
    c.style.flexBasis = c.classList.contains('header-pane-col-card') ? '50%' : `${hasCard ? 50 / catCols.length : 25}%`;
  });
  pane.append(row);
  return { pane, bar: bar || promo };
}

function buildPanel(item) {
  const panel = el('div', 'header-panel');
  const inner = el('div', 'header-panel-inner');
  const body = el('div', 'header-panel-body');
  const tabLis = [...item.querySelectorAll(':scope > ul > li')];
  const tabbed = tabLis.length > 1 && tabLis.every((t) => t.querySelector(':scope > p'));
  let sharedBar = null;
  if (tabbed) {
    const tabs = el('div', 'header-tabs');
    tabs.setAttribute('role', 'tablist');
    const panes = el('div', 'header-panes');
    tabLis.forEach((t, i) => {
      const { pane, bar } = buildPane(t);
      if (!sharedBar) sharedBar = bar;
      const b = el('button', 'header-tab', t.querySelector(':scope > p').textContent.trim());
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      pane.hidden = i !== 0;
      b.addEventListener('click', () => {
        [...tabs.children].forEach((x, j) => x.setAttribute('aria-selected', j === i ? 'true' : 'false'));
        [...panes.children].forEach((p, j) => { p.hidden = j !== i; });
      });
      tabs.append(b);
      panes.append(pane);
    });
    body.append(tabs, panes);
  } else {
    const { pane, bar } = buildPane(tabLis[0]);
    sharedBar = bar;
    body.append(pane);
    panel.classList.add('header-panel-simple');
  }
  inner.append(body);
  if (sharedBar) inner.append(sharedBar);
  panel.append(inner);
  return panel;
}

function buildNav(header, sectionsSection) {
  const list = el('ul', 'header-nav');
  const top = sectionsSection.querySelector('ul');
  [...(top ? top.children : [])].filter((li) => li.querySelector(':scope > p')).forEach((item) => {
    const label = item.querySelector(':scope > p').textContent.trim();
    const text = PRODUCT ? el('span', 'header-nav-label', label) : label;
    const button = el('button', 'header-nav-button', text, icon('chevron'));
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => toggle(header, button));
    list.append(el('li', 'header-nav-item', button, buildPanel(item)));
  });
  return list;
}

function buildTools(header, toolsSection) {
  const tools = el('div', 'header-tools');
  const search = el('a', 'header-search', icon('search'));
  search.href = '/search-results';
  search.setAttribute('aria-label', 'Search');
  if (PRODUCT) search.append(el('span', 'sr-only', 'Search'));
  tools.append(search);

  const dropdown = toolsSection.querySelector('li');
  if (dropdown) {
    const label = dropdown.querySelector(':scope > p').textContent.trim();
    const labelEl = el(PRODUCT ? 'span' : 'div', 'header-customers-label', label);
    const button = el('button', 'header-customers', icon('user'), labelEl, icon('caret'));
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => toggle(header, button));
    const menu = el('div', 'header-customers-menu', ...dropdown.querySelectorAll(':scope > ul > li > a'));
    const signin = [...toolsSection.querySelectorAll(':scope > p a')].find((a) => !a.closest('strong') && !a.classList.contains('button'));
    if (signin) {
      signin.className = 'header-signin';
      signin.replaceChildren(el('div', 'header-signin-label', signin.textContent.trim()), icon('signin'));
      menu.append(signin);
    }
    tools.append(el('div', 'header-customers-wrap', button, menu));
  }

  const trial = toolsSection.querySelector('a.button, strong a');
  if (trial) {
    trial.className = 'header-trial';
    const trialText = trial.textContent.trim();
    // product source: label is a direct text node of the pill; homepage source: a div
    trial.replaceChildren(PRODUCT ? trialText : el('div', 'header-trial-label', trialText), icon('trial'));
    tools.append(trial);
  }
  return tools;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const [brand, sections, tools] = [...fragment.children];

  const header = block.closest('header') || block;
  const utility = buildUtility(brand);

  const logo = el('a', 'header-logo');
  logo.href = '/';
  logo.setAttribute('aria-label', 'Ansys');
  logo.append(icon(PRODUCT ? 'p-logo' : 'ansys-logo', 'logo'));
  if (PRODUCT) logo.prepend(el('span', 'sr-only', 'Ansys part of Synopsys'));

  const burger = el('button', 'header-burger', icon('menu'));
  burger.type = 'button';
  burger.setAttribute('aria-label', 'Open navigation');
  burger.setAttribute('aria-expanded', 'false');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    header.classList.toggle('header-menu-open', open);
  });

  const bar = el('div', 'header-bar', logo, buildNav(header, sections), buildTools(header, tools), burger);
  block.replaceChildren(utility, bar);

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(header); });
  document.addEventListener('click', (e) => { if (!header.contains(e.target)) closeAll(header); });

  const onScroll = () => utility.classList.toggle('header-utility-scrolled', window.scrollY >= SCROLLED_AT);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
