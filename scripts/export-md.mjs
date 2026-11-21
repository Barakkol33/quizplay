#!/usr/bin/env node
// Export a whole project to one Markdown file, for review by an expert.
//
//   npm run export-md -- <project>  [-o out.md] [--code-lang java]
//
// <project> is a project id under public/projects/, a project folder,
// a project.json file, or a .zip. Output defaults to <project-id>.md.
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const outArg = opt('-o') ?? opt('--out');
const codeLang = opt('--code-lang') ?? '';
const target = args[0];
if (!target) {
  console.error('usage: npm run export-md -- <project-id | folder | project.json | file.zip> [-o out.md] [--code-lang java]');
  process.exit(1);
}

// ---------- reading ----------

async function openSource(t) {
  let p = t;
  if (!fs.existsSync(p)) p = path.join('public', 'projects', t);
  if (!fs.existsSync(p)) throw new Error(`Not found: ${t}`);
  if (p.endsWith('.zip')) {
    const zip = await JSZip.loadAsync(fs.readFileSync(p));
    const names = Object.keys(zip.files);
    const pj = names.filter((n) => n.endsWith('project.json')).sort((a, b) => a.length - b.length)[0];
    if (!pj) throw new Error('No project.json in zip');
    const base = pj.slice(0, -'project.json'.length);
    return async (rel) => JSON.parse(await zip.file(base + rel).async('string'));
  }
  const dir = fs.statSync(p).isDirectory() ? p : path.dirname(p);
  const projectFile = fs.statSync(p).isDirectory() ? 'project.json' : path.basename(p);
  return async (rel) => JSON.parse(fs.readFileSync(path.join(dir, rel === 'project.json' ? projectFile : rel), 'utf8'));
}

// ---------- markdown helpers ----------

const L = {
  he: {
    generated: 'יוצא לבדיקה', subjects: 'נושאים', questions: 'שאלות', answer: 'תשובה', correct: 'נכון', wrong: 'לא נכון',
    accepted: 'תשובות שמתקבלות', explanation: 'הסבר', order: 'הסדר הנכון', distractors: 'מסיחים (לא נכונים)',
    output: 'פלט צפוי', input: 'קלט', hint: 'רמז', solution: 'פתרון', pattern: 'כל פלט שמתאים לביטוי', noCheck: 'בלי בדיקה (תרגול חופשי)',
    front: 'צד קדמי', back: 'צד אחורי', instructions: 'הוראות', notice: 'הערה', review: 'הנחיה לבודק',
    reviewText: 'לכל שאלה יש מזהה (id). כשמוצאים טעות, ציינו את המזהה ואת התיקון. ✅ מסמן את התשובה הנכונה.',
    lesson: 'שיעור', image: 'תמונה',
  },
  en: {
    generated: 'Exported for review', subjects: 'Subjects', questions: 'questions', answer: 'Answer', correct: 'True', wrong: 'False',
    accepted: 'Accepted answers', explanation: 'Explanation', order: 'Correct order', distractors: 'Distractors (wrong)',
    output: 'Expected output', input: 'Input', hint: 'Hint', solution: 'Solution', pattern: 'Any output matching', noCheck: 'Not checked (free practice)',
    front: 'Front', back: 'Back', instructions: 'Instructions', notice: 'Notice', review: 'For the reviewer',
    reviewText: 'Every question has an id. When you find a mistake, note the id and the fix. ✅ marks the correct answer.',
    lesson: 'Lesson', image: 'Image',
  },
};

