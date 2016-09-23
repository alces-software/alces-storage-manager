
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';

import configureStore from 'store/configureStore';
import { loadStorageData } from 'storage/actions';
import routes from 'routes';

const store = configureStore();

store.dispatch(loadStorageData());

ReactDOM.render(
  <Provider store={store}>
    <div>
      <ReduxRouter>{routes}</ReduxRouter>
    </div>
  </Provider>,
  document.getElementById('root')
);
