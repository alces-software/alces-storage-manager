
import _ from 'lodash';
import {resolve} from 'redux-simple-promise';

import * as actionTypes from './actionTypes';

function authenticateReducer(state, action) {
  const {cluster: {ip}, username} = action.meta.payload;
  return modifyClusterInState(
    state, ip,
    (cluster) => cluster.authenticated_username = username // eslint-disable-line camelcase
    // TODO change auth username to camelcase
  );
}

function logoutReducer(state, action) {
  const {cluster: {ip}} = action.meta.payload;
  return modifyClusterInState(
    state, ip,
    (cluster) => cluster.authenticated_username = undefined // eslint-disable-line camelcase
  );
}

function setPingResponse(state, action) {
  const {cluster: {ip}} = action.meta.payload;
  return modifyClusterInState(
    state, ip,
    (cluster) => cluster.available = action.payload.available
  );
}

// Returns new state with cluster with given IP modified by executing modifyFn.
// TODO: seems convoluted to do this, although this is how we most often want
// to modify the clusters state - possibly a better way, maybe have clusters
// state keyed by IP?
function modifyClusterInState(state, clusterIp, modifyFn) {
  let newState = _.clone(state);
  const clusterIndex = _.findIndex(newState, ['ip', clusterIp]);
  const newCluster = _.clone(newState[clusterIndex]);
  modifyFn(newCluster);
  newState[clusterIndex] = newCluster;
  return newState;
}

const initialState = [];
export default function reducer(state=initialState, action) {
  switch (action.type) {

    case resolve(actionTypes.LOAD_CLUSTERS):
      return action.payload.clusters

    case resolve(actionTypes.AUTHENTICATE):
      return authenticateReducer(state, action);

    case resolve(actionTypes.LOGOUT):
      return logoutReducer(state, action);

    case resolve(actionTypes.PING):
      return setPingResponse(state, action);

    default:
      return state;
  }
}
