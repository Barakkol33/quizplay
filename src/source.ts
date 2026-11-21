/** Where a project's files come from: a URL (the repo, or anywhere) or an uploaded zip. */
import JSZip from 'jszip';

export interface Source {
  readJson<T>(path: string): Promise<T>;
  assetUrl(path: string): string;
}

const clean = (p: string) => p.replace(/^\.?\//, '');

export function urlSource(base: string): Source {
  const baseUrl = new URL(base.endsWith('/') ? base : base + '/', location.href);
  return {
    async readJson<T>(path: string): Promise<T> {
      const res = await fetch(new URL(clean(path), baseUrl));
      if (!res.ok) throw new Error(`${res.status} ${path}`);
      return (await res.json()) as T;
    },
    assetUrl: (path) => (/^(https?:|data:)/.test(path) ? path : new URL(clean(path), baseUrl).href),
  };
}

/** A whole project in one JSON file (games inline). */
export function jsonSource(project: unknown): Source {
  return {
    async readJson<T>(path: string): Promise<T> {
      if (clean(path) === 'project.json') return project as T;
      throw new Error(`Single-file project has no ${path}: put the game's questions inline`);
    },
    assetUrl: (path) => (/^(https?:|data:)/.test(path) ? path : ''),
  };
}

const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml', mp3: 'audio/mpeg', ogg: 'audio/ogg',
};

/** The zip may hold project.json at its root or inside one folder. */
export async function zipSource(file: Blob): Promise<Source> {
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir && !n.startsWith('__MACOSX/'));
  const projectFile = names
    .filter((n) => n === 'project.json' || n.endsWith('/project.json'))
    .sort((a, b) => a.split('/').length - b.split('/').length)[0];
  if (!projectFile) throw new Error('project.json not found in the zip');
  const prefix = projectFile.slice(0, -'project.json'.length);

  const texts = new Map<string, string>();
  const blobs = new Map<string, string>();
  for (const n of names) {
    if (!n.startsWith(prefix)) continue;
    const rel = n.slice(prefix.length);
    const ext = rel.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'json') texts.set(rel, await zip.files[n].async('string'));
    else {
      const blob = await zip.files[n].async('blob');
      blobs.set(rel, URL.createObjectURL(new Blob([blob], { type: MIME[ext] ?? 'application/octet-stream' })));
    }
  }
  return {
    async readJson<T>(path: string): Promise<T> {
      const text = texts.get(clean(path));
      if (text == null) throw new Error(`Missing in zip: ${path}`);
      return JSON.parse(text) as T;
    },
    assetUrl: (path) => (/^(https?:|data:)/.test(path) ? path : blobs.get(clean(path)) ?? ''),
  };
}
