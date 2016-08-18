
import { connect } from 'react-redux';

import StorageSelectionPage from 'components/pages/StorageSelectionPage';
import {storageCollectionsSelector} from 'selectors';

export default connect(
  storageCollectionsSelector
)(StorageSelectionPage);
