import { h } from '../dom';
import type { GameType } from './types';
import { isStr, isStrArr, normalize, questionBlock } from './common';

export const typein: GameType = {
  type: 'typein',
  label: { he: 'השלמה', en: 'Type the answer' },
  icon: '⌨️',
  check(q) {
    if (!isStr(q.question)) return 'missing "question"';
    if (!isStrArr(q.answers)) return '"answers" needs at least one accepted answer';
    return null;
  },
  prompt: (q) => String(q.question),
  answer: (q) => (q.answers as string[])[0],
  render(el, q, ctx) {
    const input = h('input', { class: 'typein', dir: 'auto', placeholder: ctx.t('typeAnswer'), autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    const submit = () => {
      if (input.disabled || !input.value.trim()) return;
      const given = input.value.trim();
      const right = (q.answers as string[]).some((a) => normalize(a) === normalize(given));
      input.disabled = button.disabled = true;
      input.classList.add(right ? 'is-correct' : 'is-wrong');
      ctx.done(right, given);
    };
    const button = h('button', { class: 'btn primary', onclick: submit }, ctx.t('check'));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        submit();
      }
    });
    el.append(questionBlock(String(q.question), q, ctx), h('div', { class: 'typein-row' }, input, button));
    setTimeout(() => input.focus(), 0);
  },
};
