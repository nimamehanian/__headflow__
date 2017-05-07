import React, { Component } from 'react';
import classnames from 'classnames';

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { onChange } = this.props.editor;
    const isExpanding = !this.props.node.data.get('isExpanded');
    const newState = this.props.node.nodes.count() > 1 ?
      this.props.node.nodes.reduce((tr, node) => {
        if (node.kind === 'text') { return tr; }
        return tr.setNodeByKey(node.key, { data: {
          isExpanded: node.data.get('isExpanded', isExpanding),
          isVisible: isExpanding,
        } });
      }, this.props.state.transform())
      .setNodeByKey(this.props.node.key, { data: { isExpanded: isExpanding } })
      .apply() : this.props.state;
    return onChange(newState);
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
          <span className="collapse-expand-btn" contentEditable={false} onClick={this.handleClick}>
            <i className={`ion-${isExpanded ? 'minus' : 'plus'}-round`} />
          </span> : null
        }
        <span className="entry-text">{this.props.children}</span>
      </div>
    );
  }
}

export default Entry;
