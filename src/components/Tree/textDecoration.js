import React from 'react';

export const Embolden = props =>
  <span className="embolden">{props.children}</span>;

export const Italicize = props =>
  <span className="italicize">{props.children}</span>;

export const Underline = props =>
  <span className="underline">{props.children}</span>;

export const Strikethrough = props =>
  <span className="strikethrough">{props.children}</span>;

export const Fade = props =>
  <span className="fade">{props.children}</span>;

export const Code = props => (
  <div className="entry" {...props.attributes}>
    <code>{props.children}</code>
  </div>
);
