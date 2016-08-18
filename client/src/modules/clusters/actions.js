
import _ from 'lodash';

import * as actionTypes from './actionTypes';
import {redirectTo} from 'actions/router';

export function loadClusters() {
  return {
    type: actionTypes.LOAD_CLUSTERS,
    meta: {
      apiRequest: {
        config: {
          url: '/api/v1/clusters',
          method: 'get',
        },
      },
    },
  }
}

export function authenticate(cluster, {username, password}) {
  const authenticateRequest = {
    type: actionTypes.AUTHENTICATE,
    payload: {
      cluster,
      username,
    },
    meta: {
      apiRequest: {
        config: {
          url: `/api/v1/cluster/${cluster.ip}/authenticate`,
          method: 'post',
          data: {username, password},
        },
      },
    },
  };

  return (dispatch) => {
    return dispatch(authenticateRequest).
      then( () => {
        dispatch(redirectTo(`/cluster/${cluster.ip}`));
    });
  };
}

function logoutComplete() {
  return {
    type: actionTypes.LOGOUT_COMPLETE,
  };
}

export function logout(cluster) {
  const logoutRequest = {
    type: actionTypes.LOGOUT,
    payload: {
      cluster,
    },
    meta: {
      apiRequest: {
        config: {
          url: `/api/v1/cluster/${cluster.ip}/logout`,
          method: 'post',
        },
      },
    },
  };

  return (dispatch) => {
    return dispatch(logoutRequest).
      then( () => dispatch(redirectTo(`/`)) ).
      then( () => dispatch(logoutComplete()) );
  }
}

function ping(cluster) {
  return {
    type: actionTypes.PING,
    payload: {
      cluster,
    },
    meta: {
      apiRequest: {
        config: {
          url: `/api/v1/cluster/${cluster.ip}/ping`,
          method: 'get',
        },
      },
    },
  };
}

export function pingClusters() {
  return (dispatch, getState) => {
    const clusters = getState().clusters;
    _.map(clusters, cluster => {
      dispatch(ping(cluster));
    });
  }
}
