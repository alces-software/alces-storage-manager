
import React, {PropTypes} from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import { Header as FlightHeader, NavItemLink, Icon } from 'flight-common';

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
    const {currentStorage, logout} = this.props;
    if (currentStorage) {
      return (
        <Nav pullRight>
          <NavItem>
            Logged in as <strong>{currentStorage.username}</strong> to {currentStorage.address}&nbsp;
          </NavItem>
          <NavItem onClick={() => {logout(currentStorage)}}>
            Log out <Icon name="sign-out" />
          </NavItem>
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
