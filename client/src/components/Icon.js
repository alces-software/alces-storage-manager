
import React, {PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
import classNames from 'classnames';

const iconNameToFontAwesomeProps = {
  "cluster": {name: "rocket"},
  "cluster-authenticating": {name: "spinner", spin: true},
  "cluster-logout": {name: "sign-out"},
  "cluster-pinging": {name: "spinner", spin: true},

  "session-connect": {name: "link"},
  "session-external-access": {name: "external-link-square"},
  "session-external-access-back": {name: "arrow-circle-left"},
  "session-external-access-info": {name: "info-circle"},
  "session-launch": {name: "desktop"},
  "session-launching": {name: "spinner", spin: true},
  "session-password-hide": {name: "eye-slash"},
  "session-password-reveal": {name: "eye"},

  "vnc-volume-on": {name: "volume-up"},
  "vnc-volume-off": {name: "volume-off"},
  "vnc-copy": {name: "files-o"},
  "vnc-paste": {name: "clipboard"},
  "vnc-interactive": {name: "mouse-pointer"},
  "vnc-drag-viewport": {name: "arrows"},
}

const faPropsForIconName = (iconName) => {
  const props = iconNameToFontAwesomeProps[iconName];
  return props ? props : {};
}

export default class Icon extends React.Component {
  render() {
    const faProps = faPropsForIconName(this.props.name);
    const classes = classNames(
      "flight-icon",
      `flight-icon-${this.props.name}`,
      faProps.className,
      this.props.className
    )
    return (
      <FontAwesome
        {...this.props}
        {...faProps}
        className={classes}
      />
    )
  }
}

Icon.propTypes = {
  ...FontAwesome.propTypes,
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
};
