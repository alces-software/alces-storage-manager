import React, { PropTypes } from 'react';

const propTypes = {
  cluster: PropTypes.object.isRequired,
};

function ClusterSelectionInfo({cluster}) {
  return (
    <div>
      <p>
        <strong>{cluster.name}</strong>
      </p>
      <p>
        IP: {cluster.ip}
      </p>
    </div>
  )
}

ClusterSelectionInfo.propTypes = propTypes;
export default ClusterSelectionInfo;

