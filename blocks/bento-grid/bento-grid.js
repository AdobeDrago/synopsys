import linkToImage from '../../scripts/scene7.js';

/**
 * Bento grid: rows of image | label link. Tiles are laid out half/quarter/quarter, then
 * quarter/quarter/half, like the source; each tile is a single link with the label on the image.
 */
export default function decorate(block) {
  const tiles = [...block.children].map((row) => {
    const [media, label] = row.children;
    const source = label && label.querySelector('a');
    const col = document.createElement('div');
    col.className = 'bento-grid-col';

    const link = document.createElement('a');
    link.className = 'bento-grid-link';
    link.href = source ? source.href : '#';

    const imageBox = document.createElement('div');
    imageBox.className = 'bento-grid-media';
    const img = media ? linkToImage(media) : null;
    if (img) {
      img.alt = ''; // decorative: the tile title already labels the link
      imageBox.append(img);
    }

    // h3 under the section's h2 (the source uses h4, which skips a level)
    const title = document.createElement('h3');
    title.className = 'bento-grid-title';
    title.textContent = source ? source.textContent.trim() : '';

    link.append(imageBox, title);
    col.append(link);
    return col;
  });
  block.replaceChildren(...tiles);
}
