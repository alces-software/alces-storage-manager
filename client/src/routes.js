
import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';

import { createAuthorize } from 'flight-common';
import { authenticatedWithCurrentStorage, redirectToIndexPage } from 'utils/authorization';

import App from 'containers/App';
import StorageSelectionPage from 'containers/StorageSelectionPageContainer';
import FileManagerPage from 'containers/FileManagerPageContainer';

const mapStateToProps = (state) => ({
  router: state.router,
  storage: state.storage,
});

const authorize = createAuthorize(mapStateToProps);

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={StorageSelectionPage} />
    <Route component={authorize(authenticatedWithCurrentStorage, redirectToIndexPage)}>
      <Route path="/storage/:hashedAddress" component={FileManagerPage} />
    </Route>
    <Redirect from="*" to="/" />
  </Route>
);

export default routes;
