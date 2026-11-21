import { h } from '../dom';
import type { GameType } from './types';
import { isStr } from './common';
import { richText } from './rich';

/** Reading pages. Put a lesson first in a subject, and games after it. */
export const lesson: GameType = {
  type: 'lesson',
  label: { he: 'שיעור', en: 'Lesson' },
  icon: '📖',
  passive: true,
  check(q) {
    if (!isStr(q.text)) return 'missing "text"';
    return null;
  },
  prompt: (q) => (typeof q.title === 'string' ? q.title : String(q.text).slice(0, 80)),
  answer: () => '',
  render(el, q, ctx) {
    const next = h('button', { class: 'btn primary', onclick: () => ctx.done(true, '') }, ctx.t('gotIt') + ' →');
    el.append(
      h('article', { class: 'lesson-page' },
        typeof q.title === 'string' ? h('h2', { dir: 'auto' }, q.title) : null,
        q.image ? h('img', { class: 'q-img', src: ctx.asset(q.image), alt: '' }) : null,
        richText(String(q.text)),
      ),
      h('div', { class: 'actions' }, next),
    );
    ctx.onKey((e) => {
      if (e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') ctx.done(true, '');
    });
    setTimeout(() => next.focus({ preventScroll: true }), 0);
  },
};
