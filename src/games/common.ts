import { h } from '../dom';
import type { Question } from '../types';
import type { Ctx } from './types';
import { codeBlock } from './code';

/** The question text, plus an optional image and an optional code block (`code`). */
export function questionBlock(text: string, q: Question, ctx: Ctx): HTMLElement {
  return h(
    'div',
    { class: 'q' },
    q.image ? h('img', { class: 'q-img', src: ctx.asset(q.image), alt: '' }) : null,
    h('p', { class: 'q-text', dir: 'auto' }, text),
    typeof q.code === 'string' ? codeBlock(q.code) : null,
  );
}

export const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
export const isStrArr = (v: unknown, min = 1): v is string[] => Array.isArray(v) && v.length >= min && v.every(isStr);

/** Lowercase, strip Hebrew niqqud and punctuation, collapse spaces. */
export function normalize(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[֑-ׇ]/g, '')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s./+-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}
