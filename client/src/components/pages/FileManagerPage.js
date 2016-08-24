
import React from 'react';

import FileManager from 'components/FileManager';

export default class FileManagerPage extends React.Component {
  render() {
    return (
      <FileManager collection={this.props.storageCollection} />
    );
  }
}
