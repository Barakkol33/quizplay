import { h } from '../dom';

const TOKENS =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|\b(\d+(?:\.\d+)?[fFdDlL]?)\b|\b(public|private|protected|class|static|final|void|int|double|float|long|short|byte|char|boolean|new|return|if|else|for|while|do|import|true|false|null|break|continue|switch|case|default|this|var)\b|\b(String|System|Math|Random|Scanner|Integer|Double|Character)\b/g;

/** Java-ish syntax highlighting, built from DOM nodes (never innerHTML). */
export function highlight(code: string): (Node | string)[] {
  const out: (Node | string)[] = [];
  let last = 0;
  for (let m; (m = TOKENS.exec(code)); ) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const cls = m[1] ? 'tk-com' : m[2] ? 'tk-str' : m[3] ? 'tk-num' : m[4] ? 'tk-kw' : 'tk-type';
    out.push(h('span', { class: cls }, m[0]));
    last = TOKENS.lastIndex;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

/** An answer for feedback and mistake lists: multi-line text becomes a block. */
export function answerView(text: string, isCode = false): Node | string {
  if (!text.includes('\n')) return text;
  return isCode ? codeBlock(text) : h('pre', { class: 'out block', dir: 'ltr' }, text);
}

/** A read-only code block. */
export function codeBlock(code: string): HTMLElement {
  return h('pre', { class: 'code', dir: 'ltr', lang: 'en', translate: 'no' }, h('code', {}, ...highlight(code.replace(/\s+$/, ''))));
}
