import linkToImage from '../../scripts/scene7.js';
import {
  decorateProductButtons, inlineIcon, slashIcon, vidyardBackground,
} from '../../scripts/product.js';

/**
 * Timeline variant (product pages): one row per release, title + date | release notes,
 * each entry opened by a gold slash marker on a 2px rule.
 */
function decorateTimeline(block) {
  const inner = document.createElement('div');
  inner.className = 'columns-timeline-inner';
  [...block.children].forEach((row) => {
    const [meta, notes] = row.children;
    if (!meta) return;
    const marker = document.createElement('div');
    marker.className = 'columns-timeline-marker';
    marker.append(slashIcon());
    const entry = document.createElement('div');
    entry.className = 'columns-timeline-entry';
    meta.className = 'columns-timeline-meta';
    entry.append(meta);
    if (notes) {
      notes.className = 'columns-timeline-notes';
      entry.append(notes);
    }
    inner.append(marker, entry);
  });
  block.replaceChildren(inner);
}

/**
 * Media variant (product pages): copy | media (either order). Media is a Vidyard link
 * (muted background loop over its poster) or an image link. Copy: [icon] [eyebrow] heading,
 * text, buttons.
 */
function decorateMedia(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const article = document.createElement('div');
  article.className = 'columns-media-row';
  [...row.children].forEach((cell) => {
    const bg = vidyardBackground(cell);
    // the source's media-with-content renditions: 522 / 650 / 756px wide
    const img = bg ? null : linkToImage(cell, { renditions: { 1024: 522, 1280: 650 } });
    if (bg || img) {
      const figure = document.createElement('figure');
      figure.className = 'columns-media-figure';
      if (bg) {
        // the frame takes the poster's aspect ratio (as Vidyard's player does);
        // the player sits over it
        const poster = bg.querySelector('img');
        poster.loading = 'eager';
        const size = () => { figure.style.aspectRatio = `${poster.naturalWidth} / ${poster.naturalHeight}`; };
        if (poster.complete && poster.naturalWidth) size();
        else poster.addEventListener('load', size, { once: true });
        figure.append(bg);
      } else figure.append(img.closest('picture') || img);
      article.append(figure);
      return;
    }
    const copy = document.createElement('div');
    copy.className = 'columns-media-copy';
    const header = document.createElement('div');
    header.className = 'columns-media-header';
    const group = document.createElement('div');
    group.className = 'product-heading';
    const actions = document.createElement('div');
    actions.className = 'columns-media-actions';
    const heading = cell.querySelector('h1, h2, h3, h4');
    const features = document.createElement('ul');
    features.className = 'columns-media-features';
    let seenHeading = false;
    let feature = null;
    const iconOf = (el) => {
      const icon = el.querySelector('.icon');
      if (!icon || el.textContent.trim()) return null;
      return [...icon.classList].find((c) => c.startsWith('icon-')).slice(5);
    };
    const newFeature = () => {
      feature = document.createElement('li');
      const line = document.createElement('div');
      line.className = 'columns-media-feature';
      const fig = document.createElement('figure');
      const text = document.createElement('div');
      text.className = 'columns-media-feature-text';
      line.append(fig, text);
      feature.append(line);
      features.append(feature);
    };
    [...cell.children].forEach((el) => {
      const icon = iconOf(el);
      if (el.querySelector('a.button')) {
        actions.append(...el.querySelectorAll('a.button'));
      } else if (!seenHeading && icon) {
        const fig = document.createElement('figure');
        fig.className = 'columns-media-icon';
        fig.append(inlineIcon(icon, 'columns-media-icon-svg'));
        group.append(fig);
      } else if (!seenHeading) {
        if (el === heading) seenHeading = true;
        else el.classList.add('product-eyebrow');
        group.append(el);
      } else if (icon) {
        // feature list: icon, h5/h6 title, text
        newFeature();
        feature.querySelector('figure').append(inlineIcon(icon, 'columns-media-feature-icon'));
      } else if (/^H[56]$/.test(el.tagName)) {
        if (!feature || feature.querySelector('h5, h6')) newFeature();
        feature.querySelector('.columns-media-feature-text').append(el);
      } else if (feature) {
        feature.querySelector('.columns-media-feature-text').append(el);
      } else {
        header.append(el);
      }
    });
    header.prepend(group);
    decorateProductButtons(actions);
    copy.append(header);
    if (features.children.length) copy.append(features);
    if (actions.children.length) copy.append(actions);
    article.append(copy);
  });
  block.replaceChildren(article);
}

export default function decorate(block) {
  if (block.classList.contains('timeline')) {
    decorateTimeline(block);
    return;
  }
  if (block.classList.contains('media')) {
    decorateMedia(block);
    return;
  }
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
