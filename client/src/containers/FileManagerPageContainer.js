
import { connect } from 'react-redux';

import FileManagerPage from 'components/pages/FileManagerPage';
import {fileManagerSelector} from 'selectors';

export default connect(
  fileManagerSelector
)(FileManagerPage);
