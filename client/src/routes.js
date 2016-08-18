
import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';

import {authorize} from 'components/AuthorizedComponent';
import App from 'containers/App';
import ClusterSelectionPage from 'containers/ClusterSelectionPageContainer';
import * as authorization from 'utils/authorization';

const checkCanAccessClustersPage = authorize(
  authorization.canAccessClustersPage,
  authorization.redirectToSingleClusterSessionsPage
);

/*const checkAuthenticatedForCluster = authorize(
  authorization.authenticatedWithCurrentCluster,
  authorization.redirectToClustersPage
);*/

const routes = <Route path="/" component={App}>
  <Route component={checkCanAccessClustersPage}>
    <IndexRoute component={ClusterSelectionPage} />
  </Route>

  <Redirect from="*" to="/" />
</Route>

export default routes;
