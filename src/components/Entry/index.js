import React, { Component } from 'react';
import classnames from 'classnames';

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event, isExpanding) {
    event.preventDefault();
    const syncedState = this.props.editor.getState()
      .transform()
      .collapseToStartOf(this.props.node)
      .blur()
      .apply();
    const thisBlock = syncedState.startBlock;
    if (syncedState.selection.isAtStartOf(thisBlock)) {
      this.props.editor.onChange(
        thisBlock.nodes.reduce((tr, node) => {
          if (node.kind === 'text') { return tr; }
          return tr.setNodeByKey(node.key, { data: {
            isExpanded: node.data.get('isExpanded'),
            isVisible: isExpanding,
          } });
        }, syncedState.transform())
        .setNodeByKey(thisBlock.key, { data: {
          isExpanded: isExpanding,
          isVisible: thisBlock.data.get('isVisible'),
        } })
        .apply()
      );
    }
  }

  render() {
    const entryClasses = classnames({ entry: true });
    const hasChildren = this.props.node.nodes.count() > 1;
    const isExpanded = this.props.node.data.get('isExpanded');
    const isVisible = this.props.node.data.get('isVisible');
    return (
      <div
        className={entryClasses}
        {...this.props.attributes}
        style={{ display: `${isVisible ? 'block' : 'none'}` }}
      >
        {hasChildren ? <span className="line" contentEditable={false} /> : null}
        {hasChildren ?
          <span
            className="collapse-expand-btn"
            contentEditable={false}
          >
            <i onClick={e => this.handleClick(e, !isExpanded)} className={`ion-${isExpanded ? 'minus' : 'plus'}-round`} />
          </span> : null
        }
        <span className="entry-text">{this.props.children}</span>
      </div>
    );
  }
}

export default Entry;
