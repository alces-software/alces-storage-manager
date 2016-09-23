
import * as actionTypes from './actionTypes';

export function stopSessionReloadAnimation() {
  return {
    type: actionTypes.STOP_SESSION_RELOAD_ANIMATION,
  }
}

export function closeLaunchFailedModal() {
  return {
    type: actionTypes.CLOSE_LAUNCH_FAILED_MODAL,
  };
}
