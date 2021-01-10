import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MicRecorder from 'mic-recorder-to-mp3';
import { auth, firestore, storage } from '../../services/firebase';
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
    roomCode: this.props.match.params.code,
    roomName: '',
    userId: auth().currentUser.uid,
    currentEmo: '',

    soundRecorder: new MicRecorder({ bitRate: 128 }),
    isRecording: false,
    isBlocked: false,
    recordingQuestionId: '',
  };

  componentDidMount() {
    this.getRoomInfo();
    this.fetchStatistics('slow');
    this.fetchStatistics('fast');
    this.fetchStatistics('confusing');
    this.fetchStatistics('perfect');
    this.fetchQuestions();

    navigator.getUserMedia({ audio: true },
      () => {
        console.log('Permission Granted');
        this.setState({ isBlocked: false });
      },
      () => {
        console.log('Permission Denied');
        this.setState({ isBlocked: true })
      },
    );
  }

  uploadSound = (qId, blob) => {
    const { roomCode } = this.state;

    const metadata = {
      contentType: 'audio/ogg'
    };

    const reference = `answers/ ${qId}`;

    storage.child(reference).put(blob, metadata).then(function (snapshot) {
      firestore
        .collection("rooms")
        .doc(roomCode)
        .collection("questions")
        .doc(qId)
        .update({
          audioRef: reference,
        })

      console.log('Uploaded a blob or file!');
    });
  }

  startRecording = (qId) => {
    if (this.state.isBlocked) {
      console.log('Permission Denied');
    } else {
      this.state.soundRecorder
        .start()
        .then(() => {
          this.setState({ isRecording: true, recordingQuestionId: qId });
        }).catch((e) => console.error(e));
    }
  };

  stopRecording = () => {
    this.state.soundRecorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        this.uploadSound(this.state.recordingQuestionId, blob)
        this.setState({ isRecording: false });
      }).catch((e) => console.log(e));
  };

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

  handleUpvote = (questionId) => {
    if (!this.isUserPresenter(this.state.userId)) {
      const { userId, roomCode } = this.state;
      const questionsRef = firestore.collection("rooms").doc(roomCode).collection("questions")
      var isPresent = false;
      questionsRef
        .doc(questionId)
        .onSnapshot((snapshot) => {
          const currentQuestion = snapshot.data();
          currentQuestion.upvotes.forEach((currentId) => {
            if (currentId + '' == userId + '') {
              isPresent = true;
            }
          })
          if (!isPresent) {
            const upvotes = currentQuestion.upvotes
            upvotes.push(userId);
            questionsRef
              .doc(questionId)
              .update({
                upvotes: upvotes
              })
          }
        })
    }
  }

  handleResolve = (questionId) => {
    const { roomCode } = this.state;
    const questionRef = firestore.collection("rooms").doc(roomCode).collection("questions")
    questionRef
      .doc(questionId)
      .onSnapshot((snapshot) => {
        const currentQuestion = snapshot.data();
        if (!currentQuestion.resolved) {
          questionRef
            .doc(questionId)
            .update({
              resolved: true
            })
        }
      })
  }

  submitQuestion = (e) => {
    e.preventDefault();
    const { anonymous, userId, roomCode } = this.state;
    var authorName;
    firestore
      .collection('users')
      .doc(userId)
      .get()
      .then(doc => {
        authorName = anonymous ? "(anonymous)" : doc.data().name;
        const questionsRef = firestore.collection("rooms").doc(roomCode).collection("questions")
        questionsRef
          .add({
            question: this.state.question,
            upvotes: [],
            audioRef: '',
            resolved: false,
            author: authorName
          })
          .then((docRef) => {
            questionsRef
              .doc(docRef.id)
              .update({
                uid: docRef.id
              })
          })
          .catch((error) => {
            console.error(error)
          })
      });

  }

  getRoomInfo = () => {
    const { roomCode } = this.state;

    if (roomCode) {
      firestore
        .collection('rooms')
        .doc(roomCode)
        .onSnapshot((snapshot) => {
          // console.log(snapshot.data())
          if (snapshot.data()) {
            const { roomName, presenterId } = snapshot.data();
            this.setState({ roomName, presenterId, roomCode });
          }
        })
    }
  }

  isUserPresenter = (userId) => {
    const { presenterId } = this.state;
    return presenterId == userId;
  }

  isLiked = (likeList) => {
    var liked = false;
    likeList.forEach((currentId) => {
      if (currentId + '' == this.state.userId + '') {
        liked = true;
      }
    })
    return liked;
  }

  fetchStatistics = (emo) => {
    const { roomCode } = this.state;

    if (roomCode) {
      firestore
        .collection('rooms')
        .doc(roomCode)
        .collection(emo)
        .onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              this.setState({ [emo]: snapshot.size })
            });
          },
          (err) => {
            console.log(err.toString());
          }
        );
    }
  }

  fetchQuestions = async () => {
    const { questions } = this.state;
    const { roomCode } = this.state;

    if (roomCode) {
      firestore
        .collection('rooms')
        .doc(roomCode)
        .collection('questions')
        .onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const question = {
                  ...change.doc.data(),
                }

                if (question.audioRef) {
                  const soundRef = storage.child(question.audioRef);

                  soundRef
                    .getDownloadURL()
                    .then(url => {
                      question.audioUrl = url;
                      questions.push(question);
                      questions.sort((a, b) => {
                        if (a.upvotes.length > b.upvotes.length) {
                          return -1;
                        } else if (a.upvotes.length < b.upvotes.length) {
                          return 1;
                        } else {
                          return 0;
                        }
                      })
                      this.setState({
                        questions: questions
                      })
                    })
                }

                else {
                  questions.push(question);
                  questions.sort((a, b) => {
                    if (a.upvotes.length > b.upvotes.length) {
                      return -1;
                    } else if (a.upvotes.length < b.upvotes.length) {
                      return 1;
                    } else {
                      return 0;
                    }
                  })
                  this.setState({
                    questions: questions
                  })
                }
              }
            });
          },
          (err) => {
            console.log(err.toString());
          }
        );
    }
  }

  handleEmotions = (emo) => {
    const { userId, roomCode } = this.state;
    const emos = ['slow', 'fast', 'confusing', 'perfect'];

    emos.forEach(emotion => {
      firestore
        .collection("rooms")
        .doc(roomCode)
        .collection(emotion)
        .doc(userId)
        .delete()
        .catch((error) => {
          console.error(error)
        })
    })


    firestore
      .collection("rooms")
      .doc(roomCode)
      .collection(emo)
      .doc(userId)
      .set({
        vote: 1
      })
      .then(() => {
        this.setState({ currentEmo: emo })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  handleCopy = () => {
    var copyText = document.getElementById("myInput");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    document.execCommand("copy");
  }

  renderClassInfo = () => {
    const { roomName, roomCode, slow, fast, confusing, perfect, currentEmo } = this.state;
    return (
      <div className="info">
        <div className="roomName">{roomName}</div>
        <button className="ui button" id="roomCode" onClick={this.handleCopy}>
          Join Code:
          <input type="text" value={roomCode} id="myInput" />
        </button>
        <Link className="leaveroom" to="/dashboard">
          Leave Room
        </Link>
        <div className="classMood">
          <div className={`option ${currentEmo === 'slow' ? 'selected' : null}`} onClick={() => this.handleEmotions('slow')}>
            <img
              src={require('../../data/img/snooze.svg')}
              className="option_image"
            />
            Too Slow
            <div className={`option_number ${slow >= 5 ? 'red' : null}`}>
              {slow}
            </div>
          </div>
          <div className={`option ${currentEmo === 'fast' ? 'selected' : null}`} onClick={() => this.handleEmotions('fast')}>
            <img
              src={require('../../data/img/quick.svg')}
              className="option_image"
            />
            Too Quick
            <div className={`option_number ${fast >= 5 ? 'red' : null}`}>
              {fast}
            </div>
          </div>
          <div className={`option ${currentEmo === 'confusing' ? 'selected' : null}`} onClick={() => this.handleEmotions('confusing')}>
            <img
              src={require('../../data/img/confusing.svg')}
              className="option_image"
            />
            Too Confusing
            <div className={`option_number ${confusing >= 5 ? 'red' : null}`}>
              {confusing}
            </div>
          </div>
          <div className={`option ${currentEmo === 'perfect' ? 'selected' : null}`} onClick={() => this.handleEmotions('perfect')}>
            <img
              src={require('../../data/img/perfect.svg')}
              className="option_image"
            />
            Perfect!
            <div className={`option_number ${perfect >= 5 ? 'red' : null}`}>
              {perfect}
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderQuestions = () => {
    const { userId, questions } = this.state;

    console.log(questions);

    return (
      <div id="question">
        <div className="ui two column stackable grid">
          {questions.length > 0 && questions.map(question => {
            const qId = question.uid;

            const showStopRecording = this.state.isRecording && this.state.recordingQuestionId === qId;
            const showResolveAudio = this.isUserPresenter(userId) && !question.audioUrl;

            return (
              <div className="ui column" key={question.uid}>
                <div className="ui fluid card card-question">
                  <div className={`content no-grow ${this.isLiked(question.upvotes) ? `liked` : ``}`}>
                    <button className="ui right floated icon button upvote-button" onClick={() => this.handleUpvote(question.uid)}>
                      <i className="caret up icon"></i>
                      {question.upvotes.length}
                    </button>
                    <div className="header">{question.author}</div>
                    <div className="description">
                      <p>{question.question}</p>
                    </div>
                  </div>
                  <div className="extra content" style={{ borderTop: "white" }}>
                    {showResolveAudio ? (
                      <div>
                        {
                          showStopRecording ?
                            (<button className="ui icon right floated button stop-button" onClick={() => this.stopRecording()}>
                              Stop Recording
                              <i className="microphone icon resolve-icon"></i>
                            </button>) : (
                              <button className="ui icon button record-button" onClick={() => this.startRecording(qId)}>
                                Resolve With Audio
                                <i className="microphone icon resolve-icon"></i>
                              </button>
                            )
                        }

                        <button className="ui icon button resolve-button" onClick={() => this.handleResolve(question.uid)}>
                          Resolve
                          <i className="check circle outline icon resolve-icon"></i>
                        </button>
                      </div>
                    ) : null}
                    {
                      question.audioUrl ?
                        <audio src={question.audioUrl} controls="controls" /> : null
                    }
                    {/* </span> */}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
        <i className="ui arrow circle right icon" id="submit-icon" onClick={this.submitQuestion}>
        </i>
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
