import React, { Component, PropTypes } from 'react';
import Header from '../Header';
import Tree from '../Tree';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.load(this.props.user);
  }

  render() {
    return (
      <div className="app">
        <Header
          isSaving={this.props.isSaving}
          username={this.props.user.displayName || this.props.user.email}
        />
        <Tree
          save={this.props.save}
          update={this.props.update}
          editorState={this.props.editorState}
          userId={this.props.user.uid}
        />
      </div>
    );
  }
}

App.propTypes = {
  user: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default App;
