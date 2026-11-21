import { h, clear, shuffle } from '../dom';
import { t, setLang, getLang } from '../i18n';
import { confetti, sound } from '../effects';
import { playRound, type RoundItem, type RoundResult } from '../engine';
import { gameTypes } from '../games';
import * as store from '../store';
import * as projects from '../projects';
import type { GameRef, Lang, Project } from '../types';
import { AI_PROMPT, aboutContent } from './about';

const enc = encodeURIComponent;
export const link = {
  home: '#/',
  project: (pid: string) => `#/p/${enc(pid)}`,
  subject: (pid: string, sid: string) => `#/p/${enc(pid)}/s/${enc(sid)}`,
  play: (pid: string, gid: string) => `#/play/${enc(pid)}/${enc(gid)}`,
  mistakes: (pid: string) => `#/mistakes/${enc(pid)}`,
  review: (pid: string) => `#/review/${enc(pid)}`,
  load: '#/load',
  profile: '#/profile',
  mix: (pid: string, sid?: string) => `#/mix/${enc(pid)}${sid ? '/' + enc(sid) : ''}`,
  about: '#/about',
  aboutAi: '#/about/ai',
};

const dirOf = (l: Lang) => (l === 'he' ? 'rtl' : 'ltr');
const ACCENTS = 6;
const accent = (i: number) => `--accent: var(--c${(i % ACCENTS) + 1})`;
const DEFAULT_ICONS = ['📘', '🧩', '🧠', '🚀', '🎯', '💡', '🔬', '🌍'];

// ---------- theme & language ----------

