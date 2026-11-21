export type Lang = 'he' | 'en';

/** One entry in projects/index.json. */
export interface ProjectRef {
  id: string;
  title: string;
  lang: Lang;
  /** Folder of the project, relative to projects/. */
  path: string;
  description?: string;
  icon?: string;
}

export interface GameRef {
  id: string;
  title: string;
  type: string;
  /** Game data file, relative to the project folder. Or put the game inline: */
  file?: string;
  instructions?: string;
  settings?: GameSettings;
  questions?: Question[];
}

export interface Subject {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  games: GameRef[];
}

export interface Project {
  id: string;
  title: string;
  lang: Lang;
  description?: string;
  icon?: string;
  /** Shown on the project's pages, e.g. "may contain mistakes, contact …". Emails become links. */
  notice?: string;
  subjects: Subject[];
}

export interface GameSettings {
  /** Hearts per round. 0 = unlimited. Default 3. */
  lives?: number;
  /** Seconds per question. 0 / missing = no timer. */
  timeLimit?: number;
  /** Shuffle question order. Default true. */
  shuffle?: boolean;
  /** Ask only this many questions per round. */
  count?: number;
  /** mcq: shuffle the options. Default true. */
  shuffleOptions?: boolean;
}

export interface Question {
  id: string;
  explanation?: string;
  image?: string;
  [key: string]: unknown;
}

export interface GameData {
  type: string;
  title?: string;
  instructions?: string;
  settings?: GameSettings;
  questions: Question[];
}
