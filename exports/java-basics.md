# ☕ Java בסיסי: חשבון, אקראיות והדפסות

הדפסות, פעולות חשבון, Math, מספרים אקראיים ותוכניות קטנות. כולל כתיבת קוד והרצה אמיתית בדפדפן.

*יוצא לבדיקה: 2026-11-22 · id: java-basics · 106 שאלות*

> **הערה:** שימו לב: השאלות והתשובות נכתבו ונבדקו בקפידה (כולל הרצה של הקוד), אבל ייתכנו בהן טעויות. אם משהו לא ברור או סותר את מה שלמדתם, בדקו מול חומר הלימוד או המורה, ואל תסתמכו רק על האתר. מצאתם טעות? סמנו 👎 והוסיפו הערה, או כתבו ל-blearning033@gmail.com

> **הנחיה לבודק:** לכל שאלה יש מזהה (id). כשמוצאים טעות, ציינו את המזהה ואת התיקון. ✅ מסמן את התשובה הנכונה.

## נושאים

1. 🖨️ הדפסות (25 שאלות)
2. ➗ פעולות חשבון (29 שאלות)
3. 🎲 מספרים אקראיים (23 שאלות)
4. 🧩 תוכניות קטנות (13 שאלות)
5. 💻 כתיבת קוד והרצה (16 שאלות)

---

## 1. 🖨️ הדפסות

println, print, שרשור מחרוזות ו-printf

### שיעור: הדפסות

*lesson · print-lesson · subjects/printing/lesson.json*

#### `println`

**📖 println ו-print**

ההדפסה הבסיסית ב-Java:

```java
System.out.println("Hello");   // מדפיס ויורד שורה
System.out.print("A");          // מדפיס בלי לרדת שורה
System.out.print("B");
System.out.println();           // רק ירידת שורה
```

הפלט: `Hello`, ואז `AB` באותה שורה.

- **println**: מדפיס ואז יורד לשורה חדשה.
- **print**: מדפיס ונשאר באותה שורה.

#### `concat`

**📖 חיבור מחרוזות (שרשור)**

הסימן `+` עושה שני דברים שונים: בין מספרים הוא **חיבור**, וכשאחד הצדדים מחרוזת הוא **שרשור** (הדבקה).

Java קוראת משמאל לימין:

```java
System.out.println(1 + 2 + "3");   // 33  : קודם 1+2=3, אחר כך "3"+"3"
System.out.println("1" + 2 + 3);   // 123 : "1"+2="12", אחר כך "12"+3
System.out.println("Sum: " + (2 + 3)); // Sum: 5 : הסוגריים קודם
```

**טיפ למבחן:** כשמדפיסים חישוב עם טקסט, שמים את החישוב בסוגריים.

#### `escape`

**📖 תווים מיוחדים**

בתוך מחרוזת, לוכסן הפוך `\` פותח תו מיוחד:

- `\n`: שורה חדשה
- `\t`: טאב (רווח גדול)
- `\"`: גרשיים בתוך מחרוזת
- `\\`: לוכסן הפוך עצמו

```java
System.out.println("He said \"hi\"");  // He said "hi"
System.out.println("Line1\nLine2");      // שתי שורות
```

#### `printf`

**📖 תוספת: printf**

printf מדפיס לפי תבנית. כל `%` הוא מקום שממלאים בערך:

- `%d`: מספר שלם (int)
- `%f`: מספר עשרוני. `%.2f` = שתי ספרות אחרי הנקודה (עם עיגול)
- `%s`: מחרוזת
- `%n`: ירידת שורה (printf לא יורד שורה לבד!)

```java
System.out.printf("%d + %d = %d%n", 2, 3, 5);  // 2 + 3 = 5
System.out.printf("%.2f%n", 3.14159);          // 3.14
System.out.printf("Name: %s%n", "Dana");       // Name: Dana
```

### מה יודפס? הדפסות

*output · print-output · subjects/printing/output.json*

#### `print-println`

```java
System.out.print("A");
System.out.println("B");
System.out.print("C");
```

**פלט צפוי:**

```
AB
C
```

> **הסבר:** print לא יורד שורה, println יורד שורה אחרי ההדפסה.

#### `num-num-str`

```java
System.out.println(1 + 2 + "3");
```

**פלט צפוי:**

```
33
```

> **הסבר:** משמאל לימין: 1+2=3 (חיבור), ואז 3+"3" = "33" (שרשור).

#### `str-num-num`

```java
System.out.println("1" + 2 + 3);
```

**פלט צפוי:**

```
123
```

> **הסבר:** מתחילים במחרוזת, אז הכול שרשור: "12" ואז "123".

#### `sum-no-parens`

```java
System.out.println("Sum: " + 2 + 3);
```

**פלט צפוי:**

```
Sum: 23
```

1. ✅ Sum: 23
2. ▫️ Sum: 5
3. ▫️ Sum: 2 3
4. ▫️ שגיאת קומפילציה

