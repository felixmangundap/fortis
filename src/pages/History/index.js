import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import { auth, firestore } from '../../services/firebase';
import _ from 'lodash';

import './styles.css';

class History extends Component {
  state = {
    userId: auth().currentUser.uid,
    rooms: {},
    roomIds: [],
    redirect: false,
    roomId: '',
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
          <div className="ui container">
            <div className="bg" />
            <div className="bgInfo">
              <div className="bgTitle">History</div>
              <div className="bgText">Previous sessions you attended will be saved here. No more missing questions.</div>
            </div>
            <div className="ui column">
              <div onClick={() => {this.setState({redirect: true, roomId: rooms[room].roomCode})}} className="ui fluid card card-question">
                <div className="content padd">
                  <div className="classHeader">{rooms[room].roomName}</div>
                  <div className="classCode">{rooms[room].roomCode}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={`/room/${this.state.roomId}`}/>;
    }

    return (
      <div className="ui container" id="room">
        {this.renderRooms()}
      </div>
    );
  }

}

export default History;
