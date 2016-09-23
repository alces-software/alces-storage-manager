
import Console from "utils/console";

import MessageGeneratorsMap from "./MessageGeneratorsMap";
import {
  setupDefaultErrorMessageGenerators, addActionTypeCustomizations,
  unexpectedErrorMessageGenerator,
} from "./errorMessageCustomization";


export const errorGeneratorsMap = new MessageGeneratorsMap();

setupDefaultErrorMessageGenerators(errorGeneratorsMap);
addActionTypeCustomizations(errorGeneratorsMap);

// Generates an error message object from a raw error as created in the payload
// of the addError action.
//
// Error message objects must contain a title and content keys, which must have
// values of a string and either a string or JSX respectively.
//
// An error message will be generated and shown whenever an API request fails
// (returns a non-2xx HTTP status code). To add a more specific error message
// for the failure of a particular action, simply add the generation of an
// error message object for the given action to the appropriate function in
// this module (which may be a new function, if it is a message for a new
// status code).
export function generateErrorMessage(rawError) {
  if (!rawError) {
    return undefined;
  }

  const {status, actionType, payload} = parseError(rawError);

  let message;
  let messageGenerator = errorGeneratorsMap.getGeneratorForCode(status);
  if (messageGenerator !== undefined) {
    message = messageGenerator.generateMessage(payload, actionType);
  }

  if (message && message.title && message.content) {
    return message;
  }
  else {
    Console.warn("No or invalid message defined for error:", rawError);
    return unexpectedErrorMessageGenerator.
      generateMessage(payload, actionType);
  }
}

// Parses out an object with the parts we care about from a raw error, as
// created in the payload of the addError action.
function parseError(rawError) {
  return {
    status: rawError.messagePayload.response.status,
    actionType: rawError.messagePayload.action.type,
    payload: rawError.messagePayload,
  }
}


export const infoGeneratorsMap = new MessageGeneratorsMap();

export function generateInformationMessage(message) {
  const messageCode = message.messagePayload;
  let generatedMessage;
  let messageGenerator = infoGeneratorsMap.getGeneratorForCode(messageCode);
  if (messageGenerator !== undefined) {
    generatedMessage = messageGenerator.generateMessage();
  }

  if (generatedMessage && generatedMessage.title && generatedMessage.content) {
    return generatedMessage;
  }
  else {
    Console.warn("No or invalid message defined for:", message);
    return {title: undefined, message: undefined};
  }
}
