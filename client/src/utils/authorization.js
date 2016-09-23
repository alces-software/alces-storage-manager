import {replace} from 'redux-router';

// Functions for use with AuthorizedComponent.


// Authorization functions.

export function authenticatedWithCurrentStorage(store) {
  const storageId = store.params.hashedAddress;
  const currentStorage = store.storage.hosts[storageId];
  return currentStorage && !!currentStorage.username;
}

// Authorization failure handlers.

export function redirectToIndexPage() {
  this.props.dispatch(replace('/'));
}
