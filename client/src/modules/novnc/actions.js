
import * as actionTypes from './actionTypes';
import {redirectTo} from 'actions/router';

export function stateChange(state, msg) {
  return {
    type: actionTypes.STATE_CHANGE,
    payload: {
      state, // State string passed to noVNC RFB's onUpdateState function.
      msg,
    },
  }
}

export function enableSound() {
  localStorage.setItem('soundEnabled', true);
  return {
    type: actionTypes.ENABLE_SOUND,
  }
}

export function disableSound() {
  localStorage.setItem('soundEnabled', false);
  return {
    type: actionTypes.DISABLE_SOUND,
  }
}

export function setCopyText(text) {
  return {
    type: actionTypes.SET_COPY_TEXT,
    payload: {
      text,
    },
  }
}

export function showPasteModal() {
  return {
    type: actionTypes.SHOW_PASTE_MODAL,
  }
}

export function hidePasteModal() {
  return {
    type: actionTypes.HIDE_PASTE_MODAL,
  }
}

export function pasteText() {
  return (dispatch, getState) => {
    const text = getState().form['vnc-paste-modal'].pastedText.value;

    dispatch({
      type: actionTypes.PASTE_TEXT,
      payload: {
        text,
      },
    });
  }
}

export function pasteComplete() {
  return {
    type: actionTypes.PASTE_COMPLETE,
  }
}

export function showSessionFailedModal(sessionFailedOnInitialConnect) {
  return {
    type: actionTypes.SHOW_SESSION_FAILED_MODAL,
    payload: {
      sessionFailedOnInitialConnect,
    },
  }
}

export function hideSessionFailedModal() {
  return (dispatch, getState) => {
    const clusterIp = getState().router.params.clusterIp;
    const clusterUrl = `/cluster/${clusterIp}`;
    dispatch(redirectTo(clusterUrl));

    return dispatch({
      type: actionTypes.HIDE_SESSION_FAILED_MODAL,
    })
  }
}

export function setInteractiveMode() {
  return {
    type: actionTypes.SET_INTERACTIVE_MODE,
  }
}

export function setDragViewportMode() {
  return {
    type: actionTypes.SET_DRAG_VIEWPORT_MODE,
  }
}

export function setDimensions(width, height) {
  return {
    type: actionTypes.SET_DIMENSIONS,
    payload: {
      width,
      height,
    },
  }
}

export function reset() {
  return {
    type: actionTypes.RESET,
  }
}
