import { h, shuffle } from '../dom';
import type { GameType } from './types';
import { isStr, isStrArr } from './common';
import { codeBlock } from './code';
import { normalizeOutput } from '../java/runner';

/**
 * "What does this program print?" Shows code; the learner types the exact output,
 * or picks it from `options` (the first option is the correct one; they are shuffled).
 */
export const output: GameType = {
  type: 'output',
  label: { he: 'מה יודפס?', en: 'What does it print?' },
  icon: '🖨️',
  check(q) {
    if (!isStr(q.code)) return 'missing "code"';
    if (typeof q.output !== 'string') return 'missing "output" (the exact text the code prints)';
    if (q.options != null && !isStrArr(q.options, 2)) return '"options" must be at least 2 strings, the correct output first';
    return null;
  },
  prompt: (q) => (typeof q.question === 'string' ? q.question + '\n' : '') + String(q.code),
  answer: (q) => String(q.output),
  render(el, q, ctx) {
    const want = normalizeOutput(String(q.output));
    el.append(
      h('div', { class: 'q' },
        h('p', { class: 'q-text', dir: 'auto' }, typeof q.question === 'string' ? q.question : ctx.t('whatPrints')),
        codeBlock(String(q.code)),
        typeof q.input === 'string'
          ? h('div', { class: 'stdin-box' }, h('span', { class: 'muted small' }, '⌨️ ' + ctx.t('userTypes')), h('pre', { class: 'out block', dir: 'ltr' }, q.input))
          : '',
      ),
    );

    if (Array.isArray(q.options)) {
      const opts = shuffle((q.options as string[]).map((text, i) => ({ text, i })));
      const buttons: HTMLButtonElement[] = [];
      const pick = (idx: number) => {
        if (buttons[0].disabled) return;
        buttons.forEach((b, j) => {
          b.disabled = true;
          if (opts[j].i === 0) b.classList.add('is-correct');
        });
        if (opts[idx].i !== 0) buttons[idx].classList.add('is-wrong');
        ctx.done(opts[idx].i === 0, opts[idx].text);
      };
      opts.forEach((o, idx) =>
        buttons.push(h('button', { class: 'option mono-opt', onclick: () => pick(idx) }, h('span', { class: 'key' }, String(idx + 1)), h('pre', { class: 'out', dir: 'ltr' }, o.text))),
      );
      ctx.onKey((e) => {
        const n = Number(e.key);
        if (n >= 1 && n <= buttons.length) pick(n - 1);
      });
      el.append(h('div', { class: 'options' }, buttons));
      return;
    }

    const lines = Math.max(1, want.split('\n').length);
    const area = h('textarea', {
      class: 'output-input', dir: 'ltr', rows: String(Math.min(8, lines + 1)), spellcheck: 'false',
      autocomplete: 'off', autocapitalize: 'off', placeholder: ctx.t('typeOutput'),
    });
    const submit = () => {
      if (area.disabled) return;
      const given = normalizeOutput(area.value);
      const right = given === want;
      area.disabled = btn.disabled = true;
      area.classList.add(right ? 'is-correct' : 'is-wrong');
      ctx.done(right, given || '∅');
    };
    const btn = h('button', { class: 'btn primary', onclick: submit }, ctx.t('check'));
    area.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        submit();
      }
    });
    el.append(
      h('p', { class: 'muted small' }, lines > 1 ? ctx.t('outputHintLines') : ctx.t('outputHint')),
      area,
      h('div', { class: 'actions' }, btn),
    );
    setTimeout(() => area.focus({ preventScroll: true }), 0);
  },
};
