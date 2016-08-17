import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';  // eslint-disable-line no-unused-vars

import routes from 'routes';

require("styles/main.scss");

ReactDOM.render(
  <Router history={browserHistory}>{routes}</Router>,
  document.getElementById('root')
);