
import _ from 'lodash';

//
// Class for generating messages for a particular code.
//
// The title, content and optional actions can be overridden with an override
// code, see the registerTitle, registerContent, and registerActions methods
// respectively.
//
// This is particularly useful for overriding based on the actionType
// submitted to the redux store.
//
export default class MessageGenerator {
  constructor(defaultTitle, defaultContent) {
    this.defaultTitle = defaultTitle;
    this.defaultContent = defaultContent;
    this.titles = {};
    this.contents = {};
    this.actions = {};
  }

  registerTitle(overrideCode, title) {
    this.titles[overrideCode] = title;
  }

  registerContent(overrideCode, content) {
    this.contents[overrideCode] = content;
  }

  registerActions(overrideCode, actions) {
    this.actions[overrideCode] = actions;
  }

  generateMessage(message, overrideCode) {
    let title = this.titles[overrideCode] || this.defaultTitle;
    if (_.isFunction(title)) {
      title = title(message);
    }
    let content = this.contents[overrideCode] || this.defaultContent;
    if (_.isFunction(content)) {
      content = content(message);
    }
    let actions = this.actions[overrideCode];
    if (_.isFunction(actions)) {
      actions = actions(message);
    }
    return {
      title: title,
      content: content,
      actions: actions,
    }
  }
}
