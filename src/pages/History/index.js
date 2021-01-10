import React, { Component } from 'react';
import { auth, firestore } from '../../services/firebase';
import _ from 'lodash';

import './styles.css';

class History extends Component {
  state = {
    userId: auth().currentUser.uid,
    rooms: {},
    roomIds: []
  }

  componentDidMount() {
    this.fetchRooms()
    this.fetchRoomDetails()
  }

  fetchRooms = () => {
    const { userId } = this.state;
    firestore.collection('users')
      .doc(userId)
      .get()
      .then((doc) => {
        this.setState({
          roomIds: doc.data().rooms
        })
      })
  }

  fetchRoomDetails = async () => {
    const { userId, rooms } = this.state;
    const roomsRef = firestore.collection('rooms')
    const snapshot = await roomsRef.get()
    const temp = {}
    snapshot.forEach(function (doc) {
      temp[doc.data().roomCode] = doc.data()
    })
    this.setState({
      rooms: {
        ...rooms,
        ...temp
      }
    })
  }

  renderRooms = () => {
    const { userId, rooms, roomIds } = this.state;

    return (
      <div>
        {!_.isEmpty(rooms) && roomIds.map(room => (
          <div className="ui column">
            <div className="ui fluid card card-question">
              <div className="content">
                <div className="header">{rooms[room].roomName}</div>
                <div className="description">
                  <p>{rooms[room].roomName}</p>
                </div>
              </div>
              <div className="extra content" style={{ borderTop: "white" }}>
                <button className="ui icon button resolve-button">
                  Resolve
                  <i className="check circle outline icon resolve-icon"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  render() {
    return (
      <div className="ui container" id="room">
        {this.renderRooms()}
      </div>
    );
  }

}

export default History;
