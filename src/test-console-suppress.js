/**
 * Suppress console.error, console.warn, and console.log during unit tests
 * so expected error paths and guards don't clutter the test output.
 */
(function () {
  if (typeof window === 'undefined') return;
  var noop = function () {};
  window.__originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log
  };
  console.error = noop;
  console.warn = noop;
  console.log = noop;
})();