> **הסבר:** בלי סוגריים, "Sum: "+2 הופך למחרוזת, ואז מדביקים 3.

#### `sum-parens`

```java
System.out.println("Sum: " + (2 + 3));
```

**פלט צפוי:**

```
Sum: 5
```

#### `char-plus`

```java
System.out.println('a' + 1);
```

**פלט צפוי:**

```
98
```

1. ✅ 98
2. ▫️ b
3. ▫️ a1
4. ▫️ 97

> **הסבר:** char ועוד int הוא int: הקוד של 'a' הוא 97, ועוד 1 = 98.

#### `char-cast`

```java
System.out.println((char) ('a' + 1));
```

**פלט צפוי:**

```
b
```

> **הסבר:** המרה ל-char הופכת את 98 בחזרה לתו: b.

#### `newline`

```java
System.out.println("Line1\nLine2");
```

**פלט צפוי:**

```
Line1
Line2
```

#### `quotes`

```java
System.out.println("He said \"hi\"");
```

**פלט צפוי:**

```
He said "hi"
```

#### `printf-2f`

```java
System.out.printf("%.2f%n", 3.14159);
```

**פלט צפוי:**

```
3.14
```

#### `printf-d`

```java
System.out.printf("%d + %d = %d%n", 2, 3, 2 + 3);
```

**פלט צפוי:**

```
2 + 3 = 5
```

#### `mixed-concat`

```java
System.out.println(10 + 20 + "" + 10 + 20);
```

**פלט צפוי:**

```
301020
```

> **הסבר:** 10+20=30 עוד לפני המחרוזת הריקה. אחריה הכול שרשור: "30"+"10"+"20".

#### `div-concat`

```java
System.out.println(5 / 2 + " " + 5 / 2.0);
```

**פלט צפוי:**

```
2 2.5
```

#### `length`

```java
String s = "Java";
System.out.println(s + s.length());
```

**פלט צפוי:**

```
Java4
```

### הדפסות: שאלות

*mcq · print-quiz · subjects/printing/quiz.json*

#### `println-vs-print`

מה ההבדל בין println ל-print?

1. ✅ println יורד שורה אחרי ההדפסה, print לא
2. ▫️ print יורד שורה, println לא
3. ▫️ println מדפיס רק מספרים
4. ▫️ אין הבדל

#### `printf-newline`

מה חסר כאן כדי שההדפסה הבאה תתחיל בשורה חדשה?

```java
System.out.printf("x = %d", x);
```

1. ✅ `%n (או \n) בסוף התבנית`
2. ▫️ `נקודה-פסיק נוספת`
3. ▫️ `להחליף את %d ב-%s`
4. ▫️ שום דבר, printf יורד שורה לבד

> **הסבר:** printf לא יורד שורה לבד, צריך %n בסוף.

#### `fmt-2dec`

איזו תבנית מדפיסה מספר עשרוני עם שתי ספרות אחרי הנקודה?

1. ✅ `%.2f`
2. ▫️ `%2d`
3. ▫️ `%f2`
4. ▫️ `%.2d`

#### `fmt-string`

איזה מציין מתאים להדפסת מחרוזת ב-printf?

1. ✅ `%s`
2. ▫️ `%d`
3. ▫️ `%c`
4. ▫️ `%f`

#### `escape-quote`

איך מדפיסים גרשיים בתוך מחרוזת?

1. ✅ `\"`
2. ▫️ `""`
3. ▫️ `'"'`
4. ▫️ `/"`

#### `concat-fix`

רוצים שיודפס Total: 7. איזו שורה נכונה?

1. ✅ `System.out.println("Total: " + (3 + 4));`
2. ▫️ `System.out.println("Total: " + 3 + 4);`
3. ▫️ `System.out.println("Total: " - 3 + 4);`
4. ▫️ `System.out.println(Total: + 3 + 4);`

#### `char-int`

מה הטיפוס של הביטוי 'a' + 1?

1. ✅ int
2. ▫️ char
3. ▫️ String
4. ▫️ double

### השלימו את הקוד

*cloze · print-cloze · subjects/printing/cloze.json*

#### `printf-avg`

רוצים שיודפס: Average: 8.33

```java
double avg = 25 / 3.0;
System.out.⟦printf⟧("Average: ⟦%.2f⟧%n", avg);
```

**מסיחים (לא נכונים):** println · `%d` · `%s`

#### `println-sum`

רוצים שיודפס: 3 + 4 = 7

```java
int a = 3, b = 4;
System.out.println(a + " + " + b + " = " + ⟦(a + b)⟧);
```

**מסיחים (לא נכונים):** `a + b` · `"a + b"`

#### `printf-name`

רוצים שיודפס: Hi Dana, you are 12

```java
String name = "Dana";
int age = 12;
System.out.printf("Hi ⟦%s⟧, you are ⟦%d⟧%n", name, age);
```

**מסיחים (לא נכונים):** `%f` · `%n`

