import linkToImage from '../../scripts/scene7.js';

/**
 * Stats: rows of image | title | footnote, plus an optional "background | image" row
 * that sets the repeating pattern behind the whole section.
 */
export default function decorate(block) {
  const tiles = [];
  [...block.children].forEach((row) => {
    const [first, second, third] = row.children;
    if (first && first.textContent.trim().toLowerCase() === 'background' && second) {
      const a = second.querySelector('a');
      const section = block.closest('.section');
      if (a && section) section.style.setProperty('--stats-background', `url("${a.href}")`);
      return;
    }

    const tile = document.createElement('div');
    tile.className = 'stats-tile';
    const img = first ? linkToImage(first) : null;
    if (img) {
      img.className = 'stats-image';
      const media = document.createElement('div');
      media.className = 'stats-media';
      media.append(img);
      tile.append(media);
    }

    const content = document.createElement('div');
    content.className = 'stats-content';
    const h = second && second.querySelector('h3, h2, p');
    if (h) {
      const title = document.createElement('h3');
      title.className = 'stats-title';
      const text = h.textContent.trim();
      const hasNote = text.endsWith('*');
      title.textContent = hasNote ? `${text.slice(0, -1).trim()} ` : text;
      content.append(title);

      const note = third && third.querySelector('p');
      if (hasNote && note) {
        const star = document.createElement('span');
        star.className = 'stats-asterisk';
        star.textContent = '*';
        star.tabIndex = 0;
        star.setAttribute('role', 'button');
        star.setAttribute('aria-expanded', 'false');
        title.append(star);
        note.className = 'stats-note';
        content.append(note);
        const toggle = () => {
          const open = star.getAttribute('aria-expanded') !== 'true';
          star.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        star.addEventListener('click', toggle);
        star.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      }
    }
    tile.append(content);
    tiles.push(tile);
  });
  block.replaceChildren(...tiles);
}
