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

    const StorageMenuItem = ({host}) => {
      return (
        <MenuItem onClick={() => redirectTo(`/storage/${host.id}/`)} iconName="hdd-o">{host.name} (<em>{host.username}</em>)</MenuItem>
      );
    };

    const storageMenuItems = (hosts) => _(hosts).map(
      (host) => (<StorageMenuItem host={host} />)
    ).value();

    const LogoutMenuItem = ({storage}) => <MenuItem onClick={() => {logout(storage)}} iconName="sign-out">Log out of {storage.name}</MenuItem>;

    const MainMenuItem = ({}) => <MenuItem onClick={() => redirectTo('/')} iconName="arrow-return">Back to main menu</MenuItem>;

    if (currentStorage) {
      const currentText = <span>Logged in as <strong>{currentStorage.username}</strong> to <strong>{currentStorage.name}</strong> (<em>{currentStorage.ip}:{currentStorage.auth_port}</em>)</span>;
      const otherStorageHosts = _(storageHosts).reject((host) => host.id == currentStorage.id).value();

      if (otherStorageHosts.length == 0) {
        return (
          <Nav pullRight>
            <NavDropdown title={currentText} id="navbar-right-menu">
              <LogoutMenuItem storage={currentStorage} />
              <MainMenuItem />
            </NavDropdown>

          </Nav>
        );
      }

      return (
        <Nav pullRight>
          <NavDropdown title={currentText} id="navbar-right-menu">
            <MenuItem header>Also logged in to:</MenuItem>
            {storageMenuItems(otherStorageHosts)}
            <MenuItem divider />
            <LogoutMenuItem storage={currentStorage} />
            <MainMenuItem />
          </NavDropdown>

        </Nav>
      );
    }
    else if (storageHosts.length > 0) {
      const titleText = `Logged in to ${storageHosts.length} collection${storageHosts.length == 1 ? '' : 's'}`;
      return (
        <Nav pullRight>
          <NavDropdown title={titleText} id="navbar-right-menu">
            <MenuItem header>Logged in to:</MenuItem>
            {storageMenuItems(storageHosts)}
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
