import React, { Fragment, Component } from 'react';
import { Link } from 'react-router-dom';

import './style.css'
import { signout } from '../../services/auth';

const guestLinks = (
  <div className="right menu ">
    {/* <Link to="/login" className="item text no-border">
      Login
    </Link>
    <Link to="/signup" className="item text no-border">
      Sign Up
    </Link> */}
  </div>
);

const authLinks = (onSignout) => (
  <div className="right menu ">
    <Link onClick={onSignout} className="item text no-border">
      Sign Out
    </Link>
  </div>
);

class NavBar extends Component {

  onSignout = async (e) => {
    e.preventDefault();
    try {
      await signout();
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  render() {
    return (
      <Fragment>
        <div id='menubar' className="ui inverted fixed big menu">
          <div className="ui container">
            <Link to="/" className="item no-border no-padding">
              <img src={require('../../data/img/resolve.svg')} className="logo" />
            </Link>
            {this.props.authenticated === true ? authLinks(this.onSignout) : guestLinks}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default NavBar;