export function applyTheme(): void {
  const th = store.theme();
  if (th === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = th;
}

/** Re-runs the router for the current hash. Set by main.ts. */
let rerender: () => void = () => {};
export function setRerender(fn: () => void): void {
  rerender = fn;
}

const THEME_ICON: Record<store.Theme, string> = { auto: '🌓', light: '☀️', dark: '🌙' };
const THEME_NEXT: Record<store.Theme, store.Theme> = { auto: 'light', light: 'dark', dark: 'auto' };
const THEME_LABEL: Record<store.Theme, 'themeAuto' | 'themeLight' | 'themeDark'> = { auto: 'themeAuto', light: 'themeLight', dark: 'themeDark' };

function controls(): HTMLElement {
  const soundBtn = h('button', { class: 'icon-pill sound-toggle', title: t('soundToggle'), 'aria-label': t('soundToggle'), 'aria-pressed': String(!store.muted()) }, store.muted() ? '🔇' : '🔊');
  soundBtn.addEventListener('click', () => {
    store.setMuted(!store.muted());
    soundBtn.textContent = store.muted() ? '🔇' : '🔊';
    soundBtn.setAttribute('aria-pressed', String(!store.muted()));
  });
  const themeBtn = h('button', { class: 'icon-pill theme-toggle', title: `${t('theme')}: ${t(THEME_LABEL[store.theme()])}` }, THEME_ICON[store.theme()]);
  themeBtn.addEventListener('click', () => {
    store.setTheme(THEME_NEXT[store.theme()]);
    applyTheme();
    themeBtn.textContent = THEME_ICON[store.theme()];
    themeBtn.title = `${t('theme')}: ${t(THEME_LABEL[store.theme()])}`;
  });
  const other: Lang = store.uiLang() === 'he' ? 'en' : 'he';
  const langBtn = h('button', {
    class: 'icon-pill lang-toggle',
    title: t('language'),
    lang: other,
    onclick: () => {
      store.setUiLang(other);
      rerender();
    },
  }, other === 'he' ? 'עב' : 'EN');
  return h('div', { class: 'controls' },
    h('a', { class: 'icon-pill', href: link.about, title: t('info'), 'aria-label': t('info') }, 'ℹ️'),
    soundBtn, themeBtn, langBtn);
}

// ---------- shared pieces ----------

function topbar(...crumbs: { text: string; href?: string }[]): HTMLElement {
  const { level, progress } = store.levelInfo();
  return h(
    'header',
    { class: 'topbar' },
    h('a', { class: 'logo', href: link.home }, h('span', { class: 'logo-mark' }, '🎯'), h('span', { class: 'logo-text' }, t('appName'))),
    h('nav', { class: 'crumbs' }, crumbs.map((c) => (c.href ? h('a', { href: c.href, dir: 'auto' }, c.text) : h('span', { dir: 'auto' }, c.text)))),
    controls(),
    h(
      'a',
      { class: 'user-chip', href: link.profile, title: t('profile') },
      h('span', { class: 'lvl' }, String(level)),
      h('span', { class: 'mini-bar' }, h('span', { style: `width:${Math.round(progress * 100)}%` })),
      h('span', { class: 'uname', dir: 'auto' }, store.currentName()),
    ),
  );
}

const starsText = (n: number) => '★'.repeat(n) + '☆'.repeat(3 - n);

function page(root: HTMLElement, header: HTMLElement, ...content: (Node | null)[]): void {
  setLang(store.uiLang());
  clear(root).append(header, h('main', { class: 'main' }, ...content));
  window.scrollTo(0, 0);
}

function banner(opts: { icon?: string; title: string; sub?: string; lang?: Lang; extra?: (Node | null)[]; i?: number }): HTMLElement {
  return h('section', { class: 'banner', style: opts.i != null ? accent(opts.i) : null },
    opts.icon ? h('span', { class: 'banner-icon' }, opts.icon) : null,
    h('div', { class: 'banner-text', lang: opts.lang, dir: opts.lang ? dirOf(opts.lang) : null },
      h('h1', { dir: 'auto' }, opts.title),
      opts.sub ? h('p', { dir: 'auto' }, opts.sub) : null,
    ),
    opts.extra?.length ? h('div', { class: 'banner-actions' }, ...opts.extra) : null,
  );
}

export function renderError(root: HTMLElement, err: unknown): void {
  page(root, topbar(), h('div', { class: 'panel bad' }, h('strong', {}, t('error')), h('p', { dir: 'auto' }, String((err as Error)?.message ?? err))), h('a', { class: 'btn', href: link.home }, t('home')));
}

export function renderLoading(root: HTMLElement): void {
  clear(root).append(h('p', { class: 'loading' }, t('loading')));
}

function subjectStars(pid: string, p: Project, sid: string): { got: number; max: number } {
  const s = p.subjects.find((x) => x.id === sid)!;
  const got = s.games.reduce((sum, g) => sum + (store.gameStat(pid, g.id)?.stars ?? 0), 0);
  return { got, max: s.games.length * 3 };
}

// ---------- home ----------

export async function renderHome(root: HTMLElement): Promise<void> {
  const list = await projects.listProjects();
  const { level, nextAt, progress } = store.levelInfo();
  page(
    root,
    topbar(),
    banner({
      icon: '🎯',
      title: t('tagline'),
      sub: `${t('level')} ${level} · ${store.user().xp} / ${nextAt} ${t('xp')}`,
      extra: [h('div', { class: 'xp-bar' }, h('span', { style: `width:${Math.round(progress * 100)}%` }))],
    }),
    h('h2', {}, t('projects')),
    h('div', { class: 'grid' },
      list.map((e, i) => {
        const reviewCount = store.mistakes(e.ref.id).filter((m) => m.stat.review).length;
        return h('a', { class: 'card-link', href: link.project(e.ref.id), style: accent(i) },
          h('span', { class: 'card-icon' }, e.ref.icon ?? DEFAULT_ICONS[i % DEFAULT_ICONS.length]),
          h('strong', { lang: e.ref.lang, dir: 'auto' }, e.ref.title),
          e.ref.description ? h('p', { class: 'muted', lang: e.ref.lang, dir: 'auto' }, e.ref.description) : null,
          h('div', { class: 'tags' },
            h('span', { class: 'tag' }, e.ref.lang === 'he' ? 'עברית' : 'English'),
            e.origin !== 'builtin' ? h('span', { class: 'tag' }, e.origin === 'zip' ? 'file' : 'URL') : null,
            reviewCount ? h('span', { class: 'tag warn' }, `${reviewCount} ✗`) : null,
          ),
        );
      }),
      h('a', { class: 'card-link dashed', href: link.load }, h('span', { class: 'card-icon plain' }, '＋'), h('strong', {}, t('loadProject')), h('p', { class: 'muted' }, t('loadProjectHint'))),
      h('a', { class: 'card-link dashed', href: link.aboutAi }, h('span', { class: 'card-icon plain' }, '✨'), h('strong', {}, t('makeProject')), h('p', { class: 'muted' }, aboutContent[getLang()].promptSteps[1])),
    ),
  );
}

// ---------- project ----------

export async function renderProject(root: HTMLElement, pid: string): Promise<void> {
  const { project: p } = await projects.getProject(pid);
  const reviewCount = store.mistakes(pid).filter((m) => m.stat.review).length;
  page(
    root,
    topbar({ text: p.title }),
    banner({
      icon: p.icon,
      title: p.title,
      sub: p.description,
      lang: p.lang,
      extra: [
        h('a', { class: 'btn on-banner', href: link.mix(pid), title: t('mixedHint') }, '🔀 ' + t('mixedPractice')),
        h('a', { class: 'btn on-banner', href: link.mistakes(pid) }, `📝 ${t('myMistakes')}`, reviewCount ? h('span', { class: 'badge' }, String(reviewCount)) : null),
      ],
    }),
    h('h2', {}, t('subjects')),
    h('div', { class: 'grid' },
      p.subjects.map((s, i) => {
        const { got, max } = subjectStars(pid, p, s.id);
        return h('a', { class: 'card-link', href: link.subject(pid, s.id), style: accent(i) },
          h('span', { class: 'card-icon' }, s.icon ?? DEFAULT_ICONS[i % DEFAULT_ICONS.length]),
          h('strong', { lang: p.lang, dir: 'auto' }, s.title),
          s.description ? h('p', { class: 'muted', lang: p.lang, dir: 'auto' }, s.description) : null,
          h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: `width:${max ? (got / max) * 100 : 0}%` })),
          h('p', { class: 'muted small' }, `${s.games.length} ${t('games')} · ★ ${got}/${max}`),
        );
      }),
    ),
  );
}

