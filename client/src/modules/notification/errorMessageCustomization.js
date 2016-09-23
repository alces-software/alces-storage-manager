
import React from 'react';

import * as storageActionTypes from 'storage/actionTypes';

import {ContactCustomerSupport} from 'flight-common';

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
      Alces Storage Manager was unable to complete your action as it was unable
      to communicate with the Storage Manager web server; please check your
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
      The Alces Storage Manager web server errored while attempting to complete
      your request. <ContactCustomerSupport/>
    </div>
  );

  const notFoundErrorMessageGenerator = new MessageGenerator(
    'Not found',
    <div>
      The requested item was not found.
    </div>
  );

  const unavailableErrorMessageGenerator = new MessageGenerator(
    'Not found',
    <div>
      The requested item is not currently available.
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
    addGeneratorForCode(404, notFoundErrorMessageGenerator).
    addGeneratorForCode(422, unprocessableEntityErrorMessageGenerator).
    addGeneratorForCode(500, serverErrorMessageGenerator).
    addGeneratorForCode(502, badGatewayErrorMessageGenerator).
    addGeneratorForCode(503, unavailableErrorMessageGenerator).
    addUnexpectedGenerator(unexpectedErrorMessageGenerator);
}


//
// Customize the error generators for certain action types.
//
// XXX Perhaps this should be moved from here and we allow other modules to
// customize as they see fit.
//
export function addActionTypeCustomizations(generatorsMap) {
  generatorsMap.customizeMessage(
    401,
    storageActionTypes.AUTHENTICATE,
    {
      title: 'Authentication failure',
      content: `The provided username and/or password are incorrect for the
           selected storage collection. Please correct these and try again.`,
    }
  );

  generatorsMap.customizeMessage(
    404,
    storageActionTypes.AUTHENTICATE,
    {
      title: 'Storage collection not found',
      content: `The selected storage collection is not available.`,
    }
  );

  generatorsMap.customizeMessage(
    503,
    storageActionTypes.AUTHENTICATE,
    {
      title: 'Storage collection unavailable',
      content: `The selected storage collection is currently unavailable. Please try again later
            or contact your network administrator.`,
    }
  );

}


function correctErrorsText() {
  return 'Please correct the errors and try again.';
}
