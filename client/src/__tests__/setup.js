/* global global */

// Define some global variables which we define in the webpack configuration.
global.__TEST__          = true,
global.__DEVELOPMENT__   = false;
global.__PRODUCTION__    = false,
global.__UNIVERSAL__     = false


// Setup jsdom for testing React components.
import jsdom from 'jsdom';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

global.document = doc;
global.window = win;

// Hoist window properties such as `navigator` to the global object.
Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});