// ---------- subject ----------

export async function renderSubject(root: HTMLElement, pid: string, sid: string): Promise<void> {
  const { project: p } = await projects.getProject(pid);
  const si = p.subjects.findIndex((x) => x.id === sid);
  const s = p.subjects[si];
  if (!s) throw new Error(`Unknown subject: ${sid}`);
  page(
    root,
    topbar({ text: p.title, href: link.project(pid) }, { text: s.title }),
    banner({
      icon: s.icon ?? DEFAULT_ICONS[si % DEFAULT_ICONS.length], title: s.title, sub: s.description, lang: p.lang, i: si,
      extra: s.games.filter((g) => !gameTypes[g.type]?.passive).length > 1
        ? [h('a', { class: 'btn on-banner', href: link.mix(pid, sid), title: t('mixedHint') }, '🔀 ' + t('mixedPractice'))]
        : [],
    }),
    h('div', { class: 'list' },
      s.games.map((g, i) => {
        const type = gameTypes[g.type];
        const st = store.gameStat(pid, g.id);
        return h('a', { class: 'game-row', href: link.play(pid, g.id), style: accent(si + i) },
          h('span', { class: 'game-icon' }, type?.icon ?? '❓'),
          h('span', { class: 'game-info' },
            h('strong', { lang: p.lang, dir: 'auto' }, g.title),
            h('span', { class: 'muted small' }, type ? type.label[getLang()] : g.type, st ? ` · ${t('score')} ${st.best}` : ''),
          ),
          h('span', { class: 'stars' + (st?.stars ? '' : ' dim') }, starsText(st?.stars ?? 0)),
          h('span', { class: 'btn primary small' }, t('play')),
        );
      }),
    ),
  );
}

