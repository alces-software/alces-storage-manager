import React, { Component, PropTypes } from 'react';
import {Button, Input, OverlayTrigger, Tooltip} from 'react-bootstrap';

import {CopyToClipboardButton} from 'components/Clipboard';
import Icon from 'components/Icon';

const propTypes = {
  password: PropTypes.string.isRequired,
};

class PasswordRevealer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isRevealed: false,
    }
  }

  render() {
    const {password} = this.props;
    const showingPassword = this.state.isRevealed;

    const clipboardButton = <CopyToClipboardButton text={password}/>

    const revealButtonTooltip = (
      <Tooltip
        id={`password-revealer-${password}`}
      >
        {showingPassword ? 'Hide' : 'Show'} password
      </Tooltip>
    );
    const revealButton = (
      <OverlayTrigger overlay={revealButtonTooltip} placement="bottom">
        <Button onClick={this.handleClickRevealButton.bind(this)}>
          <Icon name={showingPassword ? "session-password-hide" : "session-password-reveal"}/>
        </Button>
      </OverlayTrigger>
    );

    return (
      <div className="password-revealer">
          <Input
            buttonAfter={revealButton}
            buttonBefore={clipboardButton}
          >
            <input
              type="text"
              className="form-control"
              readOnly={true}
              value={showingPassword ? password : ''}
            />
          </Input>
      </div>
    );
  }

  handleClickRevealButton() {
    this.setState({
      isRevealed: !this.state.isRevealed,
    })
  }
}

PasswordRevealer.propTypes = propTypes;
export default PasswordRevealer;
