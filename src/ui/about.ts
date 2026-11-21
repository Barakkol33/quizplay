import type { Lang } from '../types';

/** The prompt to give an AI together with study material. Kept in English: it works for material in any language. */
export const AI_PROMPT = `You are building a quiz project for quizplay, a learning app that turns study material into games.

I will give you study material (text, notes, a document or a link). Turn it into ONE JSON file named project.json, in the exact format below.

## Rules
- Use ONLY facts that are in the material. Do not invent facts.
- Write all content in the language of the material. Set "lang" to "he" for Hebrew, "en" for English.
- Split the material into 3–8 subjects (topics). Give each subject 2–4 games, and each game 6–12 questions.
- Mix game types. Prefer "mcq" for understanding, "truefalse" for common misconceptions, "match" for terms and definitions, "order" for processes and sequences, "typein" for short exact answers (one or two words), "flashcards" for things to memorize.
- Every question has an "id": short, lowercase, unique within its game (e.g. "q1", "boiling-point").
- Every project, subject and game "id" uses only lowercase English letters, digits and dashes. Game ids are unique in the whole project.
- Add a short "explanation" to questions where the reason matters. It is shown after the answer.
- mcq: 4 options. "answer" is the index of the correct option, counting from 0. Put the correct option FIRST ("answer": 0); the app shuffles. Wrong options must be plausible, similar in length and style, never jokes.
- truefalse: about half true and half false. False statements should be a believable mistake.
- typein: list every reasonable spelling in "answers"; the first one is shown as the correct answer.
- match: 4–6 pairs per question, short texts.
- order: 3–6 items, written in the CORRECT order; the app shuffles them.
- Give each project and subject a fitting emoji "icon".

## Format
{
  "id": "project-id",
  "title": "Project title",
  "lang": "en",
  "icon": "📘",
  "description": "One line about the project",
  "subjects": [
    {
      "id": "subject-id",
      "title": "Subject title",
      "icon": "🧪",
      "games": [
        {
          "id": "subject-id-quiz",
          "title": "Game title",
          "type": "mcq",
          "settings": { "lives": 3 },
          "questions": [
            { "id": "q1", "question": "…?", "options": ["correct", "wrong", "wrong", "wrong"], "answer": 0, "explanation": "…" }
          ]
        }
      ]
    }
  ]
}

## Question shapes by game "type"
- "mcq":        { "id", "question", "options": [4 strings], "answer": 0, "explanation"? }
- "truefalse":  { "id", "statement", "answer": true | false, "explanation"? }
- "typein":     { "id", "question", "answers": ["main answer", "other accepted spelling"], "explanation"? }
- "match":      { "id", "prompt", "pairs": [["term", "meaning"], ["term", "meaning"], …] }
- "order":      { "id", "prompt", "items": ["first", "second", "third", …] }
- "flashcards": { "id", "front", "back" }

Optional game "settings": "lives" (hearts, 0 = unlimited, default 3), "timeLimit" (seconds per question, 0 = none), "count" (questions per round).
Use "lives": 0 for match, order and flashcards games.

## Output
Return only the complete project.json, valid JSON, in one code block. If you can create files, also give it as a downloadable project.json.

## The material
`;

interface Section {
  title: string;
  body: (string | string[])[];
}