// ---------- play ----------

export async function renderPlay(root: HTMLElement, pid: string, gid: string): Promise<void> {
  const entry = await projects.getProject(pid);
  const p = entry.project;
  const found = projects.findGame(p, gid);
  if (!found) throw new Error(`Unknown game: ${gid}`);
  const data = await projects.getGame(pid, gid);
  const type = gameTypes[data.type];
  const settings = data.settings ?? {};
  let qs = settings.shuffle === false ? data.questions : shuffle(data.questions);
  if (settings.count) qs = qs.slice(0, settings.count);
  const items: RoundItem[] = qs.map((q) => ({ pid, gid, q, type, source: entry.source, settings }));

  const shell = h('div', {});
  page(root, topbar({ text: p.title, href: link.project(pid) }, { text: found.subject.title, href: link.subject(pid, found.subject.id) }, { text: found.game.title }), shell);
  playRound(shell, items, {
    title: data.title ?? found.game.title,
    instructions: data.instructions,
    lives: type.passive ? 0 : settings.lives ?? 3,
    timeLimit: type.passive ? 0 : settings.timeLimit ?? 0,
    lang: p.lang,
    onFinish: (r) => {
      const next = nextGame(p, gid);
      const nextHref = next ? link.play(pid, next.id) : undefined;
      if (type.passive) {
        store.recordGame(pid, gid, 0, 3);
        store.addXp(10);
        lessonDone(root, { title: found.game.title, nextHref, nextTitle: next?.title, backHref: link.subject(pid, found.subject.id), again: () => renderPlay(root, pid, gid), lang: p.lang });
        return;
      }
      const { newBest } = store.recordGame(pid, gid, r.score, r.stars);
      store.addXp(r.score);
      results(root, r, {
        nextHref,
        title: found.game.title,
        newBest,
        again: () => renderPlay(root, pid, gid),
        backHref: link.subject(pid, found.subject.id),
        pid,
        lang: p.lang,
      });
    },
  });
}

/** The game after this one: next in its subject, else the first game of the next subject. */
function nextGame(p: Project, gid: string): GameRef | undefined {
  const all = p.subjects.flatMap((s) => s.games);
  return all[all.findIndex((g) => g.id === gid) + 1];
}

function lessonDone(root: HTMLElement, o: { title: string; nextHref?: string; nextTitle?: string; backHref: string; again: () => void; lang: Lang }): void {
  sound('win');
  page(
    root,
    topbar(),
    h('section', { class: 'results' },
      h('div', { class: 'big-emoji' }, '📖✓'),
      h('h1', {}, t('lessonDone')),
      h('p', { class: 'muted', lang: o.lang, dir: 'auto' }, o.title),
      h('p', {}, t('lessonDoneHint')),
      h('div', { class: 'actions center' },
        o.nextHref ? h('a', { class: 'btn primary', href: o.nextHref }, t('nextGame') + ': ', h('span', { lang: o.lang, dir: 'auto' }, o.nextTitle ?? ''), ' →') : null,
        h('button', { class: 'btn', onclick: o.again }, '↻ ' + t('playAgain')),
        h('a', { class: 'btn', href: o.backHref }, t('back')),
      ),
    ),
  );
}

