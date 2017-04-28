import React, { Component, PropTypes } from 'react';
import { EditorBlock } from 'draft-js';
import classnames from 'classnames';

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkVisibility = this.checkVisibility.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.checkVisibility();
  }

  componentWillReceiveProps(nextProps) {
    this.checkVisibility(nextProps);
  }

  // shouldComponentUpdate(nextProps) {
  //   return (
  //     nextProps.block.getText() !== this.props.block.getText() ||
  //     nextProps.block.getDepth() !== this.props.block.getDepth()
  //     // nextProps.blockProps.hasChildren !== this.props.blockProps.hasChildren ||
  //     // nextProps.blockProps.isExpanded !== this.props.blockProps.isExpanded ||
  //     // nextProps.blockProps.isVisible !== this.props.blockProps.isVisible ||
  //     // nextProps.blockProps.note !== this.props.blockProps.note
  //   );
  // }

  checkVisibility(nextProps) {
    if ((nextProps && !nextProps.block.getData().get('isVisible', true)) ||
      !this.props.block.getData().get('isVisible', true)
    ) {
      this.entry.parentNode.parentNode.style.listStyleType = 'none';
    } else {
      this.entry.parentNode.parentNode.style.listStyleType = 'disc';
    }
  }

  handleClick() {
    this.props.blockProps.toggleExpand();
    this.checkVisibility();
  }

  render() {
    const blockData = this.props.block.getData();
    const entryClasses = classnames({
      entry: true,
      hide: !blockData.get('isVisible'),
    });

    return (
      <div className={entryClasses}>
        {
          blockData.get('hasChildren') ?
            <span
              className="collapse-expand-btn"
              onClick={this.handleClick}
              contentEditable={false}
            >
              {
                blockData.get('hasChildren') &&
                blockData.get('isExpanded') ?
                  <i className="ion-android-remove" /> :
                  <i className="ion-android-add" />
              }
            </span> :
            null
        }
        <span ref={(entry) => { this.entry = entry; }}>
          <EditorBlock {...this.props} />
        </span>
      </div>
    );
  }
}

Entry.propTypes = {
  blockProps: PropTypes.shape({
    // hasChildren: PropTypes.oneOfType([
    //   PropTypes.bool,
    //   PropTypes.number,
    // ]).isRequired,
    // isExpanded: PropTypes.bool.isRequired,
    // isVisible: PropTypes.bool.isRequired,
    // note: PropTypes.string,
    // contentBlock: PropTypes.object,
    toggleExpand: PropTypes.func,
    // lineNumber: PropTypes.number,
    // lineNumberOffset: PropTypes.number,
  }).isRequired,
};

export default Entry;

/* <div className="note" contentEditable={false}>
  {this.props.blockProps.note}
</div> */
