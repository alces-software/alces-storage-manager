import _ from 'lodash';
import {createSelector} from 'reselect';

const uiState = (state) => state.ui;
const routerState = (state) => state.router;
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

export const storageHostFromRouteSelector = createSelector(
  (state, props) => {
    const storageId = props.routeParams.hashedAddress;
    return storageState(state).hosts[storageId];
  },
  (storage) => {
    return {
      storageCollection: storage,
    }
  }
);

export const currentStorageSelector = createSelector(
  storageState,
  routerState,
  (storage, router) => {
    const id = router.params.hashedAddress;
    const currentStorage = storage.hosts[id];
    return currentStorage;
  }

);

const authenticatedStorageSelector = createSelector(
  storageState,
  (storage) => {
    return _(storage.hosts).filter((storage) => !!storage.username).value()
  }
);

export const appSelector = createSelector(
  notificationsSelector,
  uiState,
  currentStorageSelector,
  authenticatedStorageSelector,

  (notifications, ui, currentStorage, storageHosts) => {
    return {
      notifications,
      ui,
      currentStorage,
      storageHosts,
    }
  }
);


