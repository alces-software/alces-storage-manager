
//
// Defines a wrapper around `console` to make eslint happy and to disable
// logging in production.
//

const consoleMethods = [
  "error",
  "group",
  "groupCollapsed",
  "groupEnd",
  "info",
  "log",
  "warn",
]

class Console {
  constructor() {
    if (__DEVELOPMENT__ || __TEST__) {
      /* eslint-disable no-console */
      consoleMethods.forEach(cm => {
        if (console[cm]) {
          this[cm] = console[cm].bind(console);
        } else {
          this[cm] = function() {};
        }
      });
      /* eslint-enable no-console */
    } else {
      consoleMethods.forEach(cm => {
        this[cm] = function() {};
      });
    }
  }
}

export default new Console();
