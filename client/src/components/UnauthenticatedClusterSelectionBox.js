
import React from 'react';
import FlipCard from 'react-flipcard';

import ClusterSelectionInfo from 'components/ClusterSelectionInfo';
import ClusterLoginForm, {clusterLoginFormName} from 'components/ClusterLoginForm';

class UnauthenticatedClusterSelectionBox extends React.Component {
  render() {
    const {authenticate, cluster} = this.props;

    const form = clusterLoginFormName(cluster);

    return (
      <div
        className="flip-selection-box"
        >
        <FlipCard disabled={!cluster.available}>
          <div className="flip-selection-box-front">
            <ClusterSelectionInfo cluster={cluster}/>
            <p>
              {cluster.available ? <em>Click to login</em> : ''}
            </p>
          </div>
          <div className="flip-selection-box-back">
            <p>
              <strong>{cluster.name}</strong>
            </p>
            <ClusterLoginForm
              authenticate={authenticate}
              cluster={cluster}
              form={form}
            />
          </div>
        </FlipCard>
      </div>
    );
  }
}

export default UnauthenticatedClusterSelectionBox

