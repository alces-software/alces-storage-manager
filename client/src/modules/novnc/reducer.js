
import * as actionTypes from './actionTypes';

function initialState() {
  const soundEnabled = localStorage.soundEnabled === 'true' ||
    localStorage.soundEnabled === undefined;
  localStorage.setItem('soundEnabled', soundEnabled);
  return {soundEnabled};
}

export default function reducer(state=initialState(), action) {
  switch (action.type) {

    case actionTypes.STATE_CHANGE:
      const novncState = action.payload.state;
      const {msg} = action.payload;
      if (novncState === 'failed' && msg === 'Disconnect timeout') {
        // Disconnect is called when NoVNC component unmounts, even if not
        // connected (e.g. if this has failed). The disconnect will then
        // timeout; this is fine but we don't want to update the state with
        // this failure as will already have reset the noVNC state for this
        // connection.
        return state;
      }

      return {
      ...state,
      state: novncState,
      msg,
    };

    case actionTypes.ENABLE_SOUND:
      return {
      ...state,
      soundEnabled: true,
    }

    case actionTypes.DISABLE_SOUND:
      return {
      ...state,
      soundEnabled: false,
    }

    case actionTypes.SET_COPY_TEXT:
      return {
      ...state,
      copyText: action.payload.text,
    }

    case actionTypes.SHOW_PASTE_MODAL:
      return {
      ...state,
      showingPasteModal: true,
    }

    case actionTypes.HIDE_PASTE_MODAL:
      return {
      ...state,
      showingPasteModal: false,
    }

    case actionTypes.PASTE_TEXT:
      return {
      ...state,
      showingPasteModal: false,
      pastedText: action.payload.text,
    }

    case actionTypes.PASTE_COMPLETE:
      return {
      ...state,
      pastedText: undefined,
    }

    case actionTypes.SHOW_SESSION_FAILED_MODAL:
      return {
      ...state,
      showingSessionFailedModal: true,
      sessionFailedOnInitialConnect: action.payload.sessionFailedOnInitialConnect,
    }

    case actionTypes.HIDE_SESSION_FAILED_MODAL:
      return {
      ...state,
      showingSessionFailedModal: false,
      sessionFailedOnInitialConnect: undefined,
    }

    case actionTypes.SET_INTERACTIVE_MODE:
      return {
      ...state,
      viewportDrag: false,
    }

    case actionTypes.SET_DRAG_VIEWPORT_MODE:
      return {
      ...state,
      viewportDrag: true,
    }

    case actionTypes.SET_DIMENSIONS:
      const {width, height} = action.payload;
      return {
      ...state,
      width,
      height,
    }

    case actionTypes.RESET:
      return initialState();

    default:
      return state;
  }
}
