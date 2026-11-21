import { h, shuffle } from '../dom';
import type { GameType } from './types';
import { isStr, isStrArr } from './common';

interface Group { name: string; items: string[] }

/** Put each item in its group, one at a time. Correct only with no wrong tries. */
export const categorize: GameType = {
  type: 'categorize',
  label: { he: 'מיון לקבוצות', en: 'Sort into groups' },
  icon: '🗂️',
  check(q) {
    const g = q.groups as Group[] | undefined;
    if (!Array.isArray(g) || g.length < 2) return '"groups" needs at least 2 groups like { "name": "…", "items": ["…"] }';
    for (const x of g) if (!isStr(x?.name) || !isStrArr(x?.items)) return 'every group needs "name" and at least one item';
    return null;
  },
  prompt: (q) => (typeof q.prompt === 'string' ? q.prompt : (q.groups as Group[]).map((g) => g.name).join(' / ')),
  answer: (q) => (q.groups as Group[]).map((g) => `${g.name}: ${g.items.join(', ')}`).join(' · '),
  render(el, q, ctx) {
    const groups = q.groups as Group[];
    const queue = shuffle(groups.flatMap((g, gi) => g.items.map((text) => ({ text, gi }))));
    let errors = 0;
    let pos = 0;
    const current = h('div', { class: 'cat-current', dir: 'auto' });
    const counter = h('span', { class: 'muted small' });
    const buckets = groups.map(() => h('div', { class: 'cat-items' }));
    const buttons = groups.map((g, gi) =>
      h('div', { class: 'cat-bucket' },
        h('button', { class: 'option cat-btn', dir: 'auto', onclick: () => pick(gi) }, g.name),
        buckets[gi]),
    );

    const show = () => {
      current.textContent = queue[pos].text;
      counter.textContent = `${pos + 1} / ${queue.length}`;
    };
    const pick = (gi: number) => {
      if (pos >= queue.length) return;
      const item = queue[pos];
      const btn = buttons[gi].firstChild as HTMLButtonElement;
      if (item.gi === gi) {
        buckets[gi].append(h('span', { class: 'chip', dir: 'auto' }, item.text));
        pos++;
        if (pos === queue.length) {
          current.textContent = '✓';
          buttons.forEach((b) => ((b.firstChild as HTMLButtonElement).disabled = true));
          ctx.done(errors === 0, errors ? `${errors} ✗` : '');
        } else show();
      } else {
        errors++;
        btn.classList.add('flash-wrong');
        setTimeout(() => btn.classList.remove('flash-wrong'), 450);
      }
    };
    ctx.onKey((e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= groups.length) pick(n - 1);
    });

    el.append(
      h('div', { class: 'q' }, h('p', { class: 'q-text', dir: 'auto' }, typeof q.prompt === 'string' ? q.prompt : ctx.t('categorizeHint'))),
      h('div', { class: 'cat-stage' }, counter, current),
      h('div', { class: 'cat-groups' }, buttons),
    );
    show();
  },
};