function results(
  root: HTMLElement,
  r: RoundResult,
  o: { title: string; newBest: boolean; again: () => void; backHref: string; pid: string; lang: Lang; nextHref?: string },
): void {
  const acc = r.answered ? Math.round((r.correct / r.answered) * 100) : 0;
  if (r.stars > 0) {
    confetti();
    sound('win');
  } else sound('lose');
  page(
    root,
    topbar(),
    h('section', { class: 'results' },
      h('h1', {}, r.gameOver ? '💔 ' + t('gameOver') : '🏁 ' + t('roundOver')),
      h('p', { class: 'muted', lang: o.lang, dir: 'auto' }, o.title),
      h('div', { class: 'big-stars' }, starsText(r.stars)),
      h('div', { class: 'result-stats' },
        h('div', {}, h('strong', {}, String(r.score)), h('span', { class: 'muted' }, t('score'))),
        h('div', {}, h('strong', {}, `${acc}%`), h('span', { class: 'muted' }, t('accuracy'))),
        h('div', {}, h('strong', {}, `${r.correct}/${r.total}`), h('span', { class: 'muted' }, t('questions'))),
      ),
      o.newBest && r.score > 0 ? h('p', { class: 'tag good' }, '🏆 Best!') : null,
      h('div', { class: 'actions center' },
        o.nextHref && r.stars > 0 ? h('a', { class: 'btn primary', href: o.nextHref }, t('nextGame') + ' →') : null,
        h('button', { class: 'btn' + (o.nextHref && r.stars > 0 ? '' : ' primary'), onclick: o.again }, '↻ ' + t('playAgain')),
        r.wrong.length ? h('a', { class: 'btn', href: link.review(o.pid) }, '📝 ' + t('reviewMistakes')) : null,
        h('a', { class: 'btn', href: o.backHref }, t('back')),
      ),
    ),
    r.wrong.length
      ? h('div', { class: 'list', lang: o.lang, dir: dirOf(o.lang) },
          r.wrong.map(({ item, given }) =>
            h('div', { class: 'mistake' },
              h('p', { dir: 'auto' }, h('strong', {}, item.type.prompt(item.q))),
              given && given !== '⏱' ? h('p', { class: 'small', dir: 'auto' }, h('span', { class: 'bad-text' }, '✗ '), given) : null,
              h('p', { class: 'small', dir: 'auto' }, h('span', { class: 'good-text' }, '✓ '), item.type.answer(item.q, t)),
              item.q.explanation ? h('p', { class: 'small muted', dir: 'auto' }, item.q.explanation) : null,
            ),
          ),
        )
      : null,
  );
}

// ---------- mistakes ----------

async function mistakeItems(pid: string) {
  const entry = await projects.getProject(pid);
  const out: (RoundItem & { stat: store.QStat; gameTitle: string })[] = [];
  for (const m of store.mistakes(pid)) {
    const found = projects.findGame(entry.project, m.gid);
    if (!found) continue;
    let data;
    try {
      data = await projects.getGame(pid, m.gid);
    } catch {
      continue;
    }
    const q = data.questions.find((x) => x.id === m.qid);
    if (!q) continue;
    out.push({ pid, gid: m.gid, q, type: gameTypes[data.type], source: entry.source, settings: data.settings ?? {}, stat: m.stat, gameTitle: found.game.title });
  }
  return { entry, items: out.sort((a, b) => Number(b.stat.review) - Number(a.stat.review) || b.stat.wrong - a.stat.wrong) };
}

export async function renderMistakes(root: HTMLElement, pid: string): Promise<void> {
  const { entry, items } = await mistakeItems(pid);
  const p = entry.project;
  const toReview = items.filter((i) => i.stat.review).length;
  page(
    root,
    topbar({ text: p.title, href: link.project(pid) }, { text: t('myMistakes') }),
    banner({
      icon: '📝',
      title: t('myMistakes'),
      sub: t('reviewHint'),
      i: 4,
      extra: [toReview ? h('a', { class: 'btn on-banner', href: link.review(pid) }, `${t('reviewMistakes')} (${toReview})`) : h('p', {}, t('noMistakes'))],
    }),
    h('div', { class: 'list' },
      items.map((i) =>
        h('div', { class: 'mistake' + (i.stat.review ? '' : ' done') },
          h('div', { class: 'mistake-head' },
            h('span', { class: 'muted small', dir: 'auto' }, `${i.type.icon} ${i.gameTitle}`),
            h('span', { class: 'tag ' + (i.stat.review ? 'warn' : 'good') }, i.stat.review ? t('toReview') : t('mastered')),
          ),
          h('div', { lang: p.lang, dir: dirOf(p.lang) },
            h('p', { dir: 'auto' }, h('strong', {}, i.type.prompt(i.q))),
            i.stat.lastAnswer && i.stat.lastAnswer !== '⏱'
              ? h('p', { class: 'small', dir: 'auto' }, h('span', { class: 'bad-text' }, '✗ '), i.stat.lastAnswer)
              : null,
            h('p', { class: 'small', dir: 'auto' }, h('span', { class: 'good-text' }, '✓ '), i.type.answer(i.q, t)),
          ),
          h('p', { class: 'muted small' }, `${t('timesWrong')}: ${i.stat.wrong}`),
        ),
      ),
    ),
  );
}

