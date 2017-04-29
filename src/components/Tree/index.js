import React, { Component } from 'react';
import {
  Editor,
  Block,
  Raw,
  setKeyGenerator
} from 'slate';
import schema from './schema';
import keyGen from '../../utils/keyGen';

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
    {
      kind: 'block',
      type: 'entry',
      nodes: [
        {
          kind: 'text',
          text: 'Line 5:',
        },
      ],
    },
    {
      kind: 'block',
      type: 'entry',
      nodes: [
        {
          kind: 'text',
          text: 'Line 6:',
        },
      ],
    },
  ],
}, { terse: true });

class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: initialState,
      schema,
    };
    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);
    this.indent = this.indent.bind(this);
    this.outdent = this.outdent.bind(this);
    this.collapse = this.collapse.bind(this);
    this.expand = this.expand.bind(this);
  }

  componentDidMount() {
    this.editor.focus();
  }

  onChange(editorState) {
    this.setState({ editorState });
  }

  onKeyDown(event, data, state) {
    // ↵ = New block
    if (!data.isShift && !data.isMeta && data.key === 'enter') {
      event.preventDefault();
      return this.onEnter(state);
    }

    // ⇧⌘+↵ = Add note
    if (data.isShift && data.key === 'enter') {
      event.preventDefault();
      console.log('ADD NOTE');
      return state;
    }

    // ^⌘+↑ = Move block up
    if (data.isCtrl && data.isMeta && data.key === 'up') {
      event.preventDefault();
      return this.moveUp(state);
    }

    // ^⌘+↓ = Move block down
    if (data.isCtrl && data.isMeta && data.key === 'down') {
      event.preventDefault();
      return this.moveDown(state);
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

    // ⌘+↑ = Collapse
    if (!data.isShift && data.isMeta && data.key === 'up') {
      event.preventDefault();
      return this.collapse(state);
    }

    // ⌘+↓ = Expand
    if (!data.isShift && data.isMeta && data.key === 'down') {
      event.preventDefault();
      return this.expand(state);
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

  onEnter(state) {
    const { document: doc, startBlock: thisBlock } = state;
    // Create block as child, if thisBlock already has children
    if (
      thisBlock.nodes &&
      thisBlock.nodes.count() > 1 &&
      thisBlock.nodes.get(1).text.length
    ) {
      const newBlock = Block.create({ type: 'entry' });
      return state.transform().insertNodeByKey(
        thisBlock.key, 1, newBlock
      ).collapseToStartOf(newBlock).apply();
    }
    // Do not allow deletion of root block if it is empty
    if (!thisBlock.nodes.get(0).text.length && doc.nodes.count() === 1) {
      return state;
    }
    // Do not allow creation of multiple contiguous empty blocks
    if (!thisBlock.nodes.get(0).text.length) {
      // Do nothing
      // return state;
      // Or
      // Delete empty block
      return state.transform().removeNodeByKey(thisBlock.key).apply();
    }
    // Create block at same depth
    return state.transform().insertBlock(Block.create({ type: 'entry' })).apply();
  }

  moveUp(state) {
    const { document: doc, startBlock: thisBlock } = state;
    const parent = doc.getParent(thisBlock.key);
    const prevBlock = doc.getPreviousSibling(thisBlock.key);
    if (!prevBlock) {
      // console.log('Cannot move block up; already at top of list.');
      return state;
    }
    const parentList = doc.getParent(prevBlock.key);
    if (parent.nodes.get(1) === thisBlock && parentList !== doc) {
      // console.log('Cannot move block out of its context.');
      return state;
    }
    const index = parentList.nodes.indexOf(prevBlock);
    return state.transform().moveNodeByKey(
      thisBlock.key, parentList.key, index
    ).apply();
  }

  moveDown(state) {
    const { document: doc, startBlock: thisBlock } = state;
    const parent = doc.getParent(thisBlock.key);
    const nextBlock = doc.getNextSibling(thisBlock.key);

    if (parent.nodes.last() === thisBlock) {
      // console.log('Cannot move block out of its context.');
      return state;
    }

    const index = parent.nodes.indexOf(nextBlock);
    return state.transform().moveNodeByKey(
      thisBlock.key, parent.key, index
    ).apply();
  }

  indent(state) {
    const { document: doc, startBlock: thisBlock } = state;
    const prevBlock = doc.getPreviousSibling(thisBlock.key);
    if (!prevBlock) {
      // console.log('The root block cannot be indented or outdented.');
      return state;
    }
    const ensuingIndex = prevBlock.nodes ? prevBlock.nodes.count() : 0;
    return ensuingIndex ? state.transform().moveNodeByKey(
      thisBlock.key, prevBlock.key, ensuingIndex
    ).apply() : state;
  }

  outdent(state) {
    const { document: doc, startBlock: thisBlock } = state;
    const parent = doc.getParent(thisBlock.key);
    const parentList = doc.getParent(parent.key);
    if (!parentList) {
      // console.log('The root block cannot be indented or outdented.');
      return state;
    }
    const index = parentList.nodes.indexOf(parent) + 1;
    return state.transform().moveNodeByKey(
      thisBlock.key, parentList.key, index
    ).apply();
  }

  collapse(state) {
    console.log('COLLAPSE');
    return state;
  }

  expand(state) {
    console.log('EXPAND');
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
            ref={(editor) => { this.editor = editor; }}
          />
        </div>
      </div>
    );
  }
}

export default Tree;
