
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {reset} from 'redux-form'

import VncSessionPage from 'components/pages/VncSessionPage';
import {vncSessionPageSelector} from 'selectors';
import * as notificationActions from 'notification/actions';
import * as novncActions from 'novnc/actions';

const mapDispatchToProps = (dispatch) => ({
  notificationActions: bindActionCreators(notificationActions, dispatch),
  novncActions: bindActionCreators(novncActions, dispatch),
  formActions: bindActionCreators({reset}, dispatch),
});

export default connect(
  vncSessionPageSelector,
  mapDispatchToProps
)(VncSessionPage);
