import { h } from '../dom';
import { codeBlock } from './code';

/** Inline: **bold**, `code`. Built as DOM nodes, never as HTML. */
function inline(text: string): (Node | string)[] {
  const out: (Node | string)[] = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`/g;
  let last = 0;
  for (let m; (m = re.exec(text)); ) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[1] != null ? h('strong', {}, m[1]) : h('code', {}, m[2]));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * A small, safe subset of Markdown for lessons:
 * blank line = new paragraph, "## " = heading, "- " = bullet, "1. " = numbered, **bold**, `code`.
 */
export function richText(text: string): HTMLElement {
  const root = h('div', { class: 'rich', dir: 'auto' });
  // ```fenced code``` blocks first: they may contain blank lines.
  const pieces = text.replace(/\r/g, '').split(/^```[^\n]*\n([\s\S]*?)^```[ \t]*$/m);
  pieces.forEach((piece, i) => {
    if (i % 2 === 1) root.append(codeBlock(piece));
    else if (piece.trim()) appendBlocks(root, piece);
  });
  return root;
}

function appendBlocks(root: HTMLElement, text: string): void {
  for (const block of text.split(/\n\s*\n/)) {
    const lines = block.split('\n').filter((l) => l.trim());
    if (!lines.length) continue;
    if (lines.every((l) => /^\s*[-*] /.test(l))) {
      root.append(h('ul', {}, lines.map((l) => h('li', { dir: 'auto' }, ...inline(l.replace(/^\s*[-*] /, ''))))));
    } else if (lines.every((l) => /^\s*\d+[.)] /.test(l))) {
      root.append(h('ol', {}, lines.map((l) => h('li', { dir: 'auto' }, ...inline(l.replace(/^\s*\d+[.)] /, ''))))));
    } else if (/^#{1,3} /.test(lines[0])) {
      root.append(h('h3', { dir: 'auto' }, ...inline(lines[0].replace(/^#{1,3} /, ''))));
      if (lines.length > 1) root.append(richText(lines.slice(1).join('\n')));
    } else {
      const p = h('p', { dir: 'auto' });
      lines.forEach((l, i) => {
        if (i) p.append(h('br'));
        p.append(...inline(l));
      });
      root.append(p);
    }
  }
}
