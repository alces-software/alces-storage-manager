
import _ from 'lodash';
import React from 'react';

import {ContactCustomerSupport} from 'components/CustomerSupport';

import * as clusterActionTypes from 'clusters/actionTypes';
import MessageGenerator from "./MessageGenerator";

export const unexpectedErrorMessageGenerator = new MessageGenerator(
  'Unexpected error',
  <div>
    An unexpected error occurred while attempting to complete your
    request. <ContactCustomerSupport/>
  </div>
);

//
// Add default error message generators to the generators map.
//
export function setupDefaultErrorMessageGenerators(generatorsMap) {
  const serverUnavailableErrorMessageGenerator = new MessageGenerator(
    'Unable to communicate with server',
    <div>
      Alces Access Manager was unable to complete your action as it was unable
      to communicate with the Access Manager web server; please check your
      internet connection and try again. <ContactCustomerSupport/>
    </div>
  );

  const unauthorizedErrorMessageGenerator = new MessageGenerator(
    'Unauthorized',
    'You are not authorized to perform this action.'
  );

  const unprocessableEntityErrorMessageGenerator = new MessageGenerator(
    'Action failed',
    `It was not possible to complete the action. ${correctErrorsText()}`
  );

  const serverErrorMessageGenerator = new MessageGenerator(
    'Unexpected error',
    <div>
      The Alces Access Manager web server errored while attempting to complete
      your request. <ContactCustomerSupport/>
    </div>
  );

  // Any bad gateway response that we have not planned for is an unexpected
  // error, so display the standard message.
  // TODO: this is needed in order to override the message for this status code
  // for particular actions below - maybe it would be better if we were able to
  // customize error messages without needing to specify a default, and have
  // the unexpected error message as the default default?
  const badGatewayErrorMessageGenerator = unexpectedErrorMessageGenerator;

  generatorsMap.
    addGeneratorForCode(0,   serverUnavailableErrorMessageGenerator).
    addGeneratorForCode(401, unauthorizedErrorMessageGenerator).
    addGeneratorForCode(422, unprocessableEntityErrorMessageGenerator).
    addGeneratorForCode(500, serverErrorMessageGenerator).
    addGeneratorForCode(502, badGatewayErrorMessageGenerator).
    addUnexpectedGenerator(unexpectedErrorMessageGenerator);
}


//
// Customize the error generators for certain action types.
//
// XXX Perhaps this should be moved from here and we allow other modules to
// customize as they see fit.
//
export function addActionTypeCustomizations(generatorsMap) {
  generatorsMap.

    customizeMessage(
      401,
      clusterActionTypes.AUTHENTICATE,
      {
        title: 'Authentication failure',
        content: `The provided username and/or password are incorrect for the
          selected cluster. Please correct these and try again.`,
      }
    );

    const daemonUnavailableMessage = {
      title: 'Daemon unavailable',
      content: (message) => {
        const {cluster} = message.action.payload;
        return (
          <div>
            <p>
              The Alces Access Manager Daemon for <em>{cluster.name}</em> did
              not respond.
            </p>
            <p>
              Please ensure the daemon is running at the correct address
              (<em>{cluster.ip}:{cluster.auth_port}</em>), and is accessible to
              the Alces Access Manager.
            </p>
            <p>
              <ContactCustomerSupport/>
            </p>
          </div>
        )
      }
      ,
    }

    _.each(
      [
        clusterActionTypes.AUTHENTICATE,
    ],
      (action) => {
        generatorsMap.customizeMessage(
          502, // bad gateway - i.e. daemon not running/reachable.
          action,
          daemonUnavailableMessage
        );
    });
}


function correctErrorsText() {
  return 'Please correct the errors and try again.';
}
