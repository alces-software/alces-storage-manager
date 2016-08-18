
import {resolve} from 'redux-simple-promise';

import * as actionTypes from './actionTypes';

export function handleReceivedSessions(state, action) {
  const clusterIp = action.meta.payload.cluster.ip;
  const sessions = action.payload.sessions;
  return {
    ...state,
    [clusterIp]: sessions,
  }
}

const initialState = {};
export default function reducer(state=initialState, action) {
  switch (action.type) {

    case resolve(actionTypes.LOAD_SESSIONS):
    case resolve(actionTypes.RELOAD_SESSIONS):
      return handleReceivedSessions(state, action);

    case resolve(actionTypes.LAUNCH):
      if (action.payload.success) {
        return handleReceivedSessions(state, action);
      }
      return state;

    default:
      return state;
  }
}
