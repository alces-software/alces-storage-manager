
import {createSelector} from 'reselect';

const uiState = (state) => state.ui;
const storageState = (state) => state.storage;

const notificationsSelector = createSelector(
  (state) => state.notifications,

  (notifications) => {
    return {
      showingModal: notifications.showingCurrentModal,
      currentModal: notifications.currentModal,
      exitingModal: notifications.exitingModal,
    };
  }
);

export const storageCollectionsSelector = createSelector(
  storageState,
  (storage) => {
    return {
      storage,
    }
  }
);

export const appSelector = createSelector(
  notificationsSelector,
  uiState,

  (notifications, ui) => {
    return {
      notifications,
      ui,
    }
  }
);
