import {
  Embolden,
  Italicize,
  Underline,
  Strikethrough,
  Fade,
  Code
} from './textDecoration';
import Entry from '../Entry';

const schema = {
  marks: {
    Embolden,
    Italicize,
    Underline,
    Strikethrough,
    Fade,
  },
  nodes: {
    code: Code,
    entry: Entry,
  },
};

export default schema;
