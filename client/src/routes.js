
import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';

import App from 'containers/App';
import StorageSelectionPage from 'containers/StorageSelectionPageContainer';
import FileManagerPage from 'containers/FileManagerPageContainer';



const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={StorageSelectionPage} />
    <Route path="/storage/:hashedAddress" component={FileManagerPage} />
    <Redirect from="*" to="/" />
  </Route>
);

export default routes;
