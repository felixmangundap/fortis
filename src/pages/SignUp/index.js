import React, { Component } from 'react';

import { signup, signUpWithGoogle } from '../../services/auth';

class SignUp extends Component {
  state = {
    error: null,
    name: 'Test User',
    email: 'test@test1.com',
    password: '123456',
    password2: '123456',
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
      await signup(this.state.email, this.state.password, this.state.name);
    } catch (error) {
      this.setState({ error: error.message });
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
      <div>
        <button onClick={this.handleSubmit}>Sign Up</button>
      </div>
    );
  }
}

export default SignUp;