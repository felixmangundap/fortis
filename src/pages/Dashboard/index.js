import React, { Component, Fragment } from 'react';
import {Redirect} from 'react-router-dom';
import './styles.css';

import { auth, firestore } from '../../services/firebase';

class Dashboard extends Component {
  state = {
    error: '',
    code: '',
    roomName: '',
    presenterId: auth().currentUser.uid,
    redirect: false
  };

  componentDidMount() {
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleCreateRoom = async (e) => {
    e.preventDefault();
    console.log(this.state.roomName);
    this.setState({ error: '' });
    let ref;
    try {
      ref = await firestore.collection('rooms').doc();
      await firestore.collection('rooms').doc(ref.id)
        .set({roomName: this.state.roomName, roomCode: ref.id, presenterId: this.state.presenterId});
      this.setState({redirect: true, code: ref.id});
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleJoinRoom = async (e) => {
    e.preventDefault();
    this.setState({ error: '' });
    try {
      await firestore.collection('rooms').doc(this.state.code).get().then((doc) => {
        if (doc.exists) {
          this.setState({redirect: true});
        } else {
          alert("Invalid room code!");
        }})
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  render() {
    if(this.state.redirect) {
      return <Redirect to={`/room/${this.state.code}`}/>;
    }
    return (
      <Fragment>
        <div className="ui stackable grid" id="dashboard">
          <div className="eight wide column" id="left-dashboard">
            <div id="inner-left">
              <h1>Create a room </h1>
              <div className="ui fluid input">
                <input type="text" 
                id="create-input"
                placeholder="Type your room name..." 
                name="roomName"
                onChange={this.handleChange}
                value={this.state.roomName}/>
              </div>
              <button className="ui primary fluid button" id="create-button"
              onClick={this.handleCreateRoom}>Create Room</button>
            </div>
          </div>
          <div className="eight wide column" id="right-dashboard">
            <div id="inner-right">
              <h1>Join a room </h1>
              <div className="ui fluid input">
                <input type="text" 
                id="join-input"
                placeholder="Enter an existing room code here..." 
                name="code" 
                onChange={this.handleChange}
                value={this.state.code}/>
              </div>
              <div id="joinbutton-container">
                <button className="ui primary fluid button" id="join-button"
                onClick={this.handleJoinRoom}>Join Room</button>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Dashboard;