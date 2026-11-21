# Writing a project for quizplay

**The fastest way:** open the site's info page (ℹ️), copy the AI prompt, and give it to Claude, ChatGPT or Gemini together with your study material. You get back a `project.json` to load and check on the "Load a project" page.

A project comes in one of two forms:

- **One file:** a single `project.json` with every game's questions inline. Easiest to write and to send.
- **A folder:** `project.json` lists the subjects and games, and each game has its own file. Better for big projects and for images. Send it as a **zip of the folder**.

### One file

Each game in `project.json` has `questions` (and optionally `settings` and `instructions`) instead of `file`:

```json
{
  "id": "my-project", "title": "My project", "lang": "en", "icon": "📘",
  "subjects": [
    {
      "id": "basics", "title": "The basics", "icon": "🧪",
      "games": [
        {
          "id": "basics-quiz", "title": "Quiz", "type": "mcq", "settings": { "lives": 3 },
          "questions": [
            { "id": "q1", "question": "2 + 2 = ?", "options": ["4", "3", "5", "22"], "answer": 0 }
          ]
        }
      ]
    }
  ]
}
```

### A folder

```
my-project/
  project.json
  subjects/
    basics/
      quiz.json
      words.json
  assets/              (optional images)
    diagram.png
```

You can test your zip before sending it: open the site, choose **Load a project**, and upload it. Problems in the files are listed there.

## project.json

```json
{
  "$schema": "https://barakkol33.github.io/quizplay/schemas/project.schema.json",
  "id": "my-project",
  "title": "My project",
  "lang": "en",
  "description": "One line about it",
  "subjects": [
    {
      "id": "basics",
      "title": "The basics",
      "games": [
        { "id": "basics-quiz", "title": "Quiz", "type": "mcq", "file": "subjects/basics/quiz.json" },
        { "id": "basics-words", "title": "Words", "type": "match", "file": "subjects/basics/words.json" }
      ]
    }
  ]
}
```

- `id`: lowercase letters, digits and dashes. **Don't change ids after people start playing**, because progress and mistakes are saved by id.
- `lang`: `"he"` (right to left) or `"en"` (left to right). It sets the direction of the content; the interface language is each player's own choice.
- `icon` (optional, on the project and on each subject): an emoji shown on its card.
- Game `id`s must be unique in the whole project.

## A game file

```json
{
  "$schema": "https://barakkol33.github.io/quizplay/schemas/game.schema.json",
  "type": "mcq",
  "title": "Quiz",
  "instructions": "Optional text shown above the questions",
  "settings": { "lives": 3, "timeLimit": 0, "count": 10 },
  "questions": [ ... ]
}
```

| Setting | Meaning | Default |
|---|---|---|
| `lives` | Hearts per round. `0` = unlimited | 3 |
| `timeLimit` | Seconds per question. `0` = no timer | 0 |
| `count` | Ask only this many questions per round (picked at random) | all |
| `shuffle` | Shuffle question order | true |
| `shuffleOptions` | Multiple choice: shuffle the options | true |

Every question needs an `id`, unique in its game. Any question can have an `explanation` (shown after the answer) and an `image` (a path relative to `project.json`, or a full URL).

## Question shapes, by game type

**`lesson`: reading pages.** Put a lesson first in a subject, and the games after it. Each "question" is a page. `text` supports paragraphs (separated by a blank line), `## heading`, `- bullet`, `1. step`, `**bold**` and `` `code` ``.
```json
{ "id": "p1", "title": "What Docker does", "text": "Docker packages an app into an **image**.\n\n- An image is built once\n- A container is a running image" }
```

**`multi`: select all that apply.** `answers` lists every correct index.
```json
{ "id": "q1", "question": "Which are prime?", "options": ["2", "3", "4", "5"], "answers": [0, 1, 3] }
```

**`cloze`: fill the blanks** from a word bank. Blanks go in `{{double braces}}`, and `extra` adds wrong words to the bank.
```json
{ "id": "q1", "text": "A {{container}} is a running {{image}}.", "extra": ["volume", "registry"] }
```

**`categorize`: sort into groups.** Items come one at a time; it counts as correct only with no wrong tries.
```json
{ "id": "q1", "prompt": "Mammal or bird?", "groups": [{ "name": "Mammal", "items": ["dog", "whale"] }, { "name": "Bird", "items": ["eagle", "penguin"] }] }
```

**`mcq`: multiple choice.** `answer` is the index of the correct option, counting from 0. The options are shuffled, so you can always put the correct one first.
```json
{ "id": "q1", "question": "2 + 2 = ?", "options": ["4", "3", "5", "22"], "answer": 0, "explanation": "Two pairs." }
```

**`truefalse`**
```json
{ "id": "q1", "statement": "The sun is a star.", "answer": true }
```

**`typein`: type the answer.** List every accepted answer. Case, Hebrew niqqud and punctuation are ignored. The first answer is the one shown as correct.
```json
{ "id": "q1", "question": "Capital of France?", "answers": ["Paris", "פריז"] }
```

**`match`: match pairs.** One question = one board of pairs. It counts as correct only with no wrong tries.
```json
{ "id": "q1", "prompt": "Match the word to its meaning", "pairs": [["big", "large"], ["fast", "quick"], ["old", "aged"]] }
```

**`order`: put in order.** Write the items in the correct order; the game shuffles them.
```json
{ "id": "q1", "prompt": "From smallest to largest", "items": ["atom", "cell", "organ", "body"] }
```

**`flashcards`**: the player flips the card and says whether they knew it.
```json
{ "id": "q1", "front": "Mitochondria", "back": "The part of the cell that makes energy" }
```

## Checking your files

With Node installed, in this repo:

```
npm install
npm run validate -- path/to/my-project.zip
npm run validate -- path/to/project.json     # a one-file project
```

The `$schema` line at the top of each file makes editors like VS Code show errors and autocomplete as you type.

## Getting it on the site

Built-in projects live in `public/projects/<id>/` and are listed in `public/projects/index.json`:

```json
{ "id": "my-project", "title": "My project", "lang": "en", "path": "my-project/", "description": "…" }
```

A project hosted anywhere else (another GitHub Pages site, a raw GitHub folder) can also be opened from **Load a project → From a link**, and the site remembers it.
