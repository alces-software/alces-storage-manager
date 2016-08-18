
import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';

import App from 'containers/App';
import StorageSelectionPage from 'containers/StorageSelectionPageContainer';



const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={StorageSelectionPage} />
    <Redirect from="*" to="/" />
  </Route>
);

export default routes;
