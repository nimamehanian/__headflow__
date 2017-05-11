import React, { Component } from 'react';
import classnames from 'classnames';
import throttle from 'lodash/throttle';

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
    this.getDepth = this.getDepth.bind(this);
    this.recalculateWidth = throttle(() => {
      const xOffset = ((32 * this.getDepth()) + 4 + 16);
      const width = window.innerWidth - xOffset - 4 - 8;
      this.setState({ width });
    }, 300);
  }

  componentDidMount() {
    this.recalculateWidth();
    if (window) {
      window.addEventListener('resize', this.recalculateWidth);
    }
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener('resize', this.recalculateWidth);
    }
  }

  getDepth() {
    return this.props.editor.getState().document
      .getDepth(this.props.node.key);
  }

  handleClick(event, isExpanding) {
    event.preventDefault();
    const syncedState = this.props.editor.getState()
      .transform().collapseToStartOf(this.props.node)
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
        style={{
          display: `${isVisible ? 'block' : 'none'}`,
          width: this.state.width,
        }}
      >
        {hasChildren ? <span className="line" contentEditable={false} /> : null}
        {hasChildren ?
          <span
            className="collapse-expand-btn"
            contentEditable={false}
          >
            <i
              onClick={e => this.handleClick(e, !isExpanded)}
              className={`ion-${isExpanded ? 'minus' : 'plus'}-round`}
            />
          </span> : null
        }
        <span className="bullet" contentEditable={false}>•</span>
        <span className="entry-text">{this.props.children}</span>
      </div>
    );
  }
}

export default Entry;
