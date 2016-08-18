
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

    default:
      return state;
  }
}
