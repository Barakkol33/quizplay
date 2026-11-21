import type { GameData, GameRef, Project, ProjectRef, Subject } from './types';
import { jsonSource, urlSource, zipSource, type Source } from './source';
import { gameTypes } from './games';
import * as store from './store';

export interface Entry {
  ref: ProjectRef;
  source: Source;
  origin: 'builtin' | 'url' | 'zip';
  url?: string;
  project?: Project;
  games: Map<string, GameData>;
}

const registry = new Map<string, Entry>();
let indexLoaded: Promise<void> | null = null;

const projectsBase = () => import.meta.env.BASE_URL + 'projects/';

async function loadBuiltins(): Promise<void> {
  const res = await fetch(projectsBase() + 'index.json');
  if (!res.ok) throw new Error(`projects/index.json: ${res.status}`);
  const refs = (await res.json()) as ProjectRef[];
  for (const ref of refs) {
    registry.set(ref.id, { ref, source: urlSource(projectsBase() + ref.path), origin: 'builtin', games: new Map() });
  }
  for (const url of store.customUrls()) {
    try {
      await addFromUrl(url, false);
    } catch (e) {
      console.warn('Could not load saved project', url, e);
    }
  }
}

export async function listProjects(): Promise<Entry[]> {
  indexLoaded ??= loadBuiltins();
  await indexLoaded;
  return [...registry.values()];
}

export async function getProject(pid: string): Promise<Entry & { project: Project }> {
  await listProjects();
  const e = registry.get(pid);
  if (!e) throw new Error(`Unknown project: ${pid}`);
  e.project ??= await e.source.readJson<Project>('project.json');
  return e as Entry & { project: Project };
}

export function findGame(p: Project, gid: string): { subject: Subject; game: GameRef } | undefined {
  for (const subject of p.subjects) {
    const game = subject.games.find((g) => g.id === gid);
    if (game) return { subject, game };
  }
  return undefined;
}

export async function getGame(pid: string, gid: string): Promise<GameData> {
  const e = await getProject(pid);
  const cached = e.games.get(gid);
  if (cached) return cached;
  const found = findGame(e.project, gid);
  if (!found) throw new Error(`Unknown game: ${gid}`);
  const data = await readGame(e.source, found.game);
  const type = gameTypes[data.type];
  if (!type) throw new Error(`Unknown game type: ${data.type}`);
  data.questions = (data.questions ?? []).filter((q) => {
    const problem = q?.id ? type.check(q) : 'missing id';
    if (problem) console.warn(`${gid}/${q?.id}: ${problem}`);
    return !problem;
  });
  e.games.set(gid, data);
  return data;
}

/** A game is either inline in project.json or in its own file. */
async function readGame(source: Source, g: GameRef): Promise<GameData> {
  if (Array.isArray(g.questions)) {
    return { type: g.type, title: g.title, instructions: g.instructions, settings: g.settings, questions: g.questions };
  }
  if (!g.file) throw new Error(`${g.id}: needs "file" or inline "questions"`);
  const data = await source.readJson<GameData>(g.file);
  data.type ??= g.type;
  return data;
}

function register(project: Project, source: Source, origin: Entry['origin'], url?: string): Entry {
  if (!project?.id || !Array.isArray(project.subjects)) throw new Error('project.json needs "id" and "subjects"');
  const ref: ProjectRef = { id: project.id, title: project.title, lang: project.lang, path: '', description: project.description, icon: project.icon };
  const entry: Entry = { ref, source, origin, url, project, games: new Map() };
  registry.set(project.id, entry);
  return entry;
}

export async function addFromUrl(url: string, remember = true): Promise<Entry> {
  const base = url.replace(/project\.json(\?.*)?$/, '');
  const source = urlSource(base);
  const project = await source.readJson<Project>('project.json');
  const entry = register(project, source, 'url', base);
  if (remember) store.addCustomUrl(base);
  return entry;
}

/** A .zip of the project folder, or a single project.json with the games inline. */
export async function addFromFile(file: File): Promise<Entry> {
  if (file.name.toLowerCase().endsWith('.json')) {
    const project = JSON.parse(await file.text()) as Project;
    return register(project, jsonSource(project), 'zip');
  }
  const source = await zipSource(file);
  const project = await source.readJson<Project>('project.json');
  return register(project, source, 'zip');
}

export function removeProject(pid: string): void {
  const e = registry.get(pid);
  if (!e || e.origin === 'builtin') return;
  if (e.url) store.removeCustomUrl(e.url);
  registry.delete(pid);
}

/** Loads every game of a project and lists the problems found. */
export async function checkProject(pid: string): Promise<string[]> {
  const e = await getProject(pid);
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const s of e.project.subjects) {
    for (const g of s.games ?? []) {
      if (seen.has(g.id)) problems.push(`Duplicate game id: ${g.id}`);
      seen.add(g.id);
      if (!gameTypes[g.type]) problems.push(`${g.id}: unknown type "${g.type}"`);
      const where = g.file ?? g.id;
      try {
        const data = await readGame(e.source, g);
        const type = gameTypes[data.type ?? g.type];
        const ids = new Set<string>();
        for (const q of data.questions ?? []) {
          if (!q.id) problems.push(`${where}: a question has no id`);
          else if (ids.has(q.id)) problems.push(`${where}: duplicate question id ${q.id}`);
          ids.add(q.id);
          const p = type?.check(q);
          if (p) problems.push(`${where} / ${q.id}: ${p}`);
        }
        if (!data.questions?.length) problems.push(`${where}: no questions`);
      } catch (err) {
        problems.push(`${where}: ${(err as Error).message}`);
      }
    }
  }
  return problems;
}
