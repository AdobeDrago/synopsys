import { inlineIcon } from '../../scripts/product.js';

let count = 0;

/**
 * Accordion: one row per item, question | answer. Each question becomes a heading holding
 * a toggle button (aria-expanded / aria-controls); answers expand below it.
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const [question, answer] = row.children;
    count += 1;
    const id = `accordion-panel-${count}`;
    const heading = (question && question.querySelector('h1, h2, h3, h4, h5, h6')) || document.createElement('h4');
    const label = (question ? question.textContent : '').trim();

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-trigger';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', id);
    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.append(inlineIcon('p-faq-toggle', 'accordion-icon-svg'));
    button.append(label, icon);
    heading.replaceChildren(button);
    heading.className = 'accordion-question';

    const body = document.createElement('div');
    body.className = 'accordion-body';
    if (answer) body.append(...answer.childNodes);
    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = id;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', label);
    panel.append(body);

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      panel.style.maxHeight = open ? `${body.scrollHeight}px` : '0px';
    });

    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.append(heading, panel);
    return item;
  });
  block.replaceChildren(...items);
}
