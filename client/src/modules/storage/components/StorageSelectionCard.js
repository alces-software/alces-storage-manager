
import React from 'react';
import FlipCard from 'react-flipcard';

import StorageLoginForm, {storageLoginFormName} from 'storage/components/StorageLoginForm';

class StorageSelectionCard extends React.Component {
  render() {
    const {authenticate, item} = this.props;

    const form = storageLoginFormName(item);

    return (
      <div
        className="flip-selection-box"
        >
        <FlipCard>
          <div className="flip-selection-box-front">
            {item.address}
            <p>
              <em>Click to log in</em>
            </p>
          </div>
          <div className="flip-selection-box-back">
            <p>
              <strong>{item.address}</strong>
            </p>
            <StorageLoginForm
              authenticate={authenticate}
              host={item}
              form={form}
            />
          </div>
        </FlipCard>
      </div>
    );
  }
}

export default StorageSelectionCard

