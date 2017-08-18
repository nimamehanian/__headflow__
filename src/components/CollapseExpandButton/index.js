import React from 'react';
import { Motion, spring } from 'react-motion';

const CollapseExpandButton = ({ toggle, isExpanded }) => (
  <div
    onClick={toggle}
    contentEditable={false}
  >
    <div className="collapse-expand-btn">
      <Motion style={{ rotate: spring(isExpanded ? 90 : 0, { stiffness: 300, damping: 24 }) }}>
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
