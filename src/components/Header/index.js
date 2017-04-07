import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { Auth } from '../../firebase';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuVisible: false,
    };
    this.toggleAvatarMenu = this.toggleAvatarMenu.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  toggleAvatarMenu() {
    this.setState({
      isMenuVisible: !this.state.isMenuVisible,
    });
  }

  signOut() {
    Auth.signOut()
      .then(() => console.log('Signed out.'))
      .catch(() => console.error('Error: Could not sign out.'));
  }

  render() {
    const menuClasses = classnames({
      menu: true,
      'is-visible': this.state.isMenuVisible,
    });

    const screenClasses = classnames({
      screen: true,
      'is-visible': this.state.isMenuVisible,
    });

    return (
      <div className="header">
        <div className="links-left">
          <div className="logo">headflow</div>
        </div>
        <div className="links-right">
          {
            this.props.isSaving ?
              <i className="saving ion-ios-cloud-upload-outline" /> :
              <i className="saved ion-checkmark-circled" />
          }
          <div
            className="header-element avatar"
            onClick={this.toggleAvatarMenu}
          >
            {this.props.username}
            <i className="arrow-down ion-ios-arrow-down" />
          </div>
        </div>

        <div className={menuClasses}>
          <div className="menu-item disabled">
            <i className="ion-android-person" />
            account
          </div>
          <div className="menu-item disabled">
            <i className="ion-ios-settings-strong" />
            settings
          </div>
          <div className="menu-item divider" />
          <div className="menu-item" onClick={this.signOut}>
            <i className="ion-log-out" />
            log out
          </div>
        </div>
        <div className={screenClasses} onClick={this.toggleAvatarMenu} />
      </div>
    );
  }
}

Header.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
};

export default Header;
