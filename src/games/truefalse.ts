import { h } from '../dom';
import type { GameType } from './types';
import { isStr, questionBlock } from './common';

export const truefalse: GameType = {
  type: 'truefalse',
  label: { he: 'נכון או לא נכון', en: 'True or false' },
  icon: '⚖️',
  check(q) {
    if (!isStr(q.statement)) return 'missing "statement"';
    if (typeof q.answer !== 'boolean') return '"answer" must be true or false';
    return null;
  },
  prompt: (q) => String(q.statement),
  answer: (q, t) => (q.answer ? t('true') : t('false')),
  render(el, q, ctx) {
    const make = (value: boolean) =>
      h('button', { class: `option tf tf-${value}`, onclick: () => pick(value) }, value ? '✓ ' + ctx.t('true') : '✗ ' + ctx.t('false'));
    const yes = make(true);
    const no = make(false);
    const pick = (value: boolean) => {
      if (yes.disabled) return;
      yes.disabled = no.disabled = true;
      const right = value === q.answer;
      (q.answer ? yes : no).classList.add('is-correct');
      if (!right) (value ? yes : no).classList.add('is-wrong');
      ctx.done(right, value ? ctx.t('true') : ctx.t('false'));
    };
    ctx.onKey((e) => {
      if (e.key === '1') pick(true);
      if (e.key === '2') pick(false);
    });
    el.append(questionBlock(String(q.statement), q, ctx), h('div', { class: 'options two' }, yes, no));
  },
};
