import React, { Component } from 'react';
// import range from 'lodash/range';
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

// App.propTypes = {
//   user: PropTypes.objectOf(PropTypes.any).isRequired,
// };

export default App;

/*
<div className="line-numbers">
  {range(1, this.props.editorState
    .getCurrentContent().getBlockMap().count() + 1)
    .map(num => <div className="num" key={`line_${num}`}>{num}</div>)
  }
</div>
*/
