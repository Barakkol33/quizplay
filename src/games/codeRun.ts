import { h } from '../dom';
import type { GameType } from './types';
import { isStr } from './common';
import { richText } from './rich';
import { codeBlock } from './code';
import { initJava, normalizeOutput, runJava } from '../java/runner';

const DEFAULT_STARTER = `public class Main {
    public static void main(String[] args) {
        // write your code here
    }
}
`;

/**
 * Write a Java program and run it in the browser.
 * Passes when the output equals `expected`, or matches the regular expression `pattern`
 * (for programs with random numbers). With neither, any program that runs passes.
 */
export const code: GameType = {
  type: 'code',
  label: { he: 'כתיבת קוד והרצה', en: 'Write and run code' },
  icon: '💻',
  check(q) {
    if (!isStr(q.prompt)) return 'missing "prompt"';
    if (q.expected != null && typeof q.expected !== 'string') return '"expected" must be a string';
    if (q.pattern != null) {
      if (typeof q.pattern !== 'string') return '"pattern" must be a string';
      try {
        new RegExp(q.pattern);
      } catch {
        return '"pattern" is not a valid regular expression';
      }
    }
    return null;
  },
  prompt: (q) => String(q.prompt),
  answer: (q) => (typeof q.solution === 'string' ? q.solution : typeof q.expected === 'string' ? q.expected : ''),
  render(el, q, ctx) {
    const starter = typeof q.starter === 'string' ? q.starter : DEFAULT_STARTER;
    const editor = h('textarea', { class: 'code-editor', dir: 'ltr', lang: 'en', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off', rows: String(Math.max(8, starter.split('\n').length + 2)) });
    editor.value = starter;
    const status = h('p', { class: 'run-status muted small', 'aria-live': 'polite' });
    const outBox = h('pre', { class: 'run-output', dir: 'ltr', hidden: true });
    const expectBox = h('div', { class: 'run-expect', hidden: true });
    let finished = false;

    // Editor comforts: Tab indents, Enter keeps the indentation.
    editor.addEventListener('keydown', (e) => {
      const { selectionStart: s, selectionEnd: t, value } = editor;
      if (e.key === 'Tab') {
        e.preventDefault();
        editor.setRangeText('    ', s, t, 'end');
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        run();
      } else if (e.key === 'Enter') {
        const lineStart = value.lastIndexOf('\n', s - 1) + 1;
        const indent = /^[ \t]*/.exec(value.slice(lineStart, s))![0] + (value[s - 1] === '{' ? '    ' : '');
        e.preventDefault();
        editor.setRangeText('\n' + indent, s, t, 'end');
      }
      e.stopPropagation();
    });

    // Keyboard input for Scanner. Shown when the task has "input" (or "askInput": true).
    const givenInput = typeof q.input === 'string' ? q.input : null;
    const inputArea = givenInput != null || q.askInput === true
      ? h('textarea', { class: 'output-input stdin', dir: 'ltr', rows: String(Math.max(2, (givenInput ?? '').split('\n').length)), spellcheck: 'false' })
      : null;
    if (inputArea) inputArea.value = givenInput ?? '';
    inputArea?.addEventListener('keydown', (e) => e.stopPropagation());

    const judge = (out: string): boolean | null => {
      // Checked only with the task's own input; with other input it's just a free run.
      if (inputArea && givenInput != null && normalizeOutput(inputArea.value) !== normalizeOutput(givenInput)) return null;
      const got = normalizeOutput(out);
      if (typeof q.expected === 'string') return got === normalizeOutput(q.expected);
      if (typeof q.pattern === 'string') return new RegExp(q.pattern).test(got);
      return null;
    };

    const runBtn = h('button', { class: 'btn primary', onclick: () => run() }, '▶ ' + ctx.t('run'));
    const solutionBtn = h('button', { class: 'btn', onclick: () => giveUp() }, ctx.t('showSolution'));
    const resetBtn = h('button', { class: 'btn small', onclick: () => (editor.value = starter) }, '↺ ' + ctx.t('reset'));

    const run = async () => {
      if (finished || runBtn.disabled) return;
      runBtn.disabled = true;
      outBox.hidden = true;
      expectBox.hidden = true;
      status.textContent = ctx.t('compiling');
      const slow = setTimeout(() => (status.textContent = ctx.t('javaFirstLoad')), 2500);
      try {
        const r = await runJava(editor.value, inputArea ? inputArea.value : undefined);
        clearTimeout(slow);
        outBox.hidden = false;
        if (!r.compiled) {
          outBox.className = 'run-output is-error';
          outBox.textContent = r.compileOutput || 'Compile error';
          status.textContent = '✗ ' + ctx.t('compileError');
          return;
        }
        outBox.className = 'run-output';
        outBox.textContent = r.output || ' ';
        const crashed = r.output.includes('Exception in thread "main"');
        const verdict = crashed ? false : judge(r.output);
        if (crashed) {
          outBox.classList.add('is-error');
          status.textContent = '✗ ' + ctx.t('runtimeError');
        } else if (verdict === false) {
          outBox.classList.add('is-wrong');
          status.textContent = '✗ ' + ctx.t('notYet');
          if (typeof q.expected === 'string') {
            expectBox.hidden = false;
            expectBox.replaceChildren(h('span', { class: 'muted small' }, ctx.t('expectedOutput') + ':'), h('pre', { class: 'run-output', dir: 'ltr' }, q.expected));
          }
        } else if (verdict === null && (q.expected != null || q.pattern != null)) {
          status.textContent = ctx.t('ranOtherInput');
        } else {
          outBox.classList.add('is-correct');
          status.textContent = '✓ ' + ctx.t('ranOk');
          finished = true;
          editor.readOnly = true;
          solutionBtn.disabled = true;
          ctx.done(true, editor.value);
        }
      } catch (e) {
        clearTimeout(slow);
        status.textContent = `${ctx.t('error')}: ${(e as Error).message}`;
      } finally {
        if (!finished) runBtn.disabled = false;
      }
    };

    const giveUp = () => {
      if (finished) return;
      finished = true;
      runBtn.disabled = solutionBtn.disabled = true;
      editor.readOnly = true;
      ctx.done(false, editor.value);
    };

    el.append(
      h('div', { class: 'q code-task' }, richText(String(q.prompt))),
      typeof q.expected === 'string' && q.showExpected !== false
        ? h('details', { class: 'expected-peek' }, h('summary', {}, ctx.t('expectedOutput')), h('pre', { class: 'run-output', dir: 'ltr' }, q.expected))
        : '',
      h('div', { class: 'editor-head', dir: 'ltr' }, h('span', { class: 'muted small' }, 'Main.java'), resetBtn),
      editor,
      inputArea ? h('div', { class: 'stdin-box' }, h('label', { class: 'muted small' }, '⌨️ ' + ctx.t('stdinLabel')), inputArea) : '',
      h('div', { class: 'actions' }, runBtn, solutionBtn, h('span', { class: 'muted small kbd-hint' }, 'Ctrl+Enter')),
      status,
      outBox,
      expectBox,
      typeof q.hint === 'string' ? h('details', { class: 'hint' }, h('summary', {}, '💡 ' + ctx.t('hint')), richText(q.hint)) : '',
    );
    // Start downloading Java in the background while the learner reads.
    initJava().catch(() => undefined);
  },
};

/** For the feedback box: show the solution as code. */
export function solutionBlock(src: string): HTMLElement {
  return codeBlock(src);
}
