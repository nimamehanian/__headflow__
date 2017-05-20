import React, { Component } from 'react';
import deepEqual from 'deep-equal';
import debounce from 'lodash/debounce';
import {
  Editor,
  Block,
  Raw,
  setKeyGenerator
} from 'slate';
import schema from './schema';
import keyGen from '../../utils/keyGen';

setKeyGenerator(keyGen);

class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkWhetherDataChanged = debounce((existingState, incomingState) => {
      const areStatesEqual = deepEqual(existingState, incomingState);
      // Save only when data in editorState changes
      if (!areStatesEqual) {
        this.syncWithDataStore(incomingState);
      }
    }, 2000);
    this.syncWithDataStore = this.syncWithDataStore.bind(this);
    this.createBlock = this.createBlock.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);
    this.indent = this.indent.bind(this);
    this.outdent = this.outdent.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
  }

  // componentDidMount() {
  //   this.editor.focus();
  // }

  onChange(editorState) {
    this.props.update(editorState);
    const existingState = Raw.serialize(this.props.editorState, { terse: true });
    const incomingState = Raw.serialize(editorState, { terse: true });
    this.checkWhetherDataChanged(existingState, incomingState);
  }

  onKeyDown(event, data, state) {
    // ↵ = New block
    if (!data.isShift && !data.isMeta && data.key === 'enter') {
      event.preventDefault();
      return this.onEnter(state);
    }

    // ⇧+↵ = Add note
    if (data.isShift && !data.isMeta && data.key === 'enter') {
      event.preventDefault();
      console.log('ADD NOTE');
      return state.transform().apply();
    }

    // ⇧⌘+↵ = NOT_DESIGNATED
    if (data.isShift && data.isMeta && data.key === 'enter') {
      event.preventDefault();
      console.log('⇧⌘+↵ = NOT_DESIGNATED');
      return state.transform().apply();
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
      return this.toggleExpand(state, false);
    }

    // ⌘+↓ = Expand
    if (!data.isShift && data.isMeta && data.key === 'down') {
      event.preventDefault();
      return this.toggleExpand(state, true);
    }

    // ⌘+S = Nullify save
    if (data.isMeta && data.key === 's') {
      event.preventDefault();
      return state;
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
    if (!data.isShift && data.isMeta && data.key === 'enter') {
      event.preventDefault();
      const markType = 'Strikethrough';
      const transform = state.transform();
      const key = state.startText.key;
      const length = state.startText.length;
      if (!length) { return state; }
      const isStriked = state.startText.characters
        .first().get('marks').map(mark => mark.get('type')).contains(markType);

      // const fadeChildren = (xform, nodes) => {
      //   const transformation = nodes.reduce((tr, child) => {
      //     return child.kind === 'text' ?
      //       xform.addMarkByKey(child.key, 0, child.length, 'Fade') :
      //       fadeChildren(xform, child.nodes);
      //   }, xform);
      //   return nodes ? fadeChildren(transformation, nodes) : transformation;
      // };

      return isStriked ?
        transform.removeMarkByKey(key, 0, length, markType).apply() :
        transform
          .addMarkByKey(key, 0, length, markType)
          // .call(fadeChildren, state.startBlock.nodes)
          .collapseToEndOf(state.document.getNextText(key))
          .apply();
    }

    // ⌘+K = Toggle monospace
    if (data.isMeta && data.key === 'k') {
      event.preventDefault();
      const isCode = state.blocks.some(b => b.type === 'code');
      return state.transform().setBlock(isCode ? 'entry' : 'code').apply();
    }

    // ⌘+⌫ = Delete line
    // if (data.isMeta && data.key === 'backspace') {
    //   // const { selection } = state;
    //   console.log('DELETE_LINE');
    //   const firstNode = state.document.nodes.get(0).nodes.get(0);
    //   // TODO #throwawayCode
    //   if (state.startText === firstNode) {
    //     console.log('Cannot delete root block');
    //     return state;
    //   }
    //   event.preventDefault();
    //   const charsToLeft = state.selection.startOffset;
    //   const yolo = state.transform()
    //     .deleteBackward(charsToLeft)
    //     // .collapseToEndOfPreviousBlock()
    //     // .collapseToEndOfNextBlock()
    //     // .collapseToEnd()
    //     // .insertText('🥑')
    //     // Of(state.startText)
    //     .apply();
    //   // console.log(yolo);
    //   return yolo;
    // }

    // ⌘+A ⌫ = Delete all
    if (
      data.key === 'backspace' &&
      state.selection.hasEdgeAtStartOf(state.document) &&
      state.selection.hasEdgeAtEndOf(state.document)
    ) {
      console.log('Phew! We doubt you meant to delete the whole document.');
      return state;
    }

    // ⌫ = Delete one character
    if (!data.isMeta && data.key === 'backspace') {
      event.preventDefault();
      const { document: doc, startBlock: thisBlock, selection } = state;
      const parent = doc.getParent(thisBlock.key);
      const cursorAtStart = selection.isAtStartOf(thisBlock.nodes.get(0));
      const hasText = thisBlock.nodes.get(0).text.length;
      const isFirstChild = parent.nodes.get(1) === thisBlock;
      const prevBlock = doc.getPreviousSibling(thisBlock.key);
      const prevBlockHasChildren = prevBlock &&
        prevBlock.kind === 'block' && prevBlock.nodes.count() > 1;
      if (cursorAtStart && hasText &&
        (isFirstChild || prevBlockHasChildren)
      ) { return state; }
    }

    return null;
  }

  onEnter(state) {
    const { selection, startBlock: thisBlock } = state;
    const { nodes } = thisBlock;
    const hasChildren = nodes && nodes.count() > 1;
    const cursorAtEnd = selection.isAtEndOf(nodes.get(0));

    // If cursor is NOT at EOL, split block normally
    if (!cursorAtEnd) {
      return state.transform().splitBlock().apply();
    }

    // If block is collapsed, and cursor is at EOL, create block as sibling
    if (cursorAtEnd && hasChildren && !thisBlock.data.get('isExpanded')) {
      return this.createBlock(state);
    }

    // if block is expanded, and cursor is at EOL, create block as child
    if (cursorAtEnd && hasChildren && thisBlock.data.get('isExpanded')) {
      return this.createBlock(state, true);
    }

    // Create block as sibling
    return this.createBlock(state);
  }

  createBlock(state, asChild) {
    const { document: doc, startBlock: thisBlock } = state;
    const newBlock = Block.create({ type: 'entry' });
    const parent = doc.getParent(thisBlock.key);
    const anchor = asChild ?
      { block: thisBlock, index: 1 } :
      { block: parent, index: parent.nodes.indexOf(thisBlock) + 1 };
    return state.transform()
    .insertNodeByKey(anchor.block.key, anchor.index, newBlock)
      .setNodeByKey(newBlock.key, { data: {
        isExpanded: true,
        isVisible: true,
      } })
      .collapseToEndOf(newBlock)
      .apply();
  }

  syncWithDataStore(state) {
    this.props.save(this.props.userId, state);
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
    if (!prevBlock.text) {
      // console.log('Cannot indent block when block above is empty.');
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

  toggleExpand(state, isExpanding) {
    const { startBlock: thisBlock } = state;
    return thisBlock.nodes.count() > 1 ?
      thisBlock.nodes.reduce((tr, node) => {
        if (node.kind === 'text') { return tr; }
        return tr.setNodeByKey(node.key, { data: {
          isExpanded: node.data.get('isExpanded'),
          isVisible: isExpanding,
        } });
      }, state.transform())
      .setNodeByKey(thisBlock.key, { data: {
        isExpanded: isExpanding,
        isVisible: thisBlock.data.get('isVisible'),
      } })
      .apply() : state;
  }

  render() {
    return (
      <div className="tree-container">
        <div className="tree">
          <Editor
            autoCorrect={false}
            spellCheck={false}
            state={this.props.editorState}
            schema={schema}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            ref={(editor) => { this.editor = editor; }}
            onFocus={() => this.props.toggleEditorFocus(true)}
            onBlur={() => this.props.toggleEditorFocus(false)}
          />
        </div>
      </div>
    );
  }
}

export default Tree;
