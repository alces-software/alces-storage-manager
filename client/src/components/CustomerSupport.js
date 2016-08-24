
import React from 'react';

export class CustomerSupportLink extends React.Component {
  render() {
    return (
      <a href='mailto: support@alces-software.com'>Alces Customer Support</a>
    );
  }
}

export class ContactCustomerSupport extends React.Component {
  render() {
    return (
      <span>If this error continues to occur please contact
        the <CustomerSupportLink/> team.</span>
    )
  }
}