export async function renderReview(root: HTMLElement, pid: string): Promise<void> {
  const { entry, items } = await mistakeItems(pid);
  const p = entry.project;
  const pool = shuffle(items.filter((i) => i.stat.review)).slice(0, 20);
  const shell = h('div', {});
  page(root, topbar({ text: p.title, href: link.project(pid) }, { text: t('reviewMistakes') }), shell);
  if (!pool.length) {
    shell.append(h('p', {}, t('noMistakes')), h('a', { class: 'btn', href: link.project(pid) }, t('back')));
    return;
  }
  playRound(shell, pool, {
    title: t('reviewMistakes'),
    lives: 0,
    timeLimit: 0,
    lang: p.lang,
    onFinish: (r) => {
      store.addXp(r.score);
      results(root, r, { title: p.title, newBest: false, again: () => renderReview(root, pid), backHref: link.mistakes(pid), pid, lang: p.lang });
    },
  });
}

// ---------- mixed practice (interleaving) ----------

export async function renderMixed(root: HTMLElement, pid: string, sid?: string): Promise<void> {
  const entry = await projects.getProject(pid);
  const p = entry.project;
  const subjects = sid ? p.subjects.filter((s) => s.id === sid) : p.subjects;
  if (!subjects.length) throw new Error(`Unknown subject: ${sid}`);
  const pool: (RoundItem & { rank: number })[] = [];
  for (const s of subjects) {
    for (const g of s.games) {
      const type = gameTypes[g.type];
      if (!type || type.passive) continue;
      const data = await projects.getGame(pid, g.id);
      for (const q of data.questions) {
        const st = store.questionStat(pid, g.id, q.id);
        // 0 = in mistakes, 1 = never seen, 2 = seen; random within a rank
        const rank = (st?.review ? 0 : !st ? 1 : 2) + Math.random();
        pool.push({ pid, gid: g.id, q, type, source: entry.source, settings: { ...data.settings, timeLimit: 0 }, rank });
      }
    }
  }
  const picked = shuffle(pool.sort((a, b) => a.rank - b.rank).slice(0, 15));
  const shell = h('div', {});
  const subj = sid ? subjects[0] : undefined;
  page(root, topbar({ text: p.title, href: link.project(pid) }, ...(subj ? [{ text: subj.title, href: link.subject(pid, subj.id) }] : []), { text: t('mixedPractice') }), shell);
  playRound(shell, picked, {
    title: '🔀 ' + t('mixedPractice'),
    instructions: t('mixedHint'),
    lives: 3,
    timeLimit: 0,
    lang: p.lang,
    onFinish: (r) => {
      store.addXp(r.score);
      results(root, r, { title: subj?.title ?? p.title, newBest: false, again: () => renderMixed(root, pid, sid), backHref: subj ? link.subject(pid, subj.id) : link.project(pid), pid, lang: p.lang });
    },
  });
}

// ---------- load ----------

