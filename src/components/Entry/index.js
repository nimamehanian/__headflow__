import React, { Component } from 'react';
import classnames from 'classnames';
import throttle from 'lodash/throttle';
import CollapseExpandButton from '../CollapseExpandButton';
// import listenOnce from '../../utils/listenOnce';

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
    this.getDepth = this.getDepth.bind(this);
    this.getWidth = throttle(() => {
      // Formula: xOffset = ((indentWidth * entryDepth) + sidebar + leftMargin + bulletToFirstChar)
      const xOffset = ((32 * this.getDepth()) + 240 + 4 + 16);
      // Formula: width = widthOfViewport - xOffset - rightMargin - rightPadding
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

    // const element = this.entry;
    // const deltaY = element.getBoundingClientRect().height;

    // if (isExpanding) {
      // element.style.display = 'block';
      // setTimeout(() => {
      //   console.log('MOVE HEIGHT TO:', deltaY);
      //   element.style.height = deltaY;
      //   element.style.maxHeight = deltaY;
      // }, 20);
      // this.setState({ deltaY });
    // } else {
      // element.style.height = 0;
      // element.style.maxHeight = 0;
      // listenOnce(element, 'transitionend', () => {
      //   element.style.display = 'none';
      // });
      // this.setState({ deltaY });
    // }

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
          // display: `${isVisible ? 'block' : 'none'}`,
          // maxHeight: 150,
          // height: 150,
          display: `${isVisible ? 'block' : 'none'}`,
          width: this.state.width,
        }}
        // ref={(entry) => { this.entry = entry; }}
      >
        {(hasChildren && isExpanded) ? <span className="line" contentEditable={false} /> : null}
        {hasChildren ?
          <CollapseExpandButton
            toggle={e => this.handleClick(e, !isExpanded)}
            isExpanded={isExpanded}
            contentEditable={false}
          /> : null
        }
        <span className="bullet" contentEditable={false} />
        <span className="entry-text">
          {this.props.children}
        </span>
      </div>
    );
  }
}

export default Entry;