#### `two-lines`

רוצים שתי שורות: Hello ואז World

```java
System.out.print("Hello⟦\n⟧World⟦\n⟧");
```

**מסיחים (לא נכונים):** `\t` · `/n`

> **הסבר:** שני ה-\n: אחד בין המילים, ואחד בסוף כדי שההדפסה הבאה תתחיל בשורה חדשה.

---

## 2. ➗ פעולות חשבון

int ו-double, חילוק ושארית, סדר פעולות, המרות ו-Math

### שיעור: פעולות חשבון

*lesson · math-lesson · subjects/arithmetic/lesson.json*

#### `types`

**📖 int ו-double**

- **int**: מספר שלם: `5`, `-3`, `0`
- **double**: מספר עשרוני: `2.5`, `3.0`

כשמחברים int ו-double, התוצאה double: `5 + 2.0` הוא `7.0`.

```java
int x = 3.5;     // שגיאת קומפילציה! אי אפשר לשים עשרוני ב-int
double d = 3;    // תקין: d = 3.0
```

#### `division`

**📖 חילוק ושארית**

**חילוק בין שני int נותן int**: החלק העשרוני נחתך (לא מעוגל!).

```java
7 / 2      // 3
7 / 2.0    // 3.5  (אחד מהם double)
7 % 2      // 1    שארית החלוקה
```

שימושים נפוצים ב-`%`:

- זוגי? `n % 2 == 0`
- ספרת האחדות: `n % 10`, ולהוריד אותה: `n / 10`
- שניות לדקות: `sec / 60` דקות ו-`sec % 60` שניות

#### `precedence`

**📖 סדר פעולות**

כמו במתמטיקה: `* / %` לפני `+ -`, ומשמאל לימין באותה רמה. סוגריים קודם.

```java
2 + 3 * 4     // 14
(2 + 3) * 4   // 20
20 / 4 * 2    // 10  (משמאל לימין: 5*2)
10 - 4 - 3    // 3
```

#### `casting`

**📖 המרות (casting)**

המרה כותבים בסוגריים לפני הערך:

```java
(int) 3.99          // 3   חותך, לא מעגל
(double) 7 / 2      // 3.5 קודם 7 הופך ל-7.0, ואז חילוק
(double) (7 / 2)    // 3.0 קודם חילוק שלמים (3), ואז המרה
double d = 7 / 2;   // 3.0 אותה מלכודת
```

**ההמרה נצמדת לערך שמיד אחריה.** בגלל זה יש הבדל בין שתי השורות האמצעיות.

#### `assign`

**📖 קיצורים: ++ ו-+=**

```java
x += 3;   // x = x + 3
x *= 2;   // x = x * 2
x++;      // x = x + 1
x--;      // x = x - 1
```

ההבדל בין `a++` ל-`++a` בתוך ביטוי:

```java
int a = 5;
int b = a++;   // b = 5, ואז a = 6  (קודם משתמשים, אחר כך מגדילים)
int c = ++a;   // a = 7, ואז c = 7  (קודם מגדילים)
```

#### `math`

**📖 המחלקה Math**

- `Math.pow(2, 3)`: חזקה: `8.0` (תמיד double)
- `Math.sqrt(16)`: שורש: `4.0`
- `Math.abs(-7)`: ערך מוחלט: `7`
- `Math.max(3, 8)`, `Math.min(3, 8)`: `8`, `3`
- `Math.round(2.5)`: עיגול לשלם הקרוב: `3`
- `Math.ceil(4.1)`: עיגול למעלה: `5.0`, `Math.floor(4.9)`: למטה: `4.0`
- `Math.PI`: `3.141592653589793`

### מה יודפס? חשבון

*output · math-output · subjects/arithmetic/output.json*

#### `int-div`

```java
System.out.println(7 / 2);
```

**פלט צפוי:**

```
3
```

> **הסבר:** חילוק בין שני int חותך את החלק העשרוני.

#### `double-div`

```java
System.out.println(7 / 2.0);
```

**פלט צפוי:**

```
3.5
```

#### `mod`

```java
System.out.println(7 % 3);
```

**פלט צפוי:**

```
1
```

#### `precedence`

```java
System.out.println(2 + 3 * 4);
```

**פלט צפוי:**

```
14
```

#### `left-to-right`

```java
System.out.println(20 / 4 * 2);
```

**פלט צפוי:**

```
10
```

> **הסבר:** / ו-* באותה רמה, אז משמאל לימין: 20/4=5, ואז 5*2.

#### `double-from-int-div`

```java
double d = 7 / 2;
System.out.println(d);
```

**פלט צפוי:**

```
3.0
```

1. ✅ `3.0`
2. ▫️ `3.5`
3. ▫️ 3
4. ▫️ שגיאת קומפילציה

> **הסבר:** קודם מחושב 7/2 כחילוק שלמים (3), ורק אז נשמר ב-double: 3.0.

#### `cast-first`

