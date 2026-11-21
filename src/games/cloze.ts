import { h, shuffle } from '../dom';
import type { GameType } from './types';
import { isStr, isStrArr } from './common';

/** "A {{container}} runs an {{image}}." → blanks filled from a word bank. */
const parts = (text: string) => text.split(/\{\{(.+?)\}\}/);
const blanks = (text: string) => parts(text).filter((_, i) => i % 2 === 1);

export const cloze: GameType = {
  type: 'cloze',
  label: { he: 'השלמת משפט', en: 'Fill the blanks' },
  icon: '🧩',
  check(q) {
    if (!isStr(q.text)) return 'missing "text"';
    if (!blanks(q.text).length) return '"text" needs at least one {{blank}}';
    if (q.extra != null && !isStrArr(q.extra)) return '"extra" must be a list of words';
    return null;
  },
  prompt: (q) => parts(String(q.text)).map((p, i) => (i % 2 ? '____' : p)).join(''),
  answer: (q) => parts(String(q.text)).join(''),
  render(el, q, ctx) {
    const text = String(q.text);
    const want = blanks(text);
    const filled: (number | null)[] = want.map(() => null);
    const words = shuffle([...want, ...((q.extra as string[] | undefined) ?? [])].map((w, i) => ({ w, i })));
    const tiles = new Map<number, HTMLButtonElement>();
    const slots: HTMLButtonElement[] = [];
    let locked = false;

    const wordOf = (tileId: number) => words.find((x) => x.i === tileId)!.w;
    const draw = () => {
      slots.forEach((s, i) => {
        const t = filled[i];
        s.textContent = t == null ? ' ' : wordOf(t);
        s.classList.toggle('empty', t == null);
      });
      for (const [id, b] of tiles) b.hidden = filled.includes(id);
      checkBtn.disabled = filled.includes(null);
    };
    const place = (tileId: number) => {
      if (locked) return;
      const at = filled.indexOf(null);
      if (at < 0) return;
      filled[at] = tileId;
      draw();
    };
    const unplace = (slot: number) => {
      if (locked) return;
      filled[slot] = null;
      draw();
    };

    const sentence = h('p', { class: 'cloze-text', dir: 'auto' });
    parts(text).forEach((p, i) => {
      if (i % 2 === 0) sentence.append(p);
      else {
        const idx = slots.length;
        const s = h('button', { class: 'cloze-slot empty', onclick: () => unplace(idx) });
        slots.push(s);
        sentence.append(s);
      }
    });
    const bank = h('div', { class: 'tile-bank' },
      words.map(({ w, i }) => {
        const b = h('button', { class: 'tile', dir: 'auto', onclick: () => place(i) }, w);
        tiles.set(i, b);
        return b;
      }),
    );
    const checkBtn = h('button', {
      class: 'btn primary',
      disabled: true,
      onclick: () => {
        if (locked) return;
        locked = true;
        checkBtn.disabled = true;
        let ok = true;
        slots.forEach((s, i) => {
          const right = wordOf(filled[i]!) === want[i];
          ok &&= right;
          s.classList.add(right ? 'is-correct' : 'is-wrong');
        });
        ctx.done(ok, parts(text).map((p, i) => (i % 2 ? wordOf(filled[(i - 1) / 2]!) : p)).join(''));
      },
    }, ctx.t('check'));

    el.append(h('p', { class: 'muted small' }, ctx.t('clozeHint')), sentence, bank, h('div', { class: 'actions' }, checkBtn));
    draw();
  },
};
