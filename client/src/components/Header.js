
import React, {PropTypes} from 'react';
import { Nav } from 'react-bootstrap';
import { Header as FlightHeader } from 'flight-common';

import {NavItemLink} from 'components/Links';

class Header extends React.Component {
  render() {
    const {productName} = this.props;
    return (
      <FlightHeader productName={productName} >
        <Nav>
          <NavItemLink to="/">
            {productName}
          </NavItemLink>
        </Nav>
        {this.navbarRight()}
      </FlightHeader>
    )
  }

  navbarRight() {
    const {currentStorage} = this.props;
    if (currentStorage) {
      return (
        <Nav pullRight>
          <p className="navbar-text">
            Logged in as <strong>{currentStorage.username}</strong> to {currentStorage.address}
          </p>
        </Nav>
      );
    }
    else {
      return null;
    }
  }
}

Header.propTypes = {
  currentStorage: PropTypes.object,
  productName: PropTypes.string.isRequired,
}

export default Header;
