
import React from 'react';

import AuthenticatedClusterSelectionBox from 'components/AuthenticatedClusterSelectionBox';
import Icon from 'components/Icon';
import UnauthenticatedClusterSelectionBox from 'components/UnauthenticatedClusterSelectionBox';
import {selectionBoxPropTypes} from 'utils/propTypes';

const PingingClusterFilter = ({children}) => {
  const filterMessage =
    <Icon name="cluster-pinging" className="cluster-pinging-icon"/>;
  return (
    <ClusterFilter message={filterMessage}>
      {children}
    </ClusterFilter>
  );
};

const UnavailableClusterFilter = ({children}) => {
  const filterMessage = <strong>NOT&nbsp;AVAILABLE</strong>;
  return (
    <ClusterFilter message={filterMessage}>
      {children}
    </ClusterFilter>
  );
}

const ClusterFilter = ({message, children}) => {
  return (
    <div className="cluster-filter-container">
      <div className="cluster-filter-message">
        {message}
      </div>
      <div className="cluster-filter">
        {children}
      </div>
    </div>
  );
};

class ClusterSelectionBox extends React.Component {
  render() {
    const {authenticate, item, logout} = this.props;
    const cluster = item;

    const selectionBoxElement = cluster.authenticated_username ?
      <AuthenticatedClusterSelectionBox
        cluster={cluster}
        logout={logout}
      />
    :
      <UnauthenticatedClusterSelectionBox
        authenticate={authenticate}
        cluster={cluster}
      />

    const currentlyPingingCluster = (cluster.available === undefined);

    if (currentlyPingingCluster) {
      return (
        <PingingClusterFilter>
          {selectionBoxElement}
        </PingingClusterFilter>
      );
    }
    else if (!cluster.available) {
      return (
        <UnavailableClusterFilter>
          {selectionBoxElement}
        </UnavailableClusterFilter>
      );
    }
    else {
      return selectionBoxElement;
    }
  }
}

ClusterSelectionBox.propTypes = selectionBoxPropTypes;

export default ClusterSelectionBox;
