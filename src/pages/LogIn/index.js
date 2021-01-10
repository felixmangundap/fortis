import React, { Component } from 'react';
import { signin, signInWithGoogle } from '../../services/auth';

class LogIn extends Component {
  state = {
    error: null,
    email: '',
    password: '',
  };

  componentDidMount() {
  }

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
      <div>
        <button onClick={this.handleSubmit}>Login</button>
      </div>
    );
  }
}

export default LogIn;