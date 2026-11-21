#!/usr/bin/env node
/**
 * Runs the Java in the projects with a real JDK, to prove the answers are right:
 *  - every "output" question: the code (a snippet or a full class) must print exactly `output`
 *  - every "code" exercise with a `solution`: it must compile and pass `expected` / `pattern`
 *
 *   npm run check-java                 all projects in public/projects
 *   npm run check-java -- <folder>     one project folder
 *
 * Needs javac and java on PATH (Java 8+). Skips with a warning if they're missing.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const norm = (s) => s.replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/^\n+|\n+$/g, '');

try {
  execFileSync('javac', ['-version'], { stdio: 'ignore' });
} catch {
  console.warn('check-java: javac not found, skipping');
  process.exit(0);
}

/** A snippet (no class) is wrapped in a Main class with java.util imported. */
function toProgram(code) {
  if (/\bclass\s+\w+/.test(code)) return code;
  const body = code.split('\n').map((l) => '        ' + l).join('\n');
  return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}\n`;
}

function run(src, input) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'qp-java-'));
  try {
    const cls = /public\s+(?:final\s+)?class\s+(\w+)/.exec(src)?.[1] ?? 'Main';
    writeFileSync(path.join(dir, cls + '.java'), src);
    const c = spawnSync('javac', ['-encoding', 'UTF-8', '-nowarn', cls + '.java'], { cwd: dir, encoding: 'utf8' });
    if (c.status !== 0) return { error: 'compile error:\n' + (c.stderr || c.stdout) };
    const r = spawnSync('java', ['-Dfile.encoding=UTF-8', '-cp', '.', cls], { cwd: dir, encoding: 'utf8', input: input ?? '', timeout: 10000 });
    return { output: (r.stdout ?? '') + (r.stderr ?? '') };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function projectDirs() {
  const arg = process.argv[2];
  if (arg) return [path.resolve(arg)];
  const base = path.join(root, 'public/projects');
  return readdirSync(base).map((d) => path.join(base, d)).filter((d) => statSync(d).isDirectory() && existsSync(path.join(d, 'project.json')));
}

let checked = 0;
let failed = 0;
for (const dir of projectDirs()) {
  const project = JSON.parse(readFileSync(path.join(dir, 'project.json'), 'utf8'));
  for (const s of project.subjects) {
    for (const g of s.games) {
      if (g.type !== 'output' && g.type !== 'code') continue;
      const data = g.questions ? { type: g.type, questions: g.questions } : JSON.parse(readFileSync(path.join(dir, g.file), 'utf8'));
      for (const q of data.questions) {
        const where = `${project.id}/${g.id}/${q.id}`;
        if (g.type === 'output') {
          checked++;
          const r = run(toProgram(q.code), q.input);
          if (r.error) { failed++; console.log(`✗ ${where}: ${r.error}`); continue; }
          if (norm(r.output) !== norm(q.output)) { failed++; console.log(`✗ ${where}: prints\n${r.output}\n  but the answer says\n${q.output}`); continue; }
          if (Array.isArray(q.options) && norm(q.options[0]) !== norm(q.output)) { failed++; console.log(`✗ ${where}: the first option must be the correct output`); }
        } else if (typeof q.solution === 'string') {
          checked++;
          const r = run(q.solution, q.input);
          if (r.error) { failed++; console.log(`✗ ${where}: solution: ${r.error}`); continue; }
          const out = norm(r.output);
          if (typeof q.expected === 'string' && out !== norm(q.expected)) { failed++; console.log(`✗ ${where}: solution prints\n${r.output}\n  expected\n${q.expected}`); }
          if (typeof q.pattern === 'string' && !new RegExp(q.pattern).test(out)) { failed++; console.log(`✗ ${where}: solution output "${out}" does not match ${q.pattern}`); }
        }
      }
    }
  }
}
console.log(`check-java: ${checked} checked, ${failed} failed`);
process.exit(failed ? 1 : 0);
