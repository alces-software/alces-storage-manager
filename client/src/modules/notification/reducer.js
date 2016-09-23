
import * as types from './actionTypes';

let messageId = 0;
function nextMessageId() {
  messageId = messageId + 1;
  return messageId;
}

const initialState = {
  // A FIFO of messages to show in a modal dialog.
  modalMessages: [],
  // The modal currently being shown
  currentModal: undefined,
  // The modal that is being animated out.
  exitingModal: undefined,
  showingCurrentModal: false,
}

function addModalMessage(messageType) {
  return (state, action) => {
    const newMessage = {
      messagePayload: action.payload,
      messageType: messageType,
      messageId: nextMessageId(),
    };

    let currentModal = state.currentModal;
    if (currentModal === undefined) {
      currentModal = newMessage;
    }

    return {
      ...state,
      modalMessages: [ ...state.modalMessages, newMessage ],
      currentModal: currentModal,
      showingCurrentModal: true,
    };
  }
}

const addError = addModalMessage("error");
const addInformational = addModalMessage("info");

function closeModal(state) {
  const newMessages = [...state.modalMessages];
  newMessages.shift();

  const exitingModal = state.currentModal;
  const currentModal = newMessages[0];

  return {
    ...state,
    modalMessages: newMessages,
    currentModal: currentModal,
    exitingModal: exitingModal,
    showingCurrentModal: newMessages.length > 0,
  }
}

export default function reducer(state=initialState, action) {
  switch (action.type) {
    case types.ADD_ERROR_MODAL:
      return addError(state, action);
    case types.ADD_INFO_MODAL:
      return addInformational(state, action);
    case types.CLOSE_MODAL:
      return closeModal(state);
    default:
      return state;
  }
}
