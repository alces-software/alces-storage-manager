import _ from 'lodash';
import {createSelector} from 'reselect';
const Base64 = require('js-base64').Base64;

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

export const storageHostFromRouteSelector = createSelector(
  (state, props) => {
    const hashedStorageAddress = props.routeParams.hashedAddress;
    const address = Base64.decode(hashedStorageAddress);
    return _.find(storageState(state).hosts, ['address', address]);
  },
  (storage) => {
    return {
      storageCollection: storage,
    }
  }
);
