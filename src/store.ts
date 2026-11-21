/**
 * All progress lives here. Today it is localStorage; to move to a database
 * later, keep these function signatures and change the bodies.
 */
import type { Lang } from './types';

export interface QStat {
  seen: number;
  wrong: number;
  /** Correct answers in a row since the last mistake. */
  streak: number;
  /** In the "practice mistakes" pool. */
  review: boolean;
  lastWrongAt?: number;
  lastAnswer?: string;
}

export interface GStat {
  best: number;
  stars: number;
  plays: number;
}

export interface User {
  xp: number;
  games: Record<string, GStat>;
  questions: Record<string, QStat>;
}

interface State {
  v: 1;
  current: string;
  users: Record<string, User>;
  uiLang: Lang;
  muted: boolean;
  customUrls: string[];
  theme?: Theme;
}

export type Theme = 'auto' | 'light' | 'dark';

const KEY = 'quizplay:v1';
const REVIEW_EXIT_STREAK = 2;

const emptyUser = (): User => ({ xp: 0, games: {}, questions: {} });

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (s && s.v === 1 && s.users) return s;
    }
  } catch {
    /* storage blocked or corrupt: start fresh */
  }
  const uiLang: Lang = 'he';
  const name = 'שחקן';
  return { v: 1, current: name, users: { [name]: emptyUser() }, uiLang, muted: false, customUrls: [], theme: 'auto' };
}

let state = load();

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore: progress just won't persist */
  }
}

export const qKey = (pid: string, gid: string, qid: string) => `${pid}/${gid}/${qid}`;
export const gKey = (pid: string, gid: string) => `${pid}/${gid}`;

export function user(): User {
  if (!state.users[state.current]) state.users[state.current] = emptyUser();
  return state.users[state.current];
}

export const currentName = () => state.current;
export const userNames = () => Object.keys(state.users);

export function switchUser(name: string): void {
  name = name.trim();
  if (!name) return;
  if (!state.users[name]) state.users[name] = emptyUser();
  state.current = name;
  save();
}

export function renameUser(from: string, to: string): void {
  to = to.trim();
  if (!to || from === to || state.users[to] || !state.users[from]) return;
  state.users[to] = state.users[from];
  delete state.users[from];
  if (state.current === from) state.current = to;
  save();
}

export function resetUser(): void {
  state.users[state.current] = emptyUser();
  save();
}

export function recordAnswer(pid: string, gid: string, qid: string, correct: boolean, given: string): void {
  const k = qKey(pid, gid, qid);
  const s = (user().questions[k] ??= { seen: 0, wrong: 0, streak: 0, review: false });
  s.seen++;
  if (correct) {
    s.streak++;
    if (s.review && s.streak >= REVIEW_EXIT_STREAK) s.review = false;
  } else {
    s.wrong++;
    s.streak = 0;
    s.review = true;
    s.lastWrongAt = Date.now();
    s.lastAnswer = given;
  }
  save();
}

export function recordGame(pid: string, gid: string, score: number, stars: number): { newBest: boolean } {
  const k = gKey(pid, gid);
  const g = (user().games[k] ??= { best: 0, stars: 0, plays: 0 });
  g.plays++;
  const newBest = score > g.best;
  g.best = Math.max(g.best, score);
  g.stars = Math.max(g.stars, stars);
  save();
  return { newBest };
}

export function addXp(n: number): void {
  user().xp += n;
  save();
}

export function gameStat(pid: string, gid: string): GStat | undefined {
  return user().games[gKey(pid, gid)];
}

export function questionStat(pid: string, gid: string, qid: string): QStat | undefined {
  return user().questions[qKey(pid, gid, qid)];
}

/** Every question of a project the user has ever got wrong. */
export function mistakes(pid: string): { gid: string; qid: string; stat: QStat }[] {
  const prefix = pid + '/';
  const out: { gid: string; qid: string; stat: QStat }[] = [];
  for (const [k, stat] of Object.entries(user().questions)) {
    if (!k.startsWith(prefix) || stat.wrong === 0) continue;
    const [gid, ...rest] = k.slice(prefix.length).split('/');
    out.push({ gid, qid: rest.join('/'), stat });
  }
  return out;
}

/** Level n starts at 100·(n−1)² XP. */
export function levelInfo(xp = user().xp): { level: number; progress: number; nextAt: number } {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const start = 100 * (level - 1) ** 2;
  const nextAt = 100 * level ** 2;
  return { level, progress: (xp - start) / (nextAt - start), nextAt };
}

export const uiLang = () => state.uiLang;
export function setUiLang(l: Lang): void {
  state.uiLang = l;
  save();
}

export const theme = (): Theme => state.theme ?? 'auto';
export function setTheme(th: Theme): void {
  state.theme = th;
  save();
}

export const muted = () => state.muted;
export function setMuted(m: boolean): void {
  state.muted = m;
  save();
}

export const customUrls = () => state.customUrls;
export function addCustomUrl(url: string): void {
  if (!state.customUrls.includes(url)) state.customUrls.push(url);
  save();
}
export function removeCustomUrl(url: string): void {
  state.customUrls = state.customUrls.filter((u) => u !== url);
  save();
}

export function exportJson(): string {
  return JSON.stringify({ app: 'quizplay', exportedAt: new Date().toISOString(), name: state.current, user: user() }, null, 2);
}

/** Imports one exported user, replacing the user with that name. */
export function importJson(text: string): string {
  const data = JSON.parse(text) as { app?: string; name?: string; user?: User };
  if (data.app !== 'quizplay' || !data.user || typeof data.name !== 'string') throw new Error('Not a quizplay export');
  const u = data.user;
  state.users[data.name] = { xp: Number(u.xp) || 0, games: u.games ?? {}, questions: u.questions ?? {} };
  state.current = data.name;
  save();
  return data.name;
}