```java
System.out.println((double) 7 / 2);
```

**פלט צפוי:**

```
3.5
```

#### `cast-truncates`

```java
System.out.println((int) 3.99);
```

**פלט צפוי:**

```
3
```

> **הסבר:** המרה ל-int חותכת, לא מעגלת.

#### `compound`

```java
int x = 5;
x += 3;
x *= 2;
System.out.println(x);
```

**פלט צפוי:**

```
16
```

#### `post-inc`

```java
int a = 5;
int b = a++;
System.out.println(a + " " + b);
```

**פלט צפוי:**

```
6 5
```

#### `pre-inc`

```java
int a = 5;
int b = ++a;
System.out.println(a + " " + b);
```

**פלט צפוי:**

```
6 6
```

#### `pow`

```java
System.out.println(Math.pow(2, 3));
```

**פלט צפוי:**

```
8.0
```

> **הסבר:** Math.pow מחזיר תמיד double.

#### `sqrt`

```java
System.out.println(Math.sqrt(16));
```

**פלט צפוי:**

```
4.0
```

#### `max-min`

```java
System.out.println(Math.max(3, 8) + Math.min(3, 8));
```

**פלט צפוי:**

```
11
```

#### `round`

```java
System.out.println(Math.round(2.5) + " " + Math.round(2.4));
```

**פלט צפוי:**

```
3 2
```

#### `ceil-floor`

```java
System.out.println(Math.ceil(4.1) + " " + Math.floor(4.9));
```

**פלט צפוי:**

```
5.0 4.0
```

#### `digits`

```java
int n = 1234;
System.out.println(n % 10 + " " + n / 10);
```

**פלט צפוי:**

```
4 123
```

#### `even`

```java
int n = 17;
System.out.println(n % 2 == 0);
```

**פלט צפוי:**

```
false
```

### נכון או לא נכון

*truefalse · math-tf · subjects/arithmetic/truefalse.json*

#### `int-assign`

השורה int x = 3.5; מתקמפלת, ו-x יהיה 3.

```java
int x = 3.5;
```

**תשובה:** ❌ לא נכון

> **הסבר:** זו שגיאת קומפילציה. צריך המרה מפורשת: (int) 3.5.

#### `double-assign`

השורה double d = 3; תקינה, ו-d יהיה 3.0.

**תשובה:** ✅ נכון

#### `cast-rounds`

(int) 2.9 שווה 3, כי ההמרה מעגלת.

**תשובה:** ❌ לא נכון

> **הסבר:** המרה ל-int חותכת: התוצאה 2. לעיגול משתמשים ב-Math.round.

#### `int-div-zero`

חילוק int באפס (למשל 10 / 0) זורק ArithmeticException בזמן ריצה.

**תשובה:** ✅ נכון

#### `pow-int`

Math.pow(2, 3) מחזיר int.

**תשובה:** ❌ לא נכון

> **הסבר:** הוא מחזיר double: 8.0.

#### `mod-even`

n % 2 == 0 בודק אם n זוגי.

**תשובה:** ✅ נכון

#### `precedence`

הביטוי 10 - 4 - 3 שווה 9.

**תשובה:** ❌ לא נכון

> **הסבר:** משמאל לימין: (10-4)-3 = 3.

#### `post-inc`

אחרי int a = 5; int b = a++; הערך של b הוא 5.

**תשובה:** ✅ נכון

### מה הטיפוס של התוצאה?

*categorize · math-types · subjects/arithmetic/types.json*

#### `result-type`

לאיזה טיפוס שייכת התוצאה?

- **int:** `5 / 2` · `'a' + 1` · `(int) 3.9` · `10 % 3`
- **double:** `5 / 2.0` · `Math.sqrt(9)` · `Math.pow(2, 2)`
- **String:** `"5" + 2` · `"" + 3 + 4`

> **הסבר:** אם יש double בחישוב, התוצאה double. אם יש מחרוזת עם +, התוצאה String.

### Math: מה התוצאה?

*match · math-match · subjects/arithmetic/match.json*

#### `math-results`

חברו כל ביטוי לתוצאה שלו

- `Math.pow(2, 4)` ⟷ `16.0`
- `Math.sqrt(25)` ⟷ `5.0`
- `Math.abs(-9)` ⟷ 9
- `Math.round(3.6)` ⟷ 4
- `Math.floor(3.6)` ⟷ `3.0`

#### `ops-results`

חברו כל ביטוי לתוצאה שלו

- `17 / 5` ⟷ 3
- `17 % 5` ⟷ 2
- `17 / 5.0` ⟷ `3.4`
- `(int) 17.9` ⟷ 17
- `17 / 5 * 5` ⟷ 15

---

## 3. 🎲 מספרים אקראיים

Math.random, המחלקה Random, טווחים ומלכודות

### שיעור: מספרים אקראיים

*lesson · rnd-lesson · subjects/random/lesson.json*

#### `random-class`

**📖 המחלקה Random**

