import React, { Component, Fragment } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import { auth, firestore } from './services/firebase';
import './styles.css';

const PrivateRoute = ({
  component: Component,
  authenticated,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      return authenticated ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{ pathname: '/login', state: { from: props.location } }}
        />
      );
    }}
  />
);

const PublicRoute = ({
  component: Component,
  authenticated,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      return authenticated ? (
        <Redirect to="/dashboard" />
      ) : (
        <Component {...props} />
      )
    }}
  />
);

class App extends Component {
  state = {
    authenticated: false,
    loading: true,
  };

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        firestore
          .collection('users')
          .doc(user.uid)
          .onSnapshot((snapshot) => {
            if (snapshot.data()) {
              this.setState({
                authenticated: true,
                loading: false,
              });
            }
          });
      } else {
        this.setState({
          authenticated: false,
          loading: false,
        });
      }
    });
  }

  render() {
    return this.state.loading === true ? (
      <h2>Loading...</h2>
    ) : (
      <Router>
        <Fragment>
          <NavBar authenticated={this.state.authenticated} />
          <Switch>
            <PublicRoute
              exact
              path="/"
              authenticated={this.state.authenticated}
              component={Home}
            ></PublicRoute>
            <PrivateRoute
              path="/dashboard"
              authenticated={this.state.authenticated}
              component={Dashboard}
            ></PrivateRoute>
            <PrivateRoute
              path="/room/:code"
              authenticated={this.state.authenticated}
              component={Room}
            ></PrivateRoute>
            <PublicRoute
              path="/signup"
              authenticated={this.state.authenticated}
              component={SignUp}
            ></PublicRoute>
            <PublicRoute
              path="/login"
              authenticated={this.state.authenticated}
              component={LogIn}
            ></PublicRoute>
          </Switch>
        </Fragment>
      </Router>
    );
  }
}

export default App;
