
import _ from 'lodash';
import {createSelector} from 'reselect';

const environmentState = (state) => state.environment;
const clustersState = (state) => state.clusters;
const novncState = (state) => state.novnc;
const sessionsState = (state) => state.sessions;
const uiState = (state) => state.ui;

export const singleClusterModeSelector = createSelector(
  clustersState,
  (clusters) => clusters.length === 1
)

export const singleClusterSelector = createSelector(
  clustersState,
  (clusters) => clusters[0]
)

export const clusterSelectionPageSelector = createSelector(
  clustersState,
  environmentState,
  singleClusterModeSelector,
  uiState,
  (clusters, environment, singleClusterMode, ui) => {
    return {
      clusters,
      environment,
      singleClusterMode,
      loggingOut: ui.loggingOut,
    };
  }
);
function clusterFromRouteSelectorWithDefault(noClusterDefault) {
  return (state) => {
    const clusterIp = state.router.params.clusterIp;
    return _.find(state.clusters, (cluster) => cluster.ip == clusterIp) || noClusterDefault;
  }
}

// When get cluster from the route return {} if no cluster, so things still
// behave well before clusters are set.
export const clusterFromRouteSelector = clusterFromRouteSelectorWithDefault({});

function sessionsForCluster(cluster, allSessions) {
  return sessionsForClusterWithIp(cluster.ip, allSessions);
}

function sessionsForClusterWithIp(clusterIp, allSessions) {
  const clusterSessions = allSessions[clusterIp];
  return clusterSessions ? clusterSessions : [];
}

export const sessionSelectionPageSelector = createSelector(
  clusterFromRouteSelector,
  sessionsState,
  uiState,
  (cluster, allSessions, ui) => {
    const sessions = sessionsForCluster(cluster, allSessions);
    return {
      cluster,
      sessions,
      ui,
    };
  }
);

export function sessionFromRouteSelector(state) {
  const {clusterIp, sessionUuid} = state.router.params;
  const clusterSessions = sessionsForClusterWithIp(clusterIp, state.sessions);
  return _.find(clusterSessions, (session) => session.uuid == sessionUuid);
}

export const vncSessionPageSelector = createSelector(
  clusterFromRouteSelector,
  sessionFromRouteSelector,
  novncState,
  (cluster, session, novnc) => {
    return {cluster, session, novnc};
  }
);

const notificationsSelector = createSelector(
  (state) => state.notifications,

  (notifications) => {
    return {
      showingModal: notifications.showingCurrentModal,
      currentModal: notifications.currentModal,
      exitingModal: notifications.exitingModal,
    };
  }
);

export const appSelector = createSelector(
  notificationsSelector,
  uiState,

  // Return null when no cluster so can easily tell this is the case.
  clusterFromRouteSelectorWithDefault(null),

  singleClusterModeSelector,
  singleClusterSelector,

  (notifications, ui, currentCluster, singleClusterMode, singleCluster) => {
    return {
      notifications,
      ui,
      currentCluster,
      singleClusterMode,
      singleCluster,
    }
  }
);
