import React, { Component, PropTypes } from 'react';
import { EditorBlock } from 'draft-js';
import classnames from 'classnames';

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
  }

  // TODO pull conditionals into a method call

  componentDidMount() {
    if (!this.props.blockProps.isVisible) {
      this.entry.parentNode.parentNode.style.listStyleType = 'none';
    } else {
      this.entry.parentNode.parentNode.style.listStyleType = 'disc';
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.blockProps.isVisible) {
      this.entry.parentNode.parentNode.style.listStyleType = 'none';
    } else {
      this.entry.parentNode.parentNode.style.listStyleType = 'disc';
    }
  }

  handleClick() {
    this.props.blockProps.toggleExpand();
    if (!this.props.blockProps.isVisible) {
      this.entry.parentNode.parentNode.style.listStyleType = 'none';
    } else {
      this.entry.parentNode.parentNode.style.listStyleType = 'disc';
    }
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
                this.props.blockProps.hasChildren && this.props.blockProps.isExpanded ?
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
    hasChildren: PropTypes.bool.isRequired,
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
