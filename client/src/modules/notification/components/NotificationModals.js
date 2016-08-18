
import React, {PropTypes} from 'react';

import Modal from './NotificationModal';

//
// Wrapper around NotificationModal to enable smooth transitions when we are
// closing one NotificationModal and there is another one to display.
//
// We have two NotificationModals, one representing the modal that is
// currently being shown and the other representing the modal that is being
// closed.
//
export default class NotificationModals extends React.Component {
  render() {
    const currentModalId = this.props.currentModal ?
      this.props.currentModal.messageId :
      "undefinedCurrentModal";

    const exitingModalId = this.props.exitingModal ?
      this.props.exitingModal.messageId :
      "undefinedExitingModal";

    return (
      <div>
        {/* The current modal to display. */}
        <Modal
          show={this.props.showingModal}
          onHide={this.props.onCloseNotification}
          message={this.props.currentModal}
          key={currentModalId}
        />
        {/* The modal that has just been closed. */}
        <Modal
          show={false}
          onHide={() => {}}
          message={this.props.exitingModal}
          key={exitingModalId}
        />
      </div>
    )
  }
}

// A modal message also has a payload of some variety, but that varies
// depending on the message type, so I haven't specified it here.
const modalShape = {
  messageId: PropTypes.number.isRequired,
  messageType: PropTypes.string.isRequired,
};

NotificationModals.propTypes = {
  // Whether we are displaying a modal / animating one in.
  showingModal: PropTypes.bool.isRequired,
  // The modal that is currently being displayed / is animating in.
  currentModal: PropTypes.shape(modalShape),
  // The modal that is currently being hidden / is animating out.
  exitingModal: PropTypes.shape(modalShape),
  // Callback to run when the modal is closed.
  onCloseNotification: PropTypes.func.isRequired,
}
