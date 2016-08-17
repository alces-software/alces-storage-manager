import React from 'react';
import { Route, Redirect } from 'react-router';

import App from 'containers/App';

const routes = (
  <Route path="/" component={App}>
    <Redirect from="*" to="/" />
  </Route>
);

export default routes;