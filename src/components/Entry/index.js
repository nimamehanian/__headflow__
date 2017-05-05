import React, { Component } from 'react';
import classnames from 'classnames';

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const entryClasses = classnames({ entry: true });
    const hasChildren = this.props.node.nodes.count() > 1;
    const isExpanded = this.props.node.data.get('isExpanded', true);
    const isVisible = this.props.node.data.get('isVisible', true);
    return (
      <div
        className={entryClasses}
        {...this.props.attributes}
        style={{ display: `${isVisible ? 'block' : 'none'}` }}
      >
        {hasChildren ? <span className="line" contentEditable={false} /> : null}
        {hasChildren ?
          <span className="collapse-expand-btn" contentEditable={false}>
            <i className={`ion-${isExpanded ? 'minus' : 'plus'}-round`} />
          </span> : null
        }
        <span className="entry-text">{this.props.children}</span>
      </div>
    );
  }
}

export default Entry;
