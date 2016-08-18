
import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';

import {authorize} from 'components/AuthorizedComponent';
import App from 'containers/App';
import ClusterSelectionPage from 'containers/ClusterSelectionPageContainer';
import SessionSelectionPage from 'containers/SessionSelectionPageContainer';
import VncSessionPage from 'containers/VncSessionPageContainer';
import * as authorization from 'utils/authorization';

const checkCanAccessClustersPage = authorize(
  authorization.canAccessClustersPage,
  authorization.redirectToSingleClusterSessionsPage
);

const checkAuthenticatedForCluster = authorize(
  authorization.authenticatedWithCurrentCluster,
  authorization.redirectToClustersPage
);

const checkSessionExists = authorize(
  authorization.currentSessionExists,
  authorization.redirectToSessionsPage
);

const routes = <Route path="/" component={App}>
  <Route component={checkCanAccessClustersPage}>
    <IndexRoute component={ClusterSelectionPage} />
  </Route>

  <Route component={checkAuthenticatedForCluster}>
    <Route path="cluster/:clusterIp" component={SessionSelectionPage} />
  </Route>

  <Route component={checkAuthenticatedForCluster}>
    <Route component={checkSessionExists}>
      <Route path="cluster/:clusterIp/session/:sessionUuid" component={VncSessionPage} />
    </Route>
  </Route>

  <Redirect from="*" to="/" />
</Route>

export default routes;
