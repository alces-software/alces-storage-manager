import * as actionTypes from './actionTypes';
import {redirectTo} from 'actions/router';

export function loadStorageData() {
  return {
    type: actionTypes.LOAD_STORAGE_DATA,
    meta: {
      apiRequest: {
        config: {
          url: '/api/v1/storage',
          method: 'get',
        },
      },
    },
  }
}

export function authenticate(storageHost, {username, password}) {
  const authenticateRequest = {
    type: actionTypes.AUTHENTICATE,
    payload: {
      storageHost,
      username,
    },
    meta: {
      apiRequest: {
        config: {
          url: `/api/v1/storage/${storageHost.address}/authenticate`,
          method: 'post',
          data: {username, password},
        },
      },
    },
  };

  return (dispatch) => {
    return dispatch(authenticateRequest).
    then( () => {
      dispatch(redirectTo(`/storage/${storageHost.address}`));
    });
  };
}