# quizplay 🎯

A general app for learning through games. Content comes as **projects** made of plain JSON files. The app is just the player.

**Site:** https://barakkol33.github.io/quizplay/

- **Project → subjects → games → questions.** Each game has one type.
- **Game types:** multiple choice (`mcq`), true/false (`truefalse`), type the answer (`typein`), match pairs (`match`), put in order (`order`), flashcards (`flashcards`).
- **Gamification:** score with streak multiplier, hearts, an optional timer, 1–3 stars per game, XP and levels, confetti.
- **Mistakes are remembered** for each user: a "My mistakes" page per project, and a practice round built from them. A question leaves practice after two correct answers in a row.
- **Progress is stored in the browser** (localStorage). Several users can share one device, and progress can be exported to and imported from a JSON file. There is no server; everything is on GitHub Pages.
- **Hebrew and English:** each project declares its language, and the page switches between RTL and LTR.
- **Try content before it is added:** the "Load a project" page opens a project from a link or a zip file.

To write content, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Running locally

```
npm install
npm run dev          # http://localhost:5173/quizplay/
npm run validate     # check all projects in public/projects
npm run validate -- some-project.zip   # check a project someone sent
npm run build
```

Every push to `main` validates, builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Layout

| Path | What |
|---|---|
| `public/projects/index.json` | The list of built-in projects |
| `public/projects/<id>/` | One project: `project.json` plus the game files |
| `schemas/` | JSON Schemas for `project.json` and game files (editors use them for autocomplete) |
| `scripts/validate.mjs` | The validator (schemas, unique ids, files exist, answer index in range) |
| `src/games/` | One file per game type. Register new ones in `src/games/index.ts` |
| `src/engine.ts` | Plays a round: score, streak, hearts, timer, feedback |
| `src/store.ts` | All progress. Swap the bodies for a database later; keep the signatures |
| `src/ui/screens.ts` | The screens |

## Adding a game type

1. Create `src/games/<type>.ts` that implements `GameType` (`src/games/types.ts`): `check`, `prompt`, `answer`, `render`. `render` calls `ctx.done(correct, given)` once.
2. Register it in `src/games/index.ts`.
3. Add its question shape to `schemas/game.schema.json` and its name to the `type` enum in both schemas.
