import _ from 'lodash';
import {resolve} from 'redux-simple-promise';

import * as actionTypes from './actionTypes';

const initialState = {
  hosts: [],
};

export default function reducer(state=initialState, action) {
  switch (action.type) {

    case resolve(actionTypes.LOAD_STORAGE_DATA):
      return {
        ...state,
        hosts: action.payload,
      };

    case resolve(actionTypes.AUTHENTICATE):
      const storageHostAddress = action.meta.payload.storageHost.address;
      const username = action.meta.payload.username;
      return {
        hosts: modifyStorageInState(
          state.hosts,
        storageHostAddress,
        (s) => {
          s.username = username,
          s.hasTargets = action.meta.payload.hasTargets
        }
      )};

    default:
      return state;
  }
}


function modifyStorageInState(state, address, modifyFn) {
  let newState = _.clone(state);
  const clusterIndex = _.findIndex(newState, ['address', address]);
  const newCluster = _.clone(newState[clusterIndex]);
  modifyFn(newCluster);
  newState[clusterIndex] = newCluster;
  return newState;
}
