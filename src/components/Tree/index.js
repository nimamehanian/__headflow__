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
    this.getParentKey = this.getParentKey.bind(this);
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

  getParentKey(contentBlock) {
    const currentContent = this.props.editorState.getCurrentContent();
    const blockMap = currentContent.getBlockMap();
    const depth = contentBlock.getDepth();
    const key = contentBlock.getKey();
    const parent = blockMap
      .reverse()
      .skipWhile(block => block.getKey() !== key)
      .skipUntil(block => block.getDepth() === depth - 1)
      .take(1);
    return parent.first() ? parent.first().getKey() : '';
  }

  keyBindingFn(e) {
    // Move up
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

    // Move down
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

    // Collapse
    if (hasCommandModifier(e) && !e.shiftKey && e.which === 38) {
      e.preventDefault();
      const currentContent = this.props.editorState.getCurrentContent();
      const blockMap = currentContent.getBlockMap();
      const currentBlockKey = this.props.editorState.getSelection().getAnchorKey();
      const currentBlock = blockMap.filter(block => block.getKey() === currentBlockKey).first();
      this.toggleExpand(currentBlock, 'COLLAPSE');
    }

    // Expand
    if (hasCommandModifier(e) && !e.shiftKey && e.which === 40) {
      e.preventDefault();
      const currentContent = this.props.editorState.getCurrentContent();
      const blockMap = currentContent.getBlockMap();
      const currentBlockKey = this.props.editorState.getSelection().getAnchorKey();
      const currentBlock = blockMap.filter(block => block.getKey() === currentBlockKey).first();
      // Prevents expansion of already-expanded parent from expanding children nodes
      if (!currentBlock.getData().get('isExpanded')) {
        this.toggleExpand(currentBlock, 'EXPAND');
      }
    }

    // Enter note
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

  presavePrep() {
    const blockMap = this.props.editorState.getCurrentContent().getBlockMap();
    const updatedBlockMap = blockMap.map(block =>
      new ContentBlock({
        characterList: block.getCharacterList(),
        key: block.getKey(),
        text: block.getText(),
        type: block.getType(),
        depth: block.getDepth(),
        data: block.getData()
          .set('isExpanded', block.getData().has('isExpanded') ?
            block.getData().get('isExpanded') : true
          )
          .set('isVisible', block.getData().has('isVisible') ?
            block.getData().get('isVisible') : true
          )
          .set('note', block.getData().has('note') ?
            block.getData().get('note') : ''
          )
          .set('parentKey', this.getParentKey(block)),
      })
    );

    this.handleChange(
      EditorState.push(
        this.props.editorState,
        ContentState
          .createFromBlockArray(updatedBlockMap.toArray())
          .set('selectionAfter', this.props.editorState.getSelection()),
        'change-block-data'
      )
    );
  }

  syncWithDataStore() {
    this.presavePrep();
    this.props.save(
      convertToRaw(this.props.editorState.getCurrentContent())
    );
  }

  toggleExpand(contentBlock, behavior) {
    const currentContent = this.props.editorState.getCurrentContent();
    const blockMap = currentContent.getBlockMap();
    const index = blockMap.toList().indexOf(contentBlock);
    const depth = contentBlock.getDepth();

    const interactionType = () => {
      switch (behavior) {
        case 'EXPAND':
          return true;
        case 'COLLAPSE':
          return false;
        case 'TOGGLE':
          return !contentBlock.getData().get('isExpanded');
        default:
          return true;
      }
    };

    const toggledBlock = new ContentBlock({
      characterList: contentBlock.getCharacterList(),
      key: contentBlock.getKey(),
      text: contentBlock.getText(),
      type: contentBlock.getType(),
      depth: contentBlock.getDepth(),
      data: contentBlock.getData().set('isExpanded', interactionType()),
    });

    const children = blockMap
      .skipWhile(block => blockMap.toList().indexOf(block) <= index)
      .takeWhile(block => block.getDepth() > depth)
      .filter((block, key, list) => {
        if (behavior === 'COLLAPSE') { return true; }
        console.log(key);
        // if (!block.getData().get('isExpanded')) {
        //   lastCollapsedParent = block;
        // }
        //
        // if (lastCollapsedParent && block.getDepth() > lastCollapsedParent.getDepth()) {
        //   return false;
        // }

        return block.getDepth() === depth + 1 ||
          (block.getData().get('parentKey').length &&
            currentContent
              .getBlockForKey(block.getData().get('parentKey'))
              .getData().get('isExpanded')
          )
        ;
      })
      .map(block =>
        new ContentBlock({
          characterList: block.getCharacterList(),
          key: block.getKey(),
          text: block.getText(),
          type: block.getType(),
          depth: block.getDepth(),
          data: block.getData().set('isVisible', interactionType()),
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
    this.getParentKey(contentBlock);
    const depthOfCurrentBlock = contentBlock.getDepth();
    let depthOfNextBlock = -1;

    if (this.props.editorState.getCurrentContent().getBlockAfter(contentBlock.getKey())) {
      depthOfNextBlock = this.props.editorState
        .getCurrentContent()
        .getBlockAfter(contentBlock.getKey())
        .getDepth();
    }

    const hasChildren = depthOfCurrentBlock < depthOfNextBlock;
    const isExpanded = contentBlock.getData().get('isExpanded', true);
    const isVisible = contentBlock.getData().get('isVisible', true);
    const note = contentBlock.getData().get('note');
    const toggleExpand = () => this.toggleExpand(contentBlock, 'TOGGLE');

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