```java
import java.util.Random;   // בראש הקובץ!

Random rnd = new Random();
int a = rnd.nextInt(10);        // 0 עד 9
int dice = rnd.nextInt(6) + 1;  // 1 עד 6
double d = rnd.nextDouble();    // 0.0 עד 1.0 (לא כולל)
boolean b = rnd.nextBoolean();  // true או false
```

 `rnd.nextInt(n)` נותן **0 עד n-1**. אותה נוסחה: `rnd.nextInt(max - min + 1) + min`.

#### `math-random`

**📖 דרך נוספת: Math.random()**

 `Math.random()` מחזיר **double** אקראי מ-`0.0` (כולל) עד `1.0` (**לא כולל**): למשל `0.7314...`.

כדי לקבל מספר שלם בטווח, מכפילים, ממירים ל-int ומזיזים:

```java
(int) (Math.random() * 6)        // 0 עד 5
(int) (Math.random() * 6) + 1    // 1 עד 6 (קוביה)
```

**מלכודת:** `(int) Math.random() * 6` הוא **תמיד 0**! ההמרה נצמדת ל-`Math.random()` (שהוא תמיד פחות מ-1, אז נחתך ל-0), ורק אז הכפל.

#### `formula`

**📖 הנוסחה לכל טווח**

מספר שלם אקראי בין **min** ל-**max** (כולל שניהם):

```java
(int) (Math.random() * (max - min + 1)) + min
```

- `max - min + 1` = כמה ערכים יש בטווח
- `+ min` = מאיפה מתחילים

דוגמה: בין 20 ל-30 יש 11 ערכים: `(int) (Math.random() * 11) + 20`

### טווחים: מה יכול לצאת?

*mcq · rnd-ranges · subjects/random/ranges.json*

#### `nextint-10`

אילו ערכים יכולים לצאת?

```java
rnd.nextInt(10)
```

1. ✅ 0 עד 9
2. ▫️ 1 עד 10
3. ▫️ 0 עד 10
4. ▫️ 1 עד 9

#### `dice`

אילו ערכים יכולים לצאת?

```java
rnd.nextInt(6) + 1
```

1. ✅ 1 עד 6
2. ▫️ 0 עד 6
3. ▫️ 1 עד 7
4. ▫️ 0 עד 5

#### `shifted`

אילו ערכים יכולים לצאת?

```java
rnd.nextInt(11) + 5
```

1. ✅ 5 עד 15
2. ▫️ 5 עד 16
3. ▫️ 0 עד 15
4. ▫️ 6 עד 16

> **הסבר:** nextInt(11) נותן 0 עד 10, ועוד 5: 5 עד 15.

#### `math-random-6`

אילו ערכים יכולים לצאת?

```java
(int) (Math.random() * 6) + 1
```

1. ✅ 1 עד 6
2. ▫️ 0 עד 6
3. ▫️ 0 עד 5
4. ▫️ 1 עד 7

#### `trap`

מה הערך של הביטוי?

```java
(int) Math.random() * 10
```

1. ✅ תמיד 0
2. ▫️ 0 עד 9
3. ▫️ 0 עד 10
4. ▫️ 1 עד 10

> **הסבר:** ההמרה נצמדת ל-Math.random(): הוא קטן מ-1 אז נחתך ל-0, ו-0*10 = 0.

#### `double-range`

מה יכול לצאת?

```java
Math.random() * 5
```

1. ✅ `double מ-0.0 עד 5.0, לא כולל 5.0`
2. ▫️ `int מ-0 עד 5`
3. ▫️ `int מ-0 עד 4`
4. ▫️ `double מ-1.0 עד 5.0`

#### `pick-20-30`

איזה ביטוי נותן מספר שלם אקראי בין 20 ל-30 (כולל)?

1. ✅ `rnd.nextInt(11) + 20`
2. ▫️ `rnd.nextInt(10) + 20`
3. ▫️ `rnd.nextInt(30) + 20`
4. ▫️ `rnd.nextInt(31)`

> **הסבר:** יש 11 ערכים (30-20+1), ומתחילים ב-20.

#### `pick-1-100`

איזה ביטוי נותן מספר שלם אקראי בין 1 ל-100 (כולל)?

1. ✅ `(int) (Math.random() * 100) + 1`
2. ▫️ `(int) (Math.random() * 100)`
3. ▫️ `(int) Math.random() * 100 + 1`
4. ▫️ `(int) (Math.random() * 101)`

#### `coin`

אילו ערכים יכולים לצאת?

```java
rnd.nextInt(2)
```

1. ✅ 0 או 1
2. ▫️ 1 או 2
3. ▫️ 0, 1 או 2
4. ▫️ true או false

#### `import`

מה צריך לכתוב בראש הקובץ כדי להשתמש ב-Random?

1. ✅ `import java.util.Random;`
2. ▫️ `import java.lang.Math;`
3. ▫️ `import Random;`
4. ▫️ שום דבר

