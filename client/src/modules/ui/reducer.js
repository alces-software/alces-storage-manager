
import {resolve} from 'redux-simple-promise';

import * as actionTypes from './actionTypes';
import * as storageActionTypes from 'storage/actionTypes';

function setLoaded(state, value) {
  return {...state, loaded: value};
}

function setReloadingSessions(state, value) {
  return {...state, reloadingSessions: value};
}

function setShowingLaunchFailedModal(state, value) {
  return {...state, showingLaunchFailedModal: value};
}

const DEFAULT_SESSION_REFRESH_PERIOD = 5;
const initialState = {
  // Whether the initial app data (currently just the clusters) has loaded.
  loaded: false,

  loggingOut: false,
  sessionRefreshPeriod: DEFAULT_SESSION_REFRESH_PERIOD,
};
export default function reducer(state=initialState, action) {
  switch (action.type) {

    case resolve(storageActionTypes.LOAD_STORAGE_DATA):
      return setLoaded(state, true);

    // Stop session loading animation either after timeout, if sessions loaded
    // successfully, or if load/reload request fails.
    case actionTypes.STOP_SESSION_RELOAD_ANIMATION:
      return setReloadingSessions(state, false);

    case actionTypes.CLOSE_LAUNCH_FAILED_MODAL:
      return setShowingLaunchFailedModal(state, false);

    default:
      return state;
  }
}
