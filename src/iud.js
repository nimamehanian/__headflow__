const initialUserData = { nodes: [{
  data: { isExpanded: true, isVisible: true },
  kind: 'block',
  nodes: [
    {
      kind: 'text',
      ranges: [{ marks: [{ type: 'Embolden' }], text: 'Hotkeys' }],
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '↵ (ENTER) = Begin a new block' }],
      type: 'entry',
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '^⌘+↑ = Move block up' }],
      type: 'entry',
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '^⌘+↓ = Move block down' }],
      type: 'entry',
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '↹ (TAB) = Indent' }],
      type: 'entry',
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '⇧+↹ = Outdent' }],
      type: 'entry',
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '⌘+↑ = Collapse' }],
      type: 'entry',
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '⌘+↓ = Expand' }],
      type: 'entry',
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '⌘+B/I/U = Toggle bold/italic/underline' }],
      type: 'entry',
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '⌘+K = Toggle code' }],
      type: 'entry',
    },
    {
      data: { isExpanded: true, isVisible: true },
      kind: 'block',
      nodes: [{ kind: 'text', text: '⌘+↵ = Toggle strikethrough (i.e., complete item)' }],
      type: 'entry',
    },
  ],
  type: 'entry',
}] };

export default initialUserData;
