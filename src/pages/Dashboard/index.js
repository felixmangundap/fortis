import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import './styles.css';

import { auth, firestore } from '../../services/firebase';

class Dashboard extends Component {
  state = {
    error: '',
    code: '',
    roomName: '',
    presenterId: auth.currentUser.uid,
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
      <div id="dashboard">
        <div className="ui grid">
          <div className="eight wide column">
            <div className="ui fluid input">
              <input type="text" 
              id="create-input"
              placeholder="Type your room name" 
              name="roomName"
              onChange={this.handleChange}
              value={this.state.roomName}/>
            </div>
          </div>
          <div className="eight wide column">
            <button className="ui primary fluid button" id="create-button"
            onClick={this.handleCreateRoom}>Create Room</button>
          </div>
        </div>
        <h4 id="divider">OR</h4>
        <div className="ui grid">
          <div className="eight wide column">
            <div className="ui fluid input">
              <input type="text" 
              id="join-input"
              placeholder="Enter your room code" 
              name="code" 
              onChange={this.handleChange}
              value={this.state.code}/>
            </div>
          </div>
          <div className="eight wide column">
            <button className="ui primary fluid button" id="join-button"
            onClick={this.handleJoinRoom}>Join Room</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;