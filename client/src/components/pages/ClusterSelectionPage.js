
import React from 'react';

import SingleClusterPage from 'components/SingleClusterPage';
import MultipleClustersPage from 'components/MultipleClustersPage';

export default class ClusterSelectionPage extends React.Component {
  render() {
    const {
      authenticate,
      clusters,
      singleClusterMode,
    } = this.props;

    if (singleClusterMode) {
      const cluster = clusters[0];
      return (
        <SingleClusterPage
          authenticate={authenticate}
          cluster={cluster}
        />
      );
    }
    else {
      return <MultipleClustersPage {...this.props}/>
    }
  }
}
