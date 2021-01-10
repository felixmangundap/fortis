import React, { Component, Fragment } from 'react';
import {Link} from 'react-router-dom';
import { signin, signInWithGoogle } from '../../services/auth';
import './styles.css';

class LogIn extends Component {
  state = {
    error: null,
    email: '',
    password: '',
  };

  componentDidMount() {
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ error: '' });
    try {
      await signin(this.state.email, this.state.password);
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  googleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  render() {
    return (
      <Fragment>
        <div className="ui stackable grid" id="login">
          <div className="eight wide column" id="left-login">
            <div id="innerleft-login">
              <h1>Learning for students.</h1>
              <h1>Learning for teachers.</h1>
              <img
                src={require('../../data/img/people.svg')}
                className="image-people"
              />
            </div>
          </div>
          <div className="eight wide column" id="right-login">
            <div id="innerright-login">
              <h1>Log In </h1>
              <div className="ui form">
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    onChange={this.handleChange}
                    value={this.state.email}
                    required
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={this.handleChange}
                    value={this.state.password}
                    required
                    pattern="(?=.*\d)(?=.*[a-zA-Z]).{8,}"
                    title="Password must be a combination of number and letters, and at least 8 or more characters"
                  />
                </div>
                <button className="ui fluid button" id="button-login" onClick={this.handleSubmit}>Login</button>
                <div className="ui horizontal divider">OR</div>
                <button className="ui basic fluid button" id="button-loginGoogle" onClick={this.googleSignIn}>Login with Google</button>
                <div className="bottom-message">Don't have an account? <Link to="/signup">Sign Up</Link></div>
              </div>
              <img
                src={require('../../data/img/Made_with_love.svg')}
                className="image-madewlove"
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default LogIn;
