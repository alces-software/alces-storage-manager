import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';


export default class NoTargetsMessage extends React.Component {
  render() {
    const dirString = '---\nname: "Home"\ntype: posix\ndir: "%#{dir}/"';
    return (
      <Grid>
        <Row>
          <Col>
            <h1>No targets defined!</h1>
            <p>You haven't defined any targets to use with the Storage Manager in this storage collection.</p>
            <p>A target defines a filesystem (or part of one) to be made available via the
              Storage Manager. An example target definition file is below; paste the text
              into a file at <code>~/.config/clusterware/storage/example.target.yml</code>
              on the storage host and reload this page to start using the Storage Manager.</p>
            <pre>{dirString}</pre>

            <p>The README file describes the format of target definition files in detail.</p>
            <p>System administrators can also add system-wide targets in the
              <code>/etc/xdg/clusterware/storage</code> directory, which will be applied when
              the ASM Daemon is restarted.</p>
          </Col>
        </Row>
      </Grid>
    );
  }
}
