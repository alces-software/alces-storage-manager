
import { connect } from 'react-redux';

import FileManagerPage from 'components/pages/FileManagerPage';
import {storageHostFromRouteSelector} from 'selectors';

export default connect(
  storageHostFromRouteSelector
)(FileManagerPage);
