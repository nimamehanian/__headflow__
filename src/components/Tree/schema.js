// import React from 'react';
import {
  Embolden,
  Italicize,
  Underline,
  Strikethrough,
  Code
} from './textDecoration';
import Entry from '../Entry';

const schema = {
  marks: {
    Embolden,
    Italicize,
    Underline,
    Strikethrough,
  },
  nodes: {
    code: Code,
    entry: Entry,
  },
};

export default schema;
