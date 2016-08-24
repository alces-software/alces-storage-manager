
import { connect } from 'react-redux';

import StorageSelectionPage from 'components/pages/StorageSelectionPage';
import * as storageActions from 'storage/actions';
import {storageCollectionsSelector} from 'selectors';

export default connect(
  storageCollectionsSelector,
  storageActions
)(StorageSelectionPage);
