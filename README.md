# quizplay 🎯

A general app for learning through games. Content comes as **projects** made of plain JSON files. The app is just the player.

**Site:** https://barakkol33.github.io/quizplay/

- **Project → subjects → games → questions.** Each game has one type.
- **Learn, then play:** a subject can open with a **lesson** (short reading pages), followed by games that test it.
- **Game types:** lesson (`lesson`), multiple choice (`mcq`), select all that apply (`multi`), true/false (`truefalse`), type the answer (`typein`), fill the blanks (`cloze`), match pairs (`match`), sort into groups (`categorize`), put in order (`order`), flashcards (`flashcards`).
- **Code:** questions can show code (`code`), "what does it print?" games (`output`), and **write-and-run Java in the browser** (`code`): CheerpJ runs Java 8 in WebAssembly and ECJ compiles it, with keyboard input for `Scanner`. `npm run check-java` runs every expected output and solution with a real JDK.
- **👍/👎 ratings** on every question, with an optional comment. Players export them from the profile page (Excel/JSON) and send them to the author.
- **Mixed practice:** a round drawn from every game in a project or subject, starting with questions you got wrong and questions you haven't seen.
- **Gamification:** score with streak multiplier, hearts, an optional timer, 1–3 stars per game, XP and levels, confetti.
- **Mistakes are remembered** for each user: a "My mistakes" page per project, and a practice round built from them. A question leaves practice after two correct answers in a row.
- **Progress is stored in the browser** (localStorage). Several users can share one device, and progress can be exported to and imported from a JSON file. There is no server; everything is on GitHub Pages.
- **Hebrew and English:** the interface language is the player's choice (עב / EN in the top bar, Hebrew by default). Each project declares the language of its content, and the question area takes that direction.
- **Settings in the top bar:** sound on/off, theme (auto, light, dark), language, and an info page.
- **Try content before it is added:** the "Load a project" page opens a project from a link, a zip, or a single JSON file.
- **Make content with AI:** the info page has a ready prompt that turns study material into a project file.

To write content, see [CONTRIBUTING.md](CONTRIBUTING.md). What's planned next is in [TODO.md](TODO.md).

## Running locally

```
npm install
npm run dev          # http://localhost:5173/quizplay/
npm run validate     # check all projects in public/projects
npm run validate -- some-project.zip   # check a project someone sent
npm run export-md -- java-basics --code-lang java   # whole project as one Markdown file, for an expert to review
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
