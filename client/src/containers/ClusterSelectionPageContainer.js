
import { connect } from 'react-redux';

import ClusterSelectionPage from 'components/pages/ClusterSelectionPage';
import * as clusterActions from 'clusters/actions';
import {clusterSelectionPageSelector} from 'selectors';

export default connect(
  clusterSelectionPageSelector,
  clusterActions
)(ClusterSelectionPage);