export async function renderLoad(root: HTMLElement): Promise<void> {
  const status = h('div', { class: 'load-status', 'aria-live': 'polite' });

  const after = async (entry: projects.Entry) => {
    status.replaceChildren(h('p', {}, t('loading')));
    const problems = await projects.checkProject(entry.ref.id);
    status.replaceChildren(
      h('div', { class: 'panel ' + (problems.length ? 'bad' : 'ok') },
        h('p', {}, h('strong', {}, `${t('loaded')}: `), h('span', { dir: 'auto' }, entry.ref.title)),
        problems.length
          ? [h('p', {}, t('problems') + ':'), h('ul', { class: 'problems' }, problems.map((x) => h('li', { dir: 'ltr' }, x)))]
          : h('p', {}, '✓ ' + t('noProblems')),
        h('a', { class: 'btn primary', href: link.project(entry.ref.id) }, t('play') + ' →'),
      ),
    );
  };
  const fail = (e: unknown) => status.replaceChildren(h('div', { class: 'panel bad' }, `${t('error')}: ${(e as Error).message}`));

  const urlInput = h('input', { class: 'text', type: 'url', dir: 'ltr', placeholder: 'https://…/my-project/' });
  const fileInput = h('input', { type: 'file', accept: '.zip,.json,application/zip,application/json' });
  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) projects.addFromFile(f).then(after, fail);
  });

  const saved = (await projects.listProjects()).filter((e) => e.origin === 'url');

  page(
    root,
    topbar({ text: t('loadProject') }),
    banner({ icon: '📦', title: t('loadProject'), sub: t('loadProjectHint'), i: 1, extra: [h('a', { class: 'btn on-banner', href: link.aboutAi }, '✨ ' + t('makeProject'))] }),
    h('div', { class: 'panel' }, h('h3', {}, t('fromFile')), h('label', { class: 'btn primary file-btn' }, '⬆ ' + t('fromFile'), fileInput)),
    h('div', { class: 'panel' },
      h('h3', {}, t('fromUrl')),
      h('p', { class: 'muted small' }, t('fromUrlHint')),
      h('form', {
        class: 'typein-row',
        onsubmit: (e: Event) => {
          e.preventDefault();
          if (urlInput.value.trim()) projects.addFromUrl(urlInput.value.trim()).then(after, fail);
        },
      }, urlInput, h('button', { class: 'btn primary', type: 'submit' }, t('load'))),
    ),
    status,
    saved.length
      ? h('div', { class: 'list' },
          saved.map((e) =>
            h('div', { class: 'game-row' },
              h('span', { class: 'game-info' }, h('strong', { dir: 'auto' }, e.ref.title), h('span', { class: 'muted small', dir: 'ltr' }, e.url ?? '')),
              h('button', { class: 'btn small', onclick: () => { projects.removeProject(e.ref.id); renderLoad(root); } }, '✕'),
            ),
          ),
        )
      : null,
  );
}

// ---------- about ----------

export function renderAbout(root: HTMLElement, toAi = false): void {
  const c = aboutContent[store.uiLang()];
  const copyBtn = h('button', { class: 'btn primary copy-prompt' }, '📋 ' + t('copy'));
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
    } catch {
      const r = document.createRange();
      r.selectNodeContents(pre);
      getSelection()?.removeAllRanges();
      getSelection()?.addRange(r);
      document.execCommand('copy');
    }
    copyBtn.textContent = '✓ ' + t('copied');
    setTimeout(() => (copyBtn.textContent = '📋 ' + t('copy')), 2000);
  });
  const pre = h('pre', { class: 'prompt', dir: 'ltr', lang: 'en', tabindex: '0' }, AI_PROMPT);

  page(
    root,
    topbar({ text: t('info') }),
    banner({ icon: 'ℹ️', title: t('appName'), sub: c.intro, i: 2 }),
    ...c.sections.map((s, i) =>
      h('section', { class: 'panel info', style: accent(i) },
        h('h2', {}, s.title),
        s.body.map((b) => (Array.isArray(b) ? h('ul', {}, b.map((x) => h('li', {}, x))) : h('p', {}, b))),
      ),
    ),
    h('section', { class: 'panel info ai', id: 'ai', style: accent(5) },
      h('h2', {}, '✨ ' + c.promptTitle),
      h('ol', {}, c.promptSteps.map((x) => h('li', {}, x))),
      h('div', { class: 'prompt-head' }, h('strong', {}, 'Prompt'), copyBtn),
      pre,
      h('div', { class: 'actions' }, h('a', { class: 'btn', href: link.load }, '📦 ' + t('loadProject'))),
    ),
  );
  if (toAi) setTimeout(() => document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' }), 50);
}