> **הסבר:** Math נמצא ב-java.lang ולא צריך import. Random נמצא ב-java.util.

#### `random-type`

איזה טיפוס מחזיר Math.random()?

1. ✅ double
2. ▫️ int
3. ▫️ long
4. ▫️ boolean

### אילו ערכים אפשריים?

*multi · rnd-multi · subjects/random/possible.json*

#### `nextint-5-3`

אילו מהערכים יכולים לצאת?

```java
rnd.nextInt(5) + 3
```

1. ▫️ 2
2. ✅ 3
3. ✅ 5
4. ✅ 7
5. ▫️ 8

> **הסבר:** nextInt(5) נותן 0 עד 4, ועוד 3: 3 עד 7.

#### `math-4`

אילו מהערכים יכולים לצאת?

```java
(int) (Math.random() * 4)
```

1. ✅ 0
2. ✅ 1
3. ✅ 3
4. ▫️ 4
5. ▫️ `-1`

#### `dice-sum`

זורקים שתי קוביות. אילו סכומים אפשריים?

```java
int sum = (rnd.nextInt(6) + 1) + (rnd.nextInt(6) + 1);
```

1. ▫️ 1
2. ✅ 2
3. ✅ 7
4. ✅ 12
5. ▫️ 13

> **הסבר:** כל קוביה 1 עד 6, אז הסכום 2 עד 12.

#### `minus`

אילו מהערכים יכולים לצאת?

```java
rnd.nextInt(21) - 10
```

1. ✅ `-10`
2. ✅ 0
3. ✅ 10
4. ▫️ 11
5. ▫️ `-11`

> **הסבר:** 0 עד 20, פחות 10: מ-10- עד 10.

### ביטוי וטווח

*match · rnd-match · subjects/random/match.json*

#### `ranges`

חברו כל ביטוי לטווח שלו

- `rnd.nextInt(6)` ⟷ 0 עד 5
- `rnd.nextInt(6) + 1` ⟷ 1 עד 6
- `rnd.nextInt(10) + 10` ⟷ 10 עד 19
- `rnd.nextInt(3) * 2` ⟷ 0, 2 או 4
- `(int) Math.random() * 6` ⟷ תמיד 0

### השלימו את הקוד

*cloze · rnd-cloze · subjects/random/cloze.json*

#### `dice`

קוביה: מספר בין 1 ל-6

```java
⟦import⟧ java.util.Random;
...
Random rnd = new Random();
int dice = rnd.⟦nextInt⟧(6) ⟦+ 1⟧;
```

**מסיחים (לא נכונים):** nextDouble · `- 1` · include

#### `range-20-30`

מספר בין 20 ל-30 (כולל) בעזרת Math.random

```java
int x = (int) (Math.random() * ⟦11⟧) + ⟦20⟧;
```

**מסיחים (לא נכונים):** 10 · 30 · 21

#### `coin`

מטבע: מדפיסים Heads או Tails

```java
if (rnd.⟦nextBoolean⟧()) {
    System.out.println("Heads");
} ⟦else⟧ {
    System.out.println("Tails");
}
```

**מסיחים (לא נכונים):** nextInt · then

### מה יודפס?

*output · rnd-output · subjects/random/output.json*

#### `trap-zero`

```java
System.out.println((int) Math.random() * 10);
```

**פלט צפוי:**

```
0
```

> **הסבר:** תמיד 0: ההמרה ל-int קורית לפני הכפל.

#### `nextint-one`

```java
Random rnd = new Random();
System.out.println(rnd.nextInt(1));
```

**פלט צפוי:**

```
0
```

> **הסבר:** nextInt(1) נותן 0 עד 0, כלומר תמיד 0.

#### `times-one`

```java
System.out.println((int) (Math.random() * 1) + 5);
```

**פלט צפוי:**

```
5
```

#### `nextint-range-check`

```java
Random rnd = new Random();
int x = rnd.nextInt(6) + 1;
System.out.println(x >= 1 && x <= 6);
```

**פלט צפוי:**

```
true
```

---

## 4. 🧩 תוכניות קטנות

לולאות ותנאים עם חשבון: מעקב אחרי קוד וסידור שורות

### מעקב אחרי תוכנית

*output · prog-output · subjects/programs/output.json*

#### `squares`

```java
for (int i = 1; i <= 3; i++) {
    System.out.print(i * i + " ");
}
```

**פלט צפוי:**

```
1 4 9
```

#### `sum-loop`

```java
int sum = 0;
for (int i = 1; i <= 5; i++) {
    sum += i;
}
System.out.println(sum);
```

**פלט צפוי:**

```
15
```

#### `if-mod`

```java
int x = 10;
if (x % 3 == 0) {
    System.out.println("Fizz");
} else {
    System.out.println(x % 3);
}
```

**פלט צפוי:**

```
1
```

#### `step-down`

```java
for (int i = 10; i > 0; i -= 3) {
    System.out.print(i + ",");
}
```

