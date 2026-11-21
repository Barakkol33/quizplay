/** Plays a round: a list of questions of any game types, with score, streak, hearts and timer. */
import { h, clear } from './dom';
import { t } from './i18n';
import { sound } from './effects';
import { onLeave } from './leave';
import * as store from './store';
import type { GameSettings, Lang, Question } from './types';
import type { GameType } from './games/types';
import type { Source } from './source';

export interface RoundItem {
  pid: string;
  gid: string;
  q: Question;
  type: GameType;
  source: Source;
  settings: GameSettings;
}

export interface RoundResult {
  score: number;
  correct: number;
  answered: number;
  total: number;
  stars: number;
  gameOver: boolean;
  wrong: { item: RoundItem; given: string }[];
}

export interface RoundOptions {
  title: string;
  instructions?: string;
  lives: number;
  timeLimit: number;
  /** Language of the content; the question area takes its direction. */
  lang?: Lang;
  onFinish: (r: RoundResult) => void;
}

export function starsFor(correct: number, total: number, gameOver: boolean): number {
  if (gameOver || total === 0) return 0;
  const acc = correct / total;
  return acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : acc >= 0.5 ? 1 : 0;
}

export function playRound(root: HTMLElement, items: RoundItem[], opts: RoundOptions): void {
  let idx = 0;
  let score = 0;
  let streak = 0;
  let correct = 0;
  let lives = opts.lives;
  const wrong: RoundResult['wrong'] = [];
  let keyHandler: ((e: KeyboardEvent) => void) | null = null;
  let timer: number | undefined;

  const onKey = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    keyHandler?.(e);
  };
  document.addEventListener('keydown', onKey);
  const stopTimer = () => {
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
  };
  onLeave(() => {
    document.removeEventListener('keydown', onKey);
    stopTimer();
  });

  const hearts = h('span', { class: 'hearts', 'aria-label': 'lives' });
  const scoreEl = h('span', { class: 'stat' });
  const streakEl = h('span', { class: 'stat streak' });
  const progress = h('div', { class: 'bar' }, h('div', { class: 'bar-fill' }));
  const timeBar = h('div', { class: 'bar time', hidden: !opts.timeLimit }, h('div', { class: 'bar-fill' }));
  const body = h('div', { class: 'play-body', lang: opts.lang, dir: opts.lang ? (opts.lang === 'he' ? 'rtl' : 'ltr') : null });
  const feedback = h('div', { class: 'feedback', 'aria-live': 'polite' });

  const updateHud = () => {
    hearts.textContent = opts.lives ? '❤️'.repeat(lives) + '🤍'.repeat(Math.max(0, opts.lives - lives)) : '';
    scoreEl.textContent = `${t('score')} ${score}`;
    streakEl.textContent = streak >= 2 ? `🔥 ${streak}` : '';
    (progress.firstChild as HTMLElement).style.width = `${(idx / items.length) * 100}%`;
  };

  const allPassive = items.length > 0 && items.every((i) => i.type.passive);
  clear(root).append(
    h('div', { class: 'play' + (allPassive ? ' passive' : '') },
      h('div', { class: 'hud' }, h('strong', { class: 'hud-title', dir: 'auto' }, opts.title), hearts, streakEl, scoreEl),
      progress,
      timeBar,
      opts.instructions ? h('p', { class: 'muted instructions', dir: 'auto' }, opts.instructions) : null,
      body,
      feedback,
    ),
  );

  const finish = (gameOver: boolean) => {
    stopTimer();
    document.removeEventListener('keydown', onKey);
    opts.onFinish({
      score, correct, answered: idx, total: items.length, gameOver, wrong,
      stars: starsFor(correct, items.length, gameOver),
    });
  };

  const show = () => {
    updateHud();
    clear(body);
    clear(feedback);
    body.classList.remove('locked');
    keyHandler = null;
    const item = items[idx];
    let answered = false;

    const done = (right: boolean, given: string) => {
      if (answered) return;
      answered = true;
      stopTimer();
      keyHandler = null;
      if (item.type.passive) {
        correct++;
        idx++;
        if (idx >= items.length) finish(false);
        else {
          show();
          window.scrollTo({ top: 0 });
        }
        return;
      }
      body.classList.add('locked');
      store.recordAnswer(item.pid, item.gid, item.q.id, right, given);
      if (right) {
        const mult = Math.min(4, 1 + Math.floor(streak / 3));
        score += 10 * mult;
        streak++;
        correct++;
        sound('right');
      } else {
        streak = 0;
        if (opts.lives) lives--;
        wrong.push({ item, given });
        sound('wrong');
      }
      idx++;
      updateHud();
      const out = opts.lives && lives <= 0;
      const last = idx >= items.length;
      const next = h('button', { class: 'btn primary', onclick: () => (out || last ? finish(!!out) : show()) }, t('next'));
      feedback.append(
        h('div', { class: 'feedback-box ' + (right ? 'ok' : 'bad') },
          h('strong', {}, right ? '✓ ' + t('correct') : given === '⏱' ? '⏱ ' + t('timeUp') : '✗ ' + t('wrong')),
          !right ? h('p', { dir: 'auto' }, h('span', { class: 'muted' }, t('correctAnswer') + ': '), item.type.answer(item.q, t)) : null,
          item.q.explanation ? h('p', { class: 'explanation', dir: 'auto' }, item.q.explanation) : null,
          h('div', { class: 'actions' }, next),
        ),
      );
      next.focus();
    };

    item.type.render(body, item.q, {
      t,
      asset: (p) => item.source.assetUrl(p),
      settings: item.settings,
      done,
      onKey: (fn) => (keyHandler = fn),
    });

    if (opts.timeLimit) {
      const fill = timeBar.firstChild as HTMLElement;
      const start = performance.now();
      fill.style.width = '100%';
      timer = window.setInterval(() => {
        const left = 1 - (performance.now() - start) / (opts.timeLimit * 1000);
        fill.style.width = `${Math.max(0, left) * 100}%`;
        fill.classList.toggle('low', left < 0.25);
        if (left <= 0) done(false, '⏱');
      }, 100);
    }
  };

  if (items.length === 0) finish(false);
  else show();
}
