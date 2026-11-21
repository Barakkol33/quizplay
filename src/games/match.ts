import { h, shuffle } from '../dom';
import type { GameType } from './types';
import { isStrArr } from './common';

type Pair = [string, string];

export const match: GameType = {
  type: 'match',
  label: { he: 'התאמה', en: 'Match pairs' },
  icon: '🔗',
  check(q) {
    if (!Array.isArray(q.pairs) || q.pairs.length < 2 || !q.pairs.every((p) => isStrArr(p, 2) && p.length === 2))
      return '"pairs" needs at least 2 pairs like ["term", "meaning"]';
    return null;
  },
  prompt: (q) => (typeof q.prompt === 'string' ? q.prompt : (q.pairs as Pair[]).map((p) => p[0]).join(', ')),
  answer: (q) => (q.pairs as Pair[]).map(([a, b]) => `${a} ↔ ${b}`).join(' · '),
  render(el, q, ctx) {
    const pairs = q.pairs as Pair[];
    let errors = 0;
    let left: number | null = null;
    let right: number | null = null;
    let matched = 0;
    const lBtns = new Map<number, HTMLButtonElement>();
    const rBtns = new Map<number, HTMLButtonElement>();

    const tryMatch = () => {
      if (left == null || right == null) return;
      const lb = lBtns.get(left)!;
      const rb = rBtns.get(right)!;
      if (left === right) {
        lb.disabled = rb.disabled = true;
        lb.classList.replace('selected', 'is-correct');
        rb.classList.replace('selected', 'is-correct');
        matched++;
      } else {
        errors++;
        for (const b of [lb, rb]) {
          b.classList.remove('selected');
          b.classList.add('flash-wrong');
          setTimeout(() => b.classList.remove('flash-wrong'), 450);
        }
      }
      left = right = null;
      if (matched === pairs.length) ctx.done(errors === 0, errors ? `${errors} ✗` : '');
    };

    const select = (side: 'l' | 'r', i: number) => {
      const map = side === 'l' ? lBtns : rBtns;
      const prev = side === 'l' ? left : right;
      if (prev != null) map.get(prev)!.classList.remove('selected');
      map.get(i)!.classList.add('selected');
      if (side === 'l') left = i;
      else right = i;
      tryMatch();
    };

    const col = (side: 'l' | 'r') =>
      h(
        'div',
        { class: 'match-col' },
        shuffle(pairs.map((p, i) => ({ text: p[side === 'l' ? 0 : 1], i }))).map(({ text, i }) => {
          const b = h('button', { class: 'option match-item', dir: 'auto', onclick: () => select(side, i) }, text);
          (side === 'l' ? lBtns : rBtns).set(i, b);
          return b;
        }),
      );

    el.append(
      h('div', { class: 'q' }, h('p', { class: 'q-text', dir: 'auto' }, typeof q.prompt === 'string' ? q.prompt : ctx.t('matchHint'))),
      h('div', { class: 'match' }, col('l'), col('r')),
    );
  },
};
