
import _ from 'lodash';

//
// A map from message codes to message generators and an API for modifying
// that map.
//
export default class MessageGeneratorsMap {
  constructor() {
    this.messageGenerators = {};
    this.unexpectedGenerator = undefined;
  }

  addGeneratorForCode(code, generator) {
    this.messageGenerators[code] = generator;
    return this;
  }

  addUnexpectedGenerator(generator) {
    this.unexpectedGenerator = generator;
    return this;
  }

  getGeneratorForCode(code) {
    return this.messageGenerators[code] || this.unexpectedGenerator;
  }

  customizeMessage(code, overrideCode, customizations) {
    const generator = this.getGeneratorForCustomization(code);

    _.forOwn(customizations, (customizationValue, customizationType) => {
      if (customizationType === "title") {
        generator.registerTitle(overrideCode, customizationValue);
      } else if (customizationType === "content") {
        generator.registerContent(overrideCode, customizationValue);
      } else if (customizationType === "actions") {
        generator.registerActions(overrideCode, customizationValue);
      } else {
        throw `Unsupported customization type ${customizationType}`;
      }
    })

    return this;
  }

  getGeneratorForCustomization(code) {
    let generator;
    if (code === "unexpected") {
      generator = this.unexpectedGenerator;
    } else {
      generator = this.messageGenerators[code];
    }
    if (generator === undefined) {
      throw `No message generator registered for code ${code}`;
    } else {
      return generator;
    }
  }
}
