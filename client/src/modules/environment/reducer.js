
import {resolve} from 'redux-simple-promise';

import * as clusterActionTypes from 'clusters/actionTypes';

const initialState = {};
export default function reducer(state=initialState, action) {

  switch (action.type) {

    // Currently the environment name is stored in the config file and
    // piggy-backs on the load clusters request; possibly this should be
    // changed later but makes things simple for the moment so not a big issue.
    case resolve(clusterActionTypes.LOAD_CLUSTERS):
      return {
      ...state,
      name: action.payload.environment.name,
    }

    default:
      return state;
  }
}
