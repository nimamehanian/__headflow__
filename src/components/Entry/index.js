import React, { Component } from 'react';
import classnames from 'classnames';

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const entryClasses = classnames({
      entry: true,
      // hide: !blockData.get('isVisible'),
    });

    return (
      <div className={entryClasses} {...this.props.attributes}>
        <span className="bullet" contentEditable={false}>•</span>
        {this.props.children}
      </div>
    );
  }
}

export default Entry;
