
import React from 'react';
import FlipCard from 'react-flipcard';

import { Button } from 'react-bootstrap';
import { ButtonLink, Icon } from 'flight-common';

import StorageLoginForm, {storageLoginFormName} from 'storage/components/StorageLoginForm';

class StorageSelectionCard extends React.Component {
  render() {
    const {authenticate, item, logout} = this.props;

    if (item.username) {
      return (
        <AuthenticatedStorageSelectionCard
          logout={logout}
          item={item}
        />
      );
    }
    else {
      return (
        <UnauthenticatedStorageSelectionCard
          authenticate={authenticate}
          item={item}
        />
      );
    }
  }
}

const UnauthenticatedStorageSelectionCard = ({item, authenticate}) => {
  const form = storageLoginFormName(item);

  return (
    <div
      className="flip-selection-box"
    >
      <FlipCard>
        <div className="flip-selection-box-front">
          {item.name}
          <p>
            <em>Click to log in</em>
          </p>
        </div>
        <div className="flip-selection-box-back">
          <p>
            <strong>{item.name}</strong>
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
};

const AuthenticatedStorageSelectionCard = ({item, logout}) => {
  return (
    <div
      className="static-selection-box"
    >
      <p>
        <strong>{item.name}</strong>
      </p>
      <p>
        Logged in as <em>{item.username}</em>
      </p>
      <div className="selection-box-button-container">
        <div className="selection-box-button-inner-container">
          <ButtonLink to={`/storage/${item.id}/`} bsStyle="success">
            View Storage
          </ButtonLink>
          <Button bsStyle="danger"
            onClick={() => logout(item)}
          >
            Log out <Icon name="sign-out" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StorageSelectionCard

