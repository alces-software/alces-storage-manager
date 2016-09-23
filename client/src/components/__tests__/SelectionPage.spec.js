
/* eslint-env mocha */
import {expect} from 'chai';
import React from 'react';
import {renderIntoDocument} from 'react-addons-test-utils';

import SelectionPage from 'components/SelectionPage';

describe('SelectionPage', function() {
  describe('shouldComponentupdate', function() {
    beforeEach(function() {
      const props = {
        header: <div/>,
        items: [],
        keyProp: 'id',
        selectionBoxComponent: 'div',
        loggingOut: false,
      }
      this.selectionPage = renderIntoDocument(<SelectionPage {...props}/>);
    })

    it ("doesn't update when logging out", function() {
      const nextProps = {loggingOut: true};
      const shouldUpdate = this.selectionPage.shouldComponentUpdate(nextProps);
      expect(shouldUpdate).to.be.false;
    });

    it ('updates when not logging out', function() {
      const nextProps = {loggingOut: false};
      const shouldUpdate = this.selectionPage.shouldComponentUpdate(nextProps);
      expect(shouldUpdate).to.be.true;
    });
  });
});
