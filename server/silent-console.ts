const noop = () => undefined;

const consoleMethods = [
  'assert',
  'clear',
  'count',
  'countReset',
  'debug',
  'dir',
  'dirxml',
  'error',
  'group',
  'groupCollapsed',
  'groupEnd',
  'info',
  'log',
  'profile',
  'profileEnd',
  'table',
  'time',
  'timeEnd',
  'timeLog',
  'trace',
  'warn',
] as const;

for (const method of consoleMethods) {
  const original = (console as any)[method]?.bind(console);
  Object.defineProperty(console, method, {
    configurable: true,
    writable: true,
    value: (...args: unknown[]) => {
      if (args.some((arg) => typeof arg === "string" && arg.includes("[POS-DIAG]"))) {
        original?.(...args);
      } else {
        noop();
      }
    },
  });
}