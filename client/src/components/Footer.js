
import React from 'react';
import moment from 'moment';

class Footer extends React.Component {
  render() {
    const currentYear = moment().format("YYYY");
    return (
      <footer>
        Alces Storage Manager <span className="flightFooter-copyright">&copy;</span> 2015&ndash;{currentYear}&nbsp;
        <a className="flightFooter-us" href="http://www.alces-software.com">
          Alces&nbsp;Software&nbsp;Ltd
        </a>
      </footer>
    )
  }
}

export default Footer;
