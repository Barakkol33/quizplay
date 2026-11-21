/** Cleanups (timers, key listeners) to run when the route changes. */
const fns: (() => void)[] = [];

export function onLeave(fn: () => void): void {
  fns.push(fn);
}

export function runLeave(): void {
  while (fns.length) fns.pop()!();
}
