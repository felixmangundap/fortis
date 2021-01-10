import React, { Component, Fragment } from 'react';
import {Link} from 'react-router-dom';

import { signup, signUpWithGoogle } from '../../services/auth';
import './styles.css'

class SignUp extends Component {
  state = {
    error: null,
    name: '',
    email: '',
    password: '',
    password2: '',
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
    if(this.state.password != this.state.password2) {
      alert("Password do not match!");
    } else {
      this.setState({ error: '' });
      try {
        await signup(this.state.email, this.state.password, this.state.name);
      } catch (error) {
        this.setState({ error: error.message });
      }
    }
  };

  googleSignIn = async () => {
    try {
      await signUpWithGoogle(this.state.name);
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  render() {
    return (
      <Fragment>
        <div className="ui stackable grid" id="signup">
          <div className="eight wide column" id="left-signup">
            <div id="innerleft-signup">
              <h1>Learning for students.</h1>
              <h1>Learning for teachers.</h1>
              <img
                src={require('../../data/img/people.svg')}
                className="image-people"
              />
            </div>
          </div>
          <div className="eight wide column" id="right-signup">
            <div id="innerright-signup">
              <h1>Sign Up </h1>
              <div className="ui form">
                <div className="field">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    onChange={this.handleChange}
                    value={this.state.name}
                    required
                  />
                </div>
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
                <div className="field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="password2"
                    placeholder="Confirm Password"
                    onChange={this.handleChange}
                    value={this.state.password2}
                    required
                    pattern="(?=.*\d)(?=.*[a-zA-Z]).{8,}"
                    title="Password must be a combination of number and letters, and at least 8 or more characters"
                  />
                </div>
                <button className="ui fluid button" id="button-signup" onClick={this.handleSubmit}>Sign Up</button>
                <div className="ui horizontal divider">OR</div>
                <button className="ui basic fluid button" id="button-signupGoogle" onClick={this.googleSignIn}>Register with Google</button>
                <div className="bottom-message">Already have an account? <Link to="/login">Login</Link></div>
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

export default SignUp;