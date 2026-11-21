import type { GameType } from './types';
import { mcq } from './mcq';
import { multi } from './multi';
import { truefalse } from './truefalse';
import { typein } from './typein';
import { cloze } from './cloze';
import { match } from './match';
import { categorize } from './categorize';
import { order } from './order';
import { flashcards } from './flashcards';
import { lesson } from './lesson';

/** Register new game types here. */
export const gameTypes: Record<string, GameType> = Object.fromEntries(
  [lesson, mcq, multi, truefalse, typein, cloze, match, categorize, order, flashcards].map((g) => [g.type, g]),
);
