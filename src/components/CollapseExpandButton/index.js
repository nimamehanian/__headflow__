import React from 'react';
import { Motion, spring } from 'react-motion';

const CollapseExpandButton = ({ toggle, isExpanded, behavior }) => (
  <div onClick={toggle}>
    <div className="collapse-expand-btn">
      <Motion style={{ rotate: spring(isExpanded ? 90 : 0, behavior) }}>
        {({ rotate }) => (
          <div
            className="arrow"
            style={{ transform: `rotate(${rotate}deg)` }}
            contentEditable={false}
          />
        )}
      </Motion>
    </div>
  </div>
);

export default CollapseExpandButton;