export const aboutContent: Record<Lang, { intro: string; sections: Section[]; promptTitle: string; promptSteps: string[] }> = {
  he: {
    intro: 'quizplay הופך חומר לימוד למשחקים קצרים: שאלות אמריקאיות, נכון או לא נכון, השלמה, התאמה, סידור וכרטיסיות. לומדים בקצב שלכם, צוברים נקודות וכוכבים, והאפליקציה זוכרת איפה טעיתם כדי שתתרגלו בדיוק את זה.',
    sections: [
      {
        title: 'איך משחקים',
        body: [
          [
            'בוחרים פרויקט, אחר כך נושא, ואז משחק.',
            'כל תשובה נכונה נותנת נקודות. כמה תשובות נכונות ברצף מכפילות את הנקודות 🔥.',
            'יש 3 לבבות ❤️. כל טעות מורידה לב, ובלי לבבות הסבב נגמר. בחלק מהמשחקים יש גם שעון.',
            'בסוף הסבב מקבלים עד 3 כוכבים לפי אחוז הדיוק, ונקודות ניסיון שמעלות רמה.',
            'במקלדת: המספרים 1–4 בוחרים תשובה, ו-Enter עובר לשאלה הבאה.',
          ],
        ],
      },
      {
        title: 'תרגול טעויות',
        body: [
          'כל שאלה שטעיתם בה נשמרת בעמוד "הטעויות שלי" של הפרויקט, עם התשובה שלכם והתשובה הנכונה. "תרגול טעויות" בונה סבב רק מהשאלות האלה. שאלה יוצאת מהתרגול אחרי שתי תשובות נכונות ברצף.',
        ],
      },
      {
        title: 'משתמשים והתקדמות',
        body: [
          'ההתקדמות נשמרת בדפדפן, בלי הרשמה. כמה אנשים יכולים לשחק על אותו מכשיר, כל אחד עם משתמש משלו (בעמוד הפרופיל). כדי להעביר התקדמות למכשיר אחר, מייצאים אותה לקובץ ומייבאים אותו שם.',
        ],
      },
      {
        title: 'הגדרות',
        body: [
          'בסרגל העליון: 🔊 להפעלה או השתקה של צלילים, 🌓 לערכת צבעים (אוטומטי, בהיר או כהה), ו-עב / EN לשפת הממשק. הממשק נשאר בשפה שבחרתם גם בפרויקט בשפה אחרת.',
        ],
      },
      {
        title: 'הוספת תוכן',
        body: [
          'פרויקט הוא קובץ JSON אחד, או קובץ zip עם project.json וקובץ לכל משחק. בעמוד "טעינת פרויקט" אפשר לפתוח קובץ כזה מיד ולראות אם יש בו שגיאות, לפני ששולחים אותו להוספה לאתר. ההסבר המלא על המבנה נמצא ב-CONTRIBUTING.md במאגר.',
        ],
      },
    ],
    promptTitle: 'יצירת פרויקט מחומר לימוד בעזרת AI',
    promptSteps: [
      'מעתיקים את ההנחיה למטה.',
      'מדביקים אותה בצ׳אט עם Claude, ChatGPT או Gemini, ומיד אחריה את חומר הלימוד: טקסט, סיכום, או קובץ מצורף. ההנחיה באנגלית, אבל התוכן ייכתב בשפת החומר.',
      'שומרים את התשובה כקובץ project.json.',
      'פותחים את "טעינת פרויקט", מעלים את הקובץ, ובודקים שאין שגיאות. אם יש, מדביקים אותן חזרה ל-AI ומבקשים תיקון.',
    ],
  },
  en: {
    intro: 'quizplay turns study material into short games: multiple choice, true or false, type the answer, match pairs, put in order, and flashcards. Learn at your own pace, earn points and stars, and the app remembers where you went wrong so you can practice exactly that.',
    sections: [
      {
        title: 'How to play',
        body: [
          [
            'Pick a project, then a subject, then a game.',
            'Every correct answer gives points. Correct answers in a row multiply them 🔥.',
            'You have 3 hearts ❤️. Each mistake costs one, and with none left the round ends. Some games have a timer too.',
            'At the end you get up to 3 stars for accuracy, and XP that raises your level.',
            'Keyboard: 1–4 pick an answer, Enter goes to the next question.',
          ],
        ],
      },
      {
        title: 'Practicing mistakes',
        body: [
          'Every question you got wrong is saved on the project\'s "My mistakes" page, with your answer and the correct one. "Practice mistakes" builds a round from only those questions. A question leaves practice after two correct answers in a row.',
        ],
      },
      {
        title: 'Users and progress',
        body: [
          'Progress is saved in the browser, with no sign-up. Several people can play on one device, each with their own user (on the profile page). To move progress to another device, export it to a file and import it there.',
        ],
      },
      {
        title: 'Settings',
        body: [
          'In the top bar: 🔊 turns sound on or off, 🌓 changes the theme (auto, light or dark), and עב / EN switches the interface language. The interface stays in your language even in a project written in another one.',
        ],
      },
      {
        title: 'Adding content',
        body: [
          'A project is one JSON file, or a zip with project.json and a file per game. The "Load a project" page opens one right away and lists any errors, before you send it to be added to the site. The full format is in CONTRIBUTING.md in the repository.',
        ],
      },
    ],
    promptTitle: 'Make a project from study material with AI',
    promptSteps: [
      'Copy the prompt below.',
      'Paste it into a chat with Claude, ChatGPT or Gemini, followed by your study material: text, notes, or an attached file.',
      'Save the answer as a file named project.json.',
      'Open "Load a project", upload the file, and check for errors. If there are any, paste them back to the AI and ask it to fix them.',
    ],
  },
};
