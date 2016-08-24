
const deferreds = [];

let _requiring = false;
let zxcvbn = null;

function _require() {
  if (_requiring) {
    return;
  }
  _requiring = true;

  const cleanup = () => {
    deferreds.length = 0;
    _requiring = false;
  }

  require.ensure(['zxcvbn'], (require) => {
    zxcvbn = require('zxcvbn');
    deferreds.forEach(d => d.resolve(zxcvbn))
    cleanup()
  });
}

export function loadZxcvbn() {
  if (zxcvbn) {
    return Promise.resolve(zxcvbn);
  } else {
    const promise =  new Promise((resolve, reject) => {
      deferreds.push({resolve, reject});
    })
    _require()
    return promise;
  }
}

export function checkPasswordStrength(password, userInputs) {
  if (zxcvbn) {
    return zxcvbn(password, userInputs);
  } else {
    return null;
  }
}
