moveBlock(direction) {
  const currentContent = this.props.editorState.getCurrentContent();
  const blockMap = currentContent.getBlockMap();
  const currentBlockKey = this.props.editorState.getSelection().getAnchorKey();
  const currentBlock = blockMap.filter(block => block.getKey() === currentBlockKey);
  const currentBlockDepth = currentBlock.first().getDepth();
  const currentBlockIndex = blockMap.toList().indexOf(currentBlock.first());
  const currentBlockChildren = blockMap
    .skipWhile(block => blockMap.toList().indexOf(block) <= currentBlockIndex)
    .takeWhile(block => block.getDepth() > currentBlockDepth);

  const adjacentBlock = blockMap
    .toList()
    .filter(block => block.getDepth() === currentBlockDepth)
    .filter((block, idx, list) =>
      list.get(
        direction === 'UP' ? idx + 1 : idx - 1
      ) && list.get(
        direction === 'UP' ? idx + 1 : idx - 1
      ).getKey() === currentBlockKey
    )
    .filter(block =>
      direction === 'DOWN' ?
        block.getKey() !== currentContent.getFirstBlock().getKey() :
        true
    )
    .toOrderedMap();

  const adjacentBlockDepth = adjacentBlock.count() ? adjacentBlock.first().getDepth() : -1;
  const adjacentBlockIndex = blockMap.toList().indexOf(adjacentBlock.first());
  const adjacentBlockChildren = blockMap
    .skipWhile(block => blockMap.toList().indexOf(block) <= adjacentBlockIndex)
    .takeWhile(block => block.getDepth() > adjacentBlockDepth);

  const leadingBlocks = (direction === 'UP' ?
    (adjacentBlock.count() ?
      blockMap
        .takeWhile(b => b.getKey() !== adjacentBlock.first().getKey())
        .delete(adjacentBlock.first().getKey()) :
      OrderedMap()
    ) :
    (blockMap
      .takeWhile(b => b.getKey() !== currentBlockKey)
      .delete(currentBlockKey)
    )
  );

  const trailingBlocks = blockMap
    .skipWhile(block =>
      leadingBlocks.has(block.getKey()) ||
      currentBlock.has(block.getKey()) ||
      currentBlockChildren.has(block.getKey()) ||
      adjacentBlock.has(block.getKey()) ||
      adjacentBlockChildren.has(block.getKey())
    );

  const updatedBlockMap = direction === 'UP' ?
    leadingBlocks.concat(
      currentBlock,
      currentBlockChildren,
      adjacentBlock,
      adjacentBlockChildren,
      trailingBlocks
    ) :
    leadingBlocks.concat(
      adjacentBlock,
      adjacentBlockChildren,
      currentBlock,
      currentBlockChildren,
      trailingBlocks
    );

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
