
import React, { Component, PropTypes } from 'react';
import {OverlayTrigger, Popover} from 'react-bootstrap';

import Icon from 'components/Icon';

const propTypes = {
  session: PropTypes.object.isRequired,
};

class PortNumberVncAccessDetails extends Component {
  render() {
    const {session} = this.props;

    const vncPortNumberAccess = `${session.access_host}:${session.port}`;

    const vncPortNumberAccessPopover = (
      <Popover
        title={<span>External VNC access via <strong>port</strong> number</span>}
        id="port-number-access-popover"
      >
        Supported by VNC clients that accept a port number such as:
        <ul>
          <li>
            <a href="http://www.tigervnc.org" target="_blank">
              TigerVNC</a> (Linux, OS X, Windows).
          </li>
          <li>
            <a href="http://www.tightvnc.com/" target="_blank">
              TightVNC</a> (Linux, Windows).
          </li>
          <li>
            <a href="http://www.turbovnc.org/" target="_blank">
              TurboVNC</a> (Linux, OS X, Windows).
          </li>
        </ul>
      </Popover>
    );

    return (
      <p className="external-access-section">
        Via <strong>port</strong> number: <code>
          {vncPortNumberAccess}</code>
        &nbsp;<OverlayTrigger
          overlay={vncPortNumberAccessPopover}
          placement="right"
          rootClose
          trigger="click"
        >
          <Icon name="session-external-access-info"/>
        </OverlayTrigger>
      </p>
    )
  }
}

PortNumberVncAccessDetails.propTypes = propTypes;
export default PortNumberVncAccessDetails;
