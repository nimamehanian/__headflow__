import React, { Component, PropTypes } from 'react';
import logoUrl from '../../images/headflow.png';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="header">
        <div className="links-left">
          <img className="logo" src={logoUrl} alt="logo" />
        </div>
        <div className="links-right">
          {
            this.props.isSaving ?
              <i className="saving ion-ios-cloud-upload-outline" /> :
              <i className="saved ion-checkmark-circled" />
          }
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  isSaving: PropTypes.bool.isRequired,
};

export default Header;
