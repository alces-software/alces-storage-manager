
import _ from 'lodash';
import React, {PropTypes} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import {elementType} from 'react-prop-types';
import ReactCSSTransitionReplace from 'react-css-transition-replace';

class SelectionPage extends React.Component {
  render() {
    const {addItemBox, header, items, keyProp} = this.props;

    // Render item columns here so we can group all rendered columns together
    // (addItemBox is passed in rendered), before splitting these into rows and
    // rendering these.
    const renderedItemColumns = _.map(items, (item) => this.renderItemColumn(item));
    const addItemColumn = this.renderColumn(addItemBox, "add-session");
    const allRenderedColumns = [...renderedItemColumns, addItemColumn];

    const groupedColumns = _.chunk(allRenderedColumns, 2);

    // Form a key by concatenating the keyProp of all items, and then we can
    // fade out all items to the new ones whenever this changes.
    const keyComponents = _.map(items, keyProp);
    const key = _.join(keyComponents, '-');

    return (
      <div className="container">
        <Grid>
          <Row>
            <Col md={12}>
              <div className="selection-details-box">
                {header}
              </div>
            </Col>
          </Row>
          <ReactCSSTransitionReplace
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}
            transitionName="cross-fade"
            >
            <div key={key}>
              {this.renderRows(groupedColumns)}
            </div>
          </ReactCSSTransitionReplace>
        </Grid>
      </div>
    );
  }

  renderRows(rows) {
    return _.map(rows, (row, key) => (
      <Row key={key}>
        {row}
      </Row>
    ));
  }

  renderItemColumn(item) {
    const {keyProp, selectionBoxComponent, selectionBoxProps} = this.props

    let finalSelectionBoxProps;
    if (typeof selectionBoxProps === 'function') {
      finalSelectionBoxProps = selectionBoxProps(item);
    }
    else {
      finalSelectionBoxProps = selectionBoxProps;
    }

    const key = item[keyProp];
    const selectionBoxElement = React.createElement(
      selectionBoxComponent,
      {item, ...finalSelectionBoxProps}
    );

    return this.renderColumn(selectionBoxElement, key);
  }

  renderColumn(element, key) {
    return (
      <Col md={6} key={key}>
        {element}
      </Col>
    )
  }

  shouldComponentUpdate(nextProps) {
    // Don't update when we are logging out (between dispatching LOGOUT and
    // dispatching LOGOUT_COMPLETE after transition back to home page), to
    // avoid FlipCard component children giving errors as they try to render
    // while we unmount. This may be fixed by
    // https://github.com/mzabriskie/react-flipcard/pull/3 being merged.
    return !nextProps.loggingOut;

    // TODO: Could do similar when sign in and transition as well - FlipCard
    // gives errors then too although these don't appear to affect anything.
  }
}

SelectionPage.propTypes = {
  header: PropTypes.element.isRequired, // Page header.
  items: PropTypes.array.isRequired, // Items to display.
  keyProp: PropTypes.string.isRequired, // Property to use for item keys.
  selectionBoxComponent: elementType.isRequired, // Component to display items with.
  selectionBoxProps: PropTypes.oneOfType(
    [PropTypes.object, PropTypes.func]
  ), // Props to pass through to each selection box, or function to generate these for each item.
  addItemBox: PropTypes.element, // Optional final box to add a new item.
  loggingOut: PropTypes.bool.isRequired,
};

export default SelectionPage;
