/*=============================================================================
 * Copyright (C) 2015-2016 Stephen F. Norledge and Alces Software Ltd.
 *
 * This file is part of Alces Flight.
 *
 * All rights reserved, see LICENSE.txt.
 *===========================================================================*/
import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ClipboardAction from 'clipboard/lib/clipboard-action';

import Icon from 'components/Icon';

export class CopyToClipboardButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {copyState: "notCopied"};
  }

  handleCopy(payload) {
    this.setState({copyState: "copied"});
    if (this.props.onCopy) {
      this.props.onCopy(payload);
    }
  }

  handleCopyFailure(payload) {
    this.setState({copyState: "failed"});
    if (this.props.onCopyFailure) {
      this.props.onCopyFailure(payload);
    }
  }

  tooltipText() {
    switch (this.state.copyState) {
      case "notCopied":
        return "Copy to clipboard";
      case "copied":
        return "Copied!";
      case "failed":
        return "Press Ctrl-C to copy";
    }
  }

  render() {
    const tooltip = (
      <Tooltip id={`copy-to-clipboard-button-${this.props.text}`}>
        {this.tooltipText()}
      </Tooltip>
    );

    return (
      <OverlayTrigger
        onExited={() => this.setState({copyState: "notCopied"})}
        overlay={tooltip}
        placement="bottom"
        shouldUpdatePosition
        trigger="hover"
        >
        <CopyToClipboard {...this.props} onCopy={this.handleCopy.bind(this)}>
          <Button><Icon name="clipboard"/></Button>
        </CopyToClipboard>
      </OverlayTrigger>
    )
  }
}



export class CopyToClipboard extends React.Component {
  constructor(props) {
    super(props);
    this.emitter = { emit: this.runCallbacks.bind(this) };
  }

  componentWillUnmount() {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  }

  runCallbacks(event, payload) {
    if (event === "success") {
      this.props.onCopy && this.props.onCopy(payload);
    } else if (event === "error") {
      this.props.onCopyFailed && this.props.onCopyFailed(payload);
    }
  }

  handleCopy() {
    const {text} = this.props;
    // Can we create one and keep reusing it?
    if (this.clipboard) {
      this.clipboard = null;
    }
    this.clipboard = new ClipboardAction({
      action: "copy",
      emitter: this.emitter,
      text: text,
    });
  }

  render() {
    /* eslint-disable no-redeclare */
    const {text, onCopy, children, ...rest} = this.props;
    /* eslint-enable no-redeclare */
    const elem = React.Children.only(children)
    return React.cloneElement(elem, {
      ...rest,
      onClick: this.handleCopy.bind(this),
    });
  }
}

CopyToClipboard.propTypes =  {
  text: React.PropTypes.string.isRequired,
  children: React.PropTypes.element.isRequired,
  onCopy: React.PropTypes.func,
}
