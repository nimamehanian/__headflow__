import React, { Component, PropTypes } from 'react';
import Perf from 'react-addons-perf';
import { List, Map, OrderedMap } from 'immutable';
import debounce from 'lodash/debounce';
import {
  Editor,
  EditorState,
  ContentBlock,
  ContentState,
  DefaultDraftBlockRenderMap,
  KeyBindingUtil,
  Modifier,
  RichUtils,
  convertToRaw,
  getDefaultKeyBinding,
  genKey
} from 'draft-js';
import Entry from '../Entry';

const { hasCommandModifier } = KeyBindingUtil;

class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.getParentKey = this.getParentKey.bind(this);
    this.getFirstChildKey = this.getFirstChildKey.bind(this);
    this.getLastChildKey = this.getLastChildKey.bind(this);
    this.keyBindingFn = this.keyBindingFn.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.handleReturn = this.handleReturn.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleTab = this.handleTab.bind(this);
    this.handleKeyDown = debounce(this.syncWithDataStore, 3000, { leading: false });
    this.syncWithDataStore = this.syncWithDataStore.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
    this.hasChildren = this.hasChildren.bind(this);
    this.entryRenderer = this.entryRenderer.bind(this);
  }

  componentDidMount() {
    // TODO Make this check somewhere else periodically too
    this.handleChange(
      RichUtils.toggleBlockType(
        this.props.editorState,
        'unordered-list-item'
      )
    );
  }

  // componentDidUpdate() {
  //   Perf.stop();
  //   Perf.printInclusive();
  //   Perf.printWasted();
  // }

  getParentKey(contentBlock) {
    const blockMap = this.props.editorState.getCurrentContent().getBlockMap();
    const depth = contentBlock.getDepth();
    const key = contentBlock.getKey();
    const parent = blockMap
      // Run through the entire block map, from bottom up
      .reverse()
      // Sift through the blocks until we arrive at the passed-in block
      .skipWhile(block => block.getKey() !== key)
      // Sift through its sibling blocks until we arrive at the first outdented block
      .skipUntil(block => block.getDepth() === depth - 1)
      // Take it
      .take(1);
      // It's possible for `skipUntil` to return an empty collection — if,
      // for example, contentBlock has a depth of 0 — so if it, indeed, has
      // one item in it, then return its key, otherwise return an empty string.
    return parent.first() ? parent.first().getKey() : '';
  }

  getFirstChildKey(parentBlock) {
    const blockMap = this.props.editorState.getCurrentContent().getBlockMap();
    const blockMapList = blockMap.toList();
    const index = blockMapList.indexOf(parentBlock);
    return blockMap
      .skipWhile(block => blockMapList.indexOf(block) <= index)
      .take(1)
      .first()
      .getKey();
  }

  getLastChildKey(parentBlock) {
    const blockMap = this.props.editorState.getCurrentContent().getBlockMap();
    const blockMapList = blockMap.toList();
    const index = blockMapList.indexOf(parentBlock);
    const depth = parentBlock.getDepth();
    return blockMap
      .skipWhile(block => blockMapList.indexOf(block) <= index)
      .takeWhile(block => block.getDepth() > depth)
      .filter(block => block.getDepth() === depth + 1)
      .last()
      .getKey();
  }

  keyBindingFn(e) {
    // handleReturn
    if (e.which === 13) {
      console.log('NEW BLOCK');
      const contentState = this.props.editorState.getCurrentContent();
      const startKey = contentState.getSelectionAfter().getStartKey();
      const newBlockKey = contentState.getBlockAfter(startKey).getKey();
      console.log(newBlockKey);
      // const key = selection.getAnchorKey();
      // const updatedContentState = Modifier.setBlockData(
      //   contentState,
      //   contentState.getSelectionAfter(),
      //   Map({
      //     // TODO Get hasChildren
      //     hasChildren: false,
      //     isExpanded: true,
      //     isVisible: true,
      //     note: '',
      //     // TODO Get parent key
      //     parentKey: '',
      //   })
      // );
      //
      // this.handleChange(
      //   EditorState.push(
      //     this.props.editorState,
      //     updatedContentState,
      //     'change-block-data'
      //   )
      // );
    }

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
        .concat(
          currentBlock,
          currentBlockChildren,
          prevBlock,
          prevBlockChildren,
          trailingBlocks
        );

      if (prevBlockDepth === currentBlockDepth) {
        this.handleChange(
          EditorState.push(
            this.props.editorState,
            ContentState
            .createFromBlockArray(updatedBlockMap.toArray())
            .set('selectionAfter', this.props.editorState.getSelection()),
            'move-block'
          )
        );
      }
    }

    // Move down
    if (hasCommandModifier(e) && e.shiftKey && e.which === 40) {
      e.preventDefault();
      const currentContent = this.props.editorState.getCurrentContent();
      const blockMap = currentContent.getBlockMap();
      const firstBlockKey = currentContent.getFirstBlock().getKey();
      const currentBlockKey = this.props.editorState.getSelection().getAnchorKey();
      const currentBlock = blockMap.filter(block => block.getKey() === currentBlockKey);
      const currentBlockData = currentBlock.first().getData();
      const currentBlockDepth = currentBlock.first().getDepth();
      const currentBlockIndex = blockMap.toList().indexOf(currentBlock.first());
      const currentBlockChildren = blockMap
        .skipWhile(block => blockMap.toList().indexOf(block) <= currentBlockIndex)
        .takeWhile(block => block.getDepth() > currentBlockDepth);

      const lastChildKey = currentBlockData.has('parentKey') && currentBlockData.get('parentKey').length ?
        this.getLastChildKey(
          currentContent.getBlockForKey(
            currentBlockData.get('parentKey')
          )
        ) :
        blockMap.filter(b => b.getDepth() === 0).last().getKey();

      const nextBlock = blockMap.toList()
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

      if (currentBlockKey !== lastChildKey) {
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
      console.log('TODO: toggle-note-field');
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

  handleReturn() {
    const contentState = this.props.editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();

    // Get block at cursor
    const selection = this.props.editorState.getSelection();
    const key = selection.getAnchorKey();
    const currentBlock = contentState.getBlockForKey(key);

    const leadingBlocks = blockMap.takeUntil(b => b === currentBlock);
    const trailingBlocks = blockMap.skipUntil(b => b === currentBlock).skip(1);

    // Make a new block and set its metadata
    const newBlock = new ContentBlock({
      characterList: List(),
      key: genKey(),
      text: '😊',
      type: 'unordered-list-item',
      // if currentBlock hasChildren, and isExpanded, and isVisible,
      // set depth here to be one greater than depth of currentBlock.
      // TODO Get depth
      depth: 0,

      data: Map({
        // TODO Get hasChildren
        hasChildren: false,
        isExpanded: true,
        isVisible: true,
        note: '',
        // TODO Get parent key
        parentKey: '',
      }),
    });

    // Insert new block after current cursor position in blockMap
    const updatedBlockMap = leadingBlocks.concat(
      [[newBlock.getKey(), newBlock]],
      trailingBlocks
    ).toOrderedMap();

    // Create updated contentState
    const updatedContentState = Modifier.splitBlock(
      contentState.merge({
        blockMap: updatedBlockMap,
        selectionBefore: contentState.getSelectionAfter(),
        selectionAfter: contentState.getSelectionAfter().merge({
          anchorKey: newBlock.getKey(),
          focusKey: newBlock.getKey(),
        }),
      }),
      this.props.editorState.getSelection()
    );

    this.handleChange(
      EditorState.push(
        this.props.editorState,
        updatedContentState,
        'move-block'
      )
    );

    // Notify Draft that `RETURN` keypress is overrided
    return 'handled';
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
    // TODO
    // Override handleReturn.
    // This function is stupid.
    // ContentBlock values need to be set as they're created.
    console.time('presavePrep');
    const currentContent = this.props.editorState.getCurrentContent();
    const blockMap = currentContent.getBlockMap();
    const updatedBlockMap = blockMap.map((block) => {
      const nextBlock = currentContent.getBlockAfter(block.getKey());
      return new ContentBlock({
        characterList: block.getCharacterList(),
        key: block.getKey(),
        text: block.getText(),
        type: block.getType(),
        depth: block.getDepth(),
        data: block.getData()
          // Set defaults if nonexistent:
          .set('isExpanded', block.getData().has('isExpanded') ?
            block.getData().get('isExpanded') : true
          )

          // True, if there is a next block and its depth is greater than current
          .set('hasChildren', !!(nextBlock && (nextBlock.getDepth() > block.getDepth())))

          // If block has no children, set `isExpanded` to true
          .set('isExpanded', !block.getData().get('hasChildren') ?
            true : block.getData().get('isExpanded')
          )

          .set('isVisible', block.getData().has('isVisible') ?
            block.getData().get('isVisible') : true
          )
          .set('note', block.getData().has('note') ?
            block.getData().get('note') : ''
          )
          .set('parentKey', this.getParentKey(block)),
      });
    });

    this.handleChange(
      EditorState.push(
        this.props.editorState,
        ContentState
          .createFromBlockArray(updatedBlockMap.toArray())
          .set('selectionAfter', this.props.editorState.getSelection()),
        'change-block-data'
      )
    );
    console.timeEnd('presavePrep');
  }

  syncWithDataStore() {
    // this.presavePrep();
    this.props.save(
      this.props.userId,
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

    let collapsedNode = { depth: -1, hasBeenCalled: 0 };
    const children = blockMap
      .skipWhile(block => blockMap.toList().indexOf(block) <= index)
      .takeWhile(block => block.getDepth() > depth)
      .filter((block) => {
        const blockBefore = currentContent.getBlockBefore(block.getKey());
        // Collapse all
        if (behavior === 'COLLAPSE') { return true; }

        if (
          behavior === 'EXPAND' ||
          (behavior === 'TOGGLE' && !contentBlock.getData().get('isExpanded'))
        ) {
          // if
          //   block is collapsed &&
          //   it is a child or nth grandchild of the toggled node &&
          //   a collapsed node has not yet been found...
          if (
            !blockBefore.getData().get('isExpanded') &&
            blockBefore.getDepth() >= depth + 1 &&
            collapsedNode.hasBeenCalled === 0
          ) {
            // Note its depth
            collapsedNode.depth = blockBefore.getDepth();
            // Note that a collapsed node has been found
            // (in order to skip this block for collapsed nodes within this one)
            collapsedNode.hasBeenCalled = 1;
          }

          // End case: block is no longer within collapsed node
          if (block.getDepth() <= collapsedNode.depth) {
            // Reset
            collapsedNode = { depth: -1, hasBeenCalled: 0 };
          }

          if (collapsedNode.hasBeenCalled && block.getDepth() > collapsedNode.depth) {
            return false;
          }
        }

        return block.getDepth() === depth + 1
          || (block.getData().get('parentKey').length &&
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

  hasChildren(contentBlock) {
    const key = contentBlock.getKey();
    const depth = contentBlock.getDepth();
    let depthOfNextBlock = -1;
    // If a block after the current block exists, get its depth
    const nextBlock = this.props.editorState.getCurrentContent().getBlockAfter(key);
    if (nextBlock) { depthOfNextBlock = nextBlock.getDepth(); }
    return depthOfNextBlock > depth;
  }

  // TODO Override handleReturn and set all contentBlock data properties there.
  // Delete `presavePrep` method

  entryRenderer(contentBlock) {
    const toggleExpand = () => this.toggleExpand(contentBlock, 'TOGGLE');
    return {
      component: Entry,
      editable: true,
      // passed to Entry —— available on props.blockProps
      props: {
        toggleExpand,
      },
    };
  }

  render() {
    return (
      <div className="tree-container">
        <div
          className="tree"
          onKeyDown={(e) => {
            Perf.start();
            this.handleKeyDown(e);
          }}
        >
          <Editor
            editorState={this.props.editorState}
            onUpArrow={this.keyBindingFn}
            onDownArrow={this.keyBindingFn}
            keyBindingFn={this.keyBindingFn}
            handleKeyCommand={this.handleKeyCommand}
            // handleReturn={this.handleReturn}
            blockRendererFn={this.entryRenderer}
            blockRenderMap={DefaultDraftBlockRenderMap.merge(Map({
              unstyled: { element: 'div' },
            }))}
            onChange={this.handleChange}
            onTab={this.handleTab}
            ref={(editor) => { this.editor = editor; }}
          />
        </div>
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
