import React, { Component } from 'react';
import { auth, firestore } from '../../services/firebase';

import './styles.css';

class Room extends Component {
  state = {
    slow: 0,
    fast: 0,
    confusing: 0,
    perfect: 0,
    anonymous: false,
    question: '',
    questions: [],
    presenterId: '',
    roomId: 'LNpWUigdsM98Xd8ovVUy',
    roomName: '',
    userId: auth.currentUser.uid,
  };

  componentDidMount() {
    this.getRoomInfo();
    // this.fetchStatistics();
    this.fetchQuestions();
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleToggle = (e) => {
    this.setState({
      anonymous: !!!this.state.anonymous
    });
  };

  getRoomInfo = () => {
    const { roomId } = this.state;

    if (roomId) {
      firestore
        .collection('rooms')
        .doc(roomId)
        .onSnapshot((snapshot) => {
          if (snapshot.data()) {
            const { roomName, presenterId } = snapshot.data();
            this.setState({ roomName, presenterId });
          }
        })
    }
  }

  // fetchStatistics = () => {
  //   const { roomId } = this.state;

  //   if (roomId) {
  //     firestore
  //       .collection('rooms')
  //       .doc(roomId)
  //       .collection('moods')
  //       .onSnapshot(
  //         (snapshot) => {
  //           snapshot.docChanges().forEach((change) => {
  //             if (change.type === 'modified') {
  //               console.log(change.doc.data());
  //             }
  //           });
  //         },
  //         (err) => {
  //           console.log(err.toString());
  //         }
  //       );
  //   }
  // }

  fetchQuestions = () => {
    const { questions } = this.state;
    const { roomId } = this.state;

    if (roomId) {
      firestore
        .collection('rooms')
        .doc(roomId)
        .collection('questions')
        .onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                console.log(change.doc.data());
                questions.push(change.doc.data());
              }
            });
          },
          (err) => {
            console.log(err.toString());
          }
        );
    }
  }

  upSlow = () => {

  }

  renderClassInfo = () => {
    const { roomName } = this.state;
    return (
      <div className="info">
        <div className="roomName">{roomName}</div>
        <div className="classMood">
          <div className="option" onClick={this.upSlow}>
            Too Slow
            </div>
          <div className="option">
            Too Quick
            </div>
          <div className="option">
            Too Confusing
            </div>
          <div className="option">
            Perfect!
            </div>
        </div>
      </div>
    )
  }

  renderQuestions = () => {
    const { questions } = this.state;

    console.log(questions);
    return (
      <div>
        {questions.map(question => (
          <div>
            <div>
              {question.question}
            </div>
            <div>
              {question.upvotes}
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderSearchBar = () => {
    const { question, anonymous } = this.state;

    return (
      <div className="searchBar">
        <input
          className='questionField'
          type="text"
          name="question"
          value={question}
          placeholder="Type your question here"
          onChange={this.handleChange}
        />
        <div className="anonymous">
          <input
            className="anonymousCheckbox"
            name="anonymous"
            type="checkbox"
            checked={anonymous}
            onChange={this.handleToggle} />
          <div>Anonymous</div>
        </div>
        <a onClick={this.submitQuestion}>
          Send
        </a>
      </div>
    );
  }

  render() {
    return (
      <div className="ui container" id="room">
        {this.renderClassInfo()}
        {this.renderQuestions()}
        {this.renderSearchBar()}
      </div>
    );
  }
}

export default Room;