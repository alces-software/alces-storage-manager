
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import SessionSelectionPage from 'components/pages/SessionSelectionPage';
import {sessionSelectionPageSelector} from 'selectors';
import * as sessionActions from 'sessions/actions';
import * as uiActions from 'ui/actions';

const mapDispatchToProps = (dispatch) => ({
  sessionActions: bindActionCreators(sessionActions, dispatch),
  uiActions: bindActionCreators(uiActions, dispatch),
});

export default connect(
  sessionSelectionPageSelector,
  mapDispatchToProps
)(SessionSelectionPage);
