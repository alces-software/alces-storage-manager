
import React, { Component, PropTypes } from 'react';
import {OverlayTrigger, Popover} from 'react-bootstrap';

import Icon from 'components/Icon';

const propTypes = {
  cluster: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

class HyperlinkVncAccessDetails extends Component {
  render() {
    const {cluster, session} = this.props;

    const vncHyperlinkAccess =
      `vnc://${cluster.authenticated_username}:${session.password}@${session.access_host}:${session.port}`;

    const vncHyperlinkAccessPopover = (
      <Popover
        title={<span>External VNC access via a <strong>hyperlink</strong></span>}
        id="hyperlink-access-popover"
      >
        Supported by browsers and operating systems that have been configured
        to accept <code>vnc://</code> hyperlinks such as:
        <ul>
          <li>
            OS X using <em>OS X Screen Sharing</em>.
          </li>
          <li>
            Windows by configuring a protocol handler in the registry.
          </li>
          <li>
            Linux by configuring a protocol handler using xdg-mime.
          </li>
        </ul>
      </Popover>
    );

    return (
      <p className="external-access-section">
        Via a <strong>hyperlink</strong>: <a
          href={vncHyperlinkAccess}>
          <code>{this.obfuscateVncUri(vncHyperlinkAccess)}</code>
        </a>
        &nbsp;<OverlayTrigger
          overlay={vncHyperlinkAccessPopover}
          placement="right"
          rootClose
          trigger="click"
        >
          <Icon name="session-external-access-info"/>
        </OverlayTrigger>
      </p>
    );
  }

  obfuscateVncUri(uri) {
    // Adapted from equivalent hack in Portal.
    const brokenParse = new URL(uri)
    const hackedParse = new URL(`http:${brokenParse.pathname}`)
    hackedParse.password = "******"
    hackedParse.protocol = brokenParse.protocol
    return hackedParse.href
  }
}

HyperlinkVncAccessDetails.propTypes = propTypes;
export default HyperlinkVncAccessDetails;
