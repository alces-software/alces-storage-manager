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
        hosts: _(action.payload).forEach((item, key) => {item.id = key}),
      };

    case resolve(actionTypes.AUTHENTICATE):
      const storageHostId = action.meta.payload.storageHost.id;
      const username = action.meta.payload.username;
      return {
        hosts: modifyStorageInState(
          state.hosts,
        storageHostId,
        (s) => {
          s.username = username;
          s.hasTargets = action.payload.hasTargets;
          s.warnings = action.payload.warnings;
        }
      )};

    case resolve(actionTypes.LOGOUT):
      return {
        hosts: modifyStorageInState(
          state.hosts,
          action.meta.payload.storageHost.id,
          (s) => {
            s.username = undefined;
            s.hasTargets = undefined;
            s.warnings = undefined;
          }
        )};

    default:
      return state;
  }
}


function modifyStorageInState(state, id, modifyFn) {
  let newState = _.clone(state);
  const newCluster = _.clone(newState[id]);
  modifyFn(newCluster);
  newState[id] = newCluster;
  return newState;
}
