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

  checkVisibility(nextProps) {
    if ((nextProps && !nextProps.blockProps.isVisible) ||
      !this.props.blockProps.isVisible
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
    const entryClasses = classnames({
      entry: true,
      hide: !this.props.blockProps.isVisible,
    });

    return (
      <div className={entryClasses}>
        {
          this.props.blockProps.hasChildren ?
            <span
              className="collapse-expand-btn"
              onClick={this.handleClick}
              contentEditable={false}
            >
              {
                this.props.blockProps.hasChildren &&
                this.props.blockProps.isExpanded ?
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
    hasChildren: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number,
    ]).isRequired,
    isExpanded: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool.isRequired,
    note: PropTypes.string,
    toggleExpand: PropTypes.func,
  }).isRequired,
};

export default Entry;

/* <div className="note" contentEditable={false}>
  {this.props.blockProps.note}
</div> */
