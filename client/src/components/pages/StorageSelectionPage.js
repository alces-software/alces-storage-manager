
import React from 'react';

export default class StorageSelectionPage extends React.Component {
  render() {
    const {
      storage: {hosts},
    } = this.props;

    return <p>I know of {hosts.length} collections</p>
  }
}
