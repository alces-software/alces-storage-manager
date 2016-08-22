
import React from 'react';

import _ from 'lodash';

import SelectionPage from 'components/SelectionPage';
import StorageSelectionCard from 'storage/components/StorageSelectionCard';

export default class StorageSelectionPage extends React.Component {
  render() {
    const {
      storage: {hosts},
      authenticate,
    } = this.props;

    const clusterSelectionBoxProps = {authenticate};

    const storageAvailableMessage = _.isEmpty(hosts) ?
      (
        <strong>
          There are no storage collections available.
        </strong>
      )
      :
      `Select a storage collection below to get started.`;

    const header = (
      <div>
        <p>
          {storageAvailableMessage}
        </p>
      </div>
    );

    return (
      <SelectionPage
        items={hosts}
        keyProp="address"
        header={header}
        selectionBoxComponent={StorageSelectionCard}
        selectionBoxProps={clusterSelectionBoxProps}
        loggingOut={false}
      />
    );
  }
}