**פלט צפוי:**

```
10,7,4,1,
```

#### `digit-sum`

```java
int n = 4729, s = 0;
while (n > 0) {
    s += n % 10;
    n /= 10;
}
System.out.println(s);
```

**פלט צפוי:**

```
22
```

> **הסבר:** כל סיבוב מוסיף את ספרת האחדות (n % 10) ומוריד אותה (n /= 10): 9+2+7+4 = 22.

#### `triangle`

```java
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= i; j++) {
        System.out.print("*");
    }
    System.out.println();
}
```

**פלט צפוי:**

```
*
**
***
```

#### `count-div4`

```java
int count = 0;
for (int i = 1; i <= 20; i++) {
    if (i % 4 == 0) {
        count++;
    }
}
System.out.println(count);
```

**פלט צפוי:**

```
5
```

#### `swap`

```java
int a = 3, b = 7;
int t = a;
a = b;
b = t;
System.out.println(a + " " + b);
```

**פלט צפוי:**

```
7 3
```

#### `avg-int`

```java
int a = 7, b = 8, c = 10;
System.out.println((a + b + c) / 3);
```

**פלט צפוי:**

```
8
```

1. ✅ 8
2. ▫️ `8.33`
3. ▫️ `8.333333333333334`
4. ▫️ 25

> **הסבר:** כל הערכים int, אז החילוק חותך: 25 / 3 = 8.

#### `seconds`

```java
int total = 3725;
System.out.println(total / 3600 + ":" + total % 3600 / 60 + ":" + total % 60);
```

**פלט צפוי:**

```
1:2:5
```

### סדרו את שורות התוכנית

*order · prog-order · subjects/programs/order.json*

#### `dice-program`

סדרו את השורות לתוכנית שמגרילה קוביה ומדפיסה אותה

**הסדר הנכון:**

1. `import java.util.Random;`
2. `public class Main {`
3. `public static void main(String[] args) {`
4. `Random rnd = new Random();`
5. `int dice = rnd.nextInt(6) + 1;`
6. `System.out.println(dice);`
7. `}`
8. `}`

#### `digit-sum-program`

סדרו את השורות לחישוב סכום הספרות של 4729

**הסדר הנכון:**

1. `int n = 4729, sum = 0;`
2. `while (n > 0) {`
3. `sum += n % 10;`
4. `n /= 10;`
5. `}`
6. `System.out.println(sum);`

#### `swap-program`

סדרו את השורות להחלפת הערכים של a ו-b

**הסדר הנכון:**

1. `int a = 3, b = 7;`
2. `int temp = a;`
3. `a = b;`
4. `b = temp;`
5. `System.out.println(a + " " + b);`

---

## 5. 💻 כתיבת קוד והרצה

כותבים Java ומריצים בדפדפן. ההרצה הראשונה טוענת את Java (כ-20MB).

### תרגילי קוד

*code · code-exercises · subjects/coding/exercises.json*

#### `hello`

הדפיסו בדיוק: **Hello, Java!**

**פלט צפוי:**

```
Hello, Java!
```

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}

```

#### `div-mod`

הדפיסו את התוצאה של **17 חלקי 5** (חילוק שלמים) ובשורה הבאה את **השארית**.

**פלט צפוי:**

```
3
2
```

**רמז:** חילוק שלמים: `/`. שארית: `%`.

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        System.out.println(17 / 5);
        System.out.println(17 % 5);
    }
}

```

#### `average`

חשבו והדפיסו את **הממוצע** של 7, 8 ו-10 כ-double.

**פלט צפוי:**

```
8.333333333333334
```

**רמז:** אם מחלקים ב-`3` מקבלים חילוק שלמים. נסו `3.0`.

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        int a = 7, b = 8, c = 10;
        System.out.println((a + b + c) / 3.0);
    }
}

```

#### `average-2`

אותו ממוצע של 7, 8 ו-10, אבל **מעוגל לשתי ספרות אחרי הנקודה** (8.33).

**פלט צפוי:**

```
8.33
```

**רמז:** כופלים ב-100, מעגלים עם `Math.round`, ומחלקים ב-`100.0`. (אפשר גם `printf` עם `%.2f`.)

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        double avg = (7 + 8 + 10) / 3.0;
        System.out.println(Math.round(avg * 100) / 100.0);
    }
}

```

#### `circle`

הדפיסו את **שטח העיגול** שרדיוסו 2.5, מעוגל לשתי ספרות אחרי הנקודה (19.63). שטח = π·r²

**פלט צפוי:**

```
19.63
```

**רמז:** `Math.PI * r * r`, ואז אותו טריק עיגול: `Math.round(x * 100) / 100.0`

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        double r = 2.5;
        double area = Math.PI * r * r;
        System.out.println(Math.round(area * 100) / 100.0);
    }
}

