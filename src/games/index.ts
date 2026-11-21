import type { GameType } from './types';
import { mcq } from './mcq';
import { truefalse } from './truefalse';
import { typein } from './typein';
import { match } from './match';
import { order } from './order';
import { flashcards } from './flashcards';

/** Register new game types here. */
export const gameTypes: Record<string, GameType> = Object.fromEntries(
  [mcq, truefalse, typein, match, order, flashcards].map((g) => [g.type, g]),
);
