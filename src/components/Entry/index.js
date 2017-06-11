import React, { Component } from 'react';
import classnames from 'classnames';
import throttle from 'lodash/throttle';

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
    this.getDepth = this.getDepth.bind(this);
    this.getWidth = throttle(() => {
      // xOffset = ((indentWidth * entryDepth) + sidebar + leftMargin + fromBulletToFirstChar)
      const xOffset = ((32 * this.getDepth()) + 240 + 4 + 16);
      // widthOfViewport - xOffset - rightMargin - rightPadding
      const width = window.innerWidth - xOffset - 4 - 8;
      this.setState({ width });
    }, 250);
  }

  componentDidMount() {
    this.getWidth();
    if (window) {
      window.addEventListener('resize', this.getWidth);
    }
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener('resize', this.getWidth);
    }
  }

  getDepth() {
    return this.props.editor.getState().document
      .getDepth(this.props.node.key);
  }

  handleClick(event, isExpanding) {
    event.preventDefault();
    event.stopPropagation();
    const syncedState = this.props.editor.getState()
      .transform().collapseToStartOf(this.props.node.nodes.get(0))
      .blur()
      .apply();
    const thisBlock = syncedState.startBlock;
    if (syncedState.selection.isAtStartOf(thisBlock)) {
      this.props.editor.onChange(
        thisBlock.nodes.rest().reduce((tr, node) =>
          tr.setNodeByKey(node.key, { data: {
            ...node.data.toJS(),
            isVisible: isExpanding,
          } })
        , syncedState.transform())
        .setNodeByKey(thisBlock.key, { data: {
          ...thisBlock.data.toJS(),
          isExpanded: isExpanding,
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
        {(hasChildren && isExpanded) ? <span className="line" contentEditable={false} /> : null}
        {hasChildren ?
          <span
            onClick={e => this.handleClick(e, !isExpanded)}
            className="collapse-expand-btn"
            contentEditable={false}
          >
            <i
              className={`ion-ios-${isExpanded ? 'minus' : 'plus'}-empty`}
              contentEditable={false}
            />
          </span> : null
        }
        <span className="bullet" contentEditable={false} />
        <span
          className="entry-text"
        >
          {this.props.children}
        </span>
      </div>
    );
  }
}

export default Entry;
