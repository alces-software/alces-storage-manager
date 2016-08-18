
import ClipboardAction from 'clipboard/lib/clipboard-action';
import React from 'react';

import {ContactCustomerSupport} from 'components/CustomerSupport';
import {infoGeneratorsMap} from "notification/messageGeneration"
import MessageGenerator from "notification/MessageGenerator";
import ToolbarButton from 'components/ToolbarButton';

// Set up copy messages.
const noTextCode = 'vnc-session-no-text';
const copyFailedCode = 'vnc-session-copy-failed';
infoGeneratorsMap.addGeneratorForCode(
  noTextCode,
  new MessageGenerator(
    "No text to copy",
    <p>
      Select or copy some text within the VNC session to copy to your
      computer's clipboard.
    </p>
  )
).addGeneratorForCode(
  copyFailedCode,
  new MessageGenerator(
    "Copy failed",
    <p>
      The copy of text from the VNC session failed, possibly because your web
      browser does not support this feature. <ContactCustomerSupport/>
    </p>
  )
);

export default class ToolbarCopyButton extends React.Component {
  constructor(props) {
    super(props);
    this.emitter = {
      emit: (event) => {
        if (event !== 'success') {
          this.props.notificationActions.displayInfoModal(copyFailedCode);
        }
      },
    }
  }

  render() {
    const {novnc} = this.props;

    return (
      <ToolbarButton
        iconName="vnc-copy"
        tooltip="Copy"
        active={novnc.copyMode}
        onClick={this.handleClick.bind(this)}
      />
    )
  }

  handleClick() {
    const {
      novnc: {copyText},
      notificationActions: {displayInfoModal},
    } = this.props;

    // Display modal and do nothing if no text copied within session yet.
    if (!copyText) {
      displayInfoModal(noTextCode);
      return;
    }

    // This will copy the stored text, received from the session clipboard to
    // the system clipboard.
    new ClipboardAction({
      action: 'copy',
      emitter: this.emitter,
      text: copyText,
    });
  }
}