function fence(text, lang = '') {
  const s = String(text);
  const run = Math.max(2, ...(s.match(/`+/g) ?? []).map((m) => m.length));
  const f = '`'.repeat(run + 1);
  return `${f}${lang}\n${s}\n${f}`;
}
function inline(text) {
  const s = String(text);
  if (s.includes('\n')) return '\n\n' + fence(s) + '\n';
  const run = Math.max(0, ...(s.match(/`+/g) ?? []).map((m) => m.length));
  const f = '`'.repeat(run + 1);
  const pad = s.startsWith('`') || s.endsWith('`') || s === '' ? ' ' : '';
  return `${f}${pad}${s}${pad}${f}`;
}
const looksLikeCode = (s) => /[(){};=+\-*/%<>"'\\[\]]|^\w+\.\w+/.test(String(s));
const val = (s) => (looksLikeCode(s) ? inline(s) : String(s));

function optionList(options, correct) {
  return options.map((o, i) => `${i + 1}. ${correct.has(i) ? '✅' : '▫️'} ${val(o)}`).join('\n');
}

// ---------- per type ----------

function renderQuestion(type, q, t) {
  const out = [];
  const add = (...x) => out.push(...x);
  const code = q.code && typeof q.code === 'string' ? fence(q.code, codeLang) : null;
  switch (type) {
    case 'lesson':
      add(`**📖 ${q.title ?? t.lesson}**`, '', q.text);
      break;
    case 'mcq':
      add(q.question, code, optionList(q.options, new Set([q.answer])));
      break;
    case 'multi':
      add(q.question, code, optionList(q.options, new Set(q.answers)));
      break;
    case 'truefalse':
      add(q.statement, code, `**${t.answer}:** ${q.answer ? '✅ ' + t.correct : '❌ ' + t.wrong}`);
      break;
    case 'typein':
      add(q.question, code, `**${t.accepted}:** ${q.answers.map(val).join(' · ')}`);
      break;
    case 'match':
      add(q.prompt, q.pairs.map(([a, b]) => `- ${val(a)} ⟷ ${val(b)}`).join('\n'));
      break;
    case 'order':
      add(q.prompt, `**${t.order}:**`, '', q.items.map((x, i) => `${i + 1}. ${val(x)}`).join('\n'));
      break;
    case 'flashcards':
      add(`**${t.front}:** ${q.front}`, '', `**${t.back}:** ${q.back}`);
      break;
    case 'categorize':
      add(q.prompt, q.groups.map((g) => `- **${g.name}:** ${g.items.map(val).join(' · ')}`).join('\n'));
      break;
    case 'cloze': {
      const marked = q.text.replace(/\{\{(.+?)\}\}/g, '⟦$1⟧');
      add(q.prompt, q.code ? fence(marked, codeLang) : marked.replace(/⟦(.+?)⟧/g, '**⟦$1⟧**'));
      if (q.extra?.length) add(`**${t.distractors}:** ${q.extra.map(val).join(' · ')}`);
      break;
    }
    case 'output':
      add(q.question, fence(q.code, codeLang));
      if (q.input) add(`**${t.input}:**`, '', fence(q.input));
      add(`**${t.output}:**`, '', fence(q.output));
      if (q.options) add(optionList(q.options, new Set([q.options.indexOf(q.output)])));
      break;
    case 'code':
      add(q.prompt);
      if (q.input) add(`**${t.input}:**`, '', fence(q.input));
      if (q.expected != null) add(`**${t.output}:**`, '', fence(q.expected));
      else if (q.pattern) add(`**${t.pattern}:** ${inline(q.pattern)}`);
      else add(`*${t.noCheck}*`);
      if (q.hint) add(`**${t.hint}:** ${q.hint}`);
      add(`**${t.solution}:**`, '', fence(q.solution ?? q.starter ?? '', codeLang));
      break;
    default:
      add(fence(JSON.stringify(q, null, 2), 'json'));
  }
  if (q.image) add(`*${t.image}: ${q.image}*`);
  if (q.explanation) add(`> **${t.explanation}:** ${String(q.explanation).replace(/\n/g, '\n> ')}`);
  return out.filter((x) => x != null).join('\n\n');
}

// ---------- main ----------

const read = await openSource(target);
const project = await read('project.json');
const t = L[project.lang] ?? L.en;
const today = new Date().toLocaleDateString('sv'); // local YYYY-MM-DD

const body = [];
const toc = [];
let total = 0;
for (const [si, s] of project.subjects.entries()) {
  const sub = [];
  let count = 0;
  for (const g of s.games) {
    const data = g.file ? await read(g.file) : g;
    const type = data.type ?? g.type;
    const qs = data.questions ?? [];
    count += type === 'lesson' ? 0 : qs.length;
    sub.push(`### ${g.title}`, '', `*${type} · ${g.id}${g.file ? ' · ' + g.file : ''}*`);
    const instr = data.instructions ?? g.instructions;
    if (instr) sub.push('', `**${t.instructions}:** ${instr}`);
    for (const q of qs) sub.push('', `#### \`${q.id}\``, '', renderQuestion(type, q, t));
    sub.push('');
  }
  total += count;
  const title = `${si + 1}. ${s.icon ? s.icon + ' ' : ''}${s.title}`;
  toc.push(`${title} (${count} ${t.questions})`);
  body.push(`## ${title}`, '', s.description ? s.description + '\n' : '', ...sub, '---', '');
}

const head = [
  `# ${project.icon ? project.icon + ' ' : ''}${project.title}`,
  '',
  project.description ?? '',
  '',
  `*${t.generated}: ${today} · id: ${project.id} · ${total} ${t.questions}*`,
  '',
  project.notice ? `> **${t.notice}:** ${project.notice}\n` : '',
  `> **${t.review}:** ${t.reviewText}`,
  '',
  `## ${t.subjects}`,
  '',
  ...toc,
  '',
  '---',
  '',
];

const outFile = outArg ?? `${project.id}.md`;
fs.writeFileSync(outFile, [...head, ...body].join('\n').replace(/\n{3,}/g, '\n\n'));
console.log(`wrote ${outFile}: ${project.subjects.length} subjects, ${total} questions`);
