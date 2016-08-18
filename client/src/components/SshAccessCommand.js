import React, { PropTypes } from 'react';

const propTypes = {
  cluster: PropTypes.object.isRequired,
};

function SshAccessCommand({cluster}) {
  return (
    <code>ssh {cluster.authenticated_username}@{cluster.ip}</code>
  );
}

SshAccessCommand.propTypes = propTypes;
export default SshAccessCommand;

