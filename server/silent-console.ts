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
  Object.defineProperty(console, method, {
    configurable: true,
    writable: true,
    value: noop,
  });
}