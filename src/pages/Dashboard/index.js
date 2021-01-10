import React, { Component } from 'react';
import './styles.css';

class Dashboard extends Component {
  state = {
    error: '',
    code: '',
    name: '',
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
    console.log(this.state.name);
    // TODO
  };

  handleJoinRoom = async (e) => {
    e.preventDefault();
    console.log(this.state.code);
    // TODO
  };

  render() {
    return (
      <div id="dashboard">
        <div className="ui grid">
          <div className="eight wide column">
            <div className="ui fluid input">
              <input type="text" 
              id="create-input"
              placeholder="Type your room name" 
              name="name"
              onChange={this.handleChange}
              value={this.state.name}/>
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