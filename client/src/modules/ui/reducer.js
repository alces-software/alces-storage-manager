
import {resolve, reject} from 'redux-simple-promise';

import * as actionTypes from './actionTypes';
import * as sessionActionTypes from 'sessions/actionTypes';
import * as clusterActionTypes from 'clusters/actionTypes';

function setLoaded(state, value) {
  return {...state, loaded: value};
}

function setReloadingSessions(state, value) {
  return {...state, reloadingSessions: value};
}

function setLaunchingSession(state, value) {
  return {...state, launchingSession: value};
}

function setShowingLaunchFailedModal(state, value) {
  return {...state, showingLaunchFailedModal: value};
}

function setLoggingOutFlag(state, value) {
  return {...state, loggingOut: value};
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

    case actionTypes.LOAD_SESSION_DATA_COMPLETE:
      return setLoaded(state, true);

    case sessionActionTypes.RELOAD_SESSIONS:
      return setReloadingSessions(state, true);

    // Stop session loading animation either after timeout, if sessions loaded
    // successfully, or if load/reload request fails.
    case actionTypes.STOP_SESSION_RELOAD_ANIMATION:
    case reject(sessionActionTypes.LOAD_SESSIONS):
    case reject(sessionActionTypes.RELOAD_SESSIONS):
      return setReloadingSessions(state, false);

    case sessionActionTypes.LAUNCH:
      return setLaunchingSession(state, true);

    case resolve(sessionActionTypes.LAUNCH):
      const newState = setLaunchingSession(state, false);
      if (action.payload.success !== true) {
        return {
          ...newState,
          showingLaunchFailedModal: true,
          launchFailedResponse: action.payload.launch_response,
        }
      }
      return newState;

    case reject(sessionActionTypes.LAUNCH):
      return setLaunchingSession(state, false);

    case actionTypes.CLOSE_LAUNCH_FAILED_MODAL:
      return setShowingLaunchFailedModal(state, false);

    case clusterActionTypes.LOGOUT:
      return setLoggingOutFlag(state, true);

    case clusterActionTypes.LOGOUT_COMPLETE:
      return setLoggingOutFlag(state, false);

    case resolve(clusterActionTypes.LOAD_CLUSTERS):
      return {
        ...state,
        sessionRefreshPeriod: action.payload.session_refresh_period || DEFAULT_SESSION_REFRESH_PERIOD,
      };

    default:
      return state;
  }
}
