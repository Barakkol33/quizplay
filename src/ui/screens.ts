import { h, clear, shuffle } from '../dom';
import { t, setLang, getLang } from '../i18n';
import { confetti, sound } from '../effects';
import { playRound, type RoundItem, type RoundResult } from '../engine';
import { gameTypes } from '../games';
import * as store from '../store';
import * as projects from '../projects';
import type { Project } from '../types';

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
};

// ---------- shared pieces ----------

function topbar(...crumbs: { text: string; href?: string }[]): HTMLElement {
  const { level, progress } = store.levelInfo();
  return h(
    'header',
    { class: 'topbar' },
    h('a', { class: 'logo', href: link.home }, '🎯 ', t('appName')),
    h('nav', { class: 'crumbs' }, crumbs.map((c) => (c.href ? h('a', { href: c.href, dir: 'auto' }, c.text) : h('span', { dir: 'auto' }, c.text)))),
    h(
      'a',
      { class: 'user-chip', href: link.profile, title: t('profile') },
      h('span', { class: 'lvl' }, `${t('level')} ${level}`),
      h('span', { class: 'mini-bar' }, h('span', { style: `width:${Math.round(progress * 100)}%` })),
      h('span', { class: 'uname', dir: 'auto' }, store.currentName()),
    ),
  );
}

const starsText = (n: number) => '★'.repeat(n) + '☆'.repeat(3 - n);

function page(root: HTMLElement, header: HTMLElement, ...content: (Node | null)[]): void {
  clear(root).append(header, h('main', { class: 'main' }, ...content));
  window.scrollTo(0, 0);
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
  setLang(store.uiLang());
  const list = await projects.listProjects();
  const { level, nextAt } = store.levelInfo();
  page(
    root,
    topbar(),
    h('section', { class: 'hero' },
      h('h1', {}, t('tagline')),
      h('p', { class: 'muted' }, `${t('level')} ${level} · ${store.user().xp} / ${nextAt} ${t('xp')}`),
    ),
    h('h2', {}, t('projects')),
    h('div', { class: 'grid' },
      list.map((e) => {
        const reviewCount = store.mistakes(e.ref.id).filter((m) => m.stat.review).length;
        return h('a', { class: 'card-link', href: link.project(e.ref.id), lang: e.ref.lang, dir: e.ref.lang === 'he' ? 'rtl' : 'ltr' },
          h('strong', {}, e.ref.title),
          e.ref.description ? h('p', { class: 'muted' }, e.ref.description) : null,
          h('div', { class: 'tags' },
            h('span', { class: 'tag' }, e.ref.lang === 'he' ? 'עברית' : 'English'),
            e.origin !== 'builtin' ? h('span', { class: 'tag' }, e.origin === 'zip' ? 'zip' : 'URL') : null,
            reviewCount ? h('span', { class: 'tag warn' }, `${reviewCount} ✗`) : null,
          ),
        );
      }),
      h('a', { class: 'card-link dashed', href: link.load }, h('strong', {}, '＋ ' + t('loadProject')), h('p', { class: 'muted' }, t('loadProjectHint'))),
    ),
  );
}

// ---------- project ----------

