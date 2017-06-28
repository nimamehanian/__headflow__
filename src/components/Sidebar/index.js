import React, { Component } from 'react';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.selectContext = this.selectContext.bind(this);
  }

  selectContext(idx) {
    this.props.selectContext(this.props.userId, idx);
  }

  render() {
    return (
      <div className="sidebar">
        <span
          className="selected-context"
          style={{
            transform: `translateY(${this.props.currentContext * 26}px)`,
            transition: 'transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
            willChange: 'transform',
          }}
        />
        <ul className="contexts">
          {
            this.props.contexts
            .map((entry, idx) => (
              <li
                style={{
                  color: `rgba(73, 78, 107, ${idx === this.props.currentContext ? 1 : 0.6})`,
                }}
                onClick={() => this.selectContext(idx)}
                key={`cntxt_${idx + 1}`}
              >{entry}</li>
            ))
          }
        </ul>
      </div>
    );
  }
}

export default Sidebar;
