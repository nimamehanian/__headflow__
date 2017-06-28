import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Raw } from 'slate';
import Header from '../Header';
import Sidebar from '../Sidebar';
import Tree from '../Tree';
import Spinner from '../Spinner';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.load(this.props.user);
  }

  render() {
    if (this.props.isDataLoaded) {
      console.log(this.props.editorState);
      // console.log(
      //   Raw.deserialize(
      //     { nodes: this.props.editorState.document
      //     .nodes.get(this.props.currentContext)
      //     .nodes.skip(1).toJS() },
      //     { terse: true }
      //   )
      // );
    }
    return (
      <div>
        {!this.props.isDataLoaded ?
          <div className="app-loading"><Spinner /></div> : null
        }
        <div className="app">
          <Header
            isEditorFocused={this.props.isEditorFocused}
            isSaving={this.props.isSaving}
            username={this.props.user.displayName || this.props.user.email}
          />
          <Sidebar
            selectContext={this.props.selectContext}
            currentContext={this.props.currentContext}
            contexts={this.props.editorState.document.nodes.reduce((list, block) =>
              [...list, block.nodes.get(0).text]
              , [])}
            userId={this.props.user.uid}
          />
          <Tree
            save={this.props.save}
            update={this.props.update}
            editorState={this.props.editorState}
            currentContext={this.props.currentContext}
            toggleEditorFocus={this.props.toggleEditorFocus}
            userId={this.props.user.uid}
          />
        </div>
      </div>
    );
  }
}

App.propTypes = {
  user: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default App;
