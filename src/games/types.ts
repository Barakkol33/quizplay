import type { GameSettings, Question } from '../types';
import type { Key } from '../i18n';

export interface Ctx {
  t: (key: Key) => string;
  asset: (path: string) => string;
  settings: GameSettings;
  /** Call once when the question is answered. `given` is what the player answered, for the mistakes list. */
  done: (correct: boolean, given: string) => void;
  /** Keyboard shortcuts for this question only. */
  onKey: (handler: (e: KeyboardEvent) => void) => void;
}

/**
 * A game type. To add one: create a file in src/games/, implement this,
 * register it in src/games/index.ts, and add its question shape to
 * schemas/game.schema.json.
 */
export interface GameType {
  type: string;
  label: { he: string; en: string };
  icon: string;
  /** Returns a problem description, or null if the question is valid. */
  check(q: Question): string | null;
  /** Short text of the question, for the mistakes list. */
  prompt(q: Question): string;
  /** The correct answer as text. */
  answer(q: Question, t: Ctx['t']): string;
  render(el: HTMLElement, q: Question, ctx: Ctx): void;
}
