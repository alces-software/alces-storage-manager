import _ from 'lodash';
import {replaceState} from 'redux-router'

//import {} from 'selectors';
import {hashToStorageAddress} from 'storage/utils';

// Functions for use with AuthorizedComponent.


// Authorization functions.

export function authenticatedWithCurrentStorage(store) {
  const address = hashToStorageAddress(store.params.hashedAddress);
  const currentStorage = _.find(store.storage.hosts, ['address', address]);
  return currentStorage && !!currentStorage.username;
}

// Authorization failure handlers.

export function redirectToIndexPage() {
  this.props.dispatch(replaceState(null, '/'));
}
