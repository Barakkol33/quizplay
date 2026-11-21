import { h, shuffle } from '../dom';
import type { GameType } from './types';
import { isStr, isStrArr, questionBlock } from './common';

/** Select all that apply. */
export const multi: GameType = {
  type: 'multi',
  label: { he: 'בחירה מרובה', en: 'Select all that apply' },
  icon: '☑️',
  check(q) {
    if (!isStr(q.question)) return 'missing "question"';
    if (!isStrArr(q.options, 3)) return '"options" needs at least 3 strings';
    const a = q.answers;
    const n = (q.options as string[]).length;
    if (!Array.isArray(a) || !a.length || !a.every((x) => Number.isInteger(x) && x >= 0 && x < n))
      return '"answers" must list the indexes (from 0) of all correct options';
    return null;
  },
  prompt: (q) => String(q.question),
  answer: (q) => (q.answers as number[]).map((i) => (q.options as string[])[i]).join(' · '),
  render(el, q, ctx) {
    const correct = new Set(q.answers as number[]);
    const order = shuffle((q.options as string[]).map((text, i) => ({ text, i })));
    const chosen = new Set<number>();
    const buttons = order.map((o, idx) =>
      h('button', { class: 'option multi-opt', dir: 'auto', 'aria-pressed': 'false', onclick: () => toggle(idx) },
        h('span', { class: 'key check' }, ''), h('span', {}, o.text)),
    );
    const toggle = (idx: number) => {
      if (checkBtn.disabled && chosen.size) return;
      const i = order[idx].i;
      if (chosen.has(i)) chosen.delete(i);
      else chosen.add(i);
      const on = chosen.has(i);
      buttons[idx].classList.toggle('selected', on);
      buttons[idx].setAttribute('aria-pressed', String(on));
      (buttons[idx].firstChild as HTMLElement).textContent = on ? '✓' : '';
      checkBtn.disabled = chosen.size === 0;
    };
    const checkBtn = h('button', {
      class: 'btn primary',
      disabled: true,
      onclick: () => {
        checkBtn.disabled = true;
        buttons.forEach((b, idx) => {
          b.disabled = true;
          const i = order[idx].i;
          if (correct.has(i)) b.classList.add('is-correct');
          else if (chosen.has(i)) b.classList.add('is-wrong');
        });
        const ok = chosen.size === correct.size && [...chosen].every((i) => correct.has(i));
        ctx.done(ok, order.filter((o) => chosen.has(o.i)).map((o) => o.text).join(' · '));
      },
    }, ctx.t('check'));
    ctx.onKey((e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= buttons.length) toggle(n - 1);
    });
    el.append(
      questionBlock(String(q.question), q, ctx),
      h('p', { class: 'muted small' }, ctx.t('selectAll')),
      h('div', { class: 'options' }, buttons),
      h('div', { class: 'actions' }, checkBtn),
    );
  },
};
