import React, { Component } from 'react';
import { auth, firestore } from '../../services/firebase';

import './styles.css';

class History extends Component {
  state = {
    userId: auth().currentUser.uid,
    rooms: [],
  }

  componentDidMount() {
    this.fetchRooms()
  }

  fetchRooms = () => {
    const { userId, rooms } = this.state;
    firestore
      .collection('users')
      .doc(userId)
      .onSnapshot((snapshot) => {
        var temp = snapshot.data().rooms
        var temp2 = []
        console.log(temp)
        temp.forEach((roomId) => {
          firestore
            .collection('rooms')
            .doc(roomId)
            .onSnapshot((snapshot) => {
              temp2.push(snapshot.data())
            })
            console.log(temp2)
            this.setState({
              rooms: temp2
            })
        })
      })
  }

  renderRooms = () => {
    const { userId, rooms } = this.state;

    console.log("di dalem renderroom")
    console.log(rooms)
    return (
        <div>
        {rooms.map(room => (
          <div>
          <div>
            <div>
              <div>{room.roomName}</div>
              <div>
                <p>{room.roomCode}</p>
              </div>
            </div>
            {/* <div className="extra content" style={{borderTop: "white"}}>
                <button className= "ui icon button resolve-button">
                  Resolve
                  <i className="check circle outline icon resolve-icon"></i>
                </button> 
            </div> */}
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
