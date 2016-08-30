
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Header from 'components/Header';
import { Footer, LoadingPage } from 'flight-common';
import * as notificationActions from 'notification/actions';
import * as storageActions from 'storage/actions';
import NotificationModals from 'notification/components/NotificationModals';
import {appSelector} from 'selectors';

if (!__TEST__){
  require("styles/main.scss");
}

const productName = "Alces Storage Manager";

class App extends React.Component {
  render() {
    const {
      notifications: {showingModal, currentModal, exitingModal},
      closeNotificationModal,
    } = this.props;

    return (
      <div className="stickyFooter-wrapper-wrapper">
        <div className="flight">
          <NotificationModals
            showingModal={showingModal}
            onCloseNotification={closeNotificationModal}
            currentModal={currentModal}
            exitingModal={exitingModal}
          />
          <Header productName={productName} {...this.props} />
          <div className="pageContainer">
            {this.page()}
          </div>
        </div>
        <Footer ref={(footer) => this.footer = footer} productName={productName} />
      </div>
    )
  }

  page() {
    const {ui: {loaded}} = this.props;

    let key;
    if (loaded) {
      key = this.props.location.pathname;
    } else {
      key = 'loadingPage';
    }

    return (
      <ReactCSSTransitionGroup
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
        transitionName="fade-in-out"
        >
        <FadeTransitionHandler key={key} className="page" footer={this.footer}>
          {loaded ? this.props.children : <LoadingPage productName={productName} />}
        </FadeTransitionHandler>
      </ReactCSSTransitionGroup>
    )
  }
}

class FadeTransitionHandler extends React.Component {
  componentDidMount() {
    // A page is about to fade in.
    const footerEl = ReactDOM.findDOMNode(this.props.footer);
    if (footerEl) {
      footerEl.classList.add("footer--animate");
    }
  }

  componentWillUnmount() {
    // A page has just faded out.
    const footerEl = ReactDOM.findDOMNode(this.props.footer);
    if (footerEl) {
      footerEl.classList.remove("footer--animate");
    }
  }

  render() {
    return (
      <div className="page">
        {this.props.children}
      </div>
    );
  }
}

export default connect(
  appSelector,
  {
    closeNotificationModal: notificationActions.closeModal,
    logout: storageActions.logout,
  }
)(App);
