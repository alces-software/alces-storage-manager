
import React, { Component, PropTypes } from 'react';
import {OverlayTrigger, Popover} from 'react-bootstrap';

import Icon from 'components/Icon';

const propTypes = {
  session: PropTypes.object.isRequired,
};

class DisplayNumberVncAccessDetails extends Component {
  render() {
    const {session} = this.props;

    const vncDisplayNumberAccess = `${session.access_host}:${session.display}`;

    const vncDisplayNumberAccessPopover = (
      <Popover
        title={<span>External VNC access via <strong>display</strong> number</span>}
        id="display-number-access-popover"
      >
        Supported by VNC clients that accept a VNC display number such as:
        <ul>
          <li>
            <a href="https://www.realvnc.com/" target="_blank">
              RealVNC</a> (Linux, OS X, Windows).
          </li>
          <li>
            <a href="http://www.uvnc.com/" target="_blank">
              UltraVNC</a> (Windows only).
          </li>
        </ul>
      </Popover>
    );

    return (
      <p className="external-access-section">
        Via <strong>display</strong> number: <code>
          {vncDisplayNumberAccess}</code>
        &nbsp;<OverlayTrigger
          overlay={vncDisplayNumberAccessPopover}
          placement="right"
          rootClose
          trigger="click"
        >
          <Icon name="session-external-access-info"/>
        </OverlayTrigger>
      </p>
    );
  }
}

DisplayNumberVncAccessDetails.propTypes = propTypes;
export default DisplayNumberVncAccessDetails;
