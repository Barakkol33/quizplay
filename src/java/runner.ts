/**
 * Compile and run Java in the browser.
 *
 * - JVM: CheerpJ (WebAssembly), loaded from its CDN on first use. Free under the
 *   CheerpJ Community licence for non-commercial / educational use.
 * - Compiler: ECJ 3.26 (Eclipse Compiler for Java, EPL-2.0), served from public/java/ecj.jar.
 *   It is the last ECJ that runs on Java 8; newer ones need Java 11+ and crash on
 *   CheerpJ's Java 11 module image.
 * - CheerpJ's /str/ has no subfolders, so sources are /str/<Class>.java (overwritten
 *   each run). Classes, the compile log and the output go to fresh paths under /files/.
 * - Output: a small wrapper class, compiled next to the learner's code, sends
 *   System.out and System.err to a file that we read back.
 */

const LOADER = 'https://cjrtnc.leaningtech.com/4.2/loader.js';
const JAVA_VERSION = 8;

declare global {
  function cheerpjInit(options?: Record<string, unknown>): Promise<void>;
  function cheerpjRunMain(className: string, classPath: string, ...args: string[]): Promise<number>;
  function cheerpOSAddStringFile(path: string, data: string | Uint8Array): void;
  function cjFileBlob(path: string): Promise<Blob>;
}

export interface RunResult {
  /** Compiled without errors. */
  compiled: boolean;
  /** Compiler messages. */
  compileOutput: string;
  /** What the program printed (stdout + stderr). */
  output: string;
  exitCode: number;
}

const WRAPPER = `import java.io.*;
public class QuizplayRunner {
  public static void main(String[] a) throws Exception {
    PrintStream ps = new PrintStream(new FileOutputStream(a[1]), true, "UTF-8");
    System.setOut(ps);
    System.setErr(ps);
    if (a.length > 2) System.setIn(new FileInputStream(a[2]));
    try {
      Class.forName(a[0]).getMethod("main", String[].class).invoke(null, (Object) new String[0]);
    } catch (NoSuchMethodException e) {
      System.out.println("Error: class " + a[0] + " has no main method");
    } catch (Throwable e) {
      // Under CheerpJ the exception may arrive unwrapped; print it like Java does.
      Throwable c = (e instanceof java.lang.reflect.InvocationTargetException && e.getCause() != null) ? e.getCause() : e;
      System.out.flush();
      System.err.println("Exception in thread \\"main\\" " + c);
      for (StackTraceElement s : c.getStackTrace()) {
        if (s.getClassName().startsWith("QuizplayRunner") || s.getClassName().startsWith("java.") || s.getClassName().startsWith("sun.") || s.getClassName().startsWith("jdk.")) continue;
        System.err.println("\\tat " + s);
      }
    } finally {
      ps.flush();
      ps.close();
    }
  }
}
`;

let ready: Promise<void> | null = null;
let queue: Promise<unknown> = Promise.resolve();
let runId = 0;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load the Java runtime. Check the internet connection.'));
    document.head.append(s);
  });
}

/** Load the JVM. The first call downloads the runtime; later calls are instant. */
export function initJava(): Promise<void> {
  ready ??= (async () => {
    await loadScript(LOADER);
    await cheerpjInit({ version: JAVA_VERSION, status: 'none' });
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

/** The public class name, which must also be the file name. */
export function mainClassName(src: string): string {
  return /public\s+(?:final\s+)?class\s+([A-Za-z_]\w*)/.exec(src)?.[1] ?? /class\s+([A-Za-z_]\w*)/.exec(src)?.[1] ?? 'Main';
}

async function readText(path: string): Promise<string> {
  try {
    return await (await cjFileBlob(path)).text();
  } catch {
    return '';
  }
}

const ecjPath = () => '/app' + new URL(import.meta.env.BASE_URL + 'java/ecj.jar', location.href).pathname;

/** ECJ's log starts with a date and a banner, and uses virtual paths; keep only the problems. */
function cleanCompileLog(log: string): string {
  return log
    .split('\n')
    .filter((l) => !l.startsWith('#'))
    .join('\n')
    .split('/str/').join('')
    .trim();
}

async function compileAndRun(src: string, input?: string): Promise<RunResult> {
  await initJava();
  const stamp = `${Date.now()}-${++runId}`;
  const cls = mainClassName(src);
  const out = `/files/qp-${stamp}`;
  const log = `/files/qp-${stamp}-compile.log`;
  cheerpOSAddStringFile(`/str/${cls}.java`, src);
  cheerpOSAddStringFile('/str/QuizplayRunner.java', WRAPPER);
  const code = await cheerpjRunMain(
    'org.eclipse.jdt.internal.compiler.batch.Main',
    ecjPath(),
    '-1.8', '-encoding', 'UTF-8', '-nowarn',
    '-d', out, '-log', log,
    `/str/${cls}.java`, '/str/QuizplayRunner.java',
  );
  // ECJ recovers from many errors and still writes classes, so trust the log, not only the exit code.
  const logText = await readText(log);
  if (code !== 0 || /\bERROR in\b/.test(logText)) {
    return { compiled: false, compileOutput: cleanCompileLog(logText) || `The compiler stopped (exit code ${code}).`, output: '', exitCode: code };
  }
  const outFile = `/files/qp-${stamp}-out.txt`;
  const args = [cls, outFile];
  if (input != null) {
    // What the user "types" (System.in). Scanner reads it as if typed.
    cheerpOSAddStringFile('/str/qp-input.txt', input.endsWith('\n') ? input : input + '\n');
    args.push('/str/qp-input.txt');
  }
  const exitCode = await cheerpjRunMain('QuizplayRunner', out, ...args);
  return { compiled: true, compileOutput: '', output: await readText(outFile), exitCode };
}

/** Runs one program at a time. */
export function runJava(src: string, input?: string): Promise<RunResult> {
  const p = queue.then(() => compileAndRun(src, input));
  queue = p.catch(() => undefined);
  return p;
}

/** Compare program output ignoring line endings and trailing spaces. */
export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/^\n+|\n+$/g, '');
}
