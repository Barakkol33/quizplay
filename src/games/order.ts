import { h, shuffle } from '../dom';
import type { GameType } from './types';
import { isStrArr, questionBlock } from './common';

export const order: GameType = {
  type: 'order',
  label: { he: 'סידור', en: 'Put in order' },
  icon: '🔢',
  check(q) {
    if (!isStrArr(q.items, 2)) return '"items" needs at least 2 strings, in the correct order';
    return null;
  },
  prompt: (q) => (typeof q.prompt === 'string' ? q.prompt : (q.items as string[]).join(', ')),
  answer: (q) => (q.items as string[]).join(' → '),
  render(el, q, ctx) {
    const items = q.items as string[];
    let current = shuffle(items);
    for (let i = 0; i < 5 && current.every((x, j) => x === items[j]); i++) current = shuffle(items);
    let locked = false;
    const list = h('ol', { class: 'order-list' });

    const move = (i: number, d: number) => {
      const j = i + d;
      if (locked || j < 0 || j >= current.length) return;
      [current[i], current[j]] = [current[j], current[i]];
      draw();
      (list.children[j]?.querySelector(d < 0 ? '.up' : '.down') as HTMLButtonElement | null)?.focus();
    };

    const draw = () => {
      list.replaceChildren(
        ...current.map((text, i) =>
          h(
            'li',
            { class: 'order-item' + (locked ? (text === items[i] ? ' is-correct' : ' is-wrong') : '') },
            h('span', { class: 'order-text', dir: 'auto' }, text),
            h('button', { class: 'icon-btn up', 'aria-label': 'up', disabled: locked || i === 0, onclick: () => move(i, -1) }, '▲'),
            h('button', { class: 'icon-btn down', 'aria-label': 'down', disabled: locked || i === current.length - 1, onclick: () => move(i, 1) }, '▼'),
          ),
        ),
      );
    };

    const checkBtn = h('button', {
      class: 'btn primary',
      onclick: () => {
        if (locked) return;
        locked = true;
        checkBtn.disabled = true;
        draw();
        ctx.done(current.every((x, i) => x === items[i]), current.join(' → '));
      },
    }, ctx.t('check'));

    draw();
    el.append(
      questionBlock(typeof q.prompt === 'string' ? q.prompt : ctx.t('orderHint'), q, ctx),
      list,
      h('div', { class: 'actions' }, checkBtn),
    );
  },
};