// ---------- profile ----------

export function renderProfile(root: HTMLElement): void {
  const re = () => rerender();
  const nameInput = h('input', { class: 'text', dir: 'auto', placeholder: t('name') });
  const renameInput = h('input', { class: 'text', dir: 'auto', value: store.currentName() });
  const importInput = h('input', { type: 'file', accept: '.json,application/json' });
  const msg = h('p', { class: 'small', 'aria-live': 'polite' });
  importInput.addEventListener('change', async () => {
    const f = importInput.files?.[0];
    if (!f) return;
    try {
      store.importJson(await f.text());
      re();
    } catch (e) {
      msg.textContent = `${t('error')}: ${(e as Error).message}`;
    }
  });
  const exportProgress = () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `quizplay-${store.currentName()}.json` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const { level, nextAt, progress } = store.levelInfo();
  const seg = <T extends string>(current: T, options: [T, string][], set: (v: T) => void) =>
    h('div', { class: 'segmented' },
      options.map(([v, label]) => h('button', { class: v === current ? 'active' : '', 'aria-pressed': String(v === current), onclick: () => { set(v); re(); } }, label)));

  page(
    root,
    topbar({ text: t('profile') }),
    banner({
      icon: '🧑‍🎓',
      title: store.currentName(),
      sub: `${t('level')} ${level} · ${store.user().xp} / ${nextAt} ${t('xp')}`,
      i: 3,
      extra: [h('div', { class: 'xp-bar' }, h('span', { style: `width:${Math.round(progress * 100)}%` }))],
    }),
    h('div', { class: 'panel' },
      h('h3', {}, t('name')),
      h('form', {
        class: 'typein-row',
        onsubmit: (e: Event) => { e.preventDefault(); store.renameUser(store.currentName(), renameInput.value); re(); },
      }, renameInput, h('button', { class: 'btn', type: 'submit' }, '✎')),
    ),
    h('div', { class: 'panel settings' },
      h('div', { class: 'setting' }, h('h3', {}, t('uiLanguage')), seg<Lang>(store.uiLang(), [['he', 'עברית'], ['en', 'English']], store.setUiLang)),
      h('div', { class: 'setting' }, h('h3', {}, t('theme')),
        seg<store.Theme>(store.theme(), [['auto', '🌓 ' + t('themeAuto')], ['light', '☀️ ' + t('themeLight')], ['dark', '🌙 ' + t('themeDark')]], (v) => { store.setTheme(v); applyTheme(); })),
      h('div', { class: 'setting' }, h('h3', {}, t('sound')),
        seg<'on' | 'off'>(store.muted() ? 'off' : 'on', [['on', '🔊 ' + t('on')], ['off', '🔇 ' + t('off')]], (v) => store.setMuted(v === 'off'))),
    ),
    h('div', { class: 'panel' },
      h('h3', {}, t('users')),
      h('div', { class: 'list' },
        store.userNames().map((n) =>
          h('div', { class: 'game-row' },
            h('span', { class: 'game-info' }, h('strong', { dir: 'auto' }, n)),
            n === store.currentName()
              ? h('span', { class: 'tag good' }, t('current'))
              : h('button', { class: 'btn small', onclick: () => { store.switchUser(n); re(); } }, t('switchTo')),
          ),
        ),
      ),
      h('form', {
        class: 'typein-row',
        onsubmit: (e: Event) => { e.preventDefault(); store.switchUser(nameInput.value); re(); },
      }, nameInput, h('button', { class: 'btn primary', type: 'submit' }, t('add'))),
    ),
    h('div', { class: 'panel' },
      h('p', { class: 'muted small' }, t('progressNote')),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', onclick: exportProgress }, '⬇ ' + t('exportProgress')),
        h('label', { class: 'btn' }, '⬆ ' + t('importProgress'), importInput),
      ),
      msg,
      h('button', { class: 'btn danger', onclick: () => { if (confirm(t('confirmReset'))) { store.resetUser(); re(); } } }, t('resetUser')),
    ),
  );
}
