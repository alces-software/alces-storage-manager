import _ from 'lodash';
import React, {PropTypes} from 'react';
import { MenuItem as BsMenuItem, Nav, NavDropdown } from 'react-bootstrap';
import { Header as FlightHeader, NavItemLink, Icon } from 'flight-common';

const MenuItem = ({onClick, iconName, children, header, divider}) => {
  if (header) {
    return <BsMenuItem header>{children}</BsMenuItem>;
  }
  if (divider) {
    return <BsMenuItem divider />;
  }

  return (
    <BsMenuItem onClick={onClick}>
      <Icon name={iconName || "fw"} />
      {children}
    </BsMenuItem>
  );
};

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
    const {currentStorage, storageHosts, logout, redirectTo} = this.props;
    if (currentStorage) {
      const currentText = <span>Logged in as <strong>{currentStorage.username}</strong> to <strong>{currentStorage.name}</strong> (<em>{currentStorage.ip}:{currentStorage.auth_port}</em>)</span>;
      const otherStorageHosts = _(storageHosts).reject((host) => host.id == currentStorage.id).value();

      if (otherStorageHosts.length == 0) {
        return (
          <Nav pullRight>
            <NavDropdown title={currentText} id="navbar-right-menu">
              <MenuItem onClick={() => {logout(currentStorage)}} iconName="sign-out">Log out of {currentStorage.name}</MenuItem>
              <MenuItem onClick={() => redirectTo('/')} iconName="arrow-return">Back to main menu</MenuItem>
            </NavDropdown>

          </Nav>
        );
      }

      return (
        <Nav pullRight>
          <NavDropdown title={currentText} id="navbar-right-menu">
            <MenuItem header>Also logged in to:</MenuItem>
            {_(otherStorageHosts).map(
              (host) => {
                return (
                  <MenuItem onClick={() => redirectTo(`/storage/${host.id}/`)} iconName="hdd-o">{host.name} (<em>{host.username}</em>)</MenuItem>
                );
              }
            ).value()}
            <MenuItem divider />
            <MenuItem onClick={() => {logout(currentStorage)}} iconName="sign-out">Log out of {currentStorage.name}</MenuItem>
            <MenuItem onClick={() => redirectTo('/')} iconName="arrow-return">Back to main menu</MenuItem>
          </NavDropdown>

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
