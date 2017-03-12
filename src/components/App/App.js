import React, { Component } from 'react';
import Header from '../Header';
import Tree from '../Tree';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.load();
  }

  render() {
    return (
      <div className="app">
        <Header isSaving={this.props.isSaving} />
        <Tree
          save={this.props.save}
          update={this.props.update}
          editorState={this.props.editorState}
        />
      </div>
    );
  }
}

export default App;
