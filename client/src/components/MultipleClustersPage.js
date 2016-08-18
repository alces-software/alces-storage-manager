
import _ from 'lodash';
import React, { PropTypes } from 'react';

import ClusterSelectionBox from 'components/ClusterSelectionBox';
import SelectionPage from 'components/SelectionPage';

const propTypes = {
  authenticate: PropTypes.func.isRequired,
  clusters: PropTypes.array.isRequired,
  environment: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  loggingOut: PropTypes.bool.isRequired,
};

function MultipleClustersPage({authenticate, clusters, environment, logout, loggingOut}) {
  const clusterSelectionBoxProps = {authenticate, logout};

  const clustersAvailableMessage = _.isEmpty(clusters) ?
    (
      <strong>
        There are no clusters available within this environment, please create
        a cluster within the environment to connect to.
      </strong>
    )
    :
    `Select a cluster below to get started.`;

    const header = (
      <div>
        <p>
          Connected to environment <em>{environment.name}</em>.
        </p>
        <p>
          {clustersAvailableMessage}
        </p>
      </div>
    );

    return (
      <SelectionPage
        items={clusters}
        keyProp="ip"
        header={header}
        selectionBoxComponent={ClusterSelectionBox}
        selectionBoxProps={clusterSelectionBoxProps}
        loggingOut={loggingOut}
      />
    );
}

MultipleClustersPage.propTypes = propTypes;
export default MultipleClustersPage;

