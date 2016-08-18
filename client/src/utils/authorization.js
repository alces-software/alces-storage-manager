
import {replaceState} from 'redux-router'

import {
  clusterFromRouteSelector,
  sessionFromRouteSelector,
  singleClusterModeSelector,
  singleClusterSelector,
} from 'selectors';

// Functions for use with AuthorizedComponent.


// Authorization functions.

export function authenticatedWithCurrentCluster(store) {
  const cluster = clusterFromRouteSelector(store);
  return !!cluster.authenticated_username;
}

export function currentSessionExists(store) {
  const session = sessionFromRouteSelector(store);
  return !!session;
}

// Clusters page is inaccessible (and redirect to cluster's sessions page) when
// in single cluster mode and already authenticated with the cluster. There is
// no need to have this extra page in this case; it can be returned to by
// logging out and then a same or different account can be logged into again.
export function canAccessClustersPage(store) {
  const inSingleClusterMode = singleClusterModeSelector(store);
  if (inSingleClusterMode) {
    const singleCluster = singleClusterSelector(store);
    const unauthenticated = !singleCluster.authenticated_username;
    return unauthenticated;
  }
  else {
    return true;
  }
}


// Authorization failure handlers.

export function redirectToClustersPage() {
  this.props.dispatch(replaceState(null, '/'));
}

export function redirectToSessionsPage() {
  const clusterIp = this.props.router.params.clusterIp;
  redirectToSessionsPageForCluster(clusterIp, this.props.dispatch);
}

export function redirectToSingleClusterSessionsPage() {
  const {clusters} = this.props;
  const singleCluster = singleClusterSelector({clusters});
  redirectToSessionsPageForCluster(singleCluster.ip, this.props.dispatch);
}

function redirectToSessionsPageForCluster(clusterIp, dispatch) {
  const route = `/cluster/${clusterIp}`;
  dispatch(replaceState(null, route));
}
