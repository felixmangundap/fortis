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
    const { presenterId, roomName } = this.state;
    e.preventDefault();
    this.setState({ error: '' });
    let ref;
    try {
      ref = await firestore.collection('rooms').doc();
      await firestore.collection('rooms').doc(ref.id)
        .set({
          roomName: roomName,
          roomCode: ref.id,
          presenterId: presenterId
        })
      
      firestore
        .collection('users')
        .doc(presenterId)
        .onSnapshot((snapshot) => {
          const rooms = snapshot.data().rooms
          if (!rooms.includes(ref.id)) {
            rooms.push(ref.id);
          }
          firestore
            .collection('users')
            .doc(presenterId)
            .update({
              rooms: rooms
            })
        })
      this.setState({redirect: true, code: ref.id});
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleJoinRoom = async (e) => {
    const { code, presenterId } = this.state;
    e.preventDefault();
    this.setState({ error: '' });
    try {
      await firestore.collection('rooms').doc(code).get().then((doc) => {
        if (doc.exists) {
          firestore
            .collection('users')
            .doc(presenterId)
            .onSnapshot((snapshot) => {
              const rooms = snapshot.data().rooms
              if (!rooms.includes(code)) {
                rooms.push(code);
              }
              firestore
                .collection('users')
                .doc(presenterId)
                .update({
                  rooms: rooms
                })
            })
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