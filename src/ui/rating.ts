import { h } from '../dom';
import { t } from '../i18n';
import * as store from '../store';
import type { Question } from '../types';
import type { GameType } from '../games/types';

/** 👍 / 👎 for one question, with an optional comment. Saved per user; exported from the profile page. */
export function ratingWidget(pid: string, gid: string, q: Question, type: GameType): HTMLElement {
  const snapshot = () => ({ type: type.type, prompt: type.prompt(q).slice(0, 400) });
  const up = h('button', { class: 'rate-btn', title: t('rateUp'), 'aria-label': t('rateUp') }, '👍');
  const down = h('button', { class: 'rate-btn', title: t('rateDown'), 'aria-label': t('rateDown') }, '👎');
  const comment = h('input', { class: 'text rate-comment', dir: 'auto', maxlength: '300', placeholder: t('rateComment') });
  const saved = h('span', { class: 'muted small rate-saved', 'aria-live': 'polite' });
  const commentRow = h('div', { class: 'rate-comment-row' }, comment, saved);

  const draw = () => {
    const r = store.rating(pid, gid, q.id);
    up.classList.toggle('on', r?.v === 1);
    down.classList.toggle('on', r?.v === -1);
    up.setAttribute('aria-pressed', String(r?.v === 1));
    down.setAttribute('aria-pressed', String(r?.v === -1));
    commentRow.hidden = !r;
    if (r && document.activeElement !== comment) comment.value = r.comment ?? '';
  };
  const set = (v: 1 | -1) => {
    const cur = store.rating(pid, gid, q.id)?.v;
    store.setRating(pid, gid, q.id, cur === v ? 0 : v, snapshot());
    draw();
    if (store.rating(pid, gid, q.id)?.v === -1) comment.focus({ preventScroll: true });
  };
  up.addEventListener('click', () => set(1));
  down.addEventListener('click', () => set(-1));
  let timer: number | undefined;
  comment.addEventListener('input', () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      store.setRatingComment(pid, gid, q.id, comment.value);
      saved.textContent = '✓';
      setTimeout(() => (saved.textContent = ''), 1200);
    }, 400);
  });
  // Keys typed here must not trigger game shortcuts (1–4, Enter).
  comment.addEventListener('keydown', (e) => e.stopPropagation());
  draw();
  return h('div', { class: 'rating' }, h('span', { class: 'muted small' }, t('rateThis')), up, down, commentRow);
}
