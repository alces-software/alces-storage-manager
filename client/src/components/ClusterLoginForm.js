
import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import {Button, Input} from 'react-bootstrap';
import {reduxForm} from 'redux-form';

import Icon from 'components/Icon';

// redux-form needs the form name to be passed as a parameter to the component
// to be wrapped with the reduxForm method (or passed into this method
// directly, but we can't do that as we have multiple forms with this component
// so need to create the form names dynamically), this method can be used to
// create the form name.
export const clusterLoginFormName = (cluster) => `authenticate-cluster-${cluster.ip}`;

const propTypes = {
  authenticate: PropTypes.func.isRequired,
  cluster: PropTypes.object.isRequired,
  form: PropTypes.string.isRequired, // The form name.
};

class ClusterLoginForm extends Component {
  render() {
    const {
      authenticate,
      cluster,
      fields: {username, password},
      handleSubmit,
      submitting,
    } = this.props;

    const authenticateCluster = _.partial(authenticate, cluster);
    const incomplete = !(username.value && password.value);

    const submitButtonIcon = submitting ? "cluster-authenticating" : "cluster";
    const submitButtonText = (
      <span>
        Login&nbsp;&nbsp;<Icon name={submitButtonIcon}/>
      </span>
    );

    return (
      <form onSubmit={handleSubmit(authenticateCluster)}>
        <Input placeholder="Username" type="text" {...username}/>
        <Input placeholder="Password" type="password" {...password}/>
        <Button
          className="selection-box-button"
          type="submit"
          bsStyle="success"
          disabled={incomplete || submitting}
        >
          {submitButtonText}
        </Button>
      </form>
    );
  }
}

ClusterLoginForm = reduxForm({
  fields: ['username', 'password'],
})(ClusterLoginForm);

ClusterLoginForm.propTypes = propTypes;
export default ClusterLoginForm;

