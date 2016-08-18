
/* eslint-env mocha */
import {expect} from 'chai';

import * as reducerModule from '../reducer';

describe('sessions reducer', function() {
  describe('handleReceivedSessions', function() {
    it('sets the sessions under the cluster IP', function() {
      const ip = '127.0.0.1';
      const sessions = [{uuid: '1'}, {uuid: '2'}];
      const action = {
        meta: {
          payload: {
            cluster: {
              ip,
            },
          },
        },
        payload: {
          sessions,
        },
      };

      const newState = reducerModule.handleReceivedSessions({}, action)
      expect(newState).to.deep.equal({[ip]: sessions});
    });
  });
});
