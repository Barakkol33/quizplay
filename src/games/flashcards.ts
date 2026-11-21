import { h } from '../dom';
import type { GameType } from './types';
import { isStr } from './common';

export const flashcards: GameType = {
  type: 'flashcards',
  label: { he: 'כרטיסיות', en: 'Flashcards' },
  icon: '🃏',
  check(q) {
    if (!isStr(q.front)) return 'missing "front"';
    if (!isStr(q.back)) return 'missing "back"';
    return null;
  },
  prompt: (q) => String(q.front),
  answer: (q) => String(q.back),
  render(el, q, ctx) {
    const back = h('p', { class: 'card-back', dir: 'auto', hidden: true }, String(q.back));
    const grade = (knew: boolean) => {
      knewBtn.disabled = notBtn.disabled = true;
      ctx.done(knew, knew ? ctx.t('knewIt') : ctx.t('didntKnow'));
    };
    const knewBtn = h('button', { class: 'option tf tf-true', onclick: () => grade(true) }, '✓ ' + ctx.t('knewIt'));
    const notBtn = h('button', { class: 'option tf tf-false', onclick: () => grade(false) }, '✗ ' + ctx.t('didntKnow'));
    const gradeRow = h('div', { class: 'options two', hidden: true }, knewBtn, notBtn);
    const flip = () => {
      if (!back.hidden) return;
      back.hidden = false;
      gradeRow.hidden = false;
      card.classList.add('flipped');
      flipBtn.remove();
      knewBtn.focus();
    };
    const flipBtn = h('button', { class: 'btn primary', onclick: flip }, ctx.t('showAnswer'));
    const card = h(
      'div',
      { class: 'card' },
      q.image ? h('img', { class: 'q-img', src: ctx.asset(q.image), alt: '' }) : null,
      h('p', { class: 'card-front', dir: 'auto' }, String(q.front)),
      back,
    );
    ctx.onKey((e) => {
      if (e.key === ' ' && back.hidden) {
        e.preventDefault();
        flip();
      } else if (!back.hidden && e.key === '1') grade(true);
      else if (!back.hidden && e.key === '2') grade(false);
    });
    el.append(card, h('div', { class: 'actions' }, flipBtn), gradeRow);
    setTimeout(() => flipBtn.focus(), 0);
  },
};
