
import { createStore, compose } from 'redux';
import { reduxReactRouter } from 'redux-router';
import createHistory from 'history/lib/createBrowserHistory';

import rootReducer from 'reducers';
import enhanceWithMiddleware from 'middleware';
import routes from 'routes';

const storeEnhancers = [
  enhanceWithMiddleware,
  reduxReactRouter({routes, createHistory}),
  window.devToolsExtension ? window.devToolsExtension() : f => f,
]

const storeEnhancer  = compose(...storeEnhancers);
const finalCreateStore = storeEnhancer(createStore);

export default function configureStore(initialState) {
  const store = finalCreateStore(rootReducer, initialState);

  if (__DEVELOPMENT__ && module.hot) {
    // Enable Webpack hot module replacement for reducers.
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }
  console.log(store); // eslint-disable-line no-console
  return store;
}
