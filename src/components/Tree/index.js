import React, { Component } from 'react';
import {
  Editor,
  Raw,
  setKeyGenerator
} from 'slate';
import keyGen from '../../utils/keyGen';
import schema from './schema';

setKeyGenerator(keyGen);

const initialState = Raw.deserialize({
  nodes: [
    {
      kind: 'block',
      type: 'entry',
      nodes: [
        {
          kind: 'text',
          text: 'A line of text in a paragraph.',
        },
      ],
    },
    {
      kind: 'block',
      type: 'entry',
      nodes: [
        {
          kind: 'text',
          text: 'Rich kid asshole paint me as a villain',
        },
      ],
    },
    {
      kind: 'block',
      type: 'entry',
      nodes: [
        {
          kind: 'text',
          text: 'Line 3:',
        },
      ],
    },
    {
      kind: 'block',
      type: 'entry',
      nodes: [
        {
          kind: 'text',
          text: 'Line 4:',
        },
      ],
    },
  ],
}, { terse: true });

// COMPONENT
class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: initialState,
      schema,
    };
    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.indent = this.indent.bind(this);
    this.outdent = this.outdent.bind(this);
  }

  onChange(editorState) {
    this.setState({ editorState });
  }

  onKeyDown(event, data, state) {
    // ⇧⌘+↵ = Add note
    if (data.isShift && data.isMeta && data.key === 'enter') {
      event.preventDefault();
      console.log('ADD NOTE');
      return state;
    }

    // ^⌘+↑ = Move block up
    if (data.isCtrl && data.isMeta && data.key === 'up') {
      event.preventDefault();
      console.log('MOVE UP');
      return state;
    }

    // ^⌘+↓ = Move block down
    if (data.isCtrl && data.isMeta && data.key === 'down') {
      event.preventDefault();
      console.log('MOVE DOWN');
      return state;
    }

    // ↹ = Indent
    if (!data.isShift && data.key === 'tab') {
      event.preventDefault();
      return this.indent(state);
    }

    // ⇧+↹ = Outdent
    if (data.isShift && data.key === 'tab') {
      event.preventDefault();
      return this.outdent(state);
    }

    // ⌘+B = Toggle embolden
    if (data.isMeta && data.key === 'b') {
      event.preventDefault();
      return state.transform().toggleMark('Embolden').apply();
    }

    // ⌘+I = Toggle italicize
    if (data.isMeta && data.key === 'i') {
      event.preventDefault();
      return state.transform().toggleMark('Italicize').apply();
    }

    // ⌘+U = Toggle underline
    if (data.isMeta && data.key === 'u') {
      event.preventDefault();
      return state.transform().toggleMark('Underline').apply();
    }

    // ⌘+↵ = Toggle strikethrough (i.e., complete item)
    if (data.isMeta && data.key === 'enter') {
      event.preventDefault();
      const markType = 'Strikethrough';
      const transform = state.transform();
      const key = state.startText.key;
      const length = state.startText.length;
      const isStriked = state.startText.characters
        .first().get('marks')
        .map(mark => mark.get('type'))
        .contains('Strikethrough');

      return isStriked ?
        transform.removeMarkByKey(key, 0, length, markType).apply() :
        transform.addMarkByKey(key, 0, length, markType)
          .collapseToEndOfNextBlock().apply();
    }

    // ⌘+K = Toggle monospace
    if (data.isMeta && data.key === 'k') {
      event.preventDefault();
      const isCode = state.blocks.some(b => b.type === 'code');
      return state.transform().setBlock(isCode ? 'entry' : 'code').apply();
    }

    return null;
  }

  indent(state) {
    const { document: doc, startBlock: thisBlock } = state;
    const prevBlock = doc.getPreviousSibling(thisBlock.key);
    if (!prevBlock) {
      console.log('First block cannot be indented.');
      return state;
    }
    // Append thisBlock to prevBlock's `nodes` List
    const ensuingIndex = prevBlock.nodes ?
      prevBlock.nodes.count() : 0;
    return ensuingIndex ?
      state.transform().moveNodeByKey(
        thisBlock.key,
        prevBlock.key,
        ensuingIndex
      ).apply() :
      state;
  }

  outdent(state) {
    const { document: doc, startBlock: thisBlock } = state;
    const currentItem = doc.getParent(thisBlock.key);
    console.log(currentItem);
    return state;
  }

  render() {
    return (
      <div className="tree-container">
        <div className="tree">
          <Editor
            state={this.state.editorState}
            schema={this.state.schema}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
          />
        </div>
      </div>
    );
  }
}

// Tree.propTypes = {};

export default Tree;
