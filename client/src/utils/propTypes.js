
import React, {PropTypes} from 'react';

import {errMsg, createChainableTypeChecker} from 'react-prop-types/lib/common';

/**
 * Returns a function to check whether a prop provides a particular type of
 * element.
 *
 * @param elementType The type of element to check for.
 */
function createElementOfTypeChecker(elementType) {
  /**
   * Checks whether a prop provides a particular type of element.
   *
   * The type of element can only be provided as the return value of
   * React.createClass(...)
   *
   * @param props
   * @param propName
   * @param componentName
   * @returns {Error|undefined}
   */
  function validate(props, propName, componentName) {
    const errBeginning = errMsg(props, propName, componentName,
                                '. Expected a `' + elementType.displayName + '` Element');

    if (!React.isValidElement(props[propName])) {
      return new Error(errBeginning + ', got something that is not an Element.');
    }
    if (props[propName].type !== elementType) {
      var invalidElementName = props[propName].type.displayName ||
        props[propName].type.name ||
        props[propName].type;
      return new Error(errBeginning + ', got a `' + invalidElementName + '` Element instead.');
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

const elementOfType = createElementOfTypeChecker;
export default elementOfType;

export const selectionBoxPropTypes = {
  item: PropTypes.object.isRequired,
}
