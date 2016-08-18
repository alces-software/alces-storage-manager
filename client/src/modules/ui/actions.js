
import _ from 'lodash';

import * as actionTypes from './actionTypes';
import * as clusterActionTypes from 'clusters/actions';
import {loadSessions} from 'sessions/actions';

export function stopSessionReloadAnimation() {
  return {
    type: actionTypes.STOP_SESSION_RELOAD_ANIMATION,
  }
}

function startLoadSessionData() {
  return {
    type: actionTypes.LOAD_SESSION_DATA,
  }
}

function finishLoadSessionData() {
  return {
    type: actionTypes.LOAD_SESSION_DATA_COMPLETE,
  }
}

export function loadSessionData() {
  return (dispatch) => {
    const loadAuthenticatedClusterSessions = (clusters) => {
      const authenticatedClusters = _.filter(clusters, (cluster) => cluster.authenticated_username);
      return Promise.all(
        _.map(authenticatedClusters,
              (cluster) => dispatch(loadSessions(cluster))
             )
      );
    }

    dispatch(startLoadSessionData());

    return dispatch(
      clusterActionTypes.loadClusters()
    ).then( ({clusters}) =>
      loadAuthenticatedClusterSessions(clusters)
    ).then( () => dispatch(
      finishLoadSessionData()
    )).then( () =>
      dispatch(clusterActionTypes.pingClusters())
    );
    // TODO: error handling?
  }
}

export function closeLaunchFailedModal() {
  return {
    type: actionTypes.CLOSE_LAUNCH_FAILED_MODAL,
  };
}
