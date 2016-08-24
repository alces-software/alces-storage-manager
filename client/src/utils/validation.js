
//
// Based on React Redux Universal Hot Example
// (https://github.com/erikras/react-redux-universal-hot-example) released
// under the MIT licence.
//

import _ from 'lodash';
import validatorUtils from 'validator';
import yaml from 'js-yaml';

// Compose a list of rules into a single rule which returns all errors from
// the rules in order or undefined if there are no errors.
function composeRules(rules) {
  return (value, allValues, props) => {
    // Return the first error or undefined.
    const errors = rules.map(rule => rule(value, allValues, props)).filter(error => !!error);
    if (errors.length) {
      return errors;
    } else {
      return undefined;
    }
  }
}

export function isJsonSubsetOfYaml(value) {
  if (isEmpty(value)) { return }
  let error = isYaml(value);
  if (error) { return error }
  const jsonString = JSON.stringify(
    yaml.safeLoad(value, {schema: yaml.JSON_SCHEMA})
  );
  error = isJson(jsonString);
  if (error) { return error }
}

export function isYaml(value) {
  if (isEmpty(value)) { return }

  try {
    yaml.safeLoad(value, {schema: yaml.JSON_SCHEMA});
    return;
  } catch (e) {
    // eslint-disable-line no-empty
  }
  return 'invalid';
}

export function isJson(value) {
  if (isEmpty(value)) { return }
  try {
    const o = JSON.parse(value);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the
    // type-checking, but...  JSON.parse(null) returns 'null', and
    // typeof null === "object", so we must check for that, too.
    if (o && typeof o === "object" && o !== null) {
      return
    }
  } catch (e) {
    // eslint-disable-line no-empty
  }
  return 'invalid';
}

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

export function email(value) {
  if (!isEmpty(value) && !validatorUtils.isEmail(value)) {
    return 'invalid';
  }
}

export function required(value) {
  if (isEmpty(value)) {
    return 'required';
  }
}

export function minLength(min) {
  return value => {
    if (!isEmpty(value) && value.length < min) {
      return "too_short";
    }
  };
}

export function maxLength(max) {
  return value => {
    if (!isEmpty(value) && value.length > max) {
      return "too_long";
    }
  };
}

export function integer(value) {
  if (!Number.isInteger(Number(value))) {
    return 'Must be an integer';
  }
}

export function oneOf(enumeration) {
  return value => {
    if (!~enumeration.indexOf(value)) {
      return `Must be one of: ${enumeration.join(', ')}`;
    }
  };
}

export function confirmationOf(confirms) {
  return (value, allValues) => {
    if (value !== allValues[confirms]) {
      return "not_confirmed";
    }
  }
}

export function accepted(value) {
  if (!value) {
    return "not_accepted";
  }
}

// Given a form field and an array of rules, returns a new array of rules each
// of which will only validate when the field has a truthy value.
export function when(booleanField, rules) {
  return _.map(rules, (rule) => {
    return (value, allValues, props) => {
      if (allValues[booleanField]) {
        return rule(value, allValues, props);
      }
    }
  });
}

export function createValidator(rules) {
  return (data = {}, props = {}) => {
    const errors = {};
    Object.keys(rules).forEach((key) => {
      const rule = composeRules([].concat(rules[key])); // concat enables both functions and arrays of functions
      const error = rule(data[key], data, props);
      if (error) {
        errors[key] = error;
      }
    });
    return errors;
  };
}
