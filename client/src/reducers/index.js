
// import _ from 'lodash';

// Reducers:
import { combineReducers } from 'redux';
import {reducer as form} from 'redux-form';
import { routerStateReducer } from 'redux-router';

import clusters from 'clusters/reducer';
import ui from 'ui/reducer';
import notifications from 'notification/reducer';

// import {CLEAN_SESSION} from 'auth/actionTypes';

// Reducers for state to be reset to initial state when clearing app state
// on sign out.
const unpreservedStateReducers = {
  clusters,
  form,
  ui,
  notifications,
};

// Reducers for state to be preserved when clearing app state on sign out
// (currently just router state is preserved, otherwise page refresh occurs
// after sign out).
const preservedStateReducers = {
  router: routerStateReducer,
}

const combinedReducers = combineReducers({
  ...unpreservedStateReducers,
  ...preservedStateReducers,
})

// function reduceWithJsonApiResourceInclusion(state, action) {
//   const newState = combinedReducers(state, action);
//   return jsonApiReducer(newState, action);
// }

export default function rootReducer(state, action) {
  // let inputState;

  // if (action.type === CLEAN_SESSION) {
  //   // Input state to rest of reducers will just be the state to preserve after
  //   // sign out; the rest of the state will be re-initialized to its initial
  //   // state by reducers for each section.
  //   inputState = _.pick(state, _.keys(preservedStateReducers));
  // }
  // else {
  //   inputState = state;
  // }

  // return reduceWithJsonApiResourceInclusion(inputState, action);

  return combinedReducers(state, action);
}