export async function renderProject(root: HTMLElement, pid: string): Promise<void> {
  const { project: p } = await projects.getProject(pid);
  setLang(p.lang);
  const reviewCount = store.mistakes(pid).filter((m) => m.stat.review).length;
  page(
    root,
    topbar({ text: p.title }),
    h('section', { class: 'hero' },
      h('h1', { dir: 'auto' }, p.title),
      p.description ? h('p', { class: 'muted', dir: 'auto' }, p.description) : null,
      h('div', { class: 'actions' },
        h('a', { class: 'btn', href: link.mistakes(pid) }, `📝 ${t('myMistakes')}`, reviewCount ? h('span', { class: 'badge' }, String(reviewCount)) : null),
      ),
    ),
    h('h2', {}, t('subjects')),
    h('div', { class: 'grid' },
      p.subjects.map((s) => {
        const { got, max } = subjectStars(pid, p, s.id);
        return h('a', { class: 'card-link', href: link.subject(pid, s.id) },
          h('strong', { dir: 'auto' }, s.title),
          s.description ? h('p', { class: 'muted', dir: 'auto' }, s.description) : null,
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
  setLang(p.lang);
  const s = p.subjects.find((x) => x.id === sid);
  if (!s) throw new Error(`Unknown subject: ${sid}`);
  page(
    root,
    topbar({ text: p.title, href: link.project(pid) }, { text: s.title }),
    h('section', { class: 'hero' }, h('h1', { dir: 'auto' }, s.title), s.description ? h('p', { class: 'muted', dir: 'auto' }, s.description) : null),
    h('div', { class: 'list' },
      s.games.map((g) => {
        const type = gameTypes[g.type];
        const st = store.gameStat(pid, g.id);
        return h('a', { class: 'game-row', href: link.play(pid, g.id) },
          h('span', { class: 'game-icon' }, type?.icon ?? '❓'),
          h('span', { class: 'game-info' },
            h('strong', { dir: 'auto' }, g.title),
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
  setLang(p.lang);
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
    lives: settings.lives ?? 3,
    timeLimit: settings.timeLimit ?? 0,
    onFinish: (r) => {
      const { newBest } = store.recordGame(pid, gid, r.score, r.stars);
      store.addXp(r.score);
      results(root, r, {
        title: found.game.title,
        newBest,
        again: () => renderPlay(root, pid, gid),
        backHref: link.subject(pid, found.subject.id),
        pid,
      });
    },
  });
}

function results(
  root: HTMLElement,
  r: RoundResult,
  o: { title: string; newBest: boolean; again: () => void; backHref: string; pid: string },
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
      h('p', { class: 'muted', dir: 'auto' }, o.title),
      h('div', { class: 'big-stars' }, starsText(r.stars)),
      h('div', { class: 'result-stats' },
        h('div', {}, h('strong', {}, String(r.score)), h('span', { class: 'muted' }, t('score'))),
        h('div', {}, h('strong', {}, `${acc}%`), h('span', { class: 'muted' }, t('accuracy'))),
        h('div', {}, h('strong', {}, `${r.correct}/${r.total}`), h('span', { class: 'muted' }, t('questions'))),
      ),
      o.newBest && r.score > 0 ? h('p', { class: 'tag good' }, '🏆 Best!') : null,
      h('div', { class: 'actions center' },
        h('button', { class: 'btn primary', onclick: o.again }, '↻ ' + t('playAgain')),
        r.wrong.length ? h('a', { class: 'btn', href: link.review(o.pid) }, '📝 ' + t('reviewMistakes')) : null,
        h('a', { class: 'btn', href: o.backHref }, t('back')),
      ),
    ),
    r.wrong.length
      ? h('div', { class: 'list' },
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
  setLang(p.lang);
  const toReview = items.filter((i) => i.stat.review).length;
  page(
    root,
    topbar({ text: p.title, href: link.project(pid) }, { text: t('myMistakes') }),
    h('section', { class: 'hero' },
      h('h1', {}, '📝 ' + t('myMistakes')),
      h('p', { class: 'muted' }, t('reviewHint')),
      toReview ? h('a', { class: 'btn primary', href: link.review(pid) }, `${t('reviewMistakes')} (${toReview})`) : h('p', {}, t('noMistakes')),
    ),
    h('div', { class: 'list' },
      items.map((i) =>
        h('div', { class: 'mistake' + (i.stat.review ? '' : ' done') },
          h('div', { class: 'mistake-head' },
            h('span', { class: 'muted small', dir: 'auto' }, `${i.type.icon} ${i.gameTitle}`),
            h('span', { class: 'tag ' + (i.stat.review ? 'warn' : 'good') }, i.stat.review ? t('toReview') : t('mastered')),
          ),
          h('p', { dir: 'auto' }, h('strong', {}, i.type.prompt(i.q))),
          i.stat.lastAnswer && i.stat.lastAnswer !== '⏱'
            ? h('p', { class: 'small', dir: 'auto' }, h('span', { class: 'bad-text' }, `✗ ${t('yourAnswer')}: `), i.stat.lastAnswer)
            : null,
          h('p', { class: 'small', dir: 'auto' }, h('span', { class: 'good-text' }, `✓ ${t('correctAnswer')}: `), i.type.answer(i.q, t)),
          h('p', { class: 'muted small' }, `${t('timesWrong')}: ${i.stat.wrong}`),
        ),
      ),
    ),
  );
}

export async function renderReview(root: HTMLElement, pid: string): Promise<void> {
  const { entry, items } = await mistakeItems(pid);
  const p = entry.project;
  setLang(p.lang);
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
    onFinish: (r) => {
      store.addXp(r.score);
      results(root, r, { title: p.title, newBest: false, again: () => renderReview(root, pid), backHref: link.mistakes(pid), pid });
    },
  });
}

// ---------- load ----------

export async function renderLoad(root: HTMLElement): Promise<void> {
  setLang(store.uiLang());
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
  const fileInput = h('input', { type: 'file', accept: '.zip,application/zip' });
  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) projects.addFromZip(f).then(after, fail);
  });

  const saved = (await projects.listProjects()).filter((e) => e.origin === 'url');

  page(
    root,
    topbar({ text: t('loadProject') }),
    h('section', { class: 'hero' }, h('h1', {}, t('loadProject')), h('p', { class: 'muted' }, t('loadProjectHint'))),
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
    h('div', { class: 'panel' }, h('h3', {}, t('fromFile')), fileInput),
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

// ---------- profile ----------

export function renderProfile(root: HTMLElement): void {
  setLang(store.uiLang());
  const rerender = () => renderProfile(root);
  const nameInput = h('input', { class: 'text', dir: 'auto', placeholder: t('name') });
  const renameInput = h('input', { class: 'text', dir: 'auto', value: store.currentName() });
  const importInput = h('input', { type: 'file', accept: '.json,application/json' });
  const msg = h('p', { class: 'small', 'aria-live': 'polite' });
  importInput.addEventListener('change', async () => {
    const f = importInput.files?.[0];
    if (!f) return;
    try {
      store.importJson(await f.text());
      rerender();
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
  const { level, nextAt } = store.levelInfo();

  page(
    root,
    topbar({ text: t('profile') }),
    h('section', { class: 'hero' },
      h('h1', { dir: 'auto' }, store.currentName()),
      h('p', { class: 'muted' }, `${t('level')} ${level} · ${store.user().xp} / ${nextAt} ${t('xp')}`),
      h('form', {
        class: 'typein-row',
        onsubmit: (e: Event) => { e.preventDefault(); store.renameUser(store.currentName(), renameInput.value); rerender(); },
      }, renameInput, h('button', { class: 'btn', type: 'submit' }, '✎')),
    ),
    h('div', { class: 'panel' },
      h('h3', {}, t('users')),
      h('div', { class: 'list' },
        store.userNames().map((n) =>
          h('div', { class: 'game-row' },
            h('span', { class: 'game-info' }, h('strong', { dir: 'auto' }, n)),
            n === store.currentName()
              ? h('span', { class: 'tag good' }, t('current'))
              : h('button', { class: 'btn small', onclick: () => { store.switchUser(n); rerender(); } }, t('switchTo')),
          ),
        ),
      ),
      h('form', {
        class: 'typein-row',
        onsubmit: (e: Event) => { e.preventDefault(); store.switchUser(nameInput.value); rerender(); },
      }, nameInput, h('button', { class: 'btn primary', type: 'submit' }, t('add'))),
    ),
    h('div', { class: 'panel' },
      h('h3', {}, t('uiLanguage')),
      h('div', { class: 'actions' },
        h('button', { class: 'btn' + (store.uiLang() === 'he' ? ' primary' : ''), onclick: () => { store.setUiLang('he'); rerender(); } }, 'עברית'),
        h('button', { class: 'btn' + (store.uiLang() === 'en' ? ' primary' : ''), onclick: () => { store.setUiLang('en'); rerender(); } }, 'English'),
      ),
      h('h3', {}, t('sound')),
      h('button', { class: 'btn', onclick: () => { store.setMuted(!store.muted()); rerender(); } }, store.muted() ? '🔇 ' + t('off') : '🔊 ' + t('on')),
    ),
    h('div', { class: 'panel' },
      h('p', { class: 'muted small' }, t('progressNote')),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', onclick: exportProgress }, '⬇ ' + t('exportProgress')),
        h('label', { class: 'btn' }, '⬆ ' + t('importProgress'), importInput),
      ),
      msg,
      h('button', { class: 'btn danger', onclick: () => { if (confirm(t('confirmReset'))) { store.resetUser(); rerender(); } } }, t('resetUser')),
    ),
  );
}
