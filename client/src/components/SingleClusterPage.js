import React, { PropTypes } from 'react';
import {Grid, Row, Col} from 'react-bootstrap';

import ClusterLoginForm, {clusterLoginFormName} from 'components/ClusterLoginForm';
import ClusterSelectionInfo from 'components/ClusterSelectionInfo';

const propTypes = {
  authenticate: PropTypes.func.isRequired,
  cluster: PropTypes.object.isRequired,
};

function SingleClusterPage({authenticate, cluster}) {
  const form = clusterLoginFormName(cluster);

  return (
    <Grid>
      <Row>
        <Col mdOffset={1} md={10}>
          <div className="static-selection-box">
            <ClusterSelectionInfo cluster={cluster}/>
            <ClusterLoginForm
              authenticate={authenticate}
              cluster={cluster}
              form={form}
            />
          </div>
        </Col>
      </Row>
    </Grid>
  );
}

SingleClusterPage.propTypes = propTypes;
export default SingleClusterPage;

