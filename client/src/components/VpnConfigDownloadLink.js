import React, { PropTypes } from 'react';

const propTypes = {
  cluster: PropTypes.object.isRequired,
};

function VpnConfigDownloadLink({cluster, children}) {
  return (
    <a href={`/api/v1/cluster/${cluster.ip}/vpn-config`}>
      {children}
    </a>
  );
}

VpnConfigDownloadLink.propTypes = propTypes;
export default VpnConfigDownloadLink;

