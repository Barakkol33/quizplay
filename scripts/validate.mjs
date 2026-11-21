#!/usr/bin/env node
/**
 * Validate quizplay projects.
 *
 *   npm run validate                     all projects in public/projects/index.json
 *   npm run validate -- path/to/project  one project folder (with project.json)
 *   npm run validate -- project.zip      a zipped project, as contributors send it
 *   npm run validate -- project.json     a single-file project (games inline)
 */
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import JSZip from 'jszip';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ajv = new Ajv({ allErrors: true, strict: false });
const projectSchema = JSON.parse(await readFile(path.join(root, 'schemas/project.schema.json'), 'utf8'));
const gameSchema = JSON.parse(await readFile(path.join(root, 'schemas/game.schema.json'), 'utf8'));
const checkProject = ajv.compile(projectSchema);
const checkGame = ajv.compile(gameSchema);

const fmt = (errors) => errors.map((e) => `${e.instancePath || '/'} ${e.message}${e.params?.allowedValues ? ': ' + e.params.allowedValues.join(', ') : ''}`);

/** A reader is { has(rel), json(rel) } over a folder or a zip. */
function folderReader(dir) {
  return {
    label: dir,
    has: (rel) => existsSync(path.join(dir, rel)),
    json: async (rel) => JSON.parse(await readFile(path.join(dir, rel), 'utf8')),
  };
}

/** One project.json with every game inline. */
function singleFileReader(file) {
  return {
    label: file,
    has: (rel) => rel === 'project.json',
    json: async (rel) => {
      if (rel !== 'project.json') throw new Error('single-file project: put the questions inline');
      return JSON.parse(await readFile(file, 'utf8'));
    },
  };
}

async function zipReader(file) {
  const zip = await JSZip.loadAsync(await readFile(file));
  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  const pj = names.filter((n) => n === 'project.json' || n.endsWith('/project.json')).sort((a, b) => a.split('/').length - b.split('/').length)[0];
  if (!pj) throw new Error('project.json not found in the zip');
  const prefix = pj.slice(0, -'project.json'.length);
  const norm = (rel) => prefix + rel.replace(/^\.?\//, '');
  return {
    label: file,
    has: (rel) => !!zip.files[norm(rel)],
    json: async (rel) => JSON.parse(await zip.files[norm(rel)].async('string')),
  };
}

async function validate(reader) {
  const problems = [];
  let project;
  try {
    project = await reader.json('project.json');
  } catch (e) {
    return [`project.json: ${e.message}`];
  }
  if (!checkProject(project)) return fmt(checkProject.errors).map((m) => `project.json ${m}`);

  const gameIds = new Set();
  const subjectIds = new Set();
  let questions = 0;
  for (const s of project.subjects) {
    if (subjectIds.has(s.id)) problems.push(`project.json: duplicate subject id "${s.id}"`);
    subjectIds.add(s.id);
    for (const g of s.games) {
      if (gameIds.has(g.id)) problems.push(`project.json: duplicate game id "${g.id}" (must be unique in the project)`);
      gameIds.add(g.id);
      let data;
      const where = g.file ?? `game "${g.id}"`;
      if (Array.isArray(g.questions)) {
        data = { type: g.type, questions: g.questions };
        if (g.settings) data.settings = g.settings;
        if (g.instructions) data.instructions = g.instructions;
      } else {
        if (!reader.has(g.file)) {
          problems.push(`${g.file}: file not found`);
          continue;
        }
        try {
          data = await reader.json(g.file);
        } catch (e) {
          problems.push(`${g.file}: ${e.message}`);
          continue;
        }
      }
      if (!checkGame(data)) {
        problems.push(...fmt(checkGame.errors).map((m) => `${where} ${m}`));
        continue;
      }
      if (data.type !== g.type) problems.push(`${where}: type is "${data.type}" but project.json says "${g.type}"`);
      const ids = new Set();
      for (const q of data.questions) {
        questions++;
        if (ids.has(q.id)) problems.push(`${where}: duplicate question id "${q.id}"`);
        ids.add(q.id);
        if (data.type === 'mcq' && q.answer >= q.options.length) problems.push(`${where} / ${q.id}: answer ${q.answer} but only ${q.options.length} options`);
        if (data.type === 'mcq' && new Set(q.options).size !== q.options.length) problems.push(`${where} / ${q.id}: two options are the same`);
        if (q.image && !/^(https?:|data:)/.test(q.image) && !reader.has(q.image)) problems.push(`${where} / ${q.id}: image not found: ${q.image}`);
      }
    }
  }
  if (!problems.length) console.log(`  ${project.subjects.length} subjects, ${gameIds.size} games, ${questions} questions`);
  return problems;
}

const targets = [];
const arg = process.argv[2];
if (arg) {
  const p = path.resolve(arg);
  const lower = p.toLowerCase();
  if (lower.endsWith('.zip')) targets.push(await zipReader(p));
  else if (lower.endsWith('.json')) targets.push(singleFileReader(p));
  else if ((await stat(p)).isDirectory()) targets.push(folderReader(p));
  else throw new Error(`${arg}: not a folder, .zip or .json`);
} else {
  const base = path.join(root, 'public/projects');
  const index = JSON.parse(await readFile(path.join(base, 'index.json'), 'utf8'));
  const ids = new Set();
  for (const ref of index) {
    for (const k of ['id', 'title', 'lang', 'path']) if (!ref[k]) throw new Error(`index.json: an entry has no "${k}"`);
    if (ids.has(ref.id)) throw new Error(`index.json: duplicate id ${ref.id}`);
    ids.add(ref.id);
    const reader = folderReader(path.join(base, ref.path));
    const pj = await reader.json('project.json').catch(() => null);
    if (pj && pj.id !== ref.id) throw new Error(`index.json: "${ref.id}" but its project.json has id "${pj.id}"`);
    targets.push(reader);
  }
}

let failed = 0;
for (const r of targets) {
  console.log(`• ${path.relative(root, r.label) || r.label}`);
  const problems = await validate(r);
  if (problems.length) {
    failed++;
    for (const p of problems) console.log(`  ✗ ${p}`);
  } else console.log('  ✓ valid');
}
process.exit(failed ? 1 : 0);
