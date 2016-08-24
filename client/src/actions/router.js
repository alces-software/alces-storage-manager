
import { pushState } from 'redux-router';

export function redirectTo(redirectPath) {
  return pushState(null, redirectPath);
}
