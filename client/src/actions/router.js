
import { push } from 'redux-router';

export function redirectTo(redirectPath) {
  return push(redirectPath);
}
