
import createLogger from 'redux-logger';
import * as formTypes from 'redux-form/lib/actionTypes';

let middleware;

if (__PRODUCTION__) {
  // We don't want logging in production.  We aren't going to be able to
  // access the logs so they don't really do us any good.
  const identityMiddleware = () => (nextMiddleware) => (action) => nextMiddleware(action);
  middleware = identityMiddleware;

} else {
  // In development, don't log redux-form/CHANGE actions.  They are very
  // frequent and colouring them can take quite a bit of time and processing
  // power.
  const options = {
    collapsed: true,
    level: 'info',
    predicate: (getState, action) => action.type !== formTypes.CHANGE,
  }
  middleware = createLogger(options);
}
export default middleware;
