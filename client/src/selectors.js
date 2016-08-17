
import {createSelector} from 'reselect';

const uiState = (state) => state.ui;


export const appSelector = createSelector(
  uiState,

  (ui) => {
    return {
      ui,
    }
  }
);