```

#### `max3`

הדפיסו את **הגדול** מבין 12, 45 ו-7 בעזרת `Math.max`.

**פלט צפוי:**

```
45
```

**רמז:** אפשר לקנן: `Math.max(a, Math.max(b, c))`

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        System.out.println(Math.max(12, Math.max(45, 7)));
    }
}

```

#### `time`

המירו **3725 שניות** לשעות, דקות ושניות, והדפיסו בפורמט **1:2:5** (שעות:דקות:שניות).

**פלט צפוי:**

```
1:2:5
```

**רמז:** שעות: `t / 3600`. דקות: `t % 3600 / 60`. שניות: `t % 60`.

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        int t = 3725;
        System.out.println(t / 3600 + ":" + t % 3600 / 60 + ":" + t % 60);
    }
}

```

#### `scanner-sum`

**קלט:** קראו שני מספרים שלמים מהמשתמש בעזרת `Scanner`, והדפיסו את הסכום שלהם. (הקלט לבדיקה: 7 ו-5.)

**קלט:**

```
7
5
```

**פלט צפוי:**

```
12
```

**רמז:** `int a = scan.nextInt();`

**פתרון:**

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scan = new Scanner(System.in);
        int a = scan.nextInt();
        int b = scan.nextInt();
        System.out.println(a + b);
    }
}

```

#### `digit-sum`

הדפיסו את **סכום הספרות** של 4729 בעזרת `%` ו-`/` (בלי להפוך למחרוזת).

**פלט צפוי:**

```
22
```

**רמז:** לולאת `while (n > 0)`: מוסיפים `n % 10`, ואז `n /= 10`.

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        int n = 4729, sum = 0;
        while (n > 0) {
            sum += n % 10;
            n /= 10;
        }
        System.out.println(sum);
    }
}

```

#### `table`

הדפיסו את **לוח הכפל של 7** מ-1 עד 5, כל שורה בפורמט: `7 x 1 = 7`

**פלט צפוי:**

```
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
```

**רמז:** לולאת `for` מ-1 עד 5.

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("7 x " + i + " = " + (7 * i));
        }
    }
}

```

#### `even-odd`

לכל מספר מ-1 עד 5 הדפיסו שורה כמו `1 odd` או `2 even`.

**פלט צפוי:**

```
1 odd
2 even
3 odd
4 even
5 odd
```

**רמז:** `if (i % 2 == 0)`

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            if (i % 2 == 0) {
                System.out.println(i + " even");
            } else {
                System.out.println(i + " odd");
            }
        }
    }
}

```

#### `dice`

**קוביה:** הגרילו מספר שלם בין 1 ל-6 והדפיסו אותו. (הבדיקה מקבלת כל מספר בטווח.)

**כל פלט שמתאים לביטוי:** `^[1-6]$`

**רמז:** `rnd.nextInt(6) + 1`

**פתרון:**

```java
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random rnd = new Random();
        System.out.println(rnd.nextInt(6) + 1);
    }
}

```

#### `five-random`

הדפיסו **5 מספרים אקראיים בין 10 ל-20** (כולל), כל אחד בשורה משלו.

**כל פלט שמתאים לביטוי:** `^(1[0-9]|20)(\n(1[0-9]|20)){4}$`

**רמז:** כמה ערכים יש בין 10 ל-20? `rnd.nextInt(...) + 10` בתוך לולאה.

**פתרון:**

```java
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random rnd = new Random();
        for (int i = 0; i < 5; i++) {
            System.out.println(rnd.nextInt(11) + 10);
        }
    }
}

```

#### `coin`

**מטבע:** הדפיסו באקראי `Heads` או `Tails`.

**כל פלט שמתאים לביטוי:** `^(Heads|Tails)$`

**רמז:** `rnd.nextBoolean()` או `rnd.nextInt(2) == 0`

**פתרון:**

```java
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random rnd = new Random();
        if (rnd.nextBoolean()) {
            System.out.println("Heads");
        } else {
            System.out.println("Tails");
        }
    }
}

```

#### `math-random-range`

בלי המחלקה Random: הגרילו בעזרת **Math.random()** מספר שלם בין **50 ל-60** (כולל) והדפיסו אותו.

**כל פלט שמתאים לביטוי:** `^(5[0-9]|60)$`

**רמז:** `(int) (Math.random() * 11) + 50`. שימו לב לסוגריים!

**פתרון:**

```java
public class Main {
    public static void main(String[] args) {
        System.out.println((int) (Math.random() * 11) + 50);
    }
}

```

### ארגז חול

*code · code-sandbox · subjects/coding/sandbox.json*

#### `free`

**ארגז חול:** כתבו כל תוכנית שתרצו והריצו אותה. אין בדיקה, רק להתנסות.

*בלי בדיקה (תרגול חופשי)*

**פתרון:**

```java
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random rnd = new Random();
        System.out.println("Hello!");
        System.out.println(7 / 2 + " " + 7 / 2.0);
        System.out.printf("%.2f%n", Math.PI);
        System.out.println(rnd.nextInt(6) + 1);
    }
}

```

---
