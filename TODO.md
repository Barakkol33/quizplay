# TODO

The plan for what comes next. When told **"continue"**, take the first unchecked item in **Next up**, do it, test it (build, validate, browser test), check it off here, commit and push.

## Done

- [x] App: projects → subjects → games, JSON content, GitHub Pages deploy
- [x] Games: mcq, truefalse, typein, match, order, flashcards
- [x] Score, streak, hearts, timer, stars, XP and levels
- [x] Mistakes per user, practice-mistakes round, export/import of progress
- [x] Load a project from a link, a zip, or a single JSON file
- [x] Theme (auto/light/dark), Hebrew/English interface, sound on/off, info page with AI prompt
- [x] Lessons (reading pages before the games)
- [x] Games: cloze (fill the blanks), categorize (sort into groups), multi (select all)
- [x] Mixed practice (interleaving) per project and per subject
- [x] DevOps sample project from blearning; small Hebrew sample
- [x] Code in questions, `output` (what does it print?) and `code` (write and run Java in the browser, with Scanner input); `npm run check-java`
- [x] 👍/👎 ratings with comments, exported from the profile page
- [x] Java basics project (Hebrew): printing, arithmetic, Random, small programs, coding

## Next up

0. [ ] **Java project, more subjects:** variables and types (naming rules, primitive types), Scanner input (output questions with `input` + exercises), conditions (if, else if, switch, &&, ||, !), chars and strings (char arithmetic, length, charAt, substring, equals vs ==), basic computer concepts (input/processing/output, hardware, CPU, memory, compiler).

1. [ ] **Spaced repetition.** Give each question a Leitner box (1–5). A correct answer moves it up a box, a wrong one sends it back to box 1. Box n is due after 1, 2, 4, 8, 16 days. Show "Today's review: N questions" on the home page and on each project, and build the round from questions that are due. Store `box` and `due` in `QStat` (`src/store.ts`).
2. [ ] **Daily streak and goal.** Count days in a row with at least one round, with a daily goal (e.g. 30 XP). Show 🔥 days on the home banner. Store the last-played date in the user.
3. [ ] **Checks inside lessons.** Allow a lesson page to carry one `check` question (any game type) shown under the text. You continue after answering it, and its result counts toward mistakes. Retrieval right after reading is what makes lessons stick.
4. [ ] **Study view.** One scrollable page per subject that shows all its lessons, for reading and reviewing before a test, with a "Practice this subject" button at the end.
5. [ ] **Confidence rating.** After an mcq answer, ask "how sure were you?" (guess / think so / sure). A correct guess stays in practice. A confident mistake is flagged as a misconception and comes back sooner.
6. [ ] **More game types:**
   - [ ] `memory`: flip cards to find pairs (uses the same `pairs` shape as match)
   - [ ] `hotspot` / `label`: click a spot or drag labels onto an image (diagrams, maps, anatomy)
   - [ ] `timeline`: put events on a timeline by year (history)
   - [ ] `oddoneout`: which item doesn't belong, and why
   - [ ] `speed`: a 60-second sprint of true/false or mcq from a whole subject
   - [ ] `scenario`: a short case with branching choices (troubleshooting, decisions)
7. [ ] **Richer lesson content:** code blocks with syntax highlighting, LaTeX math (KaTeX), tables, images with captions, optional audio.
8. [ ] **Commit the browser tests.** Move the Puppeteer end-to-end test into `tests/e2e.mjs` and run it in the GitHub workflow after the build.
9. [ ] **More content:** turn more blearning DevOps chapters into subjects (cloud, IaC, databases, observability, security) and add a lesson to every subject.

## Later

- [ ] Accounts and sync across devices (Supabase or Firebase free tier, or GitHub login with a gist). Keep the `src/store.ts` signatures so the screens don't change.
- [ ] Teacher view: share a project link, and see a group's progress and their common mistakes (needs the database).
- [ ] Leaderboards and challenges between friends (needs the database).
- [ ] In-browser project editor: forms for subjects, games and questions, exporting project.json.
- [ ] Generate a project in the app: paste material, call an AI API, and load the result (needs an API key or a small backend).
- [ ] PWA: works offline and installs on a phone.
- [ ] Accessibility pass: screen reader labels on every game, focus order, color contrast in both themes.
- [ ] Badges and achievements (first perfect round, 7-day streak, all stars in a subject).
