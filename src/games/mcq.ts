import { h, shuffle } from '../dom';
import type { GameType } from './types';
import { isStr, isStrArr, questionBlock } from './common';

export const mcq: GameType = {
  type: 'mcq',
  label: { he: 'שאלות אמריקאיות', en: 'Multiple choice' },
  icon: '🔤',
  check(q) {
    if (!isStr(q.question)) return 'missing "question"';
    if (!isStrArr(q.options, 2)) return '"options" needs at least 2 strings';
    const a = q.answer;
    if (typeof a !== 'number' || !Number.isInteger(a) || a < 0 || a >= (q.options as string[]).length)
      return '"answer" must be the index (from 0) of the correct option';
    return null;
  },
  prompt: (q) => String(q.question),
  answer: (q) => (q.options as string[])[q.answer as number],
  render(el, q, ctx) {
    const options = (q.options as string[]).map((text, i) => ({ text, i }));
    const order = ctx.settings.shuffleOptions === false ? options : shuffle(options);
    const buttons: HTMLButtonElement[] = [];
    const pick = (idx: number) => {
      if (buttons[0].disabled) return;
      const chosen = order[idx];
      const right = chosen.i === q.answer;
      buttons.forEach((b, j) => {
        b.disabled = true;
        if (order[j].i === q.answer) b.classList.add('is-correct');
      });
      if (!right) buttons[idx].classList.add('is-wrong');
      ctx.done(right, chosen.text);
    };
    order.forEach((o, idx) => {
      buttons.push(
        h('button', { class: 'option', dir: 'auto', onclick: () => pick(idx) }, h('span', { class: 'key' }, String(idx + 1)), h('span', {}, o.text)),
      );
    });
    ctx.onKey((e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= buttons.length) pick(n - 1);
    });
    el.append(questionBlock(String(q.question), q, ctx), h('div', { class: 'options' }, buttons));
  },
};
