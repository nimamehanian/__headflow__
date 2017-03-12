import React, { Component, PropTypes } from 'react';
import { Map, OrderedMap } from 'immutable';
import debounce from 'lodash/debounce';
import {
  Editor,
  EditorState,
  ContentBlock,
  ContentState,
  DefaultDraftBlockRenderMap,
  KeyBindingUtil,
  RichUtils,
  convertToRaw,
  getDefaultKeyBinding
} from 'draft-js';
import Entry from '../Entry';

const {
  hasCommandModifier,
} = KeyBindingUtil;

class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.keyBindingFn = this.keyBindingFn.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleTab = this.handleTab.bind(this);
    this.handleKeyDown = debounce(this.syncWithDataStore, 3000, { leading: false });
    this.syncWithDataStore = this.syncWithDataStore.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
    this.entryRenderer = this.entryRenderer.bind(this);
  }

  componentDidMount() {
    this.handleChange(
      RichUtils.toggleBlockType(
        this.props.editorState,
        'unordered-list-item'
      )
    );
    // this.editor.focus();
  }

  keyBindingFn(e) {
    // TODO Do not allow children to move out of their group
    if (hasCommandModifier(e) && e.shiftKey && e.which === 38) {
      e.preventDefault();
      const currentContent = this.props.editorState.getCurrentContent();
      const blockMap = currentContent.getBlockMap();
      const currentBlockKey = this.props.editorState.getSelection().getAnchorKey();
      const currentBlock = blockMap.filter(block => block.getKey() === currentBlockKey);
      const currentBlockDepth = currentBlock.first().getDepth();
      const currentBlockIndex = blockMap.toList().indexOf(currentBlock.first());
      const currentBlockChildren = blockMap
        .skipWhile(block => blockMap.toList().indexOf(block) <= currentBlockIndex)
        .takeWhile(block => block.getDepth() > currentBlockDepth);

      const prevBlock = blockMap
        .toList()
        .filter(block => block.getDepth() === currentBlockDepth)
        .filter((block, idx, list) =>
          list.get(idx + 1) && list.get(idx + 1).getKey() === currentBlockKey
        )
        .toOrderedMap();

      const prevBlockDepth = prevBlock.count() ? prevBlock.first().getDepth() : -1;
      const prevBlockIndex = blockMap.toList().indexOf(prevBlock.first());
      const prevBlockKey = prevBlock.count() ? prevBlock.first().getKey() : '';
      const prevBlockChildren = blockMap
        .skipWhile(block => blockMap.toList().indexOf(block) <= prevBlockIndex)
        .takeWhile(block => block.getDepth() > prevBlockDepth);

      const leadingBlocks = prevBlock.count() ?
        blockMap
          .takeWhile(block => block.getKey() !== prevBlockKey)
          .delete(prevBlockKey) :
        OrderedMap();

      const trailingBlocks = blockMap
        .skipWhile(block =>
          leadingBlocks.concat(
            currentBlock,
            currentBlockChildren,
            prevBlock,
            prevBlockChildren
          ).has(block.getKey())
        );

      const updatedBlockMap = leadingBlocks
        .concat(currentBlock, currentBlockChildren, prevBlock, prevBlockChildren, trailingBlocks)
        .toArray();

      this.handleChange(
        EditorState.push(
          this.props.editorState,
          ContentState
          .createFromBlockArray(updatedBlockMap)
          .set('selectionAfter', this.props.editorState.getSelection()),
          'move-block'
        )
      );
    }

    if (hasCommandModifier(e) && e.shiftKey && e.which === 40) {
      e.preventDefault();
      const currentContent = this.props.editorState.getCurrentContent();
      const blockMap = currentContent.getBlockMap();
      const firstBlockKey = currentContent.getFirstBlock().getKey();
      const currentBlockKey = this.props.editorState.getSelection().getAnchorKey();
      const currentBlock = blockMap.filter(block => block.getKey() === currentBlockKey);
      const currentBlockDepth = currentBlock.first().getDepth();
      const currentBlockIndex = blockMap.toList().indexOf(currentBlock.first());
      const currentBlockChildren = blockMap
        .skipWhile(block => blockMap.toList().indexOf(block) <= currentBlockIndex)
        .takeWhile(block => block.getDepth() > currentBlockDepth);

      const nextBlock = blockMap
        .toList()
        .filter(block => block.getDepth() === currentBlockDepth)
        .filter((block, idx, list) =>
          list.get(idx - 1) && list.get(idx - 1).getKey() === currentBlockKey
        )
        // Prevent last block from being moved to top position
        .filter(block => block.getKey() !== firstBlockKey)
        .toOrderedMap();

      const nextBlockDepth = nextBlock.count() ? nextBlock.first().getDepth() : -1;
      const nextBlockIndex = blockMap.toList().indexOf(nextBlock.first());
      const nextBlockChildren = blockMap
        .skipWhile(block => blockMap.toList().indexOf(block) <= nextBlockIndex)
        .takeWhile(block => block.getDepth() > nextBlockDepth);

      const leadingBlocks = blockMap
          .takeWhile(block => block.getKey() !== currentBlockKey)
          .delete(currentBlockKey);

      const trailingBlocks = blockMap
        .skipWhile(block =>
          leadingBlocks.concat(
            nextBlock,
            nextBlockChildren,
            currentBlock,
            currentBlockChildren
          ).has(block.getKey())
        );

      const updatedBlockMap = leadingBlocks
        .concat(nextBlock, nextBlockChildren, currentBlock, currentBlockChildren, trailingBlocks)
        .toArray();

      this.handleChange(
        EditorState.push(
          this.props.editorState,
          ContentState
            .createFromBlockArray(updatedBlockMap)
            .set('selectionAfter', this.props.editorState.getSelection()),
          'move-block'
        )
      );
    }

    if (hasCommandModifier(e) && !e.shiftKey && e.which === 38) {
      e.preventDefault();
      // const currentContent = this.props.editorState.getCurrentContent();
      // const blockMap = currentContent.getBlockMap();
      // const currentBlockKey = this.props.editorState.getSelection().getAnchorKey();
      // const currentBlock = blockMap.filter(block => block.getKey() === currentBlockKey).first();
      // this.toggleExpand(currentBlock, 'collapse');
    }

    if (hasCommandModifier(e) && !e.shiftKey && e.which === 40) {
      e.preventDefault();
      // const currentContent = this.props.editorState.getCurrentContent();
      // const blockMap = currentContent.getBlockMap();
      // const currentBlockKey = this.props.editorState.getSelection().getAnchorKey();
      // const currentBlock = blockMap.filter(block => block.getKey() === currentBlockKey).first();
      // this.toggleExpand(currentBlock, 'expand');
    }

    if (hasCommandModifier(e) && !e.shiftKey && e.which === 13) {
      e.preventDefault();
      console.log('toggle-note-field');
      return 'toggle-note-field';
    }

    return getDefaultKeyBinding(e);
  }

  handleKeyCommand(command) {
    switch (command) {
      case 'toggle-note-field':
        return 'handled';
      default:
        return 'not-handled';
    }
  }

  handleChange(editorState) {
    this.props.update(editorState);
  }

  handleTab(event) {
    this.handleChange(
      RichUtils.onTab(event, this.props.editorState, 4)
    );
  }

  syncWithDataStore() {
    this.props.save(
      convertToRaw(this.props.editorState.getCurrentContent())
    );
  }

  toggleExpand(contentBlock) {
    const blockMap = this.props.editorState.getCurrentContent().getBlockMap();
    const index = blockMap.toList().indexOf(contentBlock);
    const depth = contentBlock.getDepth();

    const toggledBlock = new ContentBlock({
      characterList: contentBlock.getCharacterList(),
      key: contentBlock.getKey(),
      text: contentBlock.getText(),
      type: contentBlock.getType(),
      depth: contentBlock.getDepth(),
      data: contentBlock.getData().set('isExpanded', !contentBlock.getData().get('isExpanded', true)),
    });

    const children = blockMap
      .skipWhile(block => blockMap.toList().indexOf(block) <= index)
      .takeWhile(block => block.getDepth() > depth)
      .map(block =>
        new ContentBlock({
          characterList: block.getCharacterList(),
          key: block.getKey(),
          text: block.getText(),
          type: block.getType(),
          depth: block.getDepth(),
          data: block.getData().set('isVisible', !contentBlock.getData().get('isExpanded', true)),
        })
      );

    const updatedBlockMap = blockMap
      .set(toggledBlock.getKey(), toggledBlock)
      .merge(children);

    this.handleChange(
      EditorState.push(
        this.props.editorState,
        ContentState
          .createFromBlockArray(updatedBlockMap.toArray())
          .set('selectionAfter', this.props.editorState.getSelection()),
        'change-block-data'
      )
    );

    setTimeout(this.syncWithDataStore, 0);
  }

  entryRenderer(contentBlock) {
    const depthOfCurrentBlock = contentBlock.getDepth();
    let depthOfNextBlock = -1;

    if (this.props.editorState.getCurrentContent().getBlockAfter(contentBlock.getKey())) {
      depthOfNextBlock = this.props.editorState
        .getCurrentContent()
        .getBlockAfter(contentBlock.getKey())
        .getDepth();
    }

    if (!contentBlock.getData().has('isExpanded')) {
      contentBlock.getData().set('isExpanded', true);
    }

    if (!contentBlock.getData().has('isVisible')) {
      contentBlock.getData().set('isVisible', true);
    }

    if (!contentBlock.getData().has('note')) {
      contentBlock.getData().set('note', '');
    }

    const hasChildren = depthOfCurrentBlock < depthOfNextBlock;
    const isExpanded = contentBlock.getData().get('isExpanded', true);
    const isVisible = contentBlock.getData().get('isVisible', true);
    const note = contentBlock.getData().get('note');
    const toggleExpand = () => this.toggleExpand(contentBlock);

    return {
      component: Entry,
      editable: true,
      // passed to Entry——available on props.blockProps
      props: {
        hasChildren,
        isExpanded,
        isVisible,
        note,
        toggleExpand,
      },
    };
  }

  render() {
    return (
      <div className="tree" onKeyDown={e => this.handleKeyDown(e)}>
        <Editor
          editorState={this.props.editorState}
          onUpArrow={this.keyBindingFn}
          onDownArrow={this.keyBindingFn}
          keyBindingFn={this.keyBindingFn}
          handleKeyCommand={this.handleKeyCommand}
          blockRendererFn={this.entryRenderer}
          blockRenderMap={DefaultDraftBlockRenderMap.merge(Map({
            unstyled: { element: 'div' },
          }))}
          onChange={this.handleChange}
          onTab={this.handleTab}
          ref={(editor) => { this.editor = editor; }}
        />
      </div>
    );
  }
}

Tree.propTypes = {
  save: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  editorState: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Tree;
