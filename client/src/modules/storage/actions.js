import * as actionTypes from './actionTypes';

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
