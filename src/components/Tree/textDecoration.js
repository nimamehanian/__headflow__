import React from 'react';

export const Embolden = props =>
  <span className="embolden">{props.children}</span>;

export const Italicize = props =>
  <span className="italicize">{props.children}</span>;

export const Underline = props =>
  <span className="underline">{props.children}</span>;

export const Strikethrough = props =>
  <span className="strikethrough">{props.children}</span>;

export const Code = props =>
  <div className="entry" {...props.attributes}>
    <span className="bullet" contentEditable={false}>•</span>
    <code>{props.children}</code>
  </div>;