
import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import {Button, Input} from 'react-bootstrap';
import {reduxForm} from 'redux-form';

import {Icon} from 'flight-common';

// redux-form needs the form name to be passed as a parameter to the component
// to be wrapped with the reduxForm method (or passed into this method
// directly, but we can't do that as we have multiple forms with this component
// so need to create the form names dynamically), this method can be used to
// create the form name.
export const storageLoginFormName = (host) => `authenticate-storage-${host.address}`;

const propTypes = {
  authenticate: PropTypes.func.isRequired,
  host: PropTypes.object.isRequired,
  form: PropTypes.string.isRequired, // The form name.
};

class StorageLoginForm extends Component {
  render() {
    const {
      authenticate,
      host,
      fields: {username, password},
      handleSubmit,
      submitting,
    } = this.props;

    const authenticateWithStorageHost = _.partial(authenticate, host);
    const incomplete = !(username.value && password.value);

    const submitButtonIcon = submitting ? "aam-cluster-authenticating" : "aam-cluster";
    const submitButtonText = (
      <span>
        Log in&nbsp;&nbsp;<Icon name={submitButtonIcon}/>
      </span>
    );

    return (
      <form onSubmit={handleSubmit(authenticateWithStorageHost)}>
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

StorageLoginForm = reduxForm({
  fields: ['username', 'password'],
})(StorageLoginForm);

StorageLoginForm.propTypes = propTypes;
export default StorageLoginForm